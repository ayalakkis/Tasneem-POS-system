# Point of Sale

A point-of-sale web app for a small shop selling prayer items, books, clothing and perfumes.
Admins manage the catalog, stock, customers, deliveries and staff and see profit; employees use
the POS screens only and never see cost or profit.

Next.js (App Router) · Prisma 6 + SQLite · Tailwind CSS 4 · iron-session auth.

## Running it

**1. Install**

```bash
npm install
```

**2. Configure** — create `.env` in the project root:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="<at least 32 random characters>"
SEED_ADMIN_USERNAME="admin"
SEED_ADMIN_PASSWORD="<choose one>"
```

**3. Create the database and the first admin**

```bash
npx prisma migrate dev
```

```bash
npm run db:seed
```

**4. Start**

```bash
npm run dev
```

Open http://localhost:3000 and sign in with the seed admin. Admins land on the dashboard,
employees on the New Sale screen. Change the seed password from **Users** after the first login.

Production: `npm run build` then `npm start`.

## Visual identity

Everything is derived from the shop sign: deep green kufic lettering on a limestone wall, lit
from behind by a warm brass glow.

| Role | Light | Dark | Use |
|---|---|---|---|
| Primary (green) | `#1f4e43` | `#5fa88e` | Primary actions, active states, the logo |
| Background (stone) | `#f3efe7` | `#0c1412` | Page background |
| Surface | `#fffdf9` | `#121d1a` | Cards, tables, inputs |
| Accent (brass) | `#b97f31` | `#d9a65a` | Focus ring, diamond markers, "warning" tone |
| Sidebar | `#173b33` | `#0e1916` | App frame |

- **Font:** Readex Pro (Latin + Arabic), loaded with `next/font`. Numbers use tabular figures.
- **Logo:** [`LogoMark`](src/components/brand/Logo.tsx) is the sign redrawn on a 10-unit grid as a
  single SVG path. It takes `currentColor`. The browser icon is [`src/app/icon.svg`](src/app/icon.svg).
- **Motifs:** the logo's diamond (`Diamond`) marks the current page and section labels; its arch
  (`ArchFrame`) frames empty states, the login panel and the 404 page — see
  [`Motifs.tsx`](src/components/brand/Motifs.tsx).
- **Themes:** System / Light / Dark from the toggle in the top bar, stored in the `pos-theme`
  cookie so the server renders the right theme with no flash. Invoices always print on white.
- **Accessibility:** all text tokens meet WCAG AA (4.5:1) on every surface in both themes;
  chart colors are validated for lightness, chroma and colorblind separation; motion is reduced
  when the OS asks for it.

## Design system

All tokens live in [`src/app/globals.css`](src/app/globals.css). Components use **semantic**
names, never raw colors, so dark mode needs no per-screen work:

```
bg-bg  bg-surface  bg-surface-2  border-border  text-fg  text-fg-muted  text-fg-subtle
bg-primary  text-primary-fg  bg-primary-soft  bg-accent-soft  bg-danger  bg-info-soft  …
```

Shared components are in [`src/components/ui`](src/components/ui) — import from
`@/components/ui`:

| Component | For |
|---|---|
| `Button`, `LinkButton` | Actions. Variants `primary` `secondary` `ghost` `danger` `danger-ghost`; sizes `sm` `md` `lg`; `icon`, `iconOnly`, `loading` |
| `Input`, `Select`, `Textarea`, `Field` | Forms. `Field` adds the label, hint, error and "Optional" tag |
| `Card`, `CardHeader`, `CardBody`, `CardFooter` | Grouped content |
| `Table`, `THead`, `TBody`, `TR`, `TH`, `TD`, `TableEmpty` | Data tables. `numeric` right-aligns with tabular figures |
| `Badge` | Status pills. Tones `neutral` `primary` `accent` `danger` `info` |
| `PageHeader` | Eyebrow, title, description and actions at the top of every page |
| `EmptyState` | Empty lists |
| `Alert` | Inline messages (`danger` `warning` `success` `info`) |
| `ConfirmDialog` | Confirming destructive actions. Throw from `onConfirm` to show an error |

Also: `StatCard` (KPI tiles, `hero` for the one number that matters most), `AppShell`
(sidebar + top bar + drawer on small screens) and the chart components in
`src/components/charts`.

In development, **`/admin/ui-kit`** shows every component and chart in the current theme
(it returns 404 in production).
