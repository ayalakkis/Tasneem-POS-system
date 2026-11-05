# Point of Sale

A bilingual (Arabic and English) point-of-sale web application for a small retail shop selling prayer items, books, clothing and perfumes. Administrators manage the catalog, stock, customers, deliveries and staff and can see profit. Employees use the POS screens only and never see cost or profit.

## Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Database | Prisma 6 with SQLite |
| Styling | Tailwind CSS 4 |
| Authentication | iron-session |
| Language | TypeScript |

## Features

- Role-based access: admin dashboard with profit reporting, and a restricted employee POS flow
- Catalog, categories, stock, purchases, customers, suppliers, deliveries and user management
- Receipt and invoice printing in the cashier’s current language
- Arabic (right-to-left, default) and English, with a per-device language switch
- Light, dark and system themes, with no flash on load
- Accessible design: text colors meet WCAG AA contrast in both themes, and motion is reduced when the OS requests it
- Shop PC deployment with a one-time setup script, start at boot and nightly backups (see [DEPLOY.md](DEPLOY.md))

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="<at least 32 random characters>"
   SEED_ADMIN_USERNAME="admin"
   SEED_ADMIN_PASSWORD="<choose one>"
   ```

3. Create the database and the first admin account:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000` and sign in with the seeded admin account. Admins land on the dashboard and employees on the New Sale screen. Change the seed password from the Users page after the first sign-in.

For production, run `npm run build` followed by `npm start`. To run on a PC in the shop, follow [DEPLOY.md](DEPLOY.md).

## Internationalization

Arabic is the default language (right-to-left) with English as an option. The language is stored per device in a cookie, so the server renders the correct language and direction on the first paint. Receipts print in the language the cashier is using.

- All interface text lives in `src/i18n/dictionaries/ar.ts` and `en.ts`. The two files must contain identical keys, otherwise the build fails.
- Server components and API routes use `getI18n()`; client components use `useI18n()`. Helpers format money, dates and Arabic plural forms.
- Layouts use logical CSS classes (`ms-`, `pe-`, `start-`, `text-end`) so they mirror correctly in right-to-left mode.
- Shop data such as item, category and customer names is displayed exactly as entered.

## Design system

The visual identity is derived from the shop sign: deep green lettering on a limestone wall with a warm brass accent.

| Role | Light | Dark |
|---|---|---|
| Primary (green) | `#1f4e43` | `#5fa88e` |
| Background (stone) | `#f3efe7` | `#0c1412` |
| Surface | `#fffdf9` | `#121d1a` |
| Accent (brass) | `#b97f31` | `#d9a65a` |

Typography uses Readex Pro for both Latin and Arabic text. Design tokens live in `src/app/globals.css` and components use semantic color names instead of raw values, so dark mode needs no per-screen work.

Shared components are in `src/components/ui`, including Button, Input, Select, Field, Card, Table, Badge, PageHeader, EmptyState, Alert and ConfirmDialog, plus StatCard, AppShell and chart components. In development, `/admin/ui-kit` shows every component in the current theme.

## Project structure

```
prisma/          database schema, migrations and seed data
scripts/         shop PC setup, update and backup scripts
src/app/         pages and API routes (Next.js App Router)
src/components/  shared UI, POS and chart components
src/i18n/        Arabic and English dictionaries and helpers
```
