---
name: rg-traders-fabric-redesign
description: Redesign and upgrade the existing R.G. Traders fabric wholesale website so it looks hand-built by a senior front-end developer, not AI-generated. Use this skill whenever the task involves the R.G. Traders site, a fabric / textile / polyester / knitted fabric wholesale website, de-AI-ing a website's look, replacing generic icons, fixing fonts and colours, adding parallax scroll, varied image layouts, new product sections, or making the site more responsive and professional. Trigger even if the user only says "make it look professional", "remove AI look", or "improve my fabric website".
---

# R.G. Traders — Professional Fabric Wholesale Redesign

## 0. Your role

Act as a **senior front-end developer and brand designer** with 10+ years of experience building B2B and textile-trade websites. The existing site looks AI-generated. Your job is to **redesign and enhance it**, keeping the business content, and to deliver something a real agency would ship.

Always **read the existing project files first** (HTML/CSS/JS or React components). Keep the stack the project already uses. Do not rewrite in a new framework unless asked.

---

## 1. What "looks AI-generated" means here (remove all of it)

Find and eliminate every one of these:

| Remove | Replace with |
|---|---|
| Claude-style sparkle / asterisk / starburst icons, "✨", AI-looking gradient orbs | Nothing, or a real fabric photo / a simple brand mark |
| Emoji used as icons (🧵 📦 🚚 ✅) | Real icon set (see §4) or small custom SVGs |
| Decorative underline under headings (gradient bar, squiggle, short accent line under every H2) | Clean headings. Separation comes from spacing, a thin full-width hairline rule, or a small uppercase eyebrow label above the heading |
| Purple-to-blue / pink gradients, glassmorphism everywhere, glowing shadows | Solid colours, flat surfaces, subtle 1px borders, soft low-opacity shadows only where needed |
| Every section = centred title + 3 identical cards | Different layout per section (see §6) |
| Stock-illustration blobs, 3D-looking AI imagery | Real photography of rolls, swatches, warehouse |
| Generic copy: "Elevate your...", "Seamlessly...", "Unlock...", "cutting-edge" | Plain trade language: GSM, width, roll size, colour, MOQ, dispatch |
| Rounded-everything (all radii 24px+) | Restrained radii: 2–6px for cards and buttons, 0 for image-heavy blocks |
| Hover "lift + glow" on every card | One consistent, quiet hover (image zoom 1.03 or border-colour change) |

Self-check before delivering: search the code for `linear-gradient`, `✨`, emoji characters, `text-decoration`, `border-bottom` on headings, `::after` pseudo-elements under titles, and `backdrop-filter`. Justify or delete each hit.

---

## 2. Business facts (single source of truth — do not invent others)

- **Name:** R.G. Traders
- **Business type:** Wholesale trader / distributor (also retail). Proprietorship.
- **CEO / Proprietor:** Ragul
- **Established:** 2019 (GST registration 2019)
- **Team size:** up to 10 people
- **GST No.:** 33BUCPT2817H1ZO
- **Banker:** Tamilnad Mercantile Bank
- **Address:** 48HP+P26, Maruthachalapuram, 60 Feet Road, Sivan Theatre Rd, Tiruppur, Tamil Nadu 641602
- **Phone:** +91 98439 99828
- **Additional business lines:** Factory/Manufacturing, Leasing, Retail, Works Contract, Sale Office
- **Google rating:** 5.0 (shown as "5.04" in the source text — confirm the real number before publishing; do not show a made-up review count)
- **Listed on:** IndiaMART (link to the profile if the user supplies the URL)

**Known inconsistencies to flag to the user (do not silently decide):**
1. Source mentions both Coimbatore and Tiruppur. Use **Tiruppur** (the address and Google listing) and ask the user to confirm.
2. "11 yrs" (IndiaMART membership) vs. established 2019. Use **2019** for "Since" and keep "11 yrs" out unless confirmed.

**Pricing:** No prices were provided. Never invent prices. Every product CTA is **"Get Best Price"** / **"Request Quote"**.

---

## 3. Product catalogue (use exactly this structure)

### Knitted Fabric — 5 products
- Plain Knit Polyester Fabric
- Blue Karan Plain Polyester Knitted Fabric
- Plain Polyester Nirmal Knit Fabric
- Purple Polyester Knitted Fabric
- (+ more)

### Polyester Fabric — 4 products
- Green Salena Plain Polyester Fabric
- Yellow Spun Polyester Fabric
- Purple Polyester Pique Fabric
- Blue Dot Melange Polyester Fabric
- (+ more)

### Silk Fabric — 1 product
- Yellow Turkey Silk Fabric

### Matty Fabric — 1 product
- Blue Printed Matty Fabric

**Polyester is the hero category.** It is what the business sells most. Lead with it in the hero, navigation order, homepage featured grid and imagery.

Product data lives in **one data file** (e.g. `products.js` / `products.json`) — name, category, colour, fabric type, slug, image, short description, and spec fields marked `"Ask for details"` where unknown. Render every grid from it. No hard-coded duplicates.

---

## 4. Design system

### 4.1 Colour (solid colours only — no gradients)

Pick a palette that feels like dyed cloth, not a SaaS landing page. Default palette:

| Role | Name | Hex |
|---|---|---|
| Primary (headers, footer, buttons) | Indigo Dye | `#1F2A44` |
| Primary hover | Deep Indigo | `#151D33` |
| Background | Raw Cotton | `#F6F2EA` |
| Surface (cards) | Warm White | `#FFFFFF` |
| Alt section background | Linen | `#E9E2D3` |
| Accent (CTAs, key numbers) | Madder Red | `#A63D2F` |
| Secondary accent | Turmeric | `#C8942B` |
| Calm support | Sage | `#6F8473` |
| Text | Charcoal | `#22252B` |
| Muted text | Slate | `#5B6270` |
| Borders | Thread | `#D8D0BF` |

Rules:
- Define as CSS custom properties in `:root`. No raw hex scattered through components.
- Max **one accent colour per section**. Dark sections (indigo) alternate with light sections (cotton, linen).
- Text contrast must pass WCAG AA (4.5:1 body, 3:1 large).
- Product colour swatches (blue, green, yellow, purple) are shown as **real fabric photos or flat colour chips** — they are product data, not brand palette.

### 4.2 Typography — calm, business, trustworthy

Use **two families maximum**, self-hosted or from Google Fonts with `font-display: swap`.

- **Headings:** `Fraunces` (soft serif, weight 500–600) — alternates: `Libre Caslon Text`, `Source Serif 4`
- **Body / UI:** `Source Sans 3` — alternates: `IBM Plex Sans`, `Public Sans`
- **Numbers / specs / GST (optional):** `IBM Plex Mono`, small, for GSM, width, GST number

Do **not** use: Inter-as-default-everywhere, Poppins, Space Grotesk, Orbitron, script fonts, or more than one display face.

Fluid type scale (use `clamp`):

```css
--step--1: clamp(0.82rem, 0.80rem + 0.1vw, 0.9rem);
--step-0:  clamp(1rem, 0.96rem + 0.2vw, 1.125rem);
--step-1:  clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
--step-2:  clamp(1.6rem, 1.4rem + 1vw, 2.2rem);
--step-3:  clamp(2.1rem, 1.7rem + 2vw, 3.2rem);
--step-4:  clamp(2.8rem, 2rem + 4vw, 5rem);
```

- Body line-height 1.6, headings 1.1–1.2, max line length 65–70ch.
- Eyebrow labels: uppercase, `letter-spacing: 0.14em`, `--step--1`, accent colour.
- Headings are **sentence case**, plain, no underline, no gradient text.

### 4.3 Icons — real, professional, consistent

- Use **one** library for the whole site: **Phosphor Icons (regular weight)** or **Lucide** (stroke 1.5). Import as inline SVG, not an icon font, so they can be styled and are accessible.
- Icon size 20–24px in UI, up to 32px in feature blocks. Same stroke width everywhere.
- No emoji, no AI sparkle, no coloured circle-behind-icon on every item. Icons are optional — if a section reads fine without them, leave them out.
- Add a real **brand mark**: a simple monogram "RG" in the heading serif inside a square, or a woven-thread-style SVG. Also provide a favicon (SVG + 32px PNG).
- Social/contact icons: use the actual brand glyphs for WhatsApp, Phone, Mail, Google Maps, IndiaMART.

### 4.4 Spacing & layout

- 8px spacing scale. Section padding `clamp(4rem, 8vw, 8rem)` vertical.
- Container max-width 1240px, with `padding-inline: clamp(1rem, 4vw, 2rem)`.
- 12-column CSS Grid for layout. Avoid hard-coded pixel widths.
- Buttons: solid fill, 2–4px radius, 14–16px vertical padding, uppercase optional but consistent. Primary = Indigo or Madder; secondary = 1px outline.

---

## 5. Imagery — different sizes and layouts

Use **real photography**. If the user has not supplied photos, create clearly named placeholder slots (`/assets/img/polyester-roll-01.jpg`) and a short `IMAGE-LIST.md` telling the user exactly which photos to shoot: fabric rolls stacked, close-up weave/texture of each product, swatch fan, warehouse aisles, loading, team.

Never use AI-generated imagery or illustration. If stock is needed, use licensed fabric photos only and note the source.

Image treatment rules:
- Use a **mix of aspect ratios** on the same page: 4:5 portrait, 3:2 landscape, 1:1 square, 16:9 wide, 21:9 banner. A page where every image is the same size is a failed page.
- Use `object-fit: cover`, `aspect-ratio`, `width`/`height` attributes (no layout shift), `loading="lazy"` below the fold, `srcset` + `sizes`, WebP/AVIF with JPEG fallback.
- Slight warm colour grade across all photos for consistency. No heavy filters, no overlay gradients on every image.
- Alt text describes the fabric: "Blue Karan plain polyester knitted fabric roll, close-up of weave".

Layout patterns to use (one per section, never repeat back-to-back):
1. **Asymmetric hero collage** — one tall portrait, one wide landscape, two small squares.
2. **Bento grid** — mixed-size tiles (1×1, 2×1, 1×2, 2×2) for categories.
3. **Masonry gallery** — CSS columns, natural image heights.
4. **Split feature** — 60/40 image + text, alternating sides.
5. **Full-bleed banner** with parallax background.
6. **Horizontal scroll strip** of swatches (scroll-snap).
7. **Overlapping stack** — a small image overlapping a large one, offset.

---

## 6. Page structure (sections, in order)

Each section must look **different** from its neighbours (layout, background, rhythm).

1. **Top utility bar** (slim, indigo) — phone, "GST Registered", address city, WhatsApp link.
2. **Header / nav** — logo mark + wordmark; links: Home, Products, About, Gallery, Why Us, Contact; sticky with solid background on scroll; primary button "Get Best Price". Mobile: full-screen slide-in menu, 44px tap targets.
3. **Hero** — headline in plain trade language, e.g. *"Polyester and knitted fabrics, supplied in bulk from Tiruppur."* One supporting line, two buttons (Get Best Price, View Products), trust row (GST registered · Since 2019 · 5.0 Google rating). Asymmetric image collage on the right with parallax depth (layers move at different speeds).
4. **Category strip / "What we supply"** — bento grid of the 4 categories with product counts (5, 4, 1, 1). Polyester and Knitted get the larger tiles.
5. **Featured: Polyester Fabric** — large split section, dark indigo background, product list on one side, tall image on the other.
6. **Knitted Fabric range** — product cards in a grid with colour chips (Blue Karan, Nirmal, Purple, Plain Knit).
7. **Silk and Matty** — two-column editorial block, different image ratios, short descriptions.
8. **Parallax banner** — full-bleed fabric texture photo with a single large statement and a CTA. Pure photo, no gradient overlay (use a flat 40% indigo tint only if text needs contrast).
9. **Why buy from us** — numbered list (01–05) in a two-column layout, not icon cards. Use real points: bulk/wholesale quantities, wide colour range, GST-registered invoicing, ready stock from Tiruppur, direct contact with the proprietor.
10. **How to order** — horizontal 4-step timeline: Enquire → Share requirement (colour, quantity, GSM) → Quote and sample → Dispatch. Thin line connector, numerals in the serif font.
11. **Fabric specs table** — a clean, bordered comparison table (Category · Typical use · Finish · MOQ "On request"). Scrolls horizontally on mobile.
12. **Applications / industries** — masonry image gallery: garments, sportswear, uniforms, home furnishing, linings. Only include uses you can reasonably support; mark as "Ask us".
13. **Infrastructure, warehouse and team** — three different-sized photos plus a factsheet (see §2) rendered as a definition list.
14. **Numbers strip** — count-up for: Years (since 2019), Product categories (4), Team (10), Google rating (5.0). Real numbers only.
15. **Reviews** — Google rating badge and review cards only with real, user-supplied review text. If none supplied, show the rating and a "Read our reviews on Google" link; do not fabricate quotes.
16. **FAQ** — accordion (native `<details>`) on MOQ, samples, GST invoice, delivery, payment, colour matching. Answers must be marked for the user to confirm.
17. **Enquiry form** — Name, Phone, Fabric category (select), Colour, Quantity, Message. Solid fields, visible labels (not placeholder-only). Includes WhatsApp quick-link.
18. **Contact and map** — address, phone, hours (mark "add business hours" if unknown), embedded Google Map, Directions button.
19. **Footer** — indigo; four columns (Company, Products, Reach Us, Statutory: GST No., Banker), copyright, back-to-top.

Plus: a floating WhatsApp / Call button (bottom-right, solid, not pulsing).

Also create individual **category pages** and a **product detail template** (image gallery with different-size thumbnails, spec list, Get Best Price form, related products).

---

## 7. Parallax and motion

Parallax must feel premium, not gimmicky.

- Implement with **CSS** where possible (`background-attachment: fixed` for desktop banner) and a light **JS + `requestAnimationFrame`** or `IntersectionObserver` approach for layered movement. No heavy libraries (no full-page scroll-jacking).
- Use `transform: translate3d()` only, never animate `top/left`. Add `will-change: transform` sparingly.
- Parallax zones: hero collage layers (speeds 0.05 / 0.1 / 0.18), the full-bleed banner, and one overlapping image in a split section.
- **Disable parallax** on touch devices and small screens (`@media (max-width: 900px)`) — fall back to static images. iOS ignores `background-attachment: fixed`, so don't rely on it there.
- Reveal-on-scroll: fade + 16px upward translate, 500–700ms, `cubic-bezier(.2,.7,.2,1)`, once only, staggered 80ms.
- Respect `prefers-reduced-motion: reduce` — turn off all parallax and reveals.
- No bouncing, spinning, typewriter or confetti effects.
- Keep Lighthouse performance ≥ 85 mobile.

---

## 8. Responsiveness

Mobile-first. Test and fix at **360, 390, 768, 1024, 1280, 1536** px.

- Use `clamp()`, `min()`, grid `auto-fit/minmax`, and container-based layouts.
- Collapse bento and masonry to 1–2 columns on mobile; keep **different image sizes** on mobile too (alternate full-width and half-width).
- Tables and spec lists scroll inside their own container; body never scrolls sideways.
- Tap targets ≥ 44px. Sticky bottom bar on mobile with **Call** and **WhatsApp**.
- Navigation usable with keyboard; visible focus rings (2px offset outline in accent colour).
- Honour safe-area insets on phones (`env(safe-area-inset-*)`).

---

## 9. Content and copy rules

- Write like a trader, not a marketer: short sentences, concrete nouns, numbers.
- Good: "Plain knit polyester in 20+ colours. Bulk rolls dispatched from Tiruppur."
  Bad: "Experience unparalleled textile excellence."
- Don't claim certifications, exports, machine counts, GSM values, MOQs, turnover, or client names that were not provided. Use "Ask for details" or leave a clear `TODO:` comment for the owner.
- Use Indian number/phone formats (+91 98439 99828). Currency in ₹ only if prices are supplied.
- Plain English first; offer a Tamil toggle only if the user asks.

---

## 10. Engineering quality bar

- Semantic HTML5 (`header`, `nav`, `main`, `section`, `article`, `footer`), one `h1`, logical heading order.
- Clean, commented CSS organised as: tokens → base → layout → components → sections → utilities. BEM-style or consistent naming. No `!important` unless justified.
- No dead code, no leftover AI comments ("// Here's the...").
- Accessibility: alt text, labels, ARIA only where needed, colour contrast, skip-link.
- SEO: unique `<title>` and meta description per page, Open Graph tags, `LocalBusiness` JSON-LD (name, address, phone, GST, geo), `sitemap.xml`, `robots.txt`, descriptive file names.
- Performance: compressed images, preload the hero image and the heading font, minimal JS, no unused libraries.
- Forms: client validation plus a working endpoint (mailto/WhatsApp deep-link fallback, or the user's backend). State clearly what is wired up.

---

## 11. Working process

1. **Audit** the current site. List every AI-looking element found (use §1 table). Show the list briefly.
2. **Propose** the palette and fonts in one short summary (use §4 defaults unless the user objects).
3. **Build the design tokens and base styles first**, then each section in the order of §6.
4. **Replace** icons, remove underline decorations and Claude-style marks, restructure image layouts, add parallax.
5. **Add** the new sections and category/product pages.
6. **Verify** with the checklist in §12. Fix before reporting.
7. **Report** in 6–10 lines: what changed, what the owner must supply (photos, prices, review text, hours, confirmed city), and any assumptions.

Do not ask many questions up front. Make sensible decisions, flag the inconsistencies in §2, and keep going.

---

## 12. Final checklist (all must be true)

- [ ] No gradients, emoji, sparkle/Claude-style icons, or heading underlines remain
- [ ] Two fonts max; calm serif headings, clean sans body
- [ ] One consistent professional icon set, used sparingly
- [ ] At least 5 different image layouts and 4+ aspect ratios across the page
- [ ] Every section visibly differs from its neighbours
- [ ] Polyester is featured first; all four categories and all listed products appear
- [ ] Parallax works on desktop, is off on mobile and with reduced-motion
- [ ] Works at 360px without horizontal scroll
- [ ] Business facts match §2 exactly; nothing invented (prices, reviews, certifications)
- [ ] Contact buttons work (tel:, WhatsApp, mailto, map)
- [ ] Lighthouse: Accessibility ≥ 95, SEO ≥ 95, Performance ≥ 85 (mobile)
- [ ] Code is clean, commented, and tokenised
- [ ] Open items for the owner are listed in the final report

---

## 13. Deliverables

- Updated site source (HTML/CSS/JS or components) in the project's existing structure
- `products.json` (or equivalent) with the catalogue in §3
- `/assets/img/` with correctly named image slots
- `IMAGE-LIST.md` — shot list for photography
- `README.md` — how to edit products, colours and fonts; how to deploy
- Short change report (see §11, step 7)