# 💳 Demo Credit – Wallet API (MVP)

Demo Credit is a mobile lending app that requires wallet functionality for users to manage their funds. This MVP implementation provides a secure and modular wallet API using **Node.js and TypeScript**, with full support for account funding, transfers, withdrawals, and blacklist validation via the **Lendsqr Adjutor Karma API**.

---

## Project Overview

This wallet service includes:

- Account creation with blacklist validation
- Secure transfers between users
- Wallet funding and withdrawals
- Authentication and PIN-based transaction protection
- Role-based access to transaction data
- Modular structure for scalability
- Postman-tested API endpoints

---

## Key Features

- User registration & login (with token-based auth stored on redis for security)
- Blacklist validation via Karma API before onboarding
- Fund wallet using `POST /transaction/fund`
- Withdraw funds from wallet using `POST /transaction/withdraw`
- Transfer funds between users using `POST /transaction/transfer`
- Retrieve transaction history or single transactions
- View user and account profile data

---

## Tech Stack

- **Node.js** (runtime)
- **TypeScript** (type safety)
- **Express.js** (web server)
- **Knex.js** (SQL query builder)
- **MySQL** or **PostgreSQL**
- **dotenv** (environment configuration)
- **Postman** (manual API testing)

---

## Project Structure

```
src/
├── controllers/        # Route handlers
├── routes/             # API route definitions
├── services/           # Business logic (e.g. transferFunds)
├── middlewares/        # Auth middleware, validation
├── db/                 # Knex migrations
├── config/             # Knex config and database
├── utils/              # Helpers, external API clients
└── server.ts           # Main server entry point and Express setup
```

---

## Getting Started

### Installation

```bash
git clone https://github.com/yourusername/Ayomide-lendsqr-be-test.git
cd Ayomide-lendsqr-be-test
npm install
```

### Configure Environment

Create a `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PORT=3306
DB_PASSWORD=yourpassword
DB_NAME=demo_credit_wallet
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
KARMA_API_KEY=your_karma_api_key
```

### Migrate Database

```bash
npm run migrate
```

### Start Development Server

```bash
npm run dev
```

---

## Authentication

This API uses **JWT-based auth** for simplicity:

- Tokens are passed via `Authorization: Bearer <token>`
- A middleware extracts a `userId` for protected actions
- Tokens are stored and verified using Redis.

---

## API Endpoints

### User Routes

| Method | Route                  | Description                       |
| ------ | ---------------------- | --------------------------------- |
| POST   | `/register`            | Register a new user               |
| POST   | `/login`               | Login a user (returns mock token) |
| POST   | `/logout`              | Logout (mock)                     |
| GET    | `/users`               | Get all users                     |
| GET    | `/user/:id`            | Get a user by ID                  |
| PATCH  | `/user/:id`            | Update user profile               |
| POST   | `/user/create-pin/:id` | Create transaction PIN            |

### Transaction Routes

| Method | Route                   | Description           |
| ------ | ----------------------- | --------------------- |
| POST   | `/transaction/fund`     | Fund your wallet      |
| POST   | `/transaction/withdraw` | Withdraw funds        |
| POST   | `/transaction/transfer` | Transfer funds        |
| GET    | `/transaction/:id`      | Get transaction by ID |
| GET    | `/transaction/`         | Get all transactions  |
| GET    | `/transaction/account`  | Get account details   |

---

## Testing Approach

Automated unit testing is **not implemented** in this MVP.  
Instead, the API was thoroughly tested using **Postman**, covering:

- Successful and failed fund transfers
- PIN validation
- Insufficient balance handling
- Blacklisted users blocked from onboarding
- Access control to transaction visibility

---

## External Integration

### Karma Blacklist Check

Before onboarding, each user is checked against the **Lendsqr Adjutor Karma blacklist** via a dedicated API client in:

```
utils/karmaLookup.ts
```

This ensures no blacklisted users can create accounts.

---

## Future Improvements

Here are some improvements that can be added in future development phases:

- **RBAC or user roles** (e.g., admin vs customer)
- **Pagination & filtering** for transaction history (get by types or category)
- **Webhook/event support** for third-party integrations
- **Audit logging** for sensitive actions like withdrawals
- **Automated tests** using Jest + Supertest
- **Support for third-party funding (e.g. Paystack)**

---

## Author

---

**Demo Credit Wallet API MVP**  
Built by Saheed Ayomide – 2025

---
