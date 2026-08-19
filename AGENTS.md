# MyTurn Agent Guidelines

MyTurn is a queue-management application with:

- `backend/` — ASP.NET Core / .NET / EF Core / SQLite
- `frontend/` — React + Vite + TypeScript + MUI
- `native/` — Expo React Native + TypeScript

## General Rules

- Read the existing related files before changing code.
- Preserve the current architecture and project patterns.
- Make the smallest change that solves the task.
- Do not refactor unrelated code.
- Prefer readable, human-written code over condensed code.
- Format JSX and TypeScript with normal Prettier-style line breaks.
- Keep TypeScript and ESLint clean without suppressions.
- Reuse existing hooks, types, styles, helpers, and API functions before creating new ones.
- Do not duplicate logic that already exists elsewhere in the project.

## Backend

Backend V1 is considered stable.

Do not change backend behavior unless:
- fixing a confirmed bug, or
- a frontend/native feature requires a genuinely missing endpoint.

Keep the existing:
`Endpoint -> Controller -> DAO -> EF Model`
structure.

Preserve JWT authorization, role checks, company isolation, ticket lifecycle, and SignalR behavior.

## React Web

- Use current MUI with TypeScript.
- Prefer `sx={{ ... }}` for MUI styling.
- Before changing a MUI API, check the current documentation when uncertain.
- Keep API/business logic in hooks when an existing hook pattern exists.
- Avoid synchronous `setState` helper calls directly from `useEffect`.

## React Native

- Read `styles/global.ts` before adding styles.
- Reuse `ThemeContext`, global styles, existing screen layouts, and hooks.
- Respect Safe Areas and keyboard avoidance where relevant.
- Use AsyncStorage for native persistence where existing patterns already do so.
- Preserve the current Expo Router structure.
- When porting web functionality, adapt it to native patterns rather than copying browser-specific APIs.

## Verification

After changes, run the relevant TypeScript/ESLint/build checks.

For behavior changes, test the affected user flow instead of only checking that the code compiles.