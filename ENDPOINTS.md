# MyTurn API Endpoints

Base URL: `http://localhost:3020`. JSON examples use the property names accepted by the current DTO binding. Protected endpoints require `Authorization: Bearer <JWT>`.

## Table of contents

- [Health and frontend logs](#health-and-frontend-logs)
- [Public customer API](#public-customer-api)
- [V1 status and slugs](#v1-status-and-slugs)
- [Authentication](#authentication)
- [Users](#users)
- [Companies](#companies)
- [Company Users](#company-users)
- [Locations](#locations)
- [Queues](#queues)
- [Desks](#desks)
- [Staff Sessions](#staff-sessions)
- [Services](#services)
- [Tickets](#tickets)
- [Ticket Services](#ticket-services)
- [Administrative Recovery](#administrative-recovery)
- [Analytics](#analytics)
- [PDF / Tracking](#pdf--tracking)
- [SignalR](#signalr)
- [Authorization Summary](#authorization-summary)

Response wrappers commonly contain `status` and `data`; error wrappers commonly contain `status` and `message`. Exact examples below are representative of the current controllers.

## Public customer API

These routes require no authentication. They intentionally do not provide a global public company, location, queue, or service directory. A customer must already know the company slug and, for nested resources, the location slug.

Nested resources are always resolved by `companySlug` plus `locationSlug`; a location from another company cannot resolve under the wrong company. Public lists return only active locations, queues, and services.

### `GET /public/{companySlug}`

- Authorization: Public / Anonymous.
- Success: `200 OK` with `{ "status": true, "data": { "name": "My Turn Market", "slug": "my-turn-market" } }`.
- Errors: `404 Not Found` when the company slug does not exist.

### `GET /public/{companySlug}/locations`

- Authorization: Public / Anonymous.
- Success: `200 OK` with active `PublicLocationDto[]`. Each item contains `id`, `name`, `slug`, `address`, `country`, and `isActive`.
- Errors: `404 Not Found` when the company slug does not exist.

### `GET /public/{companySlug}/{locationSlug}`

- Authorization: Public / Anonymous.
- Success: `200 OK` with an active `PublicLocationDto`.
- Errors: `404 Not Found` when either slug is unknown, the location belongs to another company, or the location is inactive.

### `GET /public/{companySlug}/{locationSlug}/queues`

- Authorization: Public / Anonymous.
- Success: `200 OK` with active `PublicQueueDto[]`. Each item contains `id`, `name`, `description`, `isActive`, `isRemoteTicketingAllowed`, `opensAt`, and `closesAt`.
- Errors: `404 Not Found` when the company/location slug pair does not resolve.

### `GET /public/{companySlug}/{locationSlug}/services`

- Authorization: Public / Anonymous.
- Success: `200 OK` with active `PublicServiceDto[]`. Each item contains `id`, `name`, `description`, `estimatedServiceMinutes`, and `isGeneric`.
- Errors: `404 Not Found` when the company/location slug pair does not resolve.

There is intentionally no `GET /public/companies`, `GET /public/queues`, or other anonymous global listing route.

## V1 status and slugs

Backend V1 is complete. The integration suite is currently `84/84` passing and runs against the dedicated Test SQLite database rather than the development database.

Companies and locations have backend-generated `slug` values. Slugs are generated from `Name`, transliterating Greek names to deterministic ASCII/Greeklish, lowercasing, removing punctuation and duplicate separators, and joining words with `-`. Renaming a company or location regenerates its slug.

- Company slugs are globally unique.
- Location slugs are unique within their Company.
- Duplicate slugs receive deterministic suffixes such as `my-market`, `my-market-2`, and `my-market-3`.
- Slug input is not required in create or update request DTOs.

## Health and frontend logs

### `GET /`

- Authorization: Public / Anonymous.
- Input: no path, query, or body.
- Success: `200 text/plain`, body `Hello World!`.
- Errors: none explicitly produced by the mapped handler.
- Ελληνικά: Χρησιμοποιείται κυρίως για έναν απλό έλεγχο ότι το backend απαντά. Δεν απαιτείται σύνδεση.

### `GET /health`

- Authorization: Public / Anonymous.
- Input: no body.
- Success: `200 text/plain`, body `ok`.
- Errors: none explicitly produced by the mapped handler.
- Ελληνικά: Χρησιμοποιείται ως smoke check διαθεσιμότητας του server.

### `GET /api/ping`

- Authorization: Public / Anonymous.
- Input: no body.
- Success: `200 text/plain`, body `Pong`.
- Errors: none explicitly produced by the mapped handler.
- Ελληνικά: Χρησιμοποιείται για έναν απλό έλεγχο επικοινωνίας με το API.

### `POST /front-logs/`

- Authorization: Public / Anonymous.
- Input body (`FrontLogDto`):

```json
{ "frontLog": "Unhandled error on queue screen" }
```

- Success: controller-defined response from `LogController.ForwardFrontLogs`; the current endpoint mapping does not add a status contract.
- Errors: Needs verification from the logging controller/service.
- Ελληνικά: Το frontend το χρησιμοποιεί για να προωθεί logs ή σφάλματα στο backend.

## Authentication

### `POST /auth/register-admin`

- Authorization: Public / Anonymous.
- Input body (`CreateUserDto`):

```json
{ "username": "admin1", "name": "Company Admin", "email": "admin@example.com", "password": "secret123" }
```

- Success: `201 Created` with a `UserSummaryDto`-shaped response (password is not returned).
- Errors supported by the controller: `400 Bad Request` for validation/duplicate username or email.
- Ελληνικά: Χρησιμοποιείται για την αρχική δημιουργία λογαριασμού ADMIN.

### `POST /auth/register-user`

- Authorization: Public / Anonymous.
- Input body: same `CreateUserDto` as above.
- Success: `201 Created` with a user summary.
- Errors: `400 Bad Request` for validation/duplicate account data.
- Ελληνικά: Το χρησιμοποιεί ένας νέος πελάτης για να δημιουργήσει λογαριασμό USER.

### `POST /auth/login`

- Authorization: Public / Anonymous.
- Input body (`LoginUserDto`):

```json
{ "username": "admin1", "password": "secret123" }
```

- Success: `200 OK` with the current login response containing the JWT/token data.
- Errors: `401 Unauthorized` for invalid credentials; `400 Bad Request` for DTO validation.
- Ελληνικά: Χρησιμοποιείται από ADMIN, STAFF, USER ή SUPERADMIN για είσοδο και λήψη JWT.

### `POST /auth/refresh`

- Authorization: Authenticated (`RequireAuthorization()`). Refresh token is read from the request by the controller; no JSON body is defined by the endpoint.
- Input: no defined JSON body; request authentication/refresh-token data is required by the current controller.
- Success: `200 OK` with refreshed token data.
- Errors: `401 Unauthorized` for missing/invalid refresh authentication; other validation errors are controller-defined.
- Ελληνικά: Χρησιμοποιείται όταν λήγει το access token ώστε να συνεχιστεί η authenticated συνεδρία.

## Users

`UserSummaryDto` responses contain `id`, `username`, `name`, `email`, `role`, `createdAt`, and `updatedAt`; passwords are not returned.

### `GET /users/`

- Authorization: ADMIN or SUPERADMIN (`AdminOnly`).
- Input: no body.
- Success: `200 OK`, for example `{ "status": true, "data": [{ "id": 1, "username": "admin1", "name": "Admin", "email": "admin@example.com", "role": "ADMIN", "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z" }] }`.
- Errors: `401 Unauthorized`, `403 Forbidden`.
- Ελληνικά: Το χρησιμοποιούν οι διαχειριστές για να δουν τη λίστα χρηστών.

### `GET /users/{id}`

- Authorization: Self or ADMIN/SUPERADMIN (`SelfOrAdmin`). Path: `id` integer.
- Input: no body.
- Success: `200 OK` with one `UserSummaryDto`.
- Errors: `401`, `403`, `404 Not Found` when the user does not exist.
- Ελληνικά: Ο χρήστης βλέπει τα δικά του στοιχεία, ενώ ο ADMIN μπορεί να δει χρήστη για διαχείριση.

### `PUT /users/{id}`

- Authorization: Self or ADMIN/SUPERADMIN. Path: `id` integer.
- Input body (`UpdateUserDto`):

```json
{ "username": "new-name", "name": "Updated Name", "email": "new@example.com", "password": "newsecret123" }
```

- Success: `200 OK` with updated `UserSummaryDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο χρήστης ενημερώνει το προφίλ του ή ο ADMIN ενημερώνει λογαριασμό.

### `PUT /users/{id}/role`

- Authorization: SUPERADMIN only. Path: `id` integer.
- Input body (`UpdateRoleDto`): `{ "role": "STAFF" }`.
- Success: `200 OK` with updated user summary.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο SUPERADMIN αλλάζει τον ρόλο ενός χρήστη.

### `PUT /users/{id}/superadmin`

- Authorization: SUPERADMIN only. Path: `id` integer. No request body.
- Success: `200 OK` with updated user summary.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο SUPERADMIN προάγει έναν υπάρχοντα χρήστη σε SUPERADMIN.

### `DELETE /users/{id}`

- Authorization: Self or ADMIN/SUPERADMIN. Path: `id` integer. No body.
- Success: `200 OK` with deletion result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για διαγραφή λογαριασμού από τον ίδιο τον χρήστη ή από διαχειριστή.

## Companies

Company bodies use `name`, `missedTicketExpiryMinutes`, and `defaultEstimatedServiceMinutes`. Responses also include the backend-generated `slug`.

### `GET /companies/`

- Authorization: SUPERADMIN only. No body.
- Success: `200 OK`, with company responses containing `id`, `name`, `slug`, `missedTicketExpiryMinutes`, `defaultEstimatedServiceMinutes`, and `createdAt`.
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN βλέπει όλες τις εταιρείες.

### `GET /companies/mine`

- Authorization: ADMIN or SUPERADMIN (`AdminOnly`); controller returns companies accessible through CompanyUser relations.
- Input: no body.
- Success: `200 OK` with a company list.
- Errors: `401`, `403`.
- Ελληνικά: Ο ADMIN βλέπει μόνο τις εταιρείες στις οποίες έχει πρόσβαση.

### `GET /companies/{id}`

- Authorization: ADMIN/SUPERADMIN plus company-level access check. Path: `id` integer.
- Success: `200 OK` with `CompanyDto`.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για προβολή των στοιχείων συγκεκριμένης εταιρείας.

### `POST /companies/`

- Authorization: ADMIN/SUPERADMIN (`AdminOnly`); the controller creates the company and its CompanyUser relation for the creator.
- Input body:

```json
{ "name": "Acme", "missedTicketExpiryMinutes": 10, "defaultEstimatedServiceMinutes": 5 }
```

- Success: `201 Created` with the created company.
- Errors: `400`, `401`, `403`.
- Ελληνικά: Ο ADMIN δημιουργεί νέα εταιρεία για να αρχίσει η διαχείριση MyTurn.

### `PUT /companies/{id}`

- Authorization: ADMIN/SUPERADMIN plus company-level access. Body:

```json
{ "name": "Acme Updated", "missedTicketExpiryMinutes": 15, "defaultEstimatedServiceMinutes": 7 }
```

- Success: `200 OK` with updated company.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για αλλαγή ρυθμίσεων της εταιρείας.

### `DELETE /companies/{id}`

- Authorization: ADMIN/SUPERADMIN plus company-level access. No body.
- Success: `200 OK` with deletion result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο διαχειριστής διαγράφει εταιρεία όταν δεν χρειάζεται πλέον.

## Company Users

### `GET /company-users/`

- Authorization: SUPERADMIN only. No body.
- Success: `200 OK` with `CompanyUserDto[]` (`id`, `userId`, `companyId`, `createdAt`).
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN βλέπει όλες τις σχέσεις χρηστών και εταιρειών.

### `GET /company-users/mine`

- Authorization: Authenticated user, any role.
- Success: `200 OK` with the current user’s company relations.
- Errors: `401`.
- Ελληνικά: Ο συνδεδεμένος χρήστης βλέπει σε ποιες εταιρείες ανήκει.

### `GET /company-users/user/{userId}`

- Authorization: SUPERADMIN only. Path: `userId` integer.
- Success: `200 OK` with that user’s CompanyUser relations.
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN ελέγχει τις εταιρείες ενός συγκεκριμένου χρήστη.

### `GET /company-users/company/{companyId}`

- Authorization: ADMIN/SUPERADMIN plus access to `companyId`.
- Success: `200 OK` with company members.
- Errors: `401`, `403`, `404` where returned by the controller.
- Ελληνικά: Ο ADMIN βλέπει τα μέλη της δικής του εταιρείας.

### `GET /company-users/company/{companyId}/staff`

- Authorization: ADMIN/SUPERADMIN plus access to `companyId`.
- Success: `200 OK` with staff users for the company.
- Errors: `401`, `403`, `404` where returned by the controller.
- Ελληνικά: Χρησιμοποιείται για τη διαχείριση των STAFF μιας εταιρείας.

### `POST /company-users/`

- Authorization: SUPERADMIN only.
- Input body (`CreateCompanyUserDto`): `{ "userId": 12, "companyId": 3 }`.
- Success: `201 Created` with `CompanyUserDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο SUPERADMIN συνδέει έναν υπάρχοντα χρήστη με εταιρεία.

### `POST /company-users/company/{companyId}/staff`

- Authorization: ADMIN/SUPERADMIN plus access to `companyId`. Path: `companyId` integer.
- Input body (`CreateUserDto`):

```json
{ "username": "staff1", "name": "Front Desk", "email": "staff@example.com", "password": "secret123" }
```

- Success: `201 Created` with the created staff user/relation result.
- Errors: `400`, `401`, `403`, `404`, `409` for duplicate account/relation conditions supported by the controller.
- Ελληνικά: Ο ADMIN δημιουργεί λογαριασμό STAFF και τον συνδέει με την εταιρεία.

### `DELETE /company-users/company/{companyId}/staff/{userId}`

- Authorization: ADMIN/SUPERADMIN plus access to `companyId`.
- Input: no body.
- Success: `200 OK` with removal result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN αφαιρεί STAFF από την εταιρεία.

### `DELETE /company-users/{id}`

- Authorization: SUPERADMIN only. Path: relation `id` integer.
- Success: `200 OK` with removal result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο SUPERADMIN διαγράφει απευθείας μια CompanyUser σχέση.

## Locations

Location responses include the backend-generated `slug` in addition to the existing location fields. Create and update requests do not accept a slug.

### `GET /locations/`

- Authorization: SUPERADMIN only. No body.
- Success: `200 OK` with `LocationDto[]`.
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN βλέπει όλες τις τοποθεσίες.

### `GET /locations/mine`

- Authorization: ADMIN/SUPERADMIN (`AdminOnly`); returns locations in accessible companies.
- Success: `200 OK` with `LocationDto[]`.
- Errors: `401`, `403`.
- Ελληνικά: Ο ADMIN βλέπει τις τοποθεσίες των εταιρειών του.

### `GET /locations/{id}`

- Authorization: ADMIN/SUPERADMIN plus resource/company access. Path: `id` integer.
- Success: `200 OK` with `LocationDto`.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για λεπτομέρειες μιας τοποθεσίας.

### `GET /locations/company/{companyId}`

- Authorization: ADMIN/SUPERADMIN plus access to `companyId`.
- Success: `200 OK` with `LocationDto[]`.
- Errors: `401`, `403`, `404` where returned by the controller.
- Ελληνικά: Ο ADMIN φορτώνει όλες τις τοποθεσίες μιας εταιρείας.

### `POST /locations/`

- Authorization: ADMIN/SUPERADMIN plus access to the company in the body.
- Input body (`CreateLocationDto`):

```json
{ "companyId": 3, "name": "Athens Branch", "address": "1 Main St", "country": "GR", "latitude": 37.98, "longitude": 23.73, "timeZoneId": "Europe/Athens" }
```

- Success: `201 Created` with `LocationDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN δημιουργεί νέα τοποθεσία μέσα στην εταιρεία.

### `PUT /locations/{id}`

- Authorization: ADMIN/SUPERADMIN plus resource/company access.
- Input body (`UpdateLocationDto`): `{ "name": "Updated Branch", "address": null, "isActive": true, "country": "GR", "latitude": 37.98, "longitude": 23.73, "timeZoneId": "Europe/Athens" }`.
- Success: `200 OK` with updated `LocationDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για ενημέρωση ή ενεργοποίηση/απενεργοποίηση τοποθεσίας.

### `DELETE /locations/{id}`

- Authorization: ADMIN/SUPERADMIN plus resource/company access. No body.
- Success: `200 OK` with deletion result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN αφαιρεί μια τοποθεσία από την εταιρεία.

## Queues

### `GET /queues/`

- Authorization: SUPERADMIN only.
- Success: `200 OK` with `QueueDto[]`.
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN βλέπει όλες τις ουρές.

### `GET /queues/{id}`

- Authorization: ADMIN/SUPERADMIN plus company access for the queue.
- Success: `200 OK` with `QueueDto`.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN βλέπει τα στοιχεία μιας συγκεκριμένης ουράς.

### `GET /queues/location/{locationId}`

- Authorization: ADMIN/SUPERADMIN plus access to the location’s company.
- Success: `200 OK` with `QueueDto[]`.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για φόρτωση των ουρών μιας τοποθεσίας.

### `GET /queues/company/{companyId}`

- Authorization: ADMIN/SUPERADMIN plus access to `companyId`.
- Success: `200 OK` with `QueueDto[]`.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN βλέπει όλες τις ουρές της εταιρείας.

### `POST /queues/`

- Authorization: ADMIN/SUPERADMIN plus access to the body’s location/company.
- Input body (`CreateQueueDto`):

```json
{ "locationId": 4, "name": "General Service", "description": "Main queue", "defaultServiceMinutes": 5, "maxWaitingTickets": 100, "opensAt": "08:00:00", "closesAt": "17:00:00", "autoResetEnabled": true, "resetAt": "00:00:00" }
```

- Success: `201 Created` with `QueueDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN δημιουργεί ουρά σε συγκεκριμένη τοποθεσία.

### `PUT /queues/{id}`

- Authorization: ADMIN/SUPERADMIN plus queue company access.
- Input body (`UpdateQueueDto`): `{ "name": "Updated Queue", "description": "Updated", "isActive": true, "isRemoteTicketingAllowed": true, "defaultServiceMinutes": 5, "maxWaitingTickets": 100, "opensAt": "08:00:00", "closesAt": "17:00:00", "resetNumberDaily": true, "autoResetEnabled": true, "resetAt": "00:00:00" }`.
- Success: `200 OK` with updated `QueueDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για ρυθμίσεις και κατάσταση ουράς.

### `POST /queues/{queueId}/reset`

- Authorization: ADMIN/SUPERADMIN plus queue company access. No body.
- Success: `200 OK` with reset result.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN κάνει χειροκίνητο reset της ουράς και των σχετικών waiting/missed tickets.

### `DELETE /queues/{id}`

- Authorization: ADMIN/SUPERADMIN plus queue company access. No body.
- Success: `200 OK` with deletion result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN διαγράφει ουρά όταν δεν χρησιμοποιείται πλέον.

## Desks

### `GET /desks/`

- Authorization: SUPERADMIN only.
- Success: `200 OK` with `DeskDto[]`.
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN βλέπει όλα τα desks.

### `GET /desks/{id}`, `GET /desks/location/{locationId}`, `GET /desks/company/{companyId}`

- Authorization: ADMIN/SUPERADMIN plus resource/company checks appropriate to the desk, location, or company.
- Input: path integer; no body.
- Success: `200 OK` with `DeskDto` for the first route, or `DeskDto[]` for the collection routes.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN χρησιμοποιεί αυτές τις διαδρομές για να φορτώσει desks μεμονωμένα ή ανά τοποθεσία/εταιρεία.

### `POST /desks/`

- Authorization: ADMIN/SUPERADMIN plus location/company access.
- Input body (`CreateDeskDto`): `{ "locationId": 4, "queueId": 8, "name": "Desk 1" }`.
- Success: `201 Created` with `DeskDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN δημιουργεί θέση εξυπηρέτησης συνδεδεμένη με location και queue.

### `PUT /desks/{id}`

- Authorization: ADMIN/SUPERADMIN plus desk company access.
- Input body (`UpdateDeskDto`): `{ "name": "Desk A", "isActive": true, "queueId": 8 }`.
- Success: `200 OK` with updated `DeskDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για αλλαγή ονόματος, ενεργοποίησης ή queue ενός desk.

### `DELETE /desks/{id}`

- Authorization: ADMIN/SUPERADMIN plus desk company access. No body.
- Success: `200 OK` with deletion result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN διαγράφει desk από την εταιρεία.

## Staff Sessions

### `GET /staff-sessions/`

- Authorization: SUPERADMIN only.
- Success: `200 OK` with `StaffSessionDto[]`.
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN βλέπει το ιστορικό όλων των staff sessions.

### `GET /staff-sessions/mine`

- Authorization: Authenticated; controller returns the current user’s active session.
- Success: `200 OK`, with `data` either a `StaffSessionDto` or `null`.
- Errors: `401`.
- Ελληνικά: Ο STAFF ελέγχει αν έχει ενεργό session και σε ποιο desk εργάζεται.

### `POST /staff-sessions/`

- Authorization: Authenticated, but controller requires role STAFF.
- Input body (`CreateStaffSessionDto`): `{ "deskId": 12 }`.
- Success: `201 Created` with `StaffSessionDto`.
- Errors: `401`, `403`, `404` for missing/inaccessible desk, `409 Conflict` when STAFF or Desk already has an active session.
- Ελληνικά: Ο STAFF ξεκινά βάρδια σε διαθέσιμο desk.

### `PUT /staff-sessions/{id}/status`

- Authorization: Authenticated; controller requires ownership of the session.
- Input body (`UpdateStaffSessionStatusDto`): `{ "status": "BREAK" }` or `{ "status": "ACTIVE" }`.
- Success: `200 OK` with updated `StaffSessionDto`.
- Errors: `400` for invalid/repeated status or ended session, `401`, `403`, `404`.
- Ελληνικά: Ο STAFF δηλώνει break ή επιστρέφει σε ενεργή κατάσταση.

### `POST /staff-sessions/{id}/end`

- Authorization: Authenticated; controller requires ownership of the session.
- Input: no body.
- Success: `200 OK` with ended `StaffSessionDto`.
- Errors: `400` for already ended session, `401`, `403`, `404`.
- Ελληνικά: Ο STAFF ολοκληρώνει τη χρήση του desk και κλείνει το session.

## Services

### `GET /services/`

- Authorization: SUPERADMIN only.
- Success: `200 OK` with `ServiceDto[]`.
- Errors: `401`, `403`.
- Ελληνικά: Ο SUPERADMIN βλέπει όλες τις υπηρεσίες.

### `GET /services/{id}`, `GET /services/location/{locationId}`, `GET /services/company/{companyId}`

- Authorization: ADMIN/SUPERADMIN plus resource/company checks.
- Input: integer path parameter; no body.
- Success: `200 OK` with `ServiceDto` for the first route or `ServiceDto[]` for collection routes.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN φορτώνει υπηρεσία ή υπηρεσίες ανά location/εταιρεία.

### `POST /services/`

- Authorization: ADMIN/SUPERADMIN plus location/company access.
- Input body (`CreateServiceDto`): `{ "locationId": 4, "name": "Passport Renewal", "description": "Renewal service", "isGeneric": false, "estimatedServiceMinutes": 8 }`.
- Success: `201 Created` with `ServiceDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN δημιουργεί υπηρεσία που μπορεί να επιλεγεί σε ticket.

### `PUT /services/{id}`

- Authorization: ADMIN/SUPERADMIN plus service company access.
- Input body (`UpdateServiceDto`): `{ "name": "Renewal", "description": "Updated", "isActive": true, "isGeneric": false, "estimatedServiceMinutes": 8 }`.
- Success: `200 OK` with updated `ServiceDto`.
- Errors: `400`, `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για ενημέρωση ή απενεργοποίηση υπηρεσίας.

### `DELETE /services/{id}`

- Authorization: ADMIN/SUPERADMIN plus service company access. No body.
- Success: `200 OK` with deletion result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN αφαιρεί υπηρεσία από την εταιρεία.

## Tickets

### `POST /tickets/`

- Authorization: Public / Anonymous (also accepts authenticated users).
- Input body (`CreateTicketDto`): `{ "queueId": 8, "email": "customer@example.com", "serviceIds": [21, 22] }`. `serviceIds` may be null.
- Success: `201 Created` with a `MyTicketDto`-shaped ticket response.
- Errors: `400` for inactive queue, disabled remote ticketing, invalid services, limits, or validation; `404` for missing queue/location/service as returned by the controller.
- `Queue.IsRemoteTicketingAllowed` must be `true`; when it is `false`, remote creation is rejected. The normal ticket creation lifecycle remains unchanged.

### `POST /tickets/kiosk`

- Authorization: ADMIN or SUPERADMIN (`AdminOnly`).
- Input body: the same `CreateTicketDto` as remote issuance: `{ "queueId": 8, "email": "customer@example.com", "serviceIds": [21, 22] }`.
- Access: the ADMIN must have access to the queue's company; SUPERADMIN bypasses company membership checks.
- Success: `201 Created` with the normal ticket creation response.
- Kiosk issuance is allowed even when `IsRemoteTicketingAllowed` is `false`.
- Kiosk-created customer tickets remain anonymous: `UserId` is `null`. The ADMIN JWT is used only to authorize the kiosk and does not own the customer ticket.
- Ελληνικά: Ο πελάτης εκδίδει ticket και προαιρετικά επιλέγει υπηρεσίες.

### `GET /tickets/id/{ticketId}`

- Authorization: Authenticated. Controller applies ticket ownership/resource checks; STAFF access is based on its active session/queue and ADMIN access is company-scoped.
- Input: path `ticketId` integer; no body.
- Success: `200 OK` with `MyTicketDto`.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για λεπτομέρειες ticket από authenticated χρήστη ή προσωπικό.

### `GET /tickets/mine`

- Authorization: Authenticated USER; controller reads the user id from JWT.
- Success: `200 OK` with the current user’s ticket list.
- Errors: `401`, `403` where controller ownership rules reject access.
- Ελληνικά: Ο USER βλέπει τα tickets που έχει εκδώσει ο ίδιος.

### `GET /tickets/{trackingToken}`

- Authorization: Public / Anonymous.
- Input: path `trackingToken` string; no body.
- Success: `200 OK` with `TicketTrackingDto` including public status/services and estimated waiting minutes.
- Errors: `404 Not Found` when the token does not identify a ticket.
- V1 public tracking intentionally includes the ticket `pin`; this also applies to the public PDF route below.
- Ελληνικά: Ο πελάτης παρακολουθεί δημόσια την πορεία του ticket μέσω QR ή tracking link.

### `GET /tickets/queue/{queueId}`

- Authorization: Authenticated; controller restricts STAFF to its assigned queue and ADMIN to accessible company queues.
- Success: `200 OK` with queue tickets.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Το προσωπικό βλέπει την τρέχουσα ουρά για να εξυπηρετήσει τον επόμενο πελάτη.

### `GET /tickets/queue/{queueId}/history`

- Authorization: Authenticated; controller applies queue/company access checks.
- Success: `200 OK` with ticket history.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για προβολή ιστορικών tickets μιας ουράς.

### `POST /tickets/next`

- Authorization: Authenticated; controller requires STAFF with an ACTIVE StaffSession.
- Input: no body. Queue and Desk come from the active session.
- Success: `200 OK` with the claimed `MyTicketDto`.
- Errors: `403` without a valid active STAFF session, `404` when queue or waiting tickets are absent, `409 Conflict` when the STAFF or Desk already has a `SERVING` ticket.
- Ελληνικά: Ο STAFF πατά Next για να καλέσει το επόμενο waiting ticket της queue του.

### `POST /tickets/{ticketId}/complete`

- Authorization: Authenticated; requires STAFF with an ACTIVE session matching the serving ticket.
- Input body (`CompleteTicketDto`): `{ "completionResult": "SUCCESS" }` or `{ "completionResult": "FAILED" }`.
- Success: `200 OK` with completed `MyTicketDto`.
- Errors: `400`, `401`, `403`, `404` when the serving ticket does not match the STAFF/Desk session.
- Ελληνικά: Ο STAFF ολοκληρώνει την εξυπηρέτηση και δηλώνει αποτέλεσμα.

### `POST /tickets/{ticketId}/missed`

- Authorization: Authenticated; requires STAFF with an ACTIVE matching session.
- Input: no body.
- Success: `200 OK` with the ticket marked missed.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο STAFF δηλώνει ότι ο πελάτης δεν εμφανίστηκε.

### `POST /tickets/{ticketId}/recall`

- Authorization: Authenticated; requires STAFF with an ACTIVE session for the ticket’s queue.
- Input: no body.
- Success: `200 OK` with recalled ticket.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο STAFF επαναφέρει missed ticket για νέα εξυπηρέτηση.

### `POST /tickets/{ticketId}/expire`

- Authorization: Authenticated; controller applies authenticated ticket/lifecycle checks.
- Input: no body.
- Success: `200 OK` with expired ticket.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Χρησιμοποιείται για λήξη missed ticket μετά το επιτρεπόμενο διάστημα.

### `POST /tickets/{ticketId}/cancel`

- Authorization: Authenticated; controller requires the ticket’s owning USER.
- Input: no body.
- Success: `200 OK` with cancelled ticket.
- Errors: `401`, `403`, `404` when ownership/status does not allow cancellation.
- Ελληνικά: Ο USER ακυρώνει δικό του waiting ticket.

### `DELETE /tickets/{ticketId}`

- Authorization: SUPERADMIN only. No body.
- Success: `200 OK` with deletion result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο SUPERADMIN κάνει administrative hard delete ticket.

## Ticket Services

All routes in this section use `RequireAuthorization("AdminOnly")`; STAFF and USER are rejected before controller execution. ADMIN also needs company access; SUPERADMIN bypasses membership checks.

Ticket Service operations are company-scoped through `TicketServiceController`; tickets and services must belong to the same accessible company/location context.

### `GET /ticket-services/ticket/{ticketId}`

- Input: path `ticketId` integer; no body.
- Success: `200 OK`, `{ "status": true, "data": [{ "id": 50, "ticketId": 100, "serviceId": 21, "createdAt": "2026-01-01T00:00:00Z" }] }`.
- Errors: `401`, `403` for role/company denial, `404` when ticket is missing.
- Ελληνικά: Ο ADMIN βλέπει τις υπηρεσίες που έχουν συνδεθεί με ticket της εταιρείας του.

### `GET /ticket-services/service/{serviceId}`

- Input: path `serviceId` integer; no body.
- Success: `200 OK` with `TicketServiceDto[]` wrapper.
- Errors: `401`, `403`, `404` when service is missing.
- Ελληνικά: Ο ADMIN βλέπει τα tickets στα οποία χρησιμοποιείται μια υπηρεσία.

### `POST /ticket-services/{ticketId}/{serviceId}`

- Input: integer path parameters; no body.
- Success: `200 OK` with the created `TicketServiceDto`.
- Errors: `400` when service location differs from ticket location or service is inactive; `401`, `403`; `404` for missing ticket/service.
- Ελληνικά: Ο ADMIN προσθέτει υπηρεσία σε ticket για διοικητική διόρθωση ή διαχείριση.

### `DELETE /ticket-services/{ticketId}/{serviceId}`

- Input: integer path parameters; no body.
- Success: `200 OK` with removal message.
- Errors: `401`, `403`, `404` for missing ticket or relation.
- Ελληνικά: Ο ADMIN αφαιρεί συγκεκριμένη υπηρεσία από ticket.

### `DELETE /ticket-services/ticket/{ticketId}`

- Input: path `ticketId` integer; no body.
- Success: `200 OK` with `deletedCount`.
- Errors: `401`, `403`, `404` for missing ticket.
- Ελληνικά: Ο ADMIN αφαιρεί όλες τις υπηρεσίες από ένα ticket.

## Administrative Recovery

### `POST /admin-recovery/staff-sessions/{sessionId}/force-end`

- Authorization: ADMIN/SUPERADMIN (`AdminOnly`) plus controller resource/company check.
- Input: path `sessionId` integer; no body.
- Success: `200 OK` with ended session result.
- Errors: `401`, `403`, `404`.
- Ελληνικά: Ο ADMIN τερματίζει session STAFF που έχει μείνει ανοικτό λόγω προβλήματος.

### `POST /admin-recovery/tickets/{ticketId}/mark-missed`

- Authorization: ADMIN/SUPERADMIN plus controller resource/company check.
- Input: path `ticketId` integer; no body.
- Success: `200 OK` with updated ticket.
- Errors: `401`, `403`, `404`, and lifecycle `400` where returned by the controller.
- Ελληνικά: Ο ADMIN διορθώνει ticket που έμεινε σε λάθος κατάσταση εξυπηρέτησης.

## Analytics

All analytics routes use `/analytics/company/{companyId}` and `AdminOnly`. The controller additionally allows SUPERADMIN globally and ADMIN only when a CompanyUser relation exists. No request body or query parameters are defined.

| Method and route | Success | Ελληνικά χρήση |
|---|---|---|
| `GET /analytics/company/{companyId}/overview` | `200 OK` with `{ "status": true, "data": ... }` | Συνοπτική εικόνα λειτουργίας εταιρείας. |
| `GET /analytics/company/{companyId}/tickets-by-hour` | `200 OK` with analytics data | Κατανομή tickets ανά ώρα. |
| `GET /analytics/company/{companyId}/tickets-by-staff` | `200 OK` with analytics data | Σύγκριση απόδοσης STAFF. |
| `GET /analytics/company/{companyId}/tickets-by-service` | `200 OK` with analytics data | Ανάλυση ανά υπηρεσία. |
| `GET /analytics/company/{companyId}/tickets-by-location` | `200 OK` with analytics data | Ανάλυση ανά location. |
| `GET /analytics/company/{companyId}/tickets-by-queue` | `200 OK` with analytics data | Ανάλυση ανά queue. |
| `GET /analytics/company/{companyId}/peak-hours` | `200 OK` with analytics data | Εντοπισμός ωρών αιχμής. |
| `GET /analytics/company/{companyId}/completion-stats` | `200 OK` with analytics data | Στατιστικά SUCCESS/FAILED ολοκληρώσεων. |

Common errors for all: `401 Unauthorized`, `403 Forbidden` for role or company denial. No other errors are added by the endpoint mapping; controller/service errors are implementation-dependent.

## PDF / Tracking

### `GET /tickets/{trackingToken}/pdf`

- Authorization: Public / Anonymous.
- Input: path `trackingToken` string; no body.
- Success: PDF file response, content type `application/pdf` (not JSON).
- Errors: `404 Not Found` when the tracking token is not found; generation errors are Needs verification.
- V1 public PDF intentionally includes the ticket `PIN`.
- Ελληνικά: Ο πελάτης κατεβάζει ή ανοίγει το PDF του ticket από public tracking link.

## SignalR

SignalR is not a normal HTTP endpoint. `Program.cs` maps the hub at:

```text
/queue-hub
```

The current `QueueHub` has no `[Authorize]` attribute, so the code does not require authentication at hub level (Needs verification if hosting configuration adds another restriction).

### Client method: `JoinQueue(queueId)`

- Client invokes `connection.invoke("JoinQueue", 5)`.
- The connection joins the group `queue-5`.
- No JSON request body or HTTP status code exists; this is a SignalR invocation.

### Client method: `LeaveQueue(queueId)`

- Client invokes `connection.invoke("LeaveQueue", 5)`.
- The connection leaves the group `queue-5`.
- No JSON request body or HTTP status code exists.

### Server event: `NowServingChanged`

After `/tickets/next` successfully claims a ticket, the backend sends this event to the ticket’s queue group:

```json
{ "number": 42, "deskId": 2, "queueId": 5 }
```

The frontend connects to `/queue-hub`, invokes `JoinQueue(queueId)`, listens for `NowServingChanged`, and updates the queue display in real time. This event is separate from the normal HTTP response returned by `/tickets/next`.

## Authorization Summary

- Public / Anonymous: `/`, `/health`, `/api/ping`, `POST /front-logs/`, registration endpoints, login, the `/public/{companySlug}` customer-read routes, `POST /tickets/` remote issuance, `GET /tickets/{trackingToken}`, and ticket PDF tracking.
- Authenticated: token refresh, `/company-users/mine`, `/staff-sessions/mine`, and most ticket/session operational routes after controller role/resource checks.
- USER: may register, create tickets, view own tickets, and cancel own eligible tickets; controller checks apply where implemented.
- STAFF: uses active Staff Sessions and the ticket operational endpoints (`queue`, `next`, `complete`, `missed`, `recall`); administrative CRUD routes are not available through `AdminOnly` policies.
- ADMIN: `AdminOnly` endpoints, normally limited by CompanyUser membership to accessible companies/resources. Ticket Services additionally enforce company access in `TicketServiceController`.
- SUPERADMIN: `SuperAdminOnly` endpoints and the SUPERADMIN bypasses company membership checks in controllers that implement company authorization.
- Additional checks: policies are defined by `AddJwtAuth` and include `AdminOnly`, `SuperAdminOnly`, and `SelfOrAdmin`; exact claim construction is in `backend/auth/Extensions/AuthExtensions.cs`.
