# Backend Internship Task
## Project Initialization - NestJS

### Objective
Create a scalable backend foundation using NestJS, Prisma and MySQL.

### Technology Stack
- NestJS
- Prisma ORM
- MySQL
- Swagger
- JWT
- ESLint
- Prettier

---

# Responsibilities

## 1. Project Initialization
- Create NestJS project
- Configure module structure
- Configure environment management

## 2. Database Setup
- Install Prisma
- Configure MySQL connection
- Configure migrations

## 3. Environment Configuration
- DATABASE_URL
- JWT_SECRET
- PORT
- Development/Staging/Production environments

## 4. Create Base Modules
- Auth Module
- User Module
- Health Module

## 5. Authentication Foundation
- JWT Strategy
- Auth Guard
- Login/Register DTO

## 6. Global Architecture
- Validation Pipe
- Error Filter
- Response Interceptor
- Logging Middleware

## 7. Swagger Setup
- OpenAPI documentation
- Auth/User/Health endpoints

## 8. Database Models
### User
- id
- email
- password
- status
- createdAt
- updatedAt

### Role
- id
- code
- name

## 9. API Standards
Example:
```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

## 10. Documentation
- Installation guide
- Prisma commands
- Migration instructions

# Suggested Project Structure
```text
src/
├── common
├── config
├── modules
│   ├── auth
│   ├── users
│   └── health
├── prisma
├── app.module.ts
└── main.ts

prisma/
├── migrations
└── schema.prisma
```

# Acceptance Criteria
- Application starts successfully
- Prisma connected to MySQL
- Swagger works
- JWT configured
- Migration executed
- README completed
