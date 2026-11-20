# ERT Hub

Engineering operations workspace for the EJUST Racing Team (ERT).

ERT Hub gives the team one place to manage tasks, projects, events, weekly
reports, and deliverables, so Operations can see who is doing what, what is
overdue, and what is blocked.

## Status

In development. Currently in Phase 1 (project foundation).
See [docs/development-roadmap.md](docs/development-roadmap.md).

## MVP features

- Login and role-based access
- Task management (assign, deadlines, status, progress)
- Dashboard
- Weekly reports
- Calendar
- Events

## Tech stack

- Next.js (App Router) and TypeScript
- Tailwind CSS
- Supabase (database, authentication, file storage), planned
- Deployed as an installable web app (PWA), planned

## Getting started

Requirements: Node.js (LTS) and Git.

```bash
git clone https://github.com/Farah-Hossam/ERT-hub.git
cd ERT-hub
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
docs/    Requirements, architecture, roadmap
src/
  app/         Pages and layouts
  components/  Reusable UI components
  features/    Tasks, projects, reports, and other features
  lib/         Shared utilities
  config/      Theme, navigation, constants
```

## Documentation

- [Product requirements](docs/product-requirements.md)
- [Development roadmap](docs/development-roadmap.md)
