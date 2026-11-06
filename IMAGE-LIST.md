# R.G. Traders photography shot list

The `/public/assets/img/*.svg` files are **flat, labelled placeholders**, not fabric photographs or AI imagery. Unverified legacy images in `/public/images/` are not used. Replace slots with owner-approved original photos. Do not remove the pending labels until a real image is supplied.

| Slot | Photograph to supply | Crop |
| --- | --- | --- |
| polyester-roll-01 | Polyester rolls stacked, portrait, warehouse context | 4:5 and 4:6 |
| polyester-roll-02 | Polyester roll and selvedge detail | 4:5 |
| polyester-swatch | Actual polyester swatch close-up | 1:1 |
| swatch-fan | Real available colours laid out as a fan | 3:2 |
| knitted-weave | Close-up of knitted fabric weave | 21:9 and 1:1 |
| banner-texture | Wide fabric texture with quiet space for text | 21:9 |
| warehouse-aisle | R.G. Traders warehouse aisle | 16:9 and 3:2 |
| loading-area | Packing/loading at the premises | 4:5 |
| team | Ragul and the team, with permission | 1:1 |
| application-1 to application-5 | Approved garment, sportswear, uniform, furnishing and lining examples; confirm actual fabric suitability | Alternate 4:5 and 3:2 |

For each of `green-salena`, `yellow-spun`, `purple-pique`, `blue-dot-melange`, `plain-knit`, `blue-karan`, `nirmal-knit`, `purple-knit`, `yellow-turkey-silk`, and `blue-printed-matty`, provide:

- `<slot>.jpg`: fabric/roll overall, 4:5, 1600px long edge.
- `<slot>-detail.jpg`: close-up weave, 1:1.
- `<slot>-roll.jpg`: roll and selvedge, 3:2.

Use indirect daylight, neutral white balance and no heavy filters. Ensure colours are accurate. Export 480/800/1200px WebP or AVIF variants and an 800px JPEG fallback. In `components/ui.tsx`, replace the placeholder `<img>` with a `<picture>` using responsive `srcSet` and `sizes`, update the descriptive alt text, remove the pending caption, and retain width/height. Replace the banner CSS background with the approved texture and assess text contrast; use a flat indigo tint if needed.

## Current production imagery

The live source now uses six illustrative Pexels fabric photographs, with responsive WebP variants and JPEG fallbacks. See `IMAGE-LICENSES.md`, `data/photos.json` and the `/image-credits/` page for source records. They are not actual product, team or warehouse photos. Replace with your cleared originals to show real stock and premises. The previous SVG slots are archived under `source-assets/placeholder-slots/`; legacy images with unknown provenance are excluded from the public directory and deployment.
