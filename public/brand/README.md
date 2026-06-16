# Brand assets

| File | Role |
|------|------|
| **`logo-mark.png`** | Nav, footer, auth, admin, favicon (via `app/layout` metadata). |

**Update the logo:** drop in a new `logo-mark.png` (same name), or add `logo-mark.svg` and change `src` in `components/brand/logo-mark.tsx` once.

**Performance:** an SVG export of this mark is ideal (small file, sharp at any size). PNGs around **256–512 px** square are enough; the UI displays 32–44 px and `next/image` resizes.
