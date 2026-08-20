# Backend — File Management Guide

Library Management System backend: Node.js + Express + TypeScript + MongoDB (Mongoose).

## Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                 # Opens the connection to MongoDB (reads MONGO_URI from .env)
│   │
│   ├── models/                   # One file per MongoDB collection (Mongoose schema + TS interface)
│   │   ├── Book.model.ts           -> "books" collection
│   │   ├── Member.model.ts         -> "members" collection
│   │   └── Borrow.model.ts         -> "borrowrecords" collection
│   │
│   ├── controllers/              # The actual logic behind each API call
│   │   ├── book.controller.ts      -> add/edit/delete/search books
│   │   ├── member.controller.ts    -> add/edit/delete/search members + a member's loan history
│   │   └── borrow.controller.ts    -> issue book, return book, pay fine, dashboard stats
│   │
│   ├── routes/                   # Maps a URL + HTTP verb to a controller function
│   │   ├── book.routes.ts          -> /api/books/*
│   │   ├── member.routes.ts        -> /api/members/*
│   │   └── borrow.routes.ts        -> /api/borrow/*
│   │
│   ├── services/
│   │   └── fine.service.ts       # ALL due-date & fine math lives here, and only here
│   │
│   ├── middleware/
│   │   └── errorHandler.ts       # Catches errors from any route, returns clean JSON errors
│   │
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types for request/response bodies
│   │
│   ├── app.ts                    # Express setup: CORS, JSON parsing, mounts the 3 routers
│   ├── server.ts                 # Entry point — connects to Mongo, then starts listening
│   └── seed.ts                   # One-off script: inserts sample books & members
│
├── package.json                  # Dependencies + npm scripts (dev, build, start, seed)
├── tsconfig.json                 # TypeScript compiler settings (src/ -> dist/)
├── .env.example                  # Template for your local .env (Mongo URI, port, fine rate...)
└── .gitignore                    # Keeps node_modules, dist/, and .env out of version control
```

## What to edit vs. what's generated

- **Edit:** anything in `src/`, plus `.env` (copy it from `.env.example` first).
- **Auto-generated — don't hand-edit:** `dist/` (created by `npm run build`), `node_modules/`.

## MongoDB Collections

| Collection      | Key Fields |
|------------------|------------|
| **books**        | `title`, `author`, `isbn` (unique), `category`, `totalCopies`, `availableCopies` |
| **members**       | `name`, `email` (unique), `phone`, `address`, `membershipDate`, `status` (active/inactive) |
| **borrowrecords** | `book` (ref), `member` (ref), `borrowDate`, `dueDate`, `returnDate`, `fineAmount`, `finePaid`, `status` (borrowed/overdue/returned) |

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books?search=&category=` | List / search books |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Remove a book (blocked if copies are on loan) |
| GET | `/api/members?search=` | List / search members |
| GET | `/api/members/:id` | Get one member |
| GET | `/api/members/:id/history` | A member's full borrowing history |
| POST | `/api/members` | Register a member |
| PUT | `/api/members/:id` | Update a member |
| DELETE | `/api/members/:id` | Remove a member (blocked if they have active loans) |
| GET | `/api/borrow?status=&memberId=&bookId=` | List loan records, with live fine calculation |
| GET | `/api/borrow/stats` | Dashboard summary numbers |
| POST | `/api/borrow` | Issue a book `{ bookId, memberId }` |
| PUT | `/api/borrow/:id/return` | Return a book, finalize its fine |
| PUT | `/api/borrow/:id/pay-fine` | Mark a fine as paid |

## Quick "where do I edit X" lookup

| I want to... | Edit this file |
|---|---|
| Change how many days before a book is due | `.env` → `BORROW_PERIOD_DAYS` |
| Change the fine amount per overdue day | `.env` → `FINE_PER_DAY` |
| Add a new field to a book/member | the model in `src/models/*.model.ts` + its controller in `src/controllers/` |
| Change a business rule (e.g. max loans per member) | the relevant `src/controllers/*.controller.ts` |
| Change CORS / allowed frontend origin | `.env` → `CLIENT_ORIGIN` |

## Setup

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI if needed
npm install
npm run seed                # optional: inserts sample books & members
npm run dev                 # starts API on http://localhost:5000
```