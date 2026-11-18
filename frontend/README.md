# WEAREZ Frontend

Angular 20 frontend for the online clothing store. The Sprint 2 catalog uses the NestJS backend in `../backend`.

## Run locally

1. Configure the backend database and JWT secret in `../backend/.env` using `../backend/.env.example`.
2. In `backend`, run `npm ci`, `npx prisma generate`, `npx prisma migrate deploy`, `npm run seed`, then `npm run start:dev`.
3. In `frontend`, run `npm ci` and `npm start`.
4. Open `http://localhost:4200`. The API defaults to `http://localhost:3000`; change `src/environments/environment.ts` if needed.

The production environment currently also points to localhost. Set the production API URL and configure an Angular environment replacement before deployment.

## Sprint 2 integration

| Page | Backend contract |
| --- | --- |
| `/` | Shows recent products from `GET /products` and category/brand lists |
| `/products` | Uses `GET /products` for name search, category/brand/size/price filters, stock, sort and pagination |
| `/products/:slug` | Uses `GET /products/:slug` for images, variant price, SKU and stock; related items come from the same listing API |
| Product detail while signed in as admin | Uploads images with `POST /products/:id/images` and sets the cover with `PATCH /products/images/:imageId/primary` |

The backend also exposes variant creation and update APIs for admins. The product detail page reads variants; cart and checkout remain later-sprint work. The gender and season filters are hidden because Sprint 2 has no corresponding fields in the database.

When the catalog API is unavailable or returns an invalid catalog shape, the frontend shows a visible **Sample catalog** notice. A real 404 on product detail shows **Product Not Found**.

The admin product editor, orders, user management and profile editing screens were imported with the frontend but their full APIs belong to later sprints. They are not part of the Sprint 2 integration.

## API shape

`GET /products` returns `{ items, meta }`. Each item includes its category, brand, image gallery and variants. `GET /products/:slug` returns the same detail fields. The frontend maps numeric prices and local image paths to its view model in `src/app/core/models/catalog-api.mapper.ts`.

Image uploads accept JPEG, PNG or WebP up to 5 MB. The backend stores files in R2 when configured and falls back to local `public/product-images/` storage. Local image URLs are resolved against the API base URL by the frontend.

## Checks

Run these in `frontend`:

```bash
npm run build
npm run lint
npm run check:catalog
npm run check:gallery
npm run check:admin
```

Run `npm run build`, `npm run lint` and `npm test` in `backend`.
