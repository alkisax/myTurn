# ResetNumberDaily – Implementation Notes

This feature was implemented incrementally with **Codex CLI** so each change could be reviewed before moving to the next step. In practice, the work was split into **6 main steps**, with an additional **Step 4.5** inserted to separate queue reset state from ticket-number reset state.

## Goal

The goal was to support Queue resets without forcing every Queue to reset at midnight and without requiring cron jobs, polling, or background workers.

The final behavior supports:

- manual Queue reset by ADMIN/SUPERADMIN,
- optional automatic reset only when `AutoResetEnabled == true`,
- configurable local reset time per Queue,
- timezone-aware reset using the Queue's Location,
- lazy automatic reset: the reset happens on the next operational use after the scheduled reset time,
- ticket numbering that can restart from `1` when appropriate,
- overnight queues such as `22:00–06:00`,
- historical tickets keeping their old `Number` values without ambiguity.

---

# Implementation steps

## Step 1 – Location geography and timezone

The first step added the geographical information needed for local-time calculations.

All geographical data was deliberately placed on **Location**, not Company, because a Company can potentially have Locations in different countries/timezones.

Added to `Location`:

```csharp
string? Country
double? Latitude
double? Longitude
string? TimeZoneId
```

`TimeZoneId` is expected to use an **IANA timezone identifier**, for example:

```text
Europe/Athens
Europe/London
America/New_York
```

The relevant Location DTOs, DAO and Controller were updated so these fields can be created, updated and returned.

### Main files changed

- `Models/Location.cs`
- `Dtos/LocationDtos/CreateLocationDto.cs`
- `Dtos/LocationDtos/UpdateLocationDto.cs`
- `Dtos/LocationDtos/LocationDto.cs`
- `Daos/LocationDao.cs`
- `Controllers/LocationController.cs`
- EF Core migration: `AddLocationGeography`

---

## Step 2 – Queue reset configuration fields

The Queue model was extended with configuration only. No reset behavior was implemented yet.

Added:

```csharp
bool AutoResetEnabled = false
TimeOnly? ResetAt
```

The existing:

```csharp
bool ResetNumberDaily
```

was kept.

`AutoResetEnabled` defaults to `false`, so existing queues do not suddenly start resetting automatically.

### Main files changed

- `Models/Queue.cs`
- `Dtos/QueueDtos/CreateQueueDto.cs`
- `Dtos/QueueDtos/UpdateQueueDto.cs`
- `Dtos/QueueDtos/QueueDto.cs`
- `Daos/QueueDao.cs`
- `Controllers/QueueController.cs`
- EF Core model snapshot / migration for the new Queue fields

---

## Step 3 – Manual Queue reset

A manual reset operation was added for ADMIN/SUPERADMIN.

Endpoint:

```text
POST /queues/{queueId}/reset
```

Authorization rules:

- `SUPERADMIN` can reset any Queue.
- `ADMIN` can reset only Queues belonging to Companies they can access through `CompanyUser`.
- `STAFF` and `USER` cannot use the endpoint.

Manual reset behavior:

```text
WAITING -> EXPIRED
MISSED  -> EXPIRED
```

For affected tickets:

```csharp
ExpiredAt = DateTime.UtcNow
UpdatedAt = DateTime.UtcNow
```

`SERVING` tickets are intentionally left untouched.

Tickets are not deleted; history is preserved.

The ticket update is done efficiently with EF Core `ExecuteUpdateAsync()`.

### Main files changed

- `Daos/TicketDao.cs`
- `Controllers/QueueController.cs`
- `Endpoints/QueueEndpoints.cs`

Main DAO method added:

```csharp
ExpireWaitingAndMissedByQueueId(int queueId)
```

---

## Step 4 – Lazy automatic reset

Automatic reset was implemented without:

- cron,
- polling,
- timers,
- `BackgroundService`,
- hosted workers.

Instead, the implementation uses a **lazy reset**.

Added to `Queue`:

```csharp
DateTime? LastResetAt
```

A reusable service was created:

```csharp
QueueResetService
```

with:

```csharp
EnsureResetIfNeeded(Queue queue)
```

The service:

1. returns immediately when `AutoResetEnabled == false`,
2. returns when `ResetAt == null`,
3. loads the Queue's Location,
4. reads `Location.TimeZoneId`,
5. converts current UTC time to the Location's local time,
6. calculates the most recent scheduled reset moment,
7. checks whether that reset has already been performed,
8. if needed, expires `WAITING` and `MISSED` tickets,
9. saves `LastResetAt` in UTC.

The calculation correctly handles overnight queues. For example, if:

```text
ResetAt = 06:00
local time = 02:00
```

the most recent scheduled reset is **yesterday at 06:00**, not today at 06:00.

The manual reset was also corrected so it updates `LastResetAt`; otherwise the next lazy access could repeat the same reset.

### Main files changed

- `Models/Queue.cs`
- `Dtos/QueueDtos/QueueDto.cs`
- `Daos/QueueDao.cs`
- `Controllers/QueueController.cs`
- `Services/QueueResetService.cs`
- `Program.cs`
- EF Core migration: `AddQueueLastResetAt`

---

## Step 4.5 – Separate operational reset from numbering reset

An additional design issue appeared: operational reset and ticket-number reset are not always the same thing.

Example:

```text
old tickets: #1, #2, #3
manual reset
new tickets: #1, #2
```

This is valid because `Ticket.Number` is not the real identity of a ticket. `Id` and `TrackingToken` remain the actual identifiers.

To distinguish the two reset concepts, another timestamp was added:

```csharp
DateTime? LastNumberResetAt
```

The two timestamps now mean:

```text
LastResetAt       = when the Queue was operationally reset
LastNumberResetAt = when ticket numbering last restarted from 1
```

Rules:

### Manual reset

Always updates both:

```text
LastResetAt
LastNumberResetAt
```

regardless of `ResetNumberDaily`.

### Automatic reset with `ResetNumberDaily == true`

Updates both:

```text
LastResetAt
LastNumberResetAt
```

### Automatic reset with `ResetNumberDaily == false`

Updates only:

```text
LastResetAt
```

and leaves `LastNumberResetAt` unchanged, so numbering continues.

### Main files changed

- `Models/Queue.cs`
- `Dtos/QueueDtos/QueueDto.cs`
- `Daos/QueueDao.cs`
- `Controllers/QueueController.cs`
- `Services/QueueResetService.cs`
- EF Core migration: `AddQueueLastNumberResetAt`

---

## Step 5 – Operational integration and numbering

The lazy reset mechanism existed after Step 4, but nothing called it yet. Step 5 connected it to the operational flow.

`QueueResetService.EnsureResetIfNeeded(queue)` is now called before:

- creating a new ticket,
- STAFF requesting `Next`,
- returning the operational Queue view.

It is **not** called for history.

### Ticket numbering change

Previously ticket numbering was based on the UTC calendar day.

That was replaced with numbering-period logic.

When creating a Ticket:

```text
If LastNumberResetAt exists:
    calculate max Number only from tickets created at/after LastNumberResetAt

If LastNumberResetAt is null:
    calculate max Number from all historical tickets in the Queue

next Number = max + 1
```

The existing SQLite:

```sql
BEGIN IMMEDIATE
```

transaction remains in place, so concurrent ticket creation is still protected from receiving the same next number.

### Operational Queue filtering change

Operational Queue view no longer uses UTC `today/tomorrow` boundaries.

It now returns only:

```text
WAITING
SERVING
MISSED
```

and, when `LastResetAt` exists, only tickets with:

```text
CreatedAt >= LastResetAt
```

History continues to return all historical tickets.

### Main files changed

- `Controllers/TicketController.cs`
- `Daos/TicketDao.cs`

---

# Final feature logic

The feature now has two independent concepts:

## Operational reset

An operational reset closes the previous Queue period.

It:

- expires `WAITING` tickets,
- expires `MISSED` tickets,
- leaves `SERVING` tickets untouched,
- records `LastResetAt`,
- causes the operational Queue view to ignore tickets created before the reset.

No tickets are deleted.

## Numbering reset

A numbering reset records:

```csharp
LastNumberResetAt
```

New tickets calculate their next number only from tickets created after this timestamp.

Therefore the database may validly contain:

```text
Ticket Id 10 -> Number 1 -> old period
Ticket Id 11 -> Number 2 -> old period

manual reset

Ticket Id 12 -> Number 1 -> current period
Ticket Id 13 -> Number 2 -> current period
```

This is intentional. `Number` is a display/queue number, not the primary identity of the Ticket.

## Manual reset rules

Manual reset always means:

```text
expire WAITING/MISSED
LastResetAt = now
LastNumberResetAt = now
```

So the next ticket starts again from `1`.

## Automatic reset rules

Automatic reset only exists when:

```csharp
AutoResetEnabled == true
```

and `ResetAt` + `Location.TimeZoneId` are configured.

When `ResetNumberDaily == true`:

```text
automatic operational reset
+ numbering starts again from 1
```

When `ResetNumberDaily == false`:

```text
automatic operational reset
+ numbering continues from previous numbers
```

A manual reset still resets numbering in both cases.

## Lazy execution

There is no process that wakes up exactly at `ResetAt`.

Instead, suppose:

```text
ResetAt = 06:00
AutoResetEnabled = true
```

and nobody uses the Queue until 08:15.

At 08:15, the first operational action triggers:

```text
EnsureResetIfNeeded(queue)
```

The service notices that the 06:00 reset is due, performs it, updates reset timestamps, and then the original operation continues.

This keeps the V1 implementation simple and avoids continuous background work.

---

# Verification performed

The feature was manually verified with HTTP requests.

A Queue containing previous tickets with numbers `1` and `2` was manually reset.

The reset response succeeded:

```json
{
  "status": true,
  "message": "Queue Updated General Queue reset",
  "expiredCount": 0
}
```

`expiredCount` was `0` because the existing tickets were `SERVING`, which manual reset intentionally does not modify.

A new ticket was then created and received:

```json
"number": 1
```

even though historical tickets already had `Number = 1`.

Finally, the operational Queue endpoint returned only the newly created current-period ticket and not the pre-reset historical tickets.

This confirmed the core end-to-end behavior of the feature.

---

# Result

For V1, the `ResetNumberDaily` / Queue reset feature is considered complete.

The resulting design supports:

- manual reset,
- optional automatic reset,
- local timezone-aware reset schedules,
- lazy execution,
- overnight Queue schedules,
- independent operational and numbering periods,
- preserved ticket history,
- repeated display numbers across different periods,
- atomic next-number allocation.
