---
name: ymm-schema-designer
description: Designs PostgreSQL schemas, migrations, seed scripts and lookup queries for Nexo Autospares vehicle fitment — make, model, chassis generation, engine, OEM/part numbers, cross-references, and LH/RH side. Use when creating or changing database tables, migrations, seeds, or part/vehicle search queries.
---

# Nexo Vehicle Fitment Schema Guidelines

## Nexo context (read first)

- **Market:** Kenya, mostly Japanese used imports. Customers identify a car by
  model + chassis code (e.g. Premio 260 = `NZT260 / ZRT260 / ZRT265`), then year.
  Engine code matters for mechanical parts but not for most of the current range
  (lenses, lamps, mats, windbreakers fit a whole generation).
- **Current data:** `src/data/vehicles.ts` (`VehicleModel`), `src/data/products.ts`
  (`ProductItem`, where `fitVehicles[]` holds vehicle ids), types in `src/types/index.ts`.
  Any schema must be seedable from these files without losing a field.
- **Stock source of truth is ERPNext.** `Item (9).csv` is an ERPNext Item export;
  `Item Code` is the join key. ERPNext keeps LH and RH as separate items
  (`Tail Lamp Probox Old Lhs` / `... Rhs`). Prices in that export are `0.0` — real
  prices come from ERPNext Item Price, not the item export.
- **Scale:** ~430 items today. Design for 100k SKUs and 1M+ fitment rows.
- These rules override generic migration skills (e.g. rules that ban foreign keys).
  Fitment correctness depends on referential integrity.

## 1. Core tables

| Table | Purpose / key columns |
|---|---|
| `makes` | `name` unique, `slug` unique |
| `models` | `make_id` FK, `name`, `slug`; unique `(make_id, slug)` |
| `vehicle_generations` | The unit customers pick (today's `VehicleModel`). `model_id` FK, `name` ("Harrier (XU60)"), `slug` (keep today's ids, e.g. `toyota-harrier-xu60`), `year_from`, `year_to` (NULL = still current), `popular` |
| `chassis_codes` | `generation_id` FK, `code` ("ZSU60"); unique `(generation_id, code)` |
| `engines` + `generation_engines` | Optional. `code` ("2ZR-FE"), `displacement_cc`, `fuel` |
| `products` | What the site shows as one listing/page: `slug` unique (title + part no), `legacy_id` (id from `src/data/products.ts`), `title`, `category`, `description`, `pair_price_kes` |
| `parts` | Sellable SKU variant of a product. `product_id` FK, `sku` unique, `erpnext_item_code`, `side` (`LH`,`RH`,`pair`,`universal`), `price_kes` integer, `stock_qty`, `is_active`, `erpnext_modified_at` |
| `part_numbers` | OEM numbers **and** cross-references in one indexable table: `product_id` FK, `number` (as printed), `number_normalized`, `kind` (`oem`,`manufacturer`,`aftermarket`,`supplier`), `brand` |
| `product_fitments` | `product_id` FK, `generation_id` FK, optional `year_from`/`year_to` (NULL = whole generation), optional `engine_id`, `position` (`front`,`rear`,`any`), `notes`, `verified_by`, `verified_at` |

Why products vs parts: ERPNext sells LH and RH as different SKUs with their own stock,
but the site shows one page with a side toggle. Fitment attaches to the product, so
both sides inherit it.

## 2. Column and constraint rules

- Foreign keys on every relationship, `ON DELETE RESTRICT` (use `CASCADE` only on pure
  join rows). **Index every FK column** — Postgres does not do it automatically.
- Money is `integer` whole KSh (`price_kes`). Never `float`/`real`.
- Years are `smallint` with `CHECK (year_from <= year_to)` and a sane range (1950 to next year).
- Enums: use `text` + `CHECK (... IN (...))` so values can be added in a migration without enum-type pain.
- Every table gets `id` (`bigint generated always as identity`), `created_at`, `updated_at` (`timestamptz`).
- Slugs are permanent — URLs and SEO depend on them (see `auto-seo-schema`). Changing
  one requires a redirect record.
- Part-number normalization as a generated column so searches ignore dashes/spaces:
  ```sql
  number_normalized text GENERATED ALWAYS AS
    (upper(regexp_replace(number, '[^A-Za-z0-9]', '', 'g'))) STORED
  ```

## 3. Indexes (performance at 100k SKUs)

- Dropdowns: `models (make_id, name)`, `vehicle_generations (model_id, year_from, year_to)`.
- Fitment: `product_fitments (generation_id, product_id)` and `(product_id)`.
- Exact lookups: `part_numbers (number_normalized)`, `chassis_codes (code)`, `parts (sku)`.
- Fuzzy search: `CREATE EXTENSION IF NOT EXISTS pg_trgm;` then GIN trigram indexes on
  `products.title`, `part_numbers.number_normalized`, `chassis_codes.code`.
- Check query plans with `EXPLAIN ANALYZE` against seeded data before calling a query done.

## 4. Reference queries

```sql
-- Parts that fit a chosen car (optionally a specific year), with per-side stock
SELECT p.slug, p.title, v.side, v.price_kes, v.stock_qty
FROM product_fitments f
JOIN vehicle_generations g ON g.id = f.generation_id
JOIN products p ON p.id = f.product_id
JOIN parts v ON v.product_id = p.id AND v.is_active
WHERE f.generation_id = $1
  AND ($2::smallint IS NULL
       OR $2 BETWEEN coalesce(f.year_from, g.year_from)
                 AND coalesce(f.year_to, g.year_to, 9999));

-- Search by part number or chassis code typed by a customer ("47 148", "zsu60")
SELECT product_id FROM part_numbers
WHERE number_normalized = upper(regexp_replace($1, '[^A-Za-z0-9]', '', 'g'));
```

## 5. Migrations and seeds

- If the project already has a migration tool, follow it. If not, write numbered plain
  SQL files in `db/migrations/NNN_short_name.sql` with `-- migrate:up` and
  `-- migrate:down` sections, and ask before introducing an ORM.
- Never edit a migration that may have been applied; add a new one.
- Current schema: `db/migrations/001_vehicle_fitment.sql`. Catalog seed:
  `db/seeds/001_catalog.sql`, generated by `npm run db:seed:generate` from `src/data/*.ts` —
  never edit the SQL by hand; change the data or `db/seeds/generate-catalog-seed.ts`.
- Vehicle ids become generation slugs; product ids are kept in `products.legacy_id` so
  carts saved in `localStorage` still resolve.
- Every migration must run up, down, and up again cleanly.

## Done checklist

- [ ] Chassis codes, side and year range are all queryable
- [ ] Every FK has an index; money is integer KSh
- [ ] Part-number search works with and without dashes/spaces
- [ ] Seed covers every vehicle and product in `src/data/`
- [ ] Every part has its `erpnext_item_code`
- [ ] Up/down migration tested
