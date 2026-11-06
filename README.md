# R.G. Traders

A Next.js 16 / React 19 / TypeScript static website, retaining the original stack. White, slate and navy palette with a cobalt accent. Self-hosted fonts with immediate system fallbacks: Encode Sans Semi Expanded for body/UI, bold Gabarito for headings and footer, Goldman for statistics, Krona One for the brand, and Italiana retained as an optional editorial face. Six licence-checked Pexels photographs illustrate fabric textures. See IMAGE-LICENSES.md.

## Run and build

Use Node.js 20.9+ and `npm install` (or `npm ci` with the lockfile).

```
npm run dev
npm run typecheck
npm run build
npm start
```

The production static export is `out/`. `npm start` serves it at http://127.0.0.1:3100. Upload `out/` to a static host with directory index support and `404.html` as the not-found document. The existing `.openai/hosting.json` Site identity is retained. No backend, secret or database is required.

## Edit content

- `data/products.ts`: single source for four categories, supplied counts, all ten named products, chips and unknown specs. The fifth knitted name is missing from the brief; it is not invented. Add it here when confirmed.
- `data/business.ts`: exact business facts, telephone, WhatsApp, map link and canonical origin. Set `NEXT_PUBLIC_SITE_URL` before building for a different domain.
- `app/globals.css`: CSS variables in `:root` define colours and type scale. Section styles follow components and layout; responsive rules are at the end.
- `app/fonts.css`: local WOFF2 files with `font-display: swap`. `app/layout.tsx` preloads the primary body and heading fonts. No runtime Google Fonts dependency. `scripts/self-host-fonts.mjs` refreshes them and saves OFL licences.
- `components/ui.tsx`: shared responsive JPEG/WebP photographs, section titles and product cards. Source mapping is in `data/photography.ts`; exact product photos can replace illustrative stock after clearance.
- `app/page.tsx`: homepage sections and FAQ draft policies.
- `app/categories/[slug]/page.tsx`, `app/products/[slug]/page.tsx`: statically generated category and product pages, unique metadata, gallery, specifications and related products.
- `app/sitemap.ts`, `app/robots.ts`: generated from catalogue and configured canonical origin.
- `components/motion.tsx`: once-only section and heading reveals plus statistics counters. No parallax. Reduced-motion users see static content.

## Modern form

Material UI provides outlined TextFields, category selection, Button and Alert inside a restrained, shadcn-style bordered card. The design uses MUI; shadcn is a visual reference, not an additional component dependency. Its official App Router cache provider collects server-rendered styles. Inline validation checks name, phone and category.

## Enquiries

Forms validate name, phone and category, then prepare a WhatsApp message to +91 98439 99828. The visitor presses Send in WhatsApp. A visible fallback link appears after preparation. No form data is stored, no message is sent automatically. Telephone and Google Maps links are wired. No email link is invented because the owner has not supplied an address.

## Owner confirmation before launch

Supply approved photographs, exact product specs, fifth knitted product, business hours, Google profile URL/rating and authentic review text. Confirm Tiruppur (sources also mentioned Coimbatore); confirm established 2019 (11 years referred to marketplace membership). Confirm MOQ, samples, delivery, payment and colour-matching FAQ wording. Exact geo coordinates are not published until verified. IndiaMART and email links await their real URLs/address. Prices remain on request; provide prices only if they should be published.

## Verification

Run typecheck and production build after changes. Responsive QA targets: 360, 390, 768, 1024, 1280 and 1536px. Check keyboard menu trapping, Escape, FAQ, product/category links, validated WhatsApp preparation and reduced motion. Lighthouse targets: Accessibility/SEO 95+, mobile Performance 85+. Do not claim these scores without an actual run.

## Image licence review

`IMAGE-LICENSES.md` records every shipped photograph, original source, photographer and licence check date. The production export uses only `public/assets/photos/` for photography. Unverified legacy photos are archived locally outside `public/`, excluded from source publication, and must not be restored without evidence of rights. Stock is illustrative rather than a promise of exact stock colour or composition.

## Floating enquiry and contact controls

`components/contact-tools.tsx` adds the vertical right-side Enquiry tab and independent circular Call/WhatsApp links. The MUI drawer reuses `EnquiryForm`, retains the draft while closed, restores focus on dismissal, and supplies product/category context on product pages. Its contact destinations come from `data/business.ts`. The mobile bottom bar is replaced by these circles.
