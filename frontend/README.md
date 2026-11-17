# WEAREZ Frontend

Angular frontend for the WEAREZ online clothing store.

## Requirements

- Node.js and npm
- Backend API running at `http://localhost:3000` by default

## Install and run

From this directory:

```bash
npm ci
npm start
```

The development server is available at `http://localhost:4200`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Run the Angular development server |
| `npm run build` | Create a production build in `dist/online-clothing-store` |
| `npm run watch` | Rebuild on source changes using development settings |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Apply automatic ESLint fixes |
| `npm run format` | Format files with Prettier |

## Routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Home page |
| `/auth/login` | Public | Sign in |
| `/auth/register` | Public | Create an account |
| `/profile` | Signed-in users | View account details |
| `/admin/customers` | Admin only | View and activate or deactivate customer accounts |

`/login`, `/register`, and `/signup` redirect to the matching authentication routes.

## Frontend structure

```text
src/app/
├── core/       # Authentication service, guards, interceptor and models
├── features/   # Home, auth, profile and admin customer pages
├── layouts/    # Main site and authentication layouts
└── shared/     # Reusable UI components and utilities
```

Feature pages are lazy-loaded. Login and registration use Angular Reactive Forms. Authentication state is held by `AuthService`; the HTTP interceptor adds the bearer token and clears the session after an unauthorized response.

## API configuration

The API base URL is configured in:

- `src/environments/environment.ts` for development
- `src/environments/environment.production.ts` for production builds

Both currently point to `http://localhost:3000`. Change the production URL and configure an Angular environment replacement in `angular.json` before deploying the frontend to a remote environment.

The frontend uses these endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register with email and password |
| `POST` | `/auth/login` | Sign in and receive a JWT |
| `GET` | `/auth/profile` | Load the signed-in user profile |
| `GET` | `/users?role=CUSTOMER` | Load customer accounts for the admin page |
| `PATCH` | `/users/:id/active` | Activate or deactivate a customer |

The customer administration page requires the backend to provide the customer list endpoint and an active admin account. The frontend expects the list endpoint to return a JSON array with each customer's `id`, `email`, `isActive`, `role`, and optional timestamps. The activation endpoint must be restricted to admins by the backend.

## Production build

```bash
npm run build
```

The generated files are written to `dist/online-clothing-store`.
