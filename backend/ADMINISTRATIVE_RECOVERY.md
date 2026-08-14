# Administrative Recovery

Administrative Recovery provides exceptional ADMIN/SUPERADMIN tools for stuck or inconsistent operational states. These actions are not part of the normal STAFF workflow.

## Authorization

- Recovery endpoints require the existing `AdminOnly` policy.
- `SUPERADMIN` may act globally.
- `ADMIN` may act only on resources belonging to Companies linked through `CompanyUser`.
- Company access is derived from the stored resource `CompanyId`; clients do not supply the authorization company.

## Endpoint: Force-end StaffSession

`POST /admin-recovery/staff-sessions/{sessionId}/force-end`

Use this when a STAFF session remains open after a crash, disconnect, abandoned device, or similar operational problem.

The session must exist and `EndedAt` must be null.

Behavior:

- `Status` becomes `ENDED`.
- `EndedAt` and `UpdatedAt` become the current UTC time.
- `BreakStartedAt` is cleared.
- If the session was in `BREAK` and `BreakStartedAt` existed, elapsed break time is added to `TotalBreakSeconds`.

The `StaffSession` is never deleted. Historical data is preserved. Desk occupancy is derived from open sessions, so ending the session releases the Desk indirectly. This action does not modify a `SERVING` Ticket.

Responses: `200` success, `403` unauthorized Company access, `404` StaffSession not found, `409` session already closed.

## Endpoint: Recover SERVING Ticket

`POST /admin-recovery/tickets/{ticketId}/mark-missed`

Use this when a Ticket is stuck in `SERVING` and the normal STAFF flow can no longer recover it.

The Ticket must exist and its status must be exactly `SERVING`.

Behavior:

- `SERVING -> MISSED`.
- `MissedAt` and `UpdatedAt` become the current UTC time.

The following fields and all other historical data are preserved:

- `Number`
- `CompanyId`
- `LocationId`
- `QueueId`
- `ServedByUserId`
- `ServedAtDeskId`
- `ServingStartedAt`
- `TrackingToken`
- `Pin`

The DAO performs a defensive conditional database update requiring both `Id == ticketId` and `Status == SERVING`. If the state changes concurrently, the action returns `409` instead of overwriting the newer state.

This action does not close `StaffSession`, modify `Desk` or `Queue`, modify `TicketService` relations, or requeue the Ticket as `WAITING`.

Responses: `200` success, `403` unauthorized Company access, `404` Ticket not found, `409` Ticket is not `SERVING` or changed state concurrently.

## Safety Guard: STAFF Removal

When an ADMIN removes a STAFF member from a Company:

- Authorization, user existence, STAFF role, and CompanyUser membership are validated first.
- If no CompanyUser relation exists, the existing `404` behavior is preserved.
- If the STAFF member has an open StaffSession in that same Company, removal returns `409`.
- The CompanyUser relation is not deleted in that case.
- An open session belonging only to a different Company does not block removal.

Recovery workflow:

1. Force-end the StaffSession.
2. Retry STAFF removal.
3. The existing removal flow succeeds.

## Safety Guard: Desk Deletion

Desk deletion returns `409` if any StaffSession references the Desk with `EndedAt == null`. Closed historical StaffSessions do not block deletion. When blocked, the Desk and StaffSession remain unchanged.

Recovery workflow:

1. Force-end the StaffSession occupying the Desk.
2. Retry Desk deletion.

Never delete StaffSessions or other historical records as part of this workflow.

## Typical Recovery Workflows

### Stale STAFF session / occupied Desk

1. ADMIN force-ends the StaffSession.
2. The session becomes `ENDED`.
3. The Desk becomes available because occupancy is derived from open sessions.
4. Normal operation may continue.

### Session ended while Ticket remains SERVING

1. ADMIN force-ends the StaffSession.
2. The Ticket intentionally remains `SERVING`.
3. ADMIN explicitly calls Ticket mark-missed recovery.
4. The Ticket becomes `MISSED`.

This two-step behavior is intentional: force-ending a session never silently changes a customer's Ticket.

### Remove STAFF with open session

1. STAFF removal returns `409`.
2. ADMIN force-ends the session.
3. ADMIN retries removal.

### Delete occupied Desk

1. Desk deletion returns `409`.
2. ADMIN force-ends the occupying session.
3. ADMIN retries Desk deletion.

## Important V1 Rules

- Recovery actions preserve Ticket and StaffSession history.
- Recovery actions never hard-delete operational history.
- Normal STAFF flows are always preferred.
- Recovery endpoints are for exceptional operational failures only.
- Existing Queue reset remains separate and unchanged.
- Queue reset retains its existing `WAITING`/`MISSED` behavior and is not a replacement for StaffSession/Ticket recovery.
- Force-ending a StaffSession intentionally does not modify a `SERVING` Ticket.
- Ticket recovery must be an explicit separate admin action.

## V1 Status

Administrative Recovery V1 = VERIFIED / CLOSED
