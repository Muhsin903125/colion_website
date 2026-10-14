# Colion International — website

The website of Colion International Trading LLC, an IT hardware stockist, wholesaler and exporter in Deira, Dubai.

The stack is the same as the LOPAZ site:

- **Astro 4**, server-rendered and cached at Vercel's edge with ISR.
- **Tailwind 3**, with **GSAP, ScrollTrigger and Lenis** for motion.
- A **custom CMS** at `/admin`. All content is one JSON document stored in **Cloudinary**.
- **Publish** clears the edge cache for the changed pages, so edits are live in seconds without a rebuild.

## Run it

```bash
npm install
cp .env.example .env      # then fill it in (see below)
npm run dev               # http://localhost:4321
```

The site works without any credentials. When Cloudinary isn't configured or can't be reached, it renders from the committed seed (`src/data/content.seed.json`).

| Command | What it does |
|---|---|
| `npm run build` | Production build. `postbuild` checks that `/admin`, `/preview` and `/api/*` are never cached. |
| `npm run check` | Type check. |
| `npm run seed` | Rebuild `src/data/content.seed.json` from `scripts/seed/*.mjs`. |
| `npm run seed:validate` | Check schema and references, and list which pages the quality gate keeps out of the index. |
| `npm run seed:push -- --apply` | Overwrite the live CMS document with the seed. Destructive: it replaces any admin edits. |
| `npm run audit:content` | Check for near-duplicate copy, duplicate or over-long titles, and missing alt text. |
| `npm run audit:links [url]` | Crawl the sitemap and every internal link and asset. |
| `npm run video:compress` | Re-encode the background clips into `public/videos/`. |
| `npm run media:optimize` | Rebuild `public/images/` from `source-media/`. |
| `node scripts/import-client-media.mjs` | Import the owner's photos and reels from `source-media/client/`. |
| `npm run media:upload -- --apply` | Move the launch gallery into Cloudinary and update the seed to point there. |
| `npm run indexnow` | Submit the live sitemap to IndexNow (Bing, Copilot, ChatGPT search). Run after a deploy. |

## Environment

See `.env.example`. Set the same variables in Vercel under Project → Settings → Environment Variables.

| Variable | Notes |
|---|---|
| `CMS_ADMIN_PASSWORD` | The `/admin` password. |
| `CMS_SESSION_SECRET` | A long random string used to sign the session cookie. |
| `CMS_REVALIDATE_TOKEN` | A random string that Publish uses to clear the cache. Read at build time, so redeploy after changing it. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Storage for both the media library and the CMS document. |
| `CLOUDINARY_FOLDER` | Set to `colion`. |
| `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_BING_SITE_VERIFICATION` | Search console verification tags. |

## Editing the site (`/admin`)

**Saving and publishing**
- **Save** stores a draft. The live site doesn't change.
- **Publish** puts the saved draft live within seconds.

**Gallery**
1. Drag photos and videos straight from your phone or PC into the drop zone.
2. Add a caption and tags to each one.
3. Press **Save & publish gallery**.

Vertical videos become reels automatically. New items appear on `/gallery/`, the home page, and any product, brand or service page they're linked to.

**Pages**
- Every page is built from sections you can reorder, hide or edit.
- Any section can have a **background photo or video**.

**Services, Products, Brands and Emirates**
- Each item is a page of its own.
- A badge on each item shows whether it is **indexed** by search engines and, if not, what's missing:
  - an intro of 120+ words
  - a 40–60 word answer
  - 3+ FAQs

**Team & reviews**
- Add people with their photo and social links.
- Add real Google reviews.

## SEO, AEO and GEO

**Structured data**
- Every page has a JSON-LD `@graph` built in `src/data/seo.ts`.
- On every page: Organization, a ComputerStore node for each branch, and WebSite.
- Per page, as relevant: WebPage with speakable markup, BreadcrumbList, FAQPage, Service, HowTo, OfferCatalog, Brand, Person, and ImageGallery with ImageObject and VideoObject.

**Programmatic pages**
- There are 6 services, 8 categories, 50 brands and 7 emirates.
- The quality gate (`src/data/quality.ts`) marks thin pages `noindex, follow` and leaves them out of the sitemap and `llms.txt`.

**Search and AI files**
- `/sitemap.xml` includes image and video entries, and a per-item `lastmod`.
- `/llms.txt` is generated from the same content as the pages.
- `/robots.txt` allows AI crawlers and blocks `/admin`, `/preview` and `/api/`.

**On-page structure for snippets and answer engines**
- Every page opens with a 40–60 word answer marked `data-answer`.
- Pages use question-style headings, `<ol>` buying guides and real `<table>` comparisons.

## Before launch: from the client

These are needed. None of them have been invented.

1. **Cloudinary API secret.** Saving in the admin fails with "api_secret mismatch". Copy the secret from Cloudinary → Settings → API Keys and paste it into `.env` and Vercel.
2. **Trade licence number, TRN and founding year.** Add them under Admin → SEO and Admin → Site.
3. **Exact Google Business Profile details.**
   - Branch 1 is linked (CID 7714097723583174697).
   - Branch 2 and the corporate office need their own profile URLs and pins.
4. **Founder's social profiles.** Add them under Admin → Team & reviews → Social links.
5. **Real Google reviews.** Add them under Admin → Team & reviews.
6. **Brand partner certificates**, if any. Only then set a brand's relationship to "authorized partner".
7. **Rights to the product photos** carried over from the old site (see `CREDITS.md`).

## Deploy and go-live

1. Import the repo into Vercel.
   - During review, set the production branch to `production` and preview `redesign/astro`.
   - Add the environment variables.
2. Add the domains:
   - `www.colioninternational.com` as primary.
   - `colioninternational.com` redirecting to www.
3. At the DNS registrar, change only two records:
   - `A @ 76.76.21.21`
   - `CNAME www cname.vercel-dns.com`

   Leave MX, SPF and DKIM untouched so email keeps working.
4. Merge `redesign/astro` → `main` → `production`.
5. Submit `https://www.colioninternational.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools, then run `npm run indexnow`.

`vercel.json` redirects the old URLs (`/index.html`, `/service-details.html` and others) with 308s. Old `/#products`-style links are forwarded by script.
