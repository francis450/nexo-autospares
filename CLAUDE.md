# Nexo Autospares

Online parts counter for Nexo Autospares, Kirinyaga Road, Nairobi. Customers pick their car,
see parts that fit, and order via WhatsApp or M-Pesa checkout, with counter pickup,
Nairobi courier or upcountry parcel delivery.

## Stack and commands

- Vite 8 + React 19 + TypeScript, Tailwind CSS v4 (`@theme` tokens in `src/index.css`), `motion`, `lucide-react`.
- Single-page app with **no router yet**; products open in `ProductDetailModal`.
- `express` is a dependency but there is no server code yet. There is no test runner yet.
- `npm run dev` (port 3000) · `npm run build` · `npm run lint` (= `tsc --noEmit`) · `npm run db:seed:generate`
- Run `npm run lint` and `npm run build` before calling any `.ts`/`.tsx` change done.

## Layout

- `src/App.tsx` — page composition, cart/order state (persisted in `localStorage`: `nexo_cart`, `nexo_selected_vehicle`, `nexo_active_order`)
- `src/components/` — `VehicleSelectorModal`, `ActiveVehicleBar`, `ProductRowCard`, `ProductDetailModal`, `CheckoutDrawer`, `CantFindPartModal`, `CounterTrustFooter`, `PromoPosterBanner`, `NexoLogo`, …
- `src/data/vehicles.ts`, `src/data/products.ts` — current catalogue (source for the DB seed)
- `src/types/index.ts` — `VehicleModel`, `ProductItem`, `CartItem`, `Order`
- `db/migrations/` — PostgreSQL schema (dbmate-style `-- migrate:up` / `-- migrate:down`)
- `db/seeds/001_catalog.sql` — **generated** from `src/data`; don't edit by hand
- `public/` — static files served from `/` (logo: `/nexo-autospare.png`)

## Domain rules

- Kenya: prices in whole KSh (`KSh 4,025`), phone numbers normalised to `2547…`/`2541…`.
- Cars are identified by model + **chassis code** (e.g. Premio 260 = NZT260/ZRT260/ZRT265), then year.
  Many parts are sold per side (LH/RH) with an optional discounted pair price.
- WhatsApp `254141088163` is currently hard-coded in `src/App.tsx`; move contact details into
  one config module when touching them.
- ERPNext is the stock/price source of truth. `Item (9).csv` is an ERPNext item export (its prices are 0).
- M-Pesa STK push in `CheckoutDrawer` is simulated. Real payments need a server-side Daraja
  integration; never trust a payment status reported by the browser.
- Only show guarantees, returns or warranty claims the business has in writing.
  "100% Fitment Guarantee" currently has no policy page.

## Project skills

- `ymm-schema-designer` — database schema, migrations, fitment queries
- `auto-seo-schema` — URLs, JSON-LD, canonical/meta
- `landing-page-builder` — ad/promo landing pages, WhatsApp leads, attribution
- `design-auditor`, `shadcn-ui` — third-party; shadcn/ui is **not** set up in this project yet,
  and the `@` alias points to the project root, not `src/`.

## Overrides of generic Spartan rules

The Spartan toolkit in `.claude/` targets Kotlin/Micronaut and Next.js. In this repo:

- **Database:** follow `ymm-schema-designer`, not `.claude/rules/database/`. Use foreign keys,
  `bigint` identity ids and hard deletes with `is_active` flags; fitment integrity depends on them.
  Use `/ymm-schema-designer` instead of `/spartan:migration`.
- **Frontend:** this is Vite + React, not Next.js — no App Router or server components.
- **Tests:** there is no test runner; don't claim TDD. Propose adding Vitest before writing tests.
