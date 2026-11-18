# Agile Sprint Plan (Revised) - Online Clothing Store

## Project Overview

- Project: Online Clothing Store
- Methodology: Agile Scrum
- Team: 2 Developers (Dev A, Dev B)
- Project End Date: December 31, 2026
- Plan Revised On: November 9, 2026 (Sprint 2 in progress)
- Sprint Duration: 1-2 weeks (compressed, see Revision Notes)
- Remaining Duration: 7.5 weeks

Legend: 🆕 = new story added in this revision. Priority: **Must** / **Should** / **Stretch** (only if ahead of schedule).

---

# Revision Notes

## Why the plan changed

- The original plan (1 intern x 10 weeks) was sized for one person. With 2 developers and about 6 development weeks left, the core scope alone is too light, but adding everything would exceed capacity.
- Capacity: 2 devs x 6 dev weeks = 12 person-weeks, about 10 after ~15% overhead. Remaining core work is about 8 person-weeks, which leaves about 2 person-weeks (roughly 11 days) for extras. This is an estimate, not a measured figure.
- Feature freeze is **December 21**. Anything unfinished by then is cut, not rushed.

## Sprint calendar

| Sprint | Dates | Length | Status |
|---|---|---|---|
| Sprint 0 | - | - | Completed |
| Sprint 1 | - | - | Completed |
| Sprint 2 | Nov 9 - Nov 22 | 2 weeks | In progress |
| Sprint 3 | Nov 23 - Nov 29 | 1 week | Planned |
| Sprint 4 | Nov 30 - Dec 6 | 1 week | Planned |
| Sprint 5 | Dec 7 - Dec 20 | 2 weeks | Planned |
| Sprint 6 | Dec 21 - Dec 31 | 1.5 weeks | Planned (hardening only) |

## Where each new feature was placed

| ID | New Feature | Sprint | Priority | Est. days |
|---|---|---|---|---|
| US-14 | Product Variants & SKUs | Sprint 2 | Must | 3-4 |
| US-15 | Product Image Upload | Sprint 2 | Should | 1-2 |
| US-16 | Stock Reservation on Checkout | Sprint 3 | Must | 2-3 |
| US-17 | Order Status Workflow | Sprint 4 | Must | 2 |
| US-18 | Admin User Management | Sprint 5 | Should | 1-2 |
| US-19 | Admin Dashboard | Sprint 5 | Should | 2-3 |
| US-20 | Coupons | Sprint 5 | Stretch | 2-3 |
| US-21 | Dark Mode Coverage | Sprint 5 | Stretch | 0.5-1 |
| US-22 | Online Payment (Sandbox) | Sprint 5 | Stretch | 4-5 |

Cut from scope: full-text search, SSR, AI features, job queues, i18n, returns/refunds.

## Gaps found in the original plan and how they were handled

- **Sprint 0 referenced Bootstrap**, but the SRS and frontend task specify TailwindCSS and shadcn/ui. Sprint 0 now says Tailwind/shadcn.
- **Sorting** is required by FR-03 (product list) but had no task. Added to US-04.
- **Stock display** is required by FR-04 (product detail) but had no task. Added to US-05.
- **Cart validation** is step 1 of FR-07 (checkout) but was not planned. Added to US-08 and tied to US-16.
- **Admin user management** appears in the SRS Admin use case but had no story. Added as US-18.
- **Non-functional requirements** (page load under 3 seconds, 50 concurrent users) were not in any sprint. Added as checks in US-13.
- **Dark mode** is already part of the frontend foundation (theme system), so US-21 only covers checking new pages.
- The stray TOC comment in the original Sprint 3 deliverables was removed.
- **US-13 (Final Quality Review)** moved from Sprint 5 to a new Sprint 6, so hardening has protected time after the feature freeze.

---

# Sprint 0 – Project Initiation

## Status

✅ Completed

## Duration

2–3 days

## Objectives

- Understand requirements
- Define use cases
- Setup development environment

## Tasks

### Analysis

- Review requirements
- Create use case diagram
- Create sitemap
- Define entities and relationships

### Technical Setup

- Create Angular project
- Configure TailwindCSS and shadcn/ui
- Configure basic routings
- Setup Git repository (optional)
- Setup coding standards (optional)

## Deliverables

- Requirement Analysis (already)
- Project Structure
- Git Repository (optional)

## Milestone 0

✅ Requirement reviewed

✅ Project setup completed

✅ Development environment ready

---

# Sprint 1 – Authentication & Foundation

## Status

✅ Completed

## Duration

Week 1–2

## Goal

Allow users to register and login into the system.

## User Stories

### US-01 Register

As a Guest, I want to create an account so that I can purchase products.

### Tasks

- Register page
- Form validation
- API integration
- Error handling

### US-02 Login

As a Customer, I want to login so that I can access protected features.

### Tasks

- Login page
- JWT authentication
- Route guards
- Session management

### US-03 Layout Foundation

- Header
- Footer
- Navigation menu
- Responsive layout

## Deliverables

- Home Page
- Login Page
- Register Page
- Authentication Module

## Milestone Sprint 1

✅ User registration completed

✅ User login completed

✅ JWT authentication working

✅ Route protection implemented

✅ Responsive layout completed

---

# Sprint 2 – Product Catalog

## Status

🔄 In progress

## Duration

Nov 9 – Nov 22 (2 weeks)

## Goal

Allow customers to browse and search products, with a data model that supports size/color variants and real product images.

## Team Split

- **Dev A:** catalog domain: schema (Category, Brand, Product, Variant, Image), listing, detail, search and filters.
- **Dev B:** carry-over work from Sprint 1 (admin user activation API), image upload service, Swagger contract for cart and orders (needed by Sprint 3), layout polish. If capacity allows, pull US-09 (Profile Management) forward from Sprint 4.

## User Stories

### US-04 Product Listing

As a Customer, I want to view products so that I can browse available items.

### Tasks

- Product grid
- Pagination
- Loading state
- 🆕 Sorting (price, newest) and display of product category (FR-03)

### US-05 Product Details

As a Customer, I want to view product details so that I can decide whether to purchase.

### Tasks

- Product details page
- Product images
- Size selection
- 🆕 Display stock availability (FR-04)
- 🆕 Variant selection (size/color) updates price, SKU and stock

### US-06 Search & Filter

As a Customer, I want to search and filter products so that I can find products quickly.

### Filters

- Category
- Brand
- Price range
- Size

### Tasks

- Search by product name
- Filter components
- Combine search, filters, sort and pagination in one query

### US-14 🆕 Product Variants & SKUs

Priority: **Must**

As an Admin, I want each product to have variants (size/color) with their own SKU, price and stock, so that inventory is tracked accurately.

### Tasks

- Design schema: Product, ProductVariant (sku, size, color, price, stock)
- Migration and seed data
- Variant API endpoints
- Variant selector on product detail page
- Update cart and order design to reference a variant, not a product

### US-15 🆕 Product Image Upload

Priority: **Should**

As an Admin, I want to upload multiple images per product so that products look realistic to customers.

### Tasks

- Integrate Cloudinary or S3
- Upload endpoint with file type and size validation
- Multiple images per product, with a primary image
- Image gallery on product detail page

## Deliverables

- Product Listing Page
- Product Details Page
- Search & Filter Components
- 🆕 Product variant data model and API
- 🆕 Image upload service

## Milestone Sprint 2

✅ Product catalog completed

✅ Product details completed

✅ Search functionality completed

✅ Filter functionality completed

✅ Pagination and sorting working

✅ 🆕 Variants/SKUs working end to end

✅ 🆕 Product images uploaded and displayed

**Checkpoint (Nov 22):** if the sprint is late, cut filters down to category and price only.

---

# Sprint 3 – Cart & Checkout

## Duration

Nov 23 – Nov 29 (1 week)

## Goal

Allow customers to purchase products without overselling stock.

## Team Split

- **Dev B:** cart, checkout, order creation, stock reservation (backend and frontend).
- **Dev A:** cart and checkout UI pages, order summary and confirmation pages, fixes carried over from Sprint 2, starts admin product API.

## User Stories

### US-07 Shopping Cart

As a Customer, I want to manage my shopping cart before checkout.

### Tasks

- Add to cart (by variant)
- Remove from cart
- Update quantity
- Calculate totals
- 🆕 Persist cart per user

### US-08 Checkout

As a Customer, I want to place an order.

### Tasks

- 🆕 Validate cart (items exist, active, in stock) before checkout (FR-07 step 1)
- Shipping information form
- Order summary
- Order confirmation
- Create order API
- 🆕 Order schema includes discount amount and payment method fields (default: cash on delivery), so coupons and online payment can be added later without a migration rewrite

### US-16 🆕 Stock Reservation on Checkout

Priority: **Must**

As a Customer, I want my order to be guaranteed when I place it, so that I am not told later that the item was sold out.

### Tasks

- Decrement variant stock inside a database transaction when the order is created
- Prevent overselling when two customers buy the last item at once (conditional update or row locking)
- Return a clear error if stock is insufficient
- Restore stock when an order is cancelled
- Test with concurrent requests

## Deliverables

- Cart Page
- Checkout Page
- Order Success Page
- 🆕 Stock-safe order creation

## Milestone Sprint 3

✅ Cart management completed

✅ Quantity update working

✅ Order placement completed

✅ Order data stored successfully

✅ 🆕 Concurrent purchases of the last item do not oversell

---

# Sprint 4 – User Account & Orders

## Duration

Nov 30 – Dec 6 (1 week)

## Goal

Allow customers to manage their profile and orders, with a controlled order lifecycle.

## Team Split

- **Dev B:** order status workflow, order history and details (backend).
- **Dev A:** profile management, order history and order details pages (frontend), admin product API.

## User Stories

### US-09 Profile Management

As a Customer, I want to manage my profile information.

### Tasks

- View profile
- Edit profile
- Change password

### US-10 Order History

As a Customer, I want to review my previous orders.

### Tasks

- Order history page
- Order details page
- Order status tracking
- 🆕 Show status history timeline on order details page

### US-17 🆕 Order Status Workflow

Priority: **Must**

As an Admin, I want orders to follow a controlled lifecycle so that statuses are consistent and traceable.

### Tasks

- Define statuses: Pending, Paid, Packed, Shipped, Delivered, Cancelled
- Validate allowed transitions (for example, Delivered cannot go back to Pending)
- Store a status history (status, changed by, timestamp)
- Cancelling an order restores stock (links to US-16)
- Swagger documentation of allowed transitions

## Deliverables

- Profile Page
- Order History Page
- Order Details Page
- 🆕 Order status workflow with history

## Milestone Sprint 4

✅ Profile management completed

✅ Password change completed

✅ Order history completed

✅ Order details completed

✅ 🆕 Order status transitions validated and recorded

**Checkpoint (Dec 6):** the full purchase flow (browse, cart, checkout, order, history) must work end to end. If not, drop all stretch items.

---

# Sprint 5 – Admin & Extended Features

## Duration

Dec 7 – Dec 20 (2 weeks)

## Goal

Provide administration features, then add optional features only if the core is complete.

## Team Split

- **Dev A:** admin product management (including inventory and variants), admin dashboard.
- **Dev B:** admin order management, admin user management, then stretch items.

## User Stories

### US-11 Product Management

As an Admin, I want to manage products.

### Tasks

- Create products
- Edit products
- Delete products
- Manage inventory
- 🆕 Manage variants (SKU, price, stock) and product images
- 🆕 Role-based route and API guard for Admin-only features

### US-12 Order Management

As an Admin, I want to process customer orders.

### Tasks

- View orders
- Search orders
- Update status
- 🆕 Status changes use the validated workflow from US-17

### US-18 🆕 Admin User Management

Priority: **Should**

As an Admin, I want to manage user accounts so that I can control who can access the system.

### Tasks

- User list with search
- Activate / deactivate users
- View user role

### US-19 🆕 Admin Dashboard

Priority: **Should** (start only after US-11 and US-12 are done)

As an Admin, I want an overview of store performance so that I can make decisions quickly.

### Tasks

- Revenue over time
- Top-selling products
- Low-stock alerts
- Orders by status
- Keep to 3-4 widgets

### Stretch Backlog

Start only after US-11, US-12, US-18 and US-19 are complete. Cut on Dec 20 if unfinished. Build each as a switchable feature so a partial result never breaks checkout.

### US-20 🆕 Coupons

Priority: **Stretch**

As a Customer, I want to apply a coupon code so that I get a discount on my order.

### Tasks

- Coupon model (percent or fixed, expiry, usage limit)
- Admin coupon create/edit
- Apply coupon in cart and checkout, store discount on the order
- Validation errors (expired, used up, invalid)

### US-21 🆕 Dark Mode Coverage

Priority: **Stretch**

As a Customer, I want the whole site to support dark mode so that it is comfortable to use at night.

### Tasks

- Verify all new pages and components in dark theme (the theme system exists from the frontend foundation)
- Fix contrast and color issues
- Persist theme preference

### US-22 🆕 Online Payment (Sandbox)

Priority: **Stretch** (realistically out of scope unless Sprints 2-4 finish early)

As a Customer, I want to pay online so that I do not need to pay on delivery.

### Tasks

- Integrate VNPay or Stripe sandbox
- Payment callback/webhook that is safe to receive twice
- Update order status to Paid on success
- Failed or cancelled payment handling

## Deliverables

- Product Management Module
- Order Management Module
- 🆕 User Management Page
- 🆕 Admin Dashboard
- 🆕 Stretch features, if completed

## Milestone Sprint 5

✅ Product management completed

✅ Order management completed

✅ 🆕 User management completed

✅ 🆕 Dashboard completed

✅ 🆕 Stretch items either complete or explicitly cut

**Checkpoint (Dec 13):** if admin products and orders are not done, skip the dashboard entirely.

---

# Sprint 6 – Hardening & Release

## Duration

Dec 21 – Dec 31 (1.5 weeks)

## Goal

Stabilize and finalize the system. **No new features after Dec 21.**

## Team Split

- **Dev A:** frontend bug fixing, responsive testing, user-facing documentation.
- **Dev B:** backend bug fixing, performance checks, Swagger, deployment.
- **Both:** demo preparation (Dec 28-31 only).

## User Stories

### US-13 Final Quality Review

### Tasks

- Refactoring
- Bug fixing
- Responsive testing
- Documentation
- 🆕 Performance check: pages load in under 3 seconds, system handles 50 concurrent users (SRS non-functional requirements)
- 🆕 Complete Swagger documentation for all endpoints
- 🆕 Deployment and README with installation, Prisma and migration instructions
- 🆕 End-to-end test of the purchase flow (browse, cart, checkout, order, admin processes order)

## Deliverables

- Final Documentation
- 🆕 Deployed application
- 🆕 Demo script

## Milestone Sprint 6

✅ High-priority bugs fixed

✅ Documentation completed

✅ 🆕 Performance targets checked

✅ 🆕 Application deployed

✅ Ready for final demo

---

# Definition of Done (DoD)

A User Story is considered complete when:

- Code is committed to Git repository
- Code review completed
- Project builds successfully
- No critical defects
- Responsive on desktop, tablet, and mobile
- Loading and error states handled
- Manual testing completed
- Mentor approval received
- 🆕 API endpoints documented in Swagger
- 🆕 Stretch features can be switched off without breaking core flows

---

# Final Demo Scope

The team must demonstrate:

✅ Authentication

✅ Product Catalog

✅ 🆕 Product Variants and Images

✅ Search & Filter

✅ Shopping Cart

✅ Checkout Process

✅ 🆕 Concurrent purchase of the last item without overselling

✅ User Profile Management

✅ Order History

✅ 🆕 Order Status Workflow

✅ Admin Product Management

✅ Admin Order Management

✅ 🆕 Admin User Management

✅ 🆕 Admin Dashboard

✅ 🆕 Stretch features (coupons, dark mode, online payment), if completed

✅ Technical Documentation
