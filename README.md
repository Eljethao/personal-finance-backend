# Personal Finance — Backend API

REST API powering the **Personal Finance** Flutter app — authentication, wallets, transactions, budgets, analytics, and slip-image storage on S3.

> Mobile app repository: [`personal-finance-frontend`](../frontend) (Flutter — iOS / Android / macOS / Web)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Model](#data-model)
- [Scripts](#scripts)
- [Project Structure](#project-structure)

---

## Overview

The backend provides:

- **JWT auth** with phone + PIN; 15-day tokens
- **Multi-wallet** support (cash, bank, credit card)
- **Transactions** with optional slip image stored on S3
- **Categories** (user-customizable)
- **Budgets** per category per month with status calculation
- **Analytics** — totals, by-category breakdown, monthly trend
- **Export** — Excel (XLSX) and PDF statement downloads

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Language | TypeScript 5 |
| Framework | Express 4 |
| Database | MongoDB 8 via Mongoose |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| File upload | Multer + `multer-s3` (AWS S3) |
| Excel export | `xlsx` |
| PDF export | `pdfkit` |
| Validation | `express-validator` |
| Security | Helmet, CORS |
| Dev runner | `ts-node-dev` (live reload) |

---

## Architecture

```
┌──────────────┐   HTTPS / JWT   ┌──────────────┐
│ Flutter app  │ ──────────────▶ │  Express API │
│ (mobile/web) │                 │  (this app)  │
└──────────────┘                 └──────┬───────┘
                                        │
                          ┌─────────────┼─────────────┐
                          ▼             ▼             ▼
                  ┌─────────────┐ ┌─────────┐ ┌──────────────┐
                  │  MongoDB    │ │ AWS S3  │ │ Excel / PDF  │
                  │ (Mongoose)  │ │ (slips) │ │  generators  │
                  └─────────────┘ └─────────┘ └──────────────┘
```

- **Layered** — routes → controllers → services → models
- **Auth middleware** validates `Authorization: Bearer <token>` and hydrates `req.user`
- **Slip uploads** stream straight to S3 via `multer-s3`; the returned URL is stored on the `Transaction` document
- **Centralized error handler** for consistent JSON error responses

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm (or npm)
- MongoDB (local or Atlas)
- AWS S3 bucket + IAM credentials (only required for slip upload)

### Install

```bash
cd backend
pnpm install
```

### Run in development

```bash
pnpm dev          # ts-node-dev → http://localhost:7001
```

### Build & start (production)

```bash
pnpm build        # tsc → dist/
pnpm start        # node dist/server.js
```

---

## Environment Variables

Create a `.env` file in `backend/`:

```env
# Server
PORT=7001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/personal-finance

# Auth
JWT_SECRET=replace-me-with-a-long-random-string
JWT_EXPIRES_IN=15d

# AWS S3 (slip images)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket-name
```

> Never commit a real `.env` to git. Rotate any secret that has been pushed.

---

## API Reference

Base URL: `http://localhost:7001/api`

All endpoints except `/auth/register` and `/auth/login` require:

```http
Authorization: Bearer <jwt>
```

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Phone + PIN → JWT |
| `POST` | `/auth/login` | Phone + PIN → JWT |
| `GET` | `/auth/me` | Current user profile |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/transactions` | List user's transactions (supports `from`, `to`, `walletId`, `categoryId`) |
| `POST` | `/transactions` | Create transaction |
| `PUT` | `/transactions/:id` | Update transaction |
| `DELETE` | `/transactions/:id` | Delete transaction |
| `POST` | `/transactions/upload-slip` | Multipart upload — returns S3 URL |

### Wallets

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/wallets` | List wallets |
| `POST` | `/wallets` | Create wallet |
| `PUT` | `/wallets/:id` | Update wallet |
| `DELETE` | `/wallets/:id` | Delete wallet |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories` | List categories |
| `POST` | `/categories` | Create category |
| `PUT` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Delete category |

### Budgets

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/budgets` | List budgets |
| `POST` | `/budgets` | Create / set monthly budget |
| `PUT` | `/budgets/:id` | Update budget |
| `DELETE` | `/budgets/:id` | Delete budget |
| `GET` | `/budgets/status` | Budget vs. actual spending per category |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/summary` | Totals (income, expenses, net) |
| `GET` | `/analytics/by-category` | Spending grouped by category |
| `GET` | `/analytics/monthly` | Trend by month |

### Export

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/export/excel` | Download `.xlsx` statement |
| `GET` | `/export/pdf` | Download `.pdf` statement |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |

---

## Data Model

Mongoose schemas in `src/models/`:

### User
```ts
{ phone (unique), pin (bcrypt-hashed), name, createdAt }
```

### Wallet
```ts
{ userId, name, type: 'cash' | 'bank' | 'card', balance, currency, color, icon }
```

### Category
```ts
{ userId, name, type: 'income' | 'expense', color, icon }
```

### Transaction
```ts
{
  userId,
  walletId,
  categoryId,
  type: 'income' | 'expense' | 'transfer',
  amount,
  date,
  note,
  merchant?,
  slipUrl?,         // S3 URL
  destinationWalletId?  // for transfers
}
```

### Budget
```ts
{ userId, categoryId, month (YYYY-MM), amount }
```

---

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start with `ts-node-dev` |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled build |

---

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Route handlers
│   ├── middleware/         # auth, error handler, validators
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers mounted under /api
│   ├── services/           # S3 client, export builders
│   ├── utils/
│   ├── app.ts              # Express app setup
│   └── server.ts           # Entry point
├── package.json
└── tsconfig.json
```

---

## License

MIT.
