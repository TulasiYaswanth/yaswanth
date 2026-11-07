# Flowza — website

A fresh, hand-built marketing site for **Flowza** (the Profit Operations System for growing B2B service companies).

Static HTML + CSS + vanilla JS. **No framework, no build step, no npm install.** Open the folder and it runs.

The upstream `devflowza/Flowza_Website` repository is private and not reachable from this workspace's GitHub connection, so this is a clean-room rebuild of the *site* — used the live public positioning and copy from [flowza.io](https://flowza.io) as the content source.

---

## Run it

```bash
python3 -m http.server 8080 --bind 0.0.0.0
# → http://localhost:8080
```

Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3) — there is nothing to compile.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: hero + leak report, problem, Profit Operations System, six capabilities, guarantee band, process, delivered result, founder, fit, booking form |
| `capabilities.html` | All eleven systems with live category filtering, plus the integration approach |
| `results.html` | Delivered 4 → 1 FTE invoice result, three modelled engagements (filterable), impact metrics |
| `about.html` | Founder, four working principles, fit / not-fit lists |
| `book.html` | Assessment request form, what happens on the call, FAQ accordion |

## Structure

```
index.html
capabilities.html
results.html
about.html
book.html
assets/
  css/styles.css   # design tokens + all components (single file, ~1,000 lines)
  js/main.js       # nav, scroll reveal, count-ups, filters, form validation, FAQ
```

## What's implemented

- **Design system in CSS custom properties** — colours, type, spacing, radii, easing in one `:root` block.
- **Hero leak-report card** — animated bars and a count-up total (`data-count` attributes).
- **Scroll reveals** and stat count-ups via `IntersectionObserver`, fully disabled under `prefers-reduced-motion`.
- **Responsive** at 1060 / 860 / 620 px, with a real mobile menu (Escape + resize aware, body scroll locked).
- **Accessibility** — skip link, landmarks, `aria-current` nav state, keyboard-visible focus rings, labelled form fields, `aria-invalid` on errors, status region on success.
- **Capability & scenario filters** — pill tabs that filter cards by `data-tags`, with a live count note.
- **Forms** — client-side validation (required + email format), inline errors, disabled submit state, success panel. Currently local-only (see below).
- **FAQ** — native `<details>` accordion, one panel open at a time.
- **SEO basics** — unique titles/descriptions, Open Graph tags, semantic headings, no render-blocking JS (`defer`).

## Wiring the form for production

`assets/js/main.js` → the `[data-assessment-form]` handler builds a `data` object and logs it. Replace this block:

```js
// fetch("/api/assessment", { method: "POST", body: JSON.stringify(data) })
console.info("Assessment request (demo, not sent):", data);
```

with a POST to your CRM / form endpoint (HubSpot, Formspree, a Worker, etc.). Alternative: swap the form for the Calendly inline embed — the direct booking link `https://calendly.com/yusuf-subasi-flowza/leak-assessment` is already used throughout.

## Content notes

- Copy, statistics and guarantees come from the live flowza.io site: the $200,000 / 120-day profit improvement guarantee, 4 → 1 FTE on ~20,000 invoices/month, and the three modelled engagements (kitchen remodeler, medical billing firm, freight brokerage) — all labelled as modelled, not testimonials.
- Founder details (Yusuf Subasi, 15 years, C.H. Robinson / Fiserv / Cargill) are as published.
- No contact email or phone number is published on flowza.io, so none is invented here: the booking form and Calendly link are the only conversion paths.
- The only stock-free visuals are CSS/SVG — no external images, so there are no licensing questions and no layout shift.

## Fonts

`Inter Tight` (UI/display) and `Instrument Serif` (italic accents) load from Google Fonts, with system fallbacks declared in the font stacks. To self-host, drop the woff2 files into `assets/fonts/` and replace the `<link>` tags with `@font-face` rules.
