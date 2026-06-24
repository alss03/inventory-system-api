# MedVelle Inventory Management API

A backend application built with Node.js, TypeScript, Fastify, Prisma, and PostgreSQL to manage inventory operations for aesthetic clinics.

## Features

### Products

* Create products
* List products
* Get product by ID
* Update products
* Delete products

### Stock Management

* Register stock movements (IN / OUT)
* Track inventory levels
* Prevent negative stock
* View stock movement history

### Stock Alerts

* Identify products below minimum stock levels
* Highlight critical inventory situations
* Support operational decision-making

---

## Tech Stack

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* PostgreSQL
* Docker
* Zod

---

## Architecture

The project follows a modular architecture with clear separation of responsibilities:

```txt
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Prisma
 ↓
PostgreSQL
```

### Structure

```txt
src/
├── modules/
│   ├── products/
│   └── stock/
│
├── shared/
│   ├── database/
│   ├── errors/
│   └── utils/
│
└── server.ts
```

### Layer Responsibilities

* Routes: HTTP endpoint registration
* Controllers: Request/response handling
* Services: Business rules
* Repositories: Data access
* Prisma: Database abstraction

---

## Running the Project

### Clone repository

```bash
git clone <repository-url>
cd backend
```

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://medvelle:medvelle@localhost:5432/medvelle_ai?schema=public"
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Run migrations

```bash
npx prisma migrate dev
```

### Seed database

```bash
npm run seed
```

### Start application

```bash
npm run dev
```

---

## API Endpoints

### Products

| Method | Endpoint      |
| ------ | ------------- |
| POST   | /products     |
| GET    | /products     |
| GET    | /products/:id |
| PUT    | /products/:id |
| DELETE | /products/:id |

### Stock

| Method | Endpoint         |
| ------ | ---------------- |
| POST   | /stock-movements |
| GET    | /stock-movements |
| GET    | /stock/alerts    |

---

## Business Rules

### Stock Movements

* Stock cannot become negative
* Product must exist before creating a stock movement

### Product Deletion

* Products with stock movement history cannot be deleted

### Stock Alerts

Severity levels:

* HIGH: Current stock below minimum stock
* HIGH: Product out of stock
* MEDIUM: Current stock equals minimum stock

---

## Error Handling

Centralized error handling using:

* AppError
* Zod validation errors
* Unexpected server errors

---

## Future Improvements

* Authentication and authorization
* Supplier management
* Purchase orders
* Automated replenishment suggestions
* Dashboard metrics
* Automated tests
* Swagger/OpenAPI documentation

```
```
