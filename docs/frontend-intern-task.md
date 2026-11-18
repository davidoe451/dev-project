# Frontend Internship Task
## Project Initialization - Angular 20+

### Objective
Build and prepare the frontend foundation for the project using modern Angular architecture and best practices.

### Technology Stack
- Angular 20+
- Vite
- TailwindCSS
- shadcn/ui
- TypeScript
- ESLint
- Prettier

---

# Responsibilities

## 1. Initialize Project

### Tasks
- Create Angular application using latest Angular version.
- Configure Vite build system.
- Configure project aliases:
  - @core
  - @shared
  - @features
  - @layouts
  - @assets

### Deliverables
- Running Angular project
- Repository structure committed

---

## 2. Configure Code Quality
- Setup ESLint
- Setup Prettier
- Create npm scripts: lint, lint:fix, format

## 3. Setup TailwindCSS
- Install TailwindCSS
- Configure design tokens and color palette
- Create typography utilities

## 4. Setup shadcn/ui
- Install and configure shadcn/ui
- Generate Button, Input, Select, Card, Dialog, Table, Loader

## 5. Create Theme System
- Light Theme
- Dark Theme
- Primary/Secondary/Success/Warning/Error colors

## 6. Create Layout Foundation
- Public Layout
- Auth Layout
- Main Layout
- Header, Sidebar, Footer, Breadcrumb

## 7. Configure Routing
- Lazy Loading
- Route Guards (placeholder)
- Dashboard, Auth, Not Found pages

## 8. Shared Components
- AppButton
- AppInput
- AppTable
- AppCard
- AppSpinner

## 9. Environment Management
- Development
- Staging
- Production

## 10. Documentation
- Installation guide
- Project structure
- Coding standards

# Suggested Project Structure
```text
src/
├── app
│   ├── core
│   ├── shared
│   ├── layouts
│   ├── features
│   ├── app.routes.ts
│   └── app.config.ts
├── assets
├── styles
└── environments
```

# Acceptance Criteria
- Application builds successfully
- Light/Dark theme available
- Routing configured
- Shared components created
- Lint passes
- README completed
