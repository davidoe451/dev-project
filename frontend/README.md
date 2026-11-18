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

## Sprint 2 interface

All changes for Sprint 2 are in `frontend`. The sibling `frontend-dev` directory is a design reference.

| Route | Interface |
| --- | --- |
| `/products` | Product grid, search, combined filters, price validation, sorting, pagination and mobile filter panel |
| `/products/:id` | Image gallery, size/color selection, variant price, SKU and stock |
| `/admin/products` | Product editor with multiple image previews, cover selection, ordering and removal |
| `/admin/users` | Customer list, status filters, pagination, activation and deactivation confirmation |

When a catalog endpoint fails or does not provide variant/gallery data, the existing sample catalog is used. A visible **Sample catalog** notice distinguishes preview content from live prices and stock. Use **Retry live catalog** or **Retry live product** to try the API again.

### Product photos

In the product editor, use a hosted HTTP/HTTPS image URL to save images with the existing product API. Device photos support JPEG, PNG and WebP, with a limit of 5 MB per image and 8 gallery images. The first image is the cover. Local previews are not saved as uploaded images, and the product cannot be saved while uploads remain pending.

File upload is disabled until the backend supplies an upload endpoint. Set `productImageUploadUrl` in the environment configuration to the complete endpoint URL. The image picker sends one `multipart/form-data` request per image using field `file` and expects either `{ "url": "https://..." }` or `{ "data": { "url": "https://..." } }`. Uploaded URLs are then saved through the existing product create/update request. Server-side file validation and storage belong to the backend.

### Backend handoff

- Catalog list/detail responses need product `variants` (size, color, SKU, price, stock) and `images` (URL, primary flag, sort order), matching `src/app/core/models/catalog.model.ts`.
- Catalog search, filters, sorting and pagination are sent together as query parameters by `CatalogService`. The existing legacy `ProductService` uses a separate product contract; this interface work does not add a backend variant API.
- Customer management uses `GET /users?role=CUSTOMER` and `PATCH /users/:id/active` with `{ "isActive": true }` or `{ "isActive": false }`. The FE maps `isActive` to status labels and applies search/pagination locally when the API returns an array. The backend must enforce admin authorization. `/admin/customers` redirects to `/admin/users`.
- Product upload requires the configurable endpoint described above. The current default is empty, so selecting files only previews them.

Run `npm run check:gallery` with Node.js 24 to check image file type, size and count limits. No backend or database access is needed for this check.

### Current admin API integration

The admin product service adapts the main backend's direct catalog response (`items`, `total`, `page`, `limit`, `totalPages`) to the admin UI. It converts numeric IDs to strings, `basePrice` to the displayed price, variant stock to total stock, and gallery images to the existing admin gallery format. Categories load from `/categories`.

Run `npm run check:admin` to check response mapping, or `npm run check:admin -- --live` to also make read-only requests to `/products` and `/categories` on `http://localhost:3000`.

The current backend does not expose order endpoints or product create/edit/delete endpoints. The dashboard shows unavailable order statistics instead of fabricated counts; the orders page reports that the feature is not available. These missing endpoints need backend work.
