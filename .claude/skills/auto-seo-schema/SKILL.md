---
name: auto-seo-schema
description: Adds search-engine structure to Nexo Autospares pages — product and car URLs, JSON-LD (Product, AutoPartsStore, BreadcrumbList), canonical/indexing rules, titles, meta and Open Graph. Use when building or editing product pages, car or category pages, the home page, or anything affecting SEO and link previews.
allowed-tools: Read, Grep, Glob, Edit, Write
---

# Nexo Autospares SEO & Structured Data

## Nexo context (read first)

- Vite + React single-page app. There is **no router yet**: products open in
  `ProductDetailModal`, so no product has its own URL. Structured data on a page that
  doesn't exist does nothing — fix URLs first (section 1).
- Shop: Nexo Autospares, Kirinyaga Road, Nairobi. Phone/WhatsApp `+254141088163`.
  Opening hours live in `src/components/CounterTrustFooter.tsx` — read them from there
  (or a shared config), never retype them.
- Currency is KES. Prices are per side; some products have a `pairPrice`.
- Customers search by car + part: "harrier 2015 head lens", "premio 260 tail light",
  "47-148". Car-specific pages are the highest-value pages on the site.

## 1. URLs — every product and car gets a real page

| Page | Path | Indexable |
|---|---|---|
| Product | `/p/{slug}` — slug = car + part + part no, e.g. `harrier-xu60-head-lens-47-148` | yes |
| Car | `/cars/{make}/{generation-slug}` e.g. `/cars/toyota/harrier-xu60` | yes |
| Car + category | `/cars/toyota/harrier-xu60/head-lenses` | yes |
| Category | `/parts/{category-slug}` | yes |
| Search | `/search?q=` | no (`noindex, follow`) |

- The modal can stay as a quick view, but it must link to (and update the address bar to) the product URL.
- Slugs are permanent (see `ymm-schema-designer`). Renamed or removed products get a 301 redirect, not a 404.

## 2. Rendering

JSON-LD, `<title>`, meta and canonical tags must be in the HTML the server sends.
Google may run JavaScript; WhatsApp, Facebook and most other crawlers do not.
Use build-time pre-rendering of product/car/category pages, or render them in the
Express server. If a change only injects tags client-side, say so explicitly — don't
report the SEO work as done.

## 3. JSON-LD templates

**Product** (one per product page):

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Head Lens – Toyota Harrier XU60 (2014–2019)",
  "sku": "HEAD LENS HARRIER 2014-2019",
  "mpn": "47-148",
  "image": ["https://<site>/assets/harrier-head-lens.webp"],
  "description": "…",
  "brand": { "@type": "Brand", "name": "<real brand or omit>" },
  "category": "Head lenses",
  "isAccessoryOrSparePartFor": {
    "@type": "Car",
    "name": "Toyota Harrier XU60",
    "brand": { "@type": "Brand", "name": "Toyota" },
    "vehicleModelDate": "2014"
  },
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "Chassis codes", "value": "ZSU60, ZSU65, AVU65" },
    { "@type": "PropertyValue", "name": "OEM Number", "value": "<oem no>" }
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://<site>/p/harrier-xu60-head-lens-47-148",
    "price": 4025,
    "priceCurrency": "KES",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "AutoPartsStore", "name": "Nexo Autospares" }
  }
}
```

Rules:
- `availability` comes from stock: `InStock` if `inStock > 0`, otherwise `OutOfStock`. Never hard-code it.
- Per-side pricing with a pair price → `AggregateOffer` with `lowPrice`/`highPrice`/`offerCount`.
- `isAccessoryOrSparePartFor`: one `Car` entry per fitting generation.
- OEM numbers and chassis codes go in `mpn` / `additionalProperty`. There is no `oemCode` property.
- Use `NewCondition` unless the part is used/ex-Japan, then `UsedCondition`.
- `aggregateRating` / `review` **only** from real customer reviews. The `rating` field in
  `src/data/products.ts` is not review data — don't output it.
- `hasMerchantReturnPolicy` and `shippingDetails` only when a written policy exists.
- All URLs absolute; read the site origin from one config value.

**AutoPartsStore** (home and contact pages): name, logo, address (Kirinyaga Road, Nairobi,
KE), `geo`, `telephone`, `openingHoursSpecification` (from the footer data),
`paymentAccepted: "Cash, M-Pesa"`, `priceRange`, `sameAs` (Google Business Profile,
Facebook, Instagram — ask for the real links).

**BreadcrumbList** on product, car and category pages: Home › Toyota › Harrier XU60 › Head lenses › product.

## 4. Canonical and indexing rules

- Clean-path pages (table above) are self-canonical.
- Query parameters (`?sort=`, `?side=`, `?utm_*`, `?gclid=`, `?fbclid=`, `?ref=`) → canonical to the clean path.
- Paginated pages `?page=2` are self-canonical (don't point them at page 1).
- Out-of-stock products stay indexed and marked `OutOfStock`. Discontinued → 301 to the closest car/category page.
- Generate `sitemap.xml` from products + car pages, and a `robots.txt` that links to it.

## 5. Titles, meta and previews

- Title: `{Part} for {Car} {years} – KSh {price} | Nexo Autospares` (aim ≤ 60 chars; drop price before car).
- Meta description: part, car, part number, price, "Kirinyaga Road, Nairobi", delivery options.
- Open Graph + Twitter: absolute 1200×630 image, `og:url` = canonical, `og:locale` = `en_KE`.
- `<html lang="en-KE">`. Never ship `user-scalable=no` or `maximum-scale=1` in the viewport meta.
- One `<h1>` per page, matching the product/car name.

## Done checklist

- [ ] Page has its own URL and appears in the sitemap
- [ ] JSON-LD present in the served HTML (check built output or view-source, not DevTools)
- [ ] Passes Google Rich Results Test / schema.org validator
- [ ] Availability and price read from data, currency `KES`
- [ ] No invented ratings, brands, policies or social links
- [ ] `npm run lint` and `npm run build` pass
