# MyTurn Web → React Native Transfer Guide

## Purpose

This document describes the current `frontend` implementation as the source of truth for a future React Native application. The Native app should preserve the same user journeys, backend contracts, authorization rules, queue behavior, and ticket semantics, while replacing browser-specific routing, storage, UI, and lifecycle code.

The existing Web frontend is a Vite React application. It uses React 19, TypeScript, Axios, React Router, MUI, `@microsoft/signalr`, JWT decoding, and `qrcode.react`.

The backend remains the business source of truth. Native should call the same backend APIs and should not reproduce ticket status transitions, queue assignment, EWT calculations, PIN rules, desk occupancy validation, or authorization decisions locally.

## Important rules for the Native implementation

- Keep backend API paths unchanged. A frontend route is not a backend endpoint.
- Public tracking is opened at the Web URL `/track/{trackingToken}`. The backend data endpoint remains `GET /tickets/{trackingToken}`.
- Do not send authentication tokens to anonymous public endpoints.
- Use secure Native storage for tokens, not ordinary preferences storage.
- Preserve leading-zero PINs as strings.
- Do not create a second local ticket-counting or queue-state system. Refresh or consume backend state.
- STAFF actions must continue to use the active `StaffSession` and backend authorization.
- Double desk occupancy remains a backend safety rule even if Native filters occupied desks before selection.
- Realtime events are notifications that backend queue state changed. The backend remains authoritative.
- Public and kiosk flows are different: public remote ticket creation is anonymous, while kiosk creation is associated with an active STAFF session and uses the kiosk endpoint.
- Avoid copying MUI components or Web page layout logic into Native. Reuse data/workflow logic and create Native screens separately.

## Web project structure

```text
frontend/
  package.json
  vite.config.ts
  tsconfig*.json
  src/
    main.tsx
    App.tsx
    App.css
    index.css
    constants/
    assets/
    authLogin/
    admin/
    components/
    context/
    hooks/
    layout/
    pages/
    types/
```

### Application bootstrap

`src/main.tsx` creates the React root and wraps the app in this order:

```text
StrictMode
  BrowserRouter
    UserProvider
      StaffProvider
        App
```

React Native will replace:

- `BrowserRouter` with a Native navigation container and stacks/tabs/deep links;
- `UserProvider` with a Native-aware authentication provider;
- `StaffProvider` with a Native context or store if the same shared STAFF workflow is retained.

`StaffProvider` calls `useStaff`, so STAFF state is initialized globally even when the current screen is not the STAFF workspace.

### Constants and assets

`src/constants/constants.ts` contains:

- `backendUrl`, from `VITE_BACKEND_URL` or `http://localhost:3020`;
- `appName`;
- shared color values.

The DSEG7 Classic font in `src/assets/DSEG7Classic-Bold.ttf` is used by the large number display. Native must load a platform font asset through the Native font mechanism rather than CSS `@font-face`.

The QR dependency is `qrcode.react` for Web. Native needs a QR component compatible with the selected React Native stack.

## Web routes and Native screen equivalents

Routes are declared in `src/App.tsx`. Most routes are rendered inside `layout/layout.tsx`, which normally shows the Navbar. Public routes do not require login. Protected routes use the existing auth route wrappers.

| Web route | Current purpose | Native equivalent |
|---|---|---|
| `/` | Home screen | Public Home screen |
| `/info` | Informational page | Public Info screen |
| `/login` | Backend login | Login screen |
| `/register` | Backend registration | Registration screen |
| `/private` | Existing authenticated private page | Authenticated user screen if retained |
| `/super-admin` | SuperAdmin area | SuperAdmin navigation/screen if retained |
| `/admin` | New Admin panel | Admin navigation stack |
| `/company-wizard` | Organization setup wizard | Admin setup flow |
| `/staff` | STAFF company/desk/session/workspace flow | STAFF navigation stack |
| `/staff/profile` | Read-only STAFF profile | STAFF profile screen |
| `/staff/public-tablet` | Public tablet home | Kiosk home screen |
| `/staff/public-tablet/issue` | Kiosk ticket issuance | Kiosk issue-ticket screen |
| `/staff/public-tablet/ticket` | Kiosk result and countdown | Kiosk ticket-result screen |
| `/staff/number-display` | Multi-queue number display | Number display screen |
| `/track/:trackingToken` | Public Web ticket tracking page | Public tracking screen or external Web link |
| `/:companySlug` | Anonymous company page | Public company screen |
| `/:companySlug/:locationSlug` | Anonymous location/queue page | Public location screen |
| `/:companySlug/:locationSlug/queues/:queueId` | Anonymous remote ticket form | Public remote-ticket screen |

The parameterized public routes must remain below fixed route handling in Native navigation. The Web router already has fixed routes before the company-slug routes; Native should use explicit screen names and parameter validation rather than a broad path matcher.

## Authentication and authorization

### Current Web authentication

`src/authLogin/context/UserAuthContext.tsx`:

- reads `localStorage["token"]`;
- decodes the JWT with `jwt-decode`;
- checks the JWT expiry;
- removes expired or invalid tokens;
- creates the current user from JWT claims;
- refreshes tokens through `POST /auth/refresh`;
- exposes `user`, `isLoading`, setters, and `refreshUser` through context.

`src/authLogin/authFunctions.ts` contains logout behavior. Navbar and kiosk/layout logic use it to clear the user and navigate.

The user object contains fields such as:

```text
_id
username
name
email
roles[]
hasPassword
provider
```

### Native authentication design

Use a Native authentication provider with:

1. Secure token storage, preferably SecureStore/Keychain/Keystore-backed storage;
2. an in-memory current-user state;
3. JWT expiry checking or backend validation;
4. refresh-token handling equivalent to the Web `/auth/refresh` flow;
5. an authenticated request helper that injects `Authorization: Bearer ...`;
6. logout that clears secure credentials and resets dependent STAFF state.

Do not make every Native hook read storage directly. The current Web code does this in many places and that is a portability weakness. Native should pass an auth client/token provider to reusable data logic or expose one through a platform-neutral auth context.

### Route authorization

The existing Web wrappers are:

- `PrivateRoute`;
- `AdminPrivateRoute`;
- `SuperAdminPrivateRoute`;
- `StaffPrivateRoute`;
- lower-level `Protected` logic.

Native should reproduce their role rules in navigation guards. Backend authorization remains mandatory and must not be weakened.

Role behavior in the Web Navbar:

- ADMIN/SUPERADMIN: Admin Panel;
- STAFF without ADMIN/SUPERADMIN: Staff Workspace and My Profile;
- anonymous users: Login;
- normal USER: existing normal user behavior.

## API access conventions

Most current logic uses Axios directly with URLs built from `backendUrl`. Authenticated requests commonly use:

```text
Authorization: Bearer localStorage.getItem("token")
```

Native should centralize this into an Axios instance or request function with interceptors/token injection. The backend endpoint paths and payloads must remain the same.

## Public customer flows

### Public company flow

Files:

- `pages/PublicCompany.tsx`
- `hooks/publicPageHooks/usePublicCompany.ts`

Flow:

1. Read `companySlug` from Web route params.
2. Request `GET /public/{companySlug}`.
3. Request `GET /public/{companySlug}/locations`.
4. Display company and active locations.
5. Navigate to `/{companySlug}/{locationSlug}`.

No authentication token is sent. The hook is already close to platform-neutral. Native only needs a different screen and navigation.

### Public location flow

Files:

- `pages/PublicLocation.tsx`
- `hooks/publicPageHooks/usePublicLocation.ts`

Flow:

1. Receive `companySlug` and `locationSlug`.
2. Request company data, location data, and queues:
   - `GET /public/{companySlug}`;
   - `GET /public/{companySlug}/{locationSlug}`;
   - `GET /public/{companySlug}/{locationSlug}/queues`.
3. Keep only queues where `isRemoteTicketingAllowed` is true.
4. Navigate to the queue-specific ticket form.

### Anonymous remote ticket flow

Files:

- `pages/PublicRemoteTicket.tsx`
- `hooks/publicPageHooks/usePublicRemoteTicket.ts`

The hook loads:

- company;
- location;
- all queues for the location;
- services for the selected queue.

The page submits anonymously to:

```http
POST /tickets
```

Payload:

```json
{
  "queueId": 5,
  "email": "customer@example.com",
  "serviceIds": [3, 4]
}
```

Email is optional and services are optional. On success the backend response contains `data.trackingToken`, and the Web page navigates to:

```text
/track/{trackingToken}
```

The tracking route then calls the backend:

```http
GET /tickets/{trackingToken}
```

Do not confuse the public Web route `/track/...` with the backend `/tickets/...` API route.

### Public ticket tracking

Files:

- `pages/TicketInfo.tsx`
- `hooks/publicPageHooks/useTicketInfo.ts`

The public response currently displays:

- ticket number;
- PIN;
- status;
- selected services;
- estimated waiting minutes;
- number of tickets ahead;
- all currently serving desk/number entries.

The current tracking types are in `types/ticket.types.ts`. Native can reuse the data contract and replace only the screen, loading/error presentation, and navigation.

## STAFF architecture

### Context and provider

Files:

- `context/StaffContext.tsx`;
- `context/StaffContextDefinition.ts`;
- `context/useStaffContext.ts`;
- `hooks/staff/useStaff.ts`.

`StaffProvider` calls `useStaff` and supplies the resulting object through `StaffContext`. STAFF screens call `useStaffContext` rather than independently loading session state.

### `useStaff` state

Important state includes:

- organizations available to the staff user;
- selected organization ID and organization;
- available desks;
- selected desk;
- active StaffSession;
- queue tickets;
- current serving ticket;
- starting-session/loading/error flags;
- waiting, serving, and missed derived ticket arrays;
- counts and next waiting ticket.

### Session recovery

When authentication finishes, `useStaff`:

1. loads `GET /company-users/mine`;
2. loads `GET /staff-sessions/mine`;
3. if there is an open session, loads the staff desks and serving ticket;
4. restores company, desk, session, and current ticket state;
5. loads the queue ticket list.

Native must preserve this recovery behavior. Refreshing or reopening the STAFF area must not hide the user’s own active desk or create another session.

### Desk discovery and session start

When a company is selected:

```http
GET /staff/companies/{companyId}/desks
```

The backend returns desks available for selection according to current occupancy. The frontend should display only returned desks, while the backend start-session validation remains the final protection.

Starting a shift:

```http
POST /staff-sessions
{ "deskId": 1 }
```

The STAFF user selects a desk; staff are not permanently assigned to a desk through Admin. Desk occupancy belongs to the active StaffSession.

### STAFF ticket actions

`useStaff` calls:

- `POST /tickets/next`;
- `POST /tickets/{ticketId}/complete` with `completionResult`;
- `POST /tickets/{ticketId}/missed`;
- `POST /tickets/{ticketId}/recall`;
- `PUT /staff-sessions/{sessionId}/status` for break/active;
- `POST /staff-sessions/{sessionId}/end`.

After mutations, it refreshes the queue ticket list. The server is authoritative for status and counts.

### STAFF PIN identification

Files:

- `hooks/staffPageHooks/useStaffTicketIdentification.ts`;
- PIN UI in `components/staffSetup/staffFlowSteps/Step4StaffWorkspace.tsx`.

The hook keeps the PIN as a string and calls:

```http
GET /tickets/identify-by-pin/{pin}
```

The endpoint requires STAFF authentication and an active StaffSession, searches within the current location/reset scope, and is identification-only. It does not change ticket state. Leading-zero PINs must remain intact.

### STAFF profile

`pages/StaffProfile.tsx` displays safe fields already present in the authenticated user object. It is read-only and does not need a new backend request unless the Native product later requires additional profile data.

## SignalR and realtime behavior

The Web uses `@microsoft/signalr` and connects to:

```text
{backendUrl}/queue-hub
```

The main event names are:

- `QueueTicketAdded`;
- `NowServingChanged`;
- `NowServingEnded`.

### STAFF queue synchronization

`useStaff`:

1. creates a connection when an active StaffSession exists;
2. registers the three event handlers;
3. joins `session.queueId` through `JoinQueue`;
4. refreshes `/tickets/queue/{queueId}` for matching queue events;
5. rejoins after `onreconnected`;
6. unregisters handlers and stops the connection during cleanup.

The events are notifications. STAFF must not manually remove or mutate ticket entries based only on an event; it should refresh the ticket list.

### Public tablet

`usePublicTablet` subscribes to the active session queue and reacts to matching `NowServingChanged`. It also loads a public HTTP now-serving snapshot first.

### Number display

`useStaffNumberDisplay`:

- loads all active queues for the session location;
- loads `/now-serving`;
- joins every queue group;
- maintains per-queue/per-desk entries;
- handles `NowServingChanged`;
- rejoins all queues after reconnect.

Native SignalR considerations:

- the event contracts and group names are reusable;
- connection creation should be injected or wrapped;
- app background/foreground transitions need explicit reconnect policy;
- cleanup must happen on screen blur/unmount and session changes;
- Native persistence must replace Web localStorage.

## Browser storage and persistence

Current storage keys:

| Key | Current use | Native replacement |
|---|---|---|
| `token` | JWT authentication | SecureStore/Keychain/Keystore-backed storage |
| `myturn-kiosk-mode` | Kiosk route protection flag | Native kiosk/session state, not ordinary public storage |
| `myturn-public-tablet-ticket` | Kiosk result handoff between issue and result routes | Navigation params or AsyncStorage/session store |
| `myturn:public-tablet:last-called` | Same-day last-called value for PublicTablet | Injected device persistence, probably AsyncStorage |
| `myturn:number-display:last-called` | Same-day multi-desk last-called display values | Injected device persistence, probably AsyncStorage |

The kiosk result page currently reads the stored ticket result, fetches updated EWT, counts down from 60 seconds, removes the stored result, and navigates back to kiosk home. Native can pass the result through navigation state instead of storage if the flow remains in one navigation stack.

The last-called values are presentation fallback only. They must not be treated as backend ticket state.

## Kiosk/public tablet flow

### Entering kiosk mode

The STAFF workspace button:

1. sets `sessionStorage["myturn-kiosk-mode"] = "true"`;
2. navigates to `/staff/public-tablet`.

`layout/layout.tsx`:

- hides the normal Navbar on the three public-tablet routes;
- allows navigation only within those routes while kiosk mode is active;
- logs out and redirects to `/login` if kiosk mode reaches another route.

The current Web exit button on the public tablet home screen is commented out. The kiosk remains entered through the STAFF workspace and should not automatically end the StaffSession.

Native should use a dedicated kiosk navigation stack. Do not rely on a Web-style URL cleanup effect as the only protection.

### Kiosk ticket issuance

`usePublicTabletIssueTicket`:

1. receives active StaffSession, selected company, and selected desk;
2. resolves the session location through the public company endpoints;
3. loads public queues;
4. loads services only after a queue is selected;
5. keeps services optional;
6. calls `POST /tickets/kiosk` with the STAFF token;
7. returns ticket result data to the page.

The payload is:

```json
{
  "queueId": 5,
  "email": null,
  "serviceIds": [3]
}
```

### Kiosk result

`usePublicTabletTicketResult`:

- receives the restored ticket result;
- calls `GET /tickets/{trackingToken}` for the current EWT;
- exposes a 60-second countdown;
- exposes `countdownFinished` without navigating itself.

The Web page owns sessionStorage, `window.location.origin`, QR rendering, and React Router navigation. Native should provide Native storage/navigation/QR equivalents.

## Public and STAFF number displays

### PublicTablet

The Web page is mostly rendering. `usePublicTablet` owns:

- current number state;
- public snapshot loading;
- queue SignalR subscription;
- same-day fallback persistence.

### StaffNumberDisplay

The Web page renders the large DSEG7 number display. `useStaffNumberDisplay` owns:

- location and queue loading;
- public now-serving snapshot;
- multi-desk state;
- queue SignalR connections;
- same-day persistence.

The Native display should preserve the distinction between queue, desk, number, and display entry. A queue may have multiple serving desks.

## Admin panel

The Admin page uses `AdminLayout`, `AdminSidebar`, and focused panel/hook pairs. The current sidebar order is:

1. Overview;
2. Organizations;
3. Locations;
4. Queues;
5. Services;
6. Desks;
7. Staff;
8. Analytics.

Pairs:

```text
AdminCompaniesPanel.tsx  + useAdminCompanies.ts
AdminLocationsPanel.tsx  + useAdminLocations.ts
AdminQueuesPanel.tsx     + useAdminQueues.ts
AdminServicesPanel.tsx   + useAdminServices.ts
AdminDesksPanel.tsx      + useAdminDesks.ts
AdminStaffPanel.tsx      + useAdminStaff.ts
AdminAnalyticsPanel.tsx  + useAdminAnalytics.ts
```

### Admin scope hierarchy

The domain hierarchy is:

```text
Organization
  └── Location
        └── Queue
              ├── Service
              └── Desk
```

Staff membership is organization-level. Staff are not permanently assigned to a location, queue, or desk by this Admin UI. They select an available desk when starting a StaffSession.

### Admin operations

- Organizations: create, edit, delete, view public link, and display a QR for `window.location.origin/{company.slug}` on Web.
- Locations: organization-scoped CRUD, active state, address/country/time zone.
- Queues: location-scoped CRUD, active/remote settings, default service minutes, limits, opening/closing times, automatic reset settings, and manual reset where supported.
- Services: location/queue-scoped CRUD, active state, generic flag, and estimated service minutes.
- Desks: location/queue-scoped CRUD and active state.
- Staff: organization-level staff membership/account creation and supported management operations.
- Analytics: read-only organization metrics loaded from multiple analytics endpoints.

Native Admin screens should use the same scope rules and backend validation. Selectors and forms need Native UI replacements, but the domain relationships must not be weakened.

## Company Wizard

Files:

- `pages/CompanyWizard.tsx`;
- `components/companySetup/companyWizardSteps/*`;
- `hooks/companySetupHooks/useCompanyWizard.ts`;
- `hooks/companySetupHooks/useCompanySetupActions.ts`;
- `hooks/companySetupHooks/useLocationSetupActions.ts`;
- `components/companySetup/Create*Form.tsx`.

The wizard supports:

1. register admin when no user exists;
2. create the first organization;
3. select an organization;
4. create staff and locations;
5. create queues, services, and desks inside a selected location.

The setup hooks load authenticated data and refresh lists after child Create*Form callbacks. The existing Create*Form components are Web/MUI forms and should not be copied into Native. Preserve their API payloads and backend validation when replacing their UI.

## Types and domain contracts

Shared types are under `src/types/` and should guide Native model definitions:

- `company.types.ts`: company/setup summaries;
- `location.types.ts`: locations and location options;
- `queue.types.ts`: queue summaries/options;
- `service.types.ts`: service summaries;
- `desk.types.ts`: desk summaries;
- `adminPanel.types.ts`: Admin API response shapes;
- `analytics.types.ts`: analytics response DTOs;
- `public.types.ts`: anonymous/public API shapes;
- `ticket.types.ts`: public tracking, ticket, service, result, and now-serving data;
- `staff.types.ts`: staff company, desk, session, and PIN identification data;
- `signalr.types.ts`: realtime event payloads.

Keep distinct API views distinct. For example, Admin, public, STAFF, and tracking responses may represent related entities with different fields and authorization meaning.

## Error and loading behavior

The Web uses local loading/error state in hooks. Initial effects generally use:

```text
useEffect
  start Axios promise
  .then set state if not ignored
  .catch set error if not ignored
  cleanup ignore flag
```

Native should preserve:

- loading states for initial requests;
- retryable submit errors that keep forms visible;
- not-found behavior for public company/location/queue/ticket screens;
- backend error messages where useful;
- cleanup against stale updates when screens change or unmount.

Do not treat a public API error as an authentication error. Do not silently attach a token to public requests.

## Navigation and Web-only boundaries

The following logic must be redesigned or kept in Native screen wrappers:

- `useParams`, `useNavigate`, `NavLink`, and pathname route checks;
- `window.location.origin` for QR/public links;
- `localStorage` and `sessionStorage`;
- MUI, DOM text fields, checkboxes, dialogs, tables, and menu controls;
- Web fixed Navbar and layout;
- browser-only kiosk route protection;
- `QRCodeSVG` rendering;
- CSS/Tailwind and the DSEG7 `@font-face` setup.

The existing extracted hooks are the best starting point for Native, but the following still contain browser-specific behavior and should be handled deliberately:

- `hooks/staff/useStaff.ts`: direct token reads and StaffContext coupling;
- `hooks/publicPageHooks/usePublicTablet.ts`: localStorage and SignalR;
- `hooks/staffPageHooks/useStaffNumberDisplay.ts`: localStorage and multiple SignalR groups;
- `hooks/publicPageHooks/usePublicTabletIssueTicket.ts`: localStorage token for kiosk API;
- Admin/setup hooks: direct localStorage token reads;
- `usePublicTabletTicketResult.ts`: timer/data logic is reusable, while storage/navigation remain in the page.

## Recommended Native implementation order

1. Define Native configuration for the backend URL and public Web tracking base URL.
2. Implement secure authentication/token refresh and an authenticated request helper.
3. Build public company and location screens using the existing public hooks/contracts.
4. Build public remote ticket creation.
5. Build public ticket tracking and decide whether tracking opens Native or the Web `/track` URL.
6. Build STAFF authentication, StaffSession recovery, company and desk selection.
7. Build the small STAFF PIN identification feature.
8. Build core STAFF ticket actions and queue state.
9. Build kiosk ticket issuance/result flow with Native navigation and secure/session persistence.
10. Build realtime PublicTablet and NumberDisplay screens after establishing SignalR foreground/background handling.
11. Build Admin analytics and then Admin CRUD screens.
12. Build the Company Wizard/setup flow with Native forms.

This order isolates authentication and navigation decisions before the most stateful STAFF and realtime screens.

## Native readiness assessment

Already in good shape:

- public data loading hooks are separated from rendering;
- ticket tracking data has shared types;
- kiosk issue/result state is partly separated;
- STAFF realtime logic is concentrated in hooks rather than duplicated in pages;
- Admin functionality uses focused hooks per panel.

Main remaining risks:

- repeated direct JWT reads from Web `localStorage`;
- authentication and StaffSession recovery are tightly connected to Web context;
- SignalR lifecycle is repeated in several hooks;
- kiosk persistence and route protection use browser sessionStorage and paths;
- QR links and public links use `window.location.origin`;
- Admin/setup hooks combine API logic with form-oriented state;
- the Web route tree is the current navigation state machine.

The first Native architecture decision should therefore be the platform boundary for authentication, secure storage, navigation, and realtime connection creation. Once those are explicit, most public data hooks and a significant portion of ticket/API logic can be reused conceptually or with small injected dependencies.
