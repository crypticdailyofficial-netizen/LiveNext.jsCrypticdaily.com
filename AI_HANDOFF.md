# AI Handoff: Cryptic Daily

Last updated: 2026-07-04

This is the current working handoff for Cryptic Daily. It is written for another developer or AI agent taking over the repo. It covers the app architecture, Sanity CMS setup, operational risks, recent AdSense cleanup work, and the exact Sanity/MCP situation.

## Project Summary

Cryptic Daily is a crypto news publication built with Next.js App Router and Sanity CMS. It publishes crypto market news, DeFi coverage, regulation stories, builder/infrastructure stories, and Web3 fraud/exploit reporting.

The site is content-heavy and SEO-sensitive. Most pages are CMS-backed, statically generated or ISR-cached, and deployed through Vercel.

Core user-facing areas:

- Homepage: featured story, latest stories, categories, ticker, latest feed.
- News index: latest articles from Sanity.
- Article detail pages: `/news/[slug]`.
- Category pages: `/categories/[category]`.
- Author pages: `/author/[slug]`.
- Search page: `/search`.
- Static legal/trust pages: About, Contact, Advertise, Editorial Policy, Privacy Policy, Terms, Disclaimer.
- Sanity Studio: embedded at `/studio`.
- RSS feed: `/feed`.
- Dynamic sitemap: `/sitemap.xml`.

## Tech Stack

- Framework: Next.js `16.1.6`.
- React: `19.2.3`.
- Styling: Tailwind CSS v4 with heavily custom page designs.
- CMS: Sanity, `next-sanity`, `@sanity/client`, `@sanity/image-url`.
- Rich text rendering: Portable Text via `@portabletext/react`.
- Dates: `date-fns`.
- Newsletter storage: Supabase server client, but current local env is missing Supabase keys.
- Ads/analytics: Google AdSense and GA IDs are present in env.
- Deployment target: Vercel.

Main scripts in `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Important warning: `npm run lint` currently fails because the repo has ESLint 9 installed but no `eslint.config.*` flat config. TypeScript checks and production build have been used for verification instead:

```bash
npx tsc --noEmit --pretty false
npm run build
```

## Repository Map

Important directories and files:

- `app/`: Next.js App Router routes, API routes, sitemap, robots, feed, layout.
- `components/`: UI components for articles, homepage, layout, ads, SEO helpers.
- `lib/`: Sanity clients, GROQ queries, adapters, utilities, constants, Supabase helper.
- `sanity/`: Sanity Studio config and schemas.
- `sanitymjs/`: one-off CMS maintenance/upload scripts. These mutate Sanity when run with a token.
- `public/`: static images.
- `types/`: shared TypeScript types.

Key frontend routes:

- `app/page.tsx`: homepage server data fetch.
- `components/home/HomePageClient.tsx`: homepage client composition.
- `components/home/Hero.jsx`: homepage hero article card.
- `components/home/LatestNewsSection.tsx`: homepage latest news area.
- `app/(main)/news/[slug]/page.tsx`: article detail route.
- `app/(main)/news/page.tsx`: news listing.
- `app/(main)/categories/[category]/page.tsx`: category archive.
- `app/(main)/author/[slug]/page.tsx`: author profile pages.
- `app/(main)/author/market-analyst/route.ts`: hard `410 Gone` route for removed low-value author URL.
- `app/(main)/search/page.tsx` and `app/(main)/search/SearchClient.tsx`: search page.
- `app/api/search/route.ts`: search API.
- `app/api/revalidate/route.ts`: Sanity webhook revalidation endpoint.
- `app/feed/route.ts`: RSS feed.
- `app/sitemap.ts`: dynamic sitemap.
- `app/robots.ts`: robots.txt config.
- `app/(admin)/studio/[[...tool]]/page.tsx`: embedded Sanity Studio.

## Sanity CMS Integration

### Current Sanity Access Pattern

This project does not currently use a configured Sanity MCP server in the repo or in the current Codex workspace.

Sanity is accessed through:

- `next-sanity` for app-side reads.
- `@sanity/client` in maintenance scripts.
- direct HTTP mutation calls in some `sanitymjs/*.mjs` scripts.
- embedded Sanity Studio through `next-sanity/studio`.
- Sanity webhook parsing through `next-sanity/webhook`.

### MCP Server Status

Important for the next AI/developer:

- No Sanity MCP server config file exists in this repository.
- No Sanity MCP tool was used for the fixes in this thread.
- All Sanity checks/mutations were done with Sanity API clients and `.env.local` values.
- If you want to use a Sanity MCP server later, configure it separately in your AI client and give it project ID, dataset, and a read/write token. Do not commit token values.

Suggested description for a colleague:

```text
Sanity MCP is not part of this repo. Use the app's existing Sanity SDK clients unless your local AI tool has a separately configured Sanity MCP server. Required access is equivalent to GROQ read plus mutations for author/article cleanup.
```

### Sanity Project Env Vars

Required for the app to show content:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_TOKEN
SANITY_WEBHOOK_SECRET
```

Observed local env status on 2026-07-04:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`: set
- `NEXT_PUBLIC_SANITY_DATASET`: set
- `SANITY_API_TOKEN`: set
- `SANITY_WEBHOOK_SECRET`: set
- Supabase public/service keys: missing locally
- AdSense and GA public IDs: set locally

Never paste or commit actual env values.

### Core Sanity Files

- `lib/sanity/client.ts`: shared app Sanity client.
- `lib/sanity/queries.ts`: GROQ query hub.
- `lib/sanity/adapters.ts`: maps raw Sanity records into frontend `Article`, author, and category shapes.
- `lib/sanity/image.ts`: Sanity image URL builder.
- `sanity/sanity.config.ts`: embedded Studio config.
- `sanity/sanity.cli.ts`: Sanity CLI config.
- `sanity/schemas/article.ts`: article schema.
- `sanity/schemas/author.ts`: author schema.
- `sanity/schemas/category.ts`: category schema.
- `sanity/schemas/tag.ts`: tag schema.

### Sanity Client Behavior

`lib/sanity/client.ts` reads:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN`

If project ID or dataset are missing, it uses a fake fallback client that returns empty/null data instead of crashing. This prevents builds from failing, but it can produce empty pages. If the site suddenly looks empty, check env vars before debugging React.

Preview/draft behavior:

- In non-production with `SANITY_API_TOKEN`, the client uses `perspective: "drafts"`.
- In production it uses `perspective: "published"`.
- `useCdn` is disabled for local preview/draft reads and enabled for production published reads.

### Sanity Studio

Studio is embedded at:

```text
/studio
```

Config:

- `sanity/sanity.config.ts`
- Studio title: `Cryptic Daily`
- Studio host in CLI config: `cryptic-daily`
- Plugins:
  - `structureTool`
  - `visionTool` for GROQ query testing

Studio navigation currently groups:

- All Articles
- Featured Article
- noIndex Articles
- Authors
- Categories
- Tags

## Sanity Content Model

### Article

Schema: `sanity/schemas/article.ts`

Important fields:

- `title`: required string, max 100.
- `slug`: required slug, max 96.
- `author`: required reference to author.
- `coverImage`: required image with required `alt`.
- `category`: required reference.
- `tags`: optional array of tag references.
- `excerpt`: required text, max 200.
- `body`: required Portable Text array.
- `publishedAt`: required datetime.
- `sources`: optional source label/url array.
- `updatedAt`: optional freshness datetime.
- `seoTitle`: optional max 60.
- `seoDescription`: optional max 160.
- `canonicalUrl`: optional.
- `noIndex`: boolean for hidden content.
- `featured`: boolean for homepage feature.
- `sponsored`: boolean for sponsorship disclosure.

Frontend article routes use `slug.current` as `/news/[slug]`.

### Author

Schema: `sanity/schemas/author.ts`

Important fields:

- `name`: required.
- `slug`: required.
- `avatar`: image.
- `role`: title/position.
- `credentials`: public E-E-A-T credibility text.
- `bio`: detailed author bio.
- `twitter`, `linkedin`, `sameAs`: identity links.

Current real authors in Sanity:

- Berat Oshily: `berat-oshily`
- Marcus Bishop: `marcus-bishop`
- Zashleen Singh: `zashleen-singh`

Important: the old generic `Market Analyst` author has been removed from Sanity and source upload scripts.

### Category

Schema: `sanity/schemas/category.ts`

Current public categories:

- `crypto-newswire`
- `web3-builder`
- `web3-fraud-files`

### Tag

Schema: `sanity/schemas/tag.ts`

Tags still exist in Sanity and article data, but there are no public tag archive pages in the app.

## Data Flow

### Homepage

File: `app/page.tsx`

Fetches in parallel:

- `getHomepageFeaturedArticle()`
- `getHomepageLatestArticles(12)`
- `getAllCategories()`
- `getTotalArticleCount()`

Then maps with:

- `mapSanityArticle`
- `mapSanityArticles`
- `mapSanityCategories`
- `dedupeArticles`

Homepage latest card reading time depends on `homepageArticleCardFields` including:

```groq
"bodyText": pt::text(body)
```

Do not remove that field. It was added to fix homepage cards showing `1 min read` while article pages showed `6-8 min read`.

### Article Detail Pages

File: `app/(main)/news/[slug]/page.tsx`

Behavior:

- `generateStaticParams()` loads all article slugs.
- `generateMetadata()` loads the article for SEO metadata.
- Page fetches article by slug.
- If no article, calls `notFound()`.
- Renders Portable Text.
- Injects Article JSON-LD and Breadcrumb JSON-LD.
- Fetches related articles and sidebar latest articles.

Important issue still known from production:

- Missing article slugs can render the 404 UI with HTTP 200 in production. This created soft-404 problems for old ghost article URLs.
- A broader fix should add hard `404`/`410` handling for known removed article URLs or improve route behavior so missing CMS content does not return a soft 404.

### News Listing

File: `app/(main)/news/page.tsx`

Fetches:

- `getAllArticles(0, 24)`
- `getLatestArticles(5)`

Maps through `mapSanityArticles`.

### Category Pages

File: `app/(main)/categories/[category]/page.tsx`

Fetches categories, category info, articles by category, and latest/sidebar content. Category pages are ISR cached with `revalidate = 120`.

### Author Pages

File: `app/(main)/author/[slug]/page.tsx`

Fetches:

- `AUTHOR_BY_SLUG_QUERY`
- `ARTICLES_BY_AUTHOR_QUERY`

The removed low-value author route is handled separately:

- `app/(main)/author/market-analyst/route.ts`
- returns `410 Gone`
- includes `X-Robots-Tag: noindex, nofollow`

This was added because `/author/market-analyst` was a low-value/empty author page concern.

### Search

Files:

- `app/(main)/search/page.tsx`
- `app/(main)/search/SearchClient.tsx`
- `app/api/search/route.ts`

Search flow:

1. Client reads query from URL.
2. Client requests `/api/search?q=...`.
3. API calls `searchArticles(search)`.
4. API maps results with `mapSanityArticles`.

Search metadata is `noindex`.

### RSS Feed

File: `app/feed/route.ts`

It creates its own Sanity client and returns RSS XML. It is resilient to missing Sanity env vars and returns an empty feed rather than crashing.

### Sitemap

File: `app/sitemap.ts`

Generates:

- static routes
- article routes from Sanity slugs
- category routes only if category has at least 3 articles
- author routes from Sanity authors

Uses `sanityClient.withConfig({ useCdn: false })`.

### Robots

File: `app/robots.ts`

Currently:

- Allows `/`
- Disallows `/studio/`
- Disallows `/api/`
- Points to sitemap.

## Revalidation

File: `app/api/revalidate/route.ts`

This route expects a signed Sanity webhook. It uses:

```ts
parseBody(req, process.env.SANITY_WEBHOOK_SECRET)
```

On valid webhook body:

- Revalidates `/news/${slug}` if a slug is present.
- Revalidates `/articles/${slug}` even though public article URLs are now `/news/[slug]`.
- Revalidates `/`, `/news`, `/articles`.

Notes:

- `/articles` appears to be legacy and may be removable later.
- If Sanity updates do not appear, verify `SANITY_WEBHOOK_SECRET` and webhook signature setup in Sanity.

## Recent Fixes Completed

These fixes were done before this handoff and should not be undone.

### About Page Counters

Files:

- `app/(main)/about/page.tsx`
- `app/(main)/about/AboutContent.tsx`

Problem:

- About page showed `0+ articles published` and `0 content categories` when Sanity fetches returned empty.

Fix:

- `AboutContent.tsx` already rendered props correctly.
- `about/page.tsx` now falls back to:
  - articles: `48`
  - categories: `3`

### Relative Date Display

File:

- `lib/utils.ts`

Problem:

- Articles from May 17-18 2026 showed as `about 5 hours ago` even when current date was June 7 2026.

Fix:

- `formatRelativeDate()` now explicitly creates `const now = new Date()` and uses `isSameDay(date, now)` and `formatDistance(date, now)`.
- Older dates render as `MMM d, yyyy`.

### Reading Time Consistency

Files:

- `lib/sanity/queries.ts`
- `lib/sanity/adapters.ts`

Problem:

- Homepage cards showed `1 min read` because homepage GROQ projections only included excerpts.
- Article pages showed 6-8 minute reads because they had full body text.

Fix:

- `homepageArticleCardFields` now includes `"bodyText": pt::text(body)`.
- `mapSanityArticle()` calculates reading time from excerpt + body text.

### Market Analyst Author Cleanup

Files:

- `app/(main)/author/market-analyst/route.ts`
- `sanitymjs/upload-article.mjs`
- `sanitymjs/upload-clarity-act.mjs`
- `sanitymjs/upload-all-articles.mjs`

Problem:

- Generic `Market Analyst` author page was empty/low-value.
- Some upload scripts could recreate `author-market-analyst`.

Fix:

- Confirmed Sanity had no `Market Analyst` author and no live article references.
- Removed `author-market-analyst` creation from upload scripts.
- Reassigned script article references to Marcus Bishop (`author-alex-carter`).
- Added `/author/market-analyst` route returning `410 Gone` and `X-Robots-Tag: noindex, nofollow`.

### Contact Page Jurisdiction Signal

File:

- `app/(main)/contact/ContactContent.tsx`

Added visible line:

```text
Editorial team based in the European Union
```

This was added as a legal/entity trust signal for Google review.

### Advertise Page Policy Cleanup

File:

- `app/(main)/advertise/AdvertiseContent.tsx`

Problem:

- Phrase `Indexed and SEO-friendly` looked like selling link equity.

Fix:

- Replaced with:

```text
Clearly labeled sponsored content
```

## Known SEO / AdSense Issues

### Ghost Article URLs

Google had indexed 11 article URLs that do not exist in Sanity:

- `circle-arc-chain-quantum-features`
- `resolv-infinite-mint-stablecoin-security-failure`
- `sec-reg-crypto-fundraising-atkins`
- `bitgo-mint-stablecoin-minting-redemption-institutions`
- `bitcoin-etf-outflows-rattle-crypto-as-iran-war-fears-take-hold`
- `sky-agent-network-capital-allocators`
- `drift-protocol-north-korea-linked-hackers`
- `delaware-stablecoin-framework-sb19`
- `senate-clarity-act-crypto-bill`
- `toncoin-telegram-integration-usdt-adoption`
- `maryland-man-charged-uranium-finance-hacks`

Sanity check result:

- no published docs
- no draft docs
- not in sitemap

Production behavior observed earlier:

- live URLs returned HTTP 200 with 404 shell content
- no article markup
- no `X-Robots-Tag`

This is a soft-404 risk and likely affected AdSense quality review. The best next fix is to return hard `410 Gone` or real `404` for those known ghost article URLs.

Suggested implementation:

- Add static route handlers for these specific slugs returning `410`, or
- Add middleware/proxy routing for a denylist of removed news slugs, or
- Fix global `notFound()` behavior if the soft-404 is caused by static export/cache behavior.

### Author Soft-404 Pattern

`/author/market-analyst` has been fixed locally with a `410` route. Confirm after deploy:

```bash
curl -I https://www.crypticdaily.com/author/market-analyst
```

Expected:

```text
HTTP/2 410
x-robots-tag: noindex, nofollow
```

## Maintenance Scripts

Most scripts live under `sanitymjs/`. Treat them as powerful, one-off CMS mutation scripts. Read before running.

Common env vars for scripts:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_TOKEN
SANITY_PROJECT_ID       # some scripts support this alternative
SANITY_DATASET          # some scripts support this alternative
SANITY_TOKEN            # some scripts support this alternative
SANITY_API_VERSION      # defaults to 2024-01-01 in many scripts
DRY_RUN=1               # supported by some scripts
```

Important scripts:

- `sanitymjs/upload-all-articles.mjs`: bulk Crypto Newswire upload.
- `sanitymjs/upload-web3-builder-articles.mjs`: bulk Web3 Builder upload.
- `sanitymjs/upload-web3-fraud-files.mjs`: bulk Web3 Fraud Files upload.
- `sanitymjs/single-article.mjs`: currently modified locally; inspect before using.
- `sanitymjs/upload-article.mjs`: single Resolv article script, now points author to Marcus Bishop.
- `sanitymjs/upload-clarity-act.mjs`: single Franklin/250 Digital script, now points author to Marcus Bishop.
- `sanitymjs/remove-listed-articles-and-tags.mjs`: deletion utility.
- `sanitymjs/delete-all-articles-except-upload-batch.mjs`: dangerous deletion utility.
- `sanitymjs/add-inline-links.mjs`: wraps existing phrases in links.
- `sanitymjs/remove-inline-links.mjs`: removes inline links.
- `sanitymjs/inject-external-links.mjs`: adds external links.
- `sanitymjs/upload-alttext-by-title.mjs`: alt text utility.
- `sanitymjs/set-cryptic-daily-alt-text-and-publish.mjs`: alt/publish utility.
- `sanitymjs/assign-category-authors.mjs`: assigns articles to authors based on category.

Do not run deletion scripts without a Sanity export/backup.

## Build and Verification Checklist

Use this after making changes:

```bash
npx tsc --noEmit --pretty false
npm run build
```

For built local verification:

```bash
PORT=3001 npm run start
curl -I http://localhost:3001/
curl -I http://localhost:3001/author/market-analyst
```

Expected for removed author:

```text
HTTP/1.1 410 Gone
X-Robots-Tag: noindex, nofollow
```

Search for risky SEO phrases:

```bash
rg -n "Indexed and SEO-friendly|SEO-friendly sponsored|author-market-analyst|Market Analyst|market-analyst" app sanity sanitymjs lib components
```

Expected:

- No `Indexed and SEO-friendly`.
- No `Market Analyst` references, except if intentionally checking old docs.
- The only `market-analyst` code path should be the hard `410` route if present.

## Current Git/Worktree Notes

There may be uncommitted local changes from recent fixes. Before taking over, run:

```bash
git status --short
git diff --stat
```

Recent intentionally changed files include:

- `AI_HANDOFF.md`
- `app/(main)/about/page.tsx`
- `app/(main)/advertise/AdvertiseContent.tsx`
- `app/(main)/contact/ContactContent.tsx`
- `app/(main)/author/market-analyst/route.ts`
- `lib/sanity/queries.ts`
- `lib/utils.ts`
- `sanitymjs/upload-all-articles.mjs`
- `sanitymjs/upload-article.mjs`
- `sanitymjs/upload-clarity-act.mjs`

Also note:

- `sanitymjs/single-article.mjs` was already modified before some of these fixes. Do not overwrite it casually.

## Deployment Notes

Vercel env vars must include Sanity values in Production and Preview if those environments should render content.

Required for content:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_TOKEN
SANITY_WEBHOOK_SECRET
```

Required for correct public URLs:

```bash
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SITE_NAME
```

For ads/analytics:

```bash
NEXT_PUBLIC_ADSENSE_CLIENT
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_GA_MEASUREMENT_ID
```

For newsletter:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Local `.env.local` currently has missing Supabase keys, so newsletter routes may not work locally.

## Practical Next Steps for a New Developer

1. Run `git status --short` and identify existing uncommitted work.
2. Run `npx tsc --noEmit --pretty false`.
3. Run `npm run build`.
4. Deploy the current fixes if not already deployed.
5. After deploy, verify:
   - `/author/market-analyst` returns `410`.
   - Contact page includes EU editorial line.
   - Advertise page no longer contains SEO/link-juice language.
   - Homepage article dates show calendar dates for older May 2026 posts.
   - Homepage reading times match article pages.
6. Add hard `410` handling for the 11 ghost article URLs before reapplying for AdSense.
7. In Search Console, request recrawl/removal for removed ghost URLs after production returns `410` or real `404`.

## High-Risk Areas

- Sanity deletion scripts in `sanitymjs/`.
- Soft-404 behavior for missing CMS pages.
- Any generic or empty author profile.
- Sponsored content wording that implies paid SEO/link equity.
- Missing env vars causing empty rendered pages through fallback Sanity client.
- ESLint setup mismatch: do not assume `npm run lint` works until ESLint 9 flat config is added.

## Short Summary

Cryptic Daily is a Sanity-backed Next.js news site. Sanity is integrated through SDK/API clients, not through a repo-configured MCP server. The most important recent work was AdSense quality cleanup: fixing empty author pages, safer sponsored-content language, EU editorial signal on Contact, date display, reading time consistency, and About page counters. The biggest remaining SEO task is hard-removing the 11 indexed ghost article URLs so Google receives `410` or a true `404`, not a 200 shell.
