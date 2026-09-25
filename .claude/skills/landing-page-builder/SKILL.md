---
name: landing-page-builder
description: Builds conversion-focused Nexo Autospares landing and promo pages for mobile buyers — WhatsApp and call CTAs, chassis-number quote forms, UTM/ad attribution that survives WhatsApp, honest trust signals, and a mobile-data performance budget. Use when creating marketing or ad landing pages, promo views, or lead capture forms.
---

# Nexo Lead-Generation Landing Pages

## Nexo context (read first)

- Buyers are mostly on mid-range Android phones on mobile data, arriving from Facebook,
  Instagram, TikTok or Google ads. Most orders close on **WhatsApp**, then pay by **M-Pesa**
  or at the counter on Kirinyaga Road.
- They shop by car + part + side ("Harrier 2016 head lens RH").
- Reuse what exists before building anything new:
  - `VehicleSelectorModal`, `ActiveVehicleBar` — car selection
  - `CantFindPartModal` — already a chassis-number → WhatsApp quote flow; extend it rather than duplicating
  - `PromoPosterBanner`, `ProductRowCard`, `CounterTrustFooter`, `NexoLogo`
  - Brand tokens in `src/index.css`: `nexo-red`, `nexo-black`, `nexo-gray`,
    `font-display` (Barlow Condensed), Plus Jakarta Sans, JetBrains Mono for prices/part numbers
- Contact details live in **one** config module (e.g. `src/config/contact.ts`:
  WhatsApp `254141088163`, phone, address, hours). If it doesn't exist yet, create it and
  replace the hard-coded `wa.me` links in `src/App.tsx`.

## 1. Mobile layout (design at 360×800 first)

- Above the fold: part name + car + years, real photo, price as `KSh 4,025`, stock state,
  primary CTA **Order on WhatsApp**, secondary **Call**.
- Sticky bottom bar with WhatsApp and `tel:` buttons: ≥ 48px tall, respects
  `env(safe-area-inset-bottom)`, never covers form fields or the price.
- WhatsApp links are `https://wa.me/<number>?text=<encoded message>` with a prefilled message
  naming the part, part number, side, price and car — the same pattern as `App.tsx`.

## 2. Quote request form (for parts not listed)

- Required (max 4): car **or** chassis/frame number, part needed, phone. Optional: side,
  name, photo of the old part or logbook.
- Chassis/frame number: accept formats like `NZT260-1234567`; validate loosely and
  uppercase it. Don't demand a 17-character VIN — most Japanese imports don't use one.
- Phone: accept `07…`, `01…`, `+254…`, `254…`; normalize to `2547XXXXXXXX` / `2541XXXXXXXX`.
- On submit: open WhatsApp with the details prefilled (like `CantFindPartModal`). When a
  backend exists, also POST the lead so it isn't lost if WhatsApp doesn't open.
- Show a clear success state with opening hours and the call option.

## 3. Attribution that survives WhatsApp

Hidden form fields alone don't work here, because most leads never submit a form.

- On first load, read `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
  `utm_term`, `gclid`, `fbclid`, `ttclid`. Store first-touch and last-touch in
  `localStorage` (wrapped in try/catch — it can be unavailable).
- Build a short reference code from them (e.g. `FB-HARRIER-0925`) and append it to every
  prefilled WhatsApp message as `Ref: …` so the counter staff can log the source.
- Include the full attribution in any form POST payload.
- Fire events through a single `track(event, params)` helper. Use GA4 names:
  `generate_lead` (with `method: whatsapp | call | form`), `view_item`, `add_to_cart`,
  `begin_checkout`, `purchase`; Meta Pixel `Lead` / `Contact`.
- If no analytics is installed, create `track` as a no-op that logs in development, and
  say so. Never invent measurement IDs or pixel IDs — ask for them.

## 4. Trust — only claims the business can back

- Always safe: physical counter on Kirinyaga Road with map link, opening hours, real product
  photos, part numbers, M-Pesa accepted, "we confirm fitment on WhatsApp before you pay".
- "100% Fitment Guarantee", returns or warranty badges only when a written policy exists and
  the badge links to it. If there's no policy, leave a visible TODO and ask. (The site already
  shows "100% Fitment Guarantee" in `VehicleSelectorModal` — flag it if no policy page exists.)
- No fake countdown timers, invented stock scarcity, fabricated reviews or made-up
  customer counts. These are misleading claims under Kenya's Consumer Protection Act.

## 5. Copy

- Headline names the car and the part: "Harrier 2014–2019 Head Lens – KSh 4,025 per side".
- Kenyan terms: KSh, M-Pesa, Nairobi courier, upcountry parcel, counter pickup.
- CTAs say what happens: "Order on WhatsApp", "Call the counter" — not "Get started".
- Short Swahili touches are fine ("Karibu") if the user wants them; keep the main copy in English.

## 6. Performance budget (mobile data)

- Hero image ≤ 150 KB (WebP/AVIF, sized for 360–430px wide screens), `fetchpriority="high"`,
  explicit `width`/`height`. Everything below the fold `loading="lazy"`.
- Initial load (HTML + CSS + JS + images) under 1 MB. Current product JPEGs are
  550–850 KB each — convert them before using them on a landing page.
- Target Lighthouse mobile Performance ≥ 90 and LCP < 2.5 s.
- Load only the font weights actually used.

## 7. Indexing

Short-lived ad pages that duplicate product content → `noindex, follow`.
Evergreen promo pages follow `auto-seo-schema`.

## Done checklist

- [ ] Checked at 360px wide: price, car and WhatsApp CTA visible without scrolling
- [ ] WhatsApp message prefilled and includes the `Ref:` code
- [ ] Every CTA fires `track(...)`
- [ ] Every guarantee shown links to a real policy (or is flagged as TODO)
- [ ] Contact details come from the shared config module
- [ ] Image weight and Lighthouse targets met
- [ ] `npm run lint` and `npm run build` pass
