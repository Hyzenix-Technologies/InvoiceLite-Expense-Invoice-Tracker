# InvoiceLite

InvoiceLite is a focused, responsive finance workspace for freelancers. It keeps clients, invoices, line items, and business expenses together and calculates income, outstanding balances, and profit automatically.

## Stack

- Next.js App Router with TypeScript and Server Actions
- Tailwind CSS
- PostgreSQL
- Prisma ORM with migrations and deterministic seed data
- shadcn/ui-style components built with Radix UI and class-variance-authority

## Features

- Dashboard totals for paid income, expenses, unpaid invoices, and net profit
- Complete client create, view, edit, and delete workflows
- Complete invoice create, view, edit, delete, and Paid/Unpaid workflows
- Dynamic invoice line items with live subtotal, tax, and total calculations
- Search invoices by invoice number or client and filter by client and status
- Complete expense create, edit, and delete workflows with optional client links
- Print-friendly invoice detail page
- Responsive sidebar, accessible forms, validation messages, empty states, alerts, and delete confirmation dialogs

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure PostgreSQL

Create a PostgreSQL database named `invoicelite`, then copy the example environment file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` if your PostgreSQL username, password, host, port, or database name differs.

### 3. Run the migration

```bash
npx prisma migrate dev
```

### 4. Seed realistic sample data

```bash
npm run seed
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run typecheck
npm run build
```

## Data model

- `Client` stores contact and billing details.
- `Invoice` belongs to a client and stores calculated totals and payment status.
- `InvoiceItem` belongs to an invoice and stores description, quantity, rate, and amount.
- `Expense` may optionally be linked to a client.

Deleting a client also deletes that client's invoices and line items. Linked expenses are preserved and become general business expenses.
