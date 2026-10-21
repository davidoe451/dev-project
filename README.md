# Online Clothing Store Backend API

Enterprise backend RESTful API built with **NestJS**, **Prisma ORM**, and **MySQL**, adhering to modular architecture, JWT authentication, centralized error handling, and standard response envelopes.

---

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Database**: MySQL
- **Documentation**: Swagger / OpenAPI
- **Authentication**: Passport-JWT & Bcrypt
- **Validation**: Class-Validator & Class-Transformer

---

## 📁 Project Structure

```text
backend/
├── docs/                               # Project requirement specifications
├── prisma/
│   ├── schema.prisma                   # Database models & relationships
│   └── seed.ts                         # Initial roles, users, categories & products
├── src/
│   ├── common/
│   │   ├── decorators/                 # @CurrentUser(), @Roles()
│   │   ├── filters/                    # Global HttpExceptionFilter
│   │   ├── guards/                     # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/               # Global TransformInterceptor
│   │   ├── interfaces/                 # Standard ApiResponse interface
│   │   └── middleware/                 # LoggingMiddleware (request timing)
│   ├── config/
│   │   └── configuration.ts            # Environment config loader
│   ├── modules/
│   │   ├── auth/                       # Register, login, JWT strategy
│   │   ├── users/                      # Profile, password, admin user management
│   │   ├── health/                     # Service uptime & DB health check
│   │   ├── products/                   # Catalog, filters, categories, admin CRUD
│   │   ├── cart/                       # Cart operations & subtotal calculations
│   │   └── orders/                     # Checkout transaction, order history, tracking
│   ├── prisma/
│   │   ├── prisma.module.ts            # Global Prisma module
│   │   └── prisma.service.ts           # Prisma client lifecycle service
│   ├── app.module.ts                   # Root application module
│   └── main.ts                         # Application entrypoint & Swagger setup
├── test/
│   └── self-check.ts                   # Automated logic & validation tests
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18+ (tested on v24 LTS)
- **MySQL Server**: 8.0+

### 2. Configure Environment

Create `.env` and configure your database credentials:

Default variables in `.env`:
```env
NODE_ENV=development
PORT=3000

# Database Connection
DATABASE_URL="mysql://root:password@localhost:3306/clothing_store"

# JWT Secret & Expiry
JWT_SECRET=super_secret_clothing_store_jwt_key_2026
JWT_EXPIRATION=7d

# Allowed Frontend Origins (Angular)
CORS_ORIGIN="http://localhost:4200"
```

### 3. Database Migration & Seed

Run migrations to apply the schema to MySQL and seed initial data:

```bash
# Generate Prisma Client
npm run prisma:generate

# Apply migrations to development database
npm run prisma:migrate

# Seed initial roles, demo users, categories and products
npm run prisma:seed
```

#### Pre-seeded Accounts:
- **Admin**: `admin@clothingstore.com` / `Admin@123456`
- **Customer**: `customer@clothingstore.com` / `Customer@123456`

---

## 🏃 Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

---

## 📖 Swagger API Documentation

Once running, interactive OpenAPI documentation is available at:

👉 **http://localhost:3000/api/docs**

All protected endpoints accept the Bearer token generated from `/api/v1/auth/login`.

---

## 📡 API Response Standard

All endpoints return uniform response payloads:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses format:

```json
{
  "success": false,
  "data": null,
  "message": "Error description or validation errors",
  "statusCode": 400,
  "path": "/api/v1/auth/login",
  "timestamp": "2026-10-21T03:00:00.000Z"
}
```

---

## 🧪 Testing

Run built-in automated self-checks (hashing, validation constraints, DTO rules):

```bash
npm test
```
