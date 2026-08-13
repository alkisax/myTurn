# Repository Guidelines

## Project Structure & Module Organization

This repository contains the MyTurn queue-management backend. The main application is in `backend/`, an ASP.NET Core .NET 10 web project using SQLite and Entity Framework Core. Keep web startup and route registration in `backend/Program.cs`; organize HTTP route mappings in `Endpoints/`, request handlers in `Controllers/`, persistence access in `Daos/`, EF Core configuration in `Data/`, domain entities in `Models/`, and transport types in `Dtos/`. Authentication-specific code is grouped under `backend/auth/`. Database migrations belong in `backend/Data/Migrations/`. Use `ZhttpTestsBackend/` for repeatable HTTP/API request scenarios and `notes/` for project notes.

## Build, Test, and Development Commands

Run commands from the repository root unless noted:

```powershell
dotnet restore backend/backend.csproj
dotnet build backend/backend.csproj
dotnet run --project backend/backend.csproj
```

The server listens on `http://localhost:3020`; `/health` is a smoke check. Execute `.http` files in `ZhttpTestsBackend/` with an HTTP client such as VS Code REST Client. There is no committed automated test project; add one before relying on `dotnet test`.

## Coding Style & Naming Conventions

Use two-space indentation, nullable-aware C#, implicit usings, and PascalCase for types, methods, controllers, endpoints, and public members. Use descriptive suffixes such as `Controller`, `Dao`, `Endpoint`, `Dto`, and `Service`. Keep namespaces and folders aligned with `backend` and `backend.auth`. Preserve the separation between endpoints, controllers, DAOs, and EF models. Run `dotnet format backend/backend.csproj` for substantial formatting changes.

## Testing Guidelines

For API changes, update or add a focused `.http` scenario in `ZhttpTestsBackend/` and verify authorization, validation, and tenant-scope behavior. For data-model changes, create an EF migration and exercise the affected endpoint against the local SQLite database. If adding automated tests, place them in a separate test project and use descriptive names such as `CreateTicket_WhenQueueIsOpen_ReturnsTicket`.

## Commit & Pull Request Guidelines

Use concise conventional-style commit subjects, as in the existing history: `feat: ...`, `fix: ...`, or `wip: ...`. Keep commits focused. Pull requests should describe the behavioral change, identify database or configuration impacts, list verification commands and manual HTTP scenarios, link the relevant issue, and include request/response examples or screenshots when an API/UI behavior is difficult to review from code alone.

## Security & Configuration Tips

Do not commit secrets, tokens, production connection strings, or local signing keys. Review `appsettings*.json` before sharing changes, use environment-specific configuration for credentials, and treat the local `backend/MyTurn.db` as development data only. Check migrations and authorization rules carefully for every schema or multi-tenant change.
