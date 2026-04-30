# Sanity CMS Architecture & Article Management System - Detailed Handoff

## Overview

Cryptic Daily uses **Sanity.io** as its headless CMS to manage all article content, authors, categories, and tags. Sanity provides a modern, flexible content infrastructure that integrates seamlessly with the Next.js frontend through a Content Delivery Network (CDN) and API-based querying via GROQ (Graph-Relational Object Queries).

The system is designed for a high-performance crypto news publication with emphasis on SEO optimization, author credibility (E-E-A-T signals), and content freshness for search engines.

---

## Project Configuration

### Sanity Studio Access & Setup

**Studio Host:** `cryptic-daily.sanity.studio` (hosted on Sanity's managed infrastructure)

**Environment Variables Required:**
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — The Sanity project ID (public)
- `NEXT_PUBLIC_SANITY_DATASET` — The dataset name, typically "production" (public)
- `SANITY_API_TOKEN` — API token for server-side mutations and preview mode (private, server-only)

**API Version:** `2024-01-01` — Ensures compatibility with latest Sanity features and stability

**CDN Strategy:**
- **Preview Mode** (with token): Uses Sanity's real-time draft API for editors to see unpublished changes immediately (`perspective: "drafts"`)
- **Production** (no token): Uses CDN-cached published documents for fast delivery to end users (`perspective: "published"`)

**CLI Configuration:** Managed through `sanity.cli.ts` which defines the project ID and dataset for CLI commands (deploy, sync, migrations, etc.)

---

## Core Document Types & Content Architecture

### 1. Article (Primary Document Type)

The `article` schema is the central document type for all published content. Articles are grouped into three logical sections within the Sanity Studio interface for better editorial workflow:

#### **Content Group (📝 Content)**

Contains the core narrative and metadata of an article.

**Title Field:**
- Type: String
- Validation: Required, max 100 characters
- Purpose: Main headline visible on all article cards, listing pages, and browser tabs
- Note: Should be compelling and descriptive for both user engagement and SEO

**Slug Field:**
- Type: URL slug (auto-generated from title, manually editable)
- Validation: Required, max 96 characters
- Purpose: Creates the article's URL path (e.g., `/article/bitcoin-etf-approval`)
- Importance: Once published, slug should remain immutable to prevent broken links and SEO equity loss
- Auto-generation: When title is entered, the slug is automatically suggested but can be customized

**Author Field:**
- Type: Reference to `author` document
- Validation: Required
- Purpose: Links article to an author profile which displays author credibility signals
- Impact: Author's bio, credentials, and identity links (Twitter, LinkedIn, etc.) are pulled from the `author` document and displayed alongside the article for Google E-E-A-T signals

**Cover Image:**
- Type: Image with hotspot
- Includes Alt Text field (required)
- Purpose: Primary visual representation on article cards, social media sharing, and article detail page
- Technical Detail: Hotspot tool allows editors to define the focal point for intelligent cropping across different device sizes
- SEO: Alt text is critical for image search visibility and accessibility compliance
- Image Processing: Images are automatically optimized through Sanity's CDN with LQIP (Low Quality Image Placeholder) metadata for progressive loading

**Category:**
- Type: Reference to `category` document
- Validation: Required
- Purpose: Single-category classification used for:
  - Article listing page filtering
  - Related articles (same category)
  - Navigation sidebar organization
  - SEO category pages with structured data
- Design Note: Each article belongs to exactly one category (not multi-category) to simplify taxonomy

**Tags:**
- Type: Array of references to `tag` documents
- Optional field
- Purpose: Secondary classification for granular topic clustering
- Use Case: Helps readers discover related content across categories (e.g., "DeFi", "Staking", "Security" tags across multiple categories)
- Note: Unlike categories, articles can have multiple tags

**Excerpt:**
- Type: Text (multi-line)
- Validation: Required, max 200 characters
- Purpose: Brief summary displayed on:
  - Article cards on homepage and listing pages
  - Meta description in search results (if `seoDescription` is not defined)
  - Social media preview text
- Strategy: Should be a compelling summary that entices click-through from search results

**Body (Rich Content):**
- Type: Array of blocks (Portable Text)
- Validation: Required
- Purpose: Main article content with rich formatting capabilities

**Supported Text Styles:**
- Normal paragraph text
- H2, H3, H4 headings (for semantic HTML hierarchy)
- Block quotes (for emphasis or cited text)

**Text Formatting:**
- **Bold** (strong emphasis)
- *Italic* (emphasis)
- `Inline code` (for technical terms, ticker symbols)

**Inline Media & Links:**
- **Images**: Can embed directly in body with:
  - Required alt text (for accessibility and SEO)
  - Optional caption (displayed below image)
  - Hotspot support for responsive focal points
- **Links**: With three configurable attributes:
  - URL destination (supports relative paths, HTTP/HTTPS, and mailto links)
  - "Open in new tab" toggle (default: true)
  - "Add nofollow" toggle (default: false, but essential for affiliate/sponsored links)

**Rich Text Validation:** All body text is validated to ensure markdown conversion and rendering compatibility with the frontend. The `pt::text()` function in GROQ queries can extract plain text from Portable Text for search indexing.

**Published At:**
- Type: DateTime with timezone
- Validation: Required
- Default: Current time when article is created
- Purpose: Determines article visibility and sort order on the site
- Note: Set to a future date to schedule publication (articles won't appear until that timestamp)

**Sources & References (Optional):**
- Type: Array of objects
- Each source has: `label` (source name) and `url` (direct link)
- Purpose: Citations and source attribution for journalism transparency
- Examples: CoinGecko, Reuters, Official Blog, Whitepaper
- Use: Appears in article metadata; helps establish credibility and provides readers with verification paths

**Last Updated (updatedAt):**
- Type: DateTime (optional)
- Purpose: Signals content freshness to Google Search
- Importance: Critical for crypto news where market conditions change rapidly
- SEO Impact: Google treats recent updates as a positive freshness signal, especially important for competitive keywords
- Protocol: Should be updated whenever the article content is materially edited (not for minor typos, but for factual updates or new analysis)

#### **SEO Group (🔍 SEO)**

Dedicated fields for search engine optimization and meta data customization.

**SEO Title:**
- Type: String (max 60 characters)
- Optional field
- Purpose: Custom title tag for search results (overrides the main `title` field)
- Strategy: Can be different from headline; often includes target keyword and includes compelling CTAs
- Example:
  - Headline: "Bitcoin's Latest Price Movement"
  - SEO Title: "Bitcoin Price Today [Live Updates 2026]"
- Note: Search engines show 50-60 characters on desktop, 35-40 on mobile

**SEO Description:**
- Type: Text (max 160 characters)
- Optional field
- Purpose: Custom meta description tag (overrides `excerpt` if defined)
- Strategy: Should include primary keyword and compelling reason to click
- Character Limit: Google typically displays 120 characters on desktop, 80 on mobile
- Impact: High CTR from SERPs correlates with better ranking signals to Google

**Canonical URL:**
- Type: URL field
- Optional field
- Purpose: Signals to search engines when this article is republished content
- Use Case: If an article was originally published on another site (e.g., guest post from a news partner), specifying the canonical URL tells Google to attribute the content to the original source
- Prevents: Duplicate content penalties that would hurt ranking
- Protocol: Only use if the article genuinely originated elsewhere; don't use to cross-link internal content

**No-Index Flag (Hide from Search Engines):**
- Type: Boolean (default: false)
- Purpose: Adds `<meta name="robots" content="noindex">` to prevent Google indexing
- Use Cases:
  - Thin or low-quality content being held for improvement
  - Draft articles accidentally published
  - Duplicate or test content
  - Outdated news that would compete with better articles
  - Sensitivity: Critical for avoiding search visibility on unwanted pages

#### **Settings Group (⚙️ Settings)**

Publication settings and content warnings.

**Featured Article:**
- Type: Boolean (default: false)
- Purpose: Marks article for homepage hero display
- Constraint: Only one article should be featured at a time (editorial decision)
- Visual: Tagged with ⭐ in Sanity Studio list view
- Display: Shows in highest-prominence slot on homepage

**Sponsored / Affiliate Content:**
- Type: Boolean (default: false)
- Purpose: Flags content requiring AdSense and FTC compliance disclosure
- Function: Automatically adds:
  - "Sponsored" badge/label on article
  - nofollow attribute to all outbound links in body
  - Structured data disclosure in JSON-LD
- Importance: Legal requirement under FTC guidelines and Google AdSense policies
- Note: Editors must remember to set this flag; it's not auto-detected

**Content Warning:**
- Type: String (optional)
- Purpose: Displays a disclaimer banner at top of article
- Examples:
  - "Past performance is not indicative of future results"
  - "This article discusses high-risk financial instruments"
  - "Not financial advice — consult a professional"
- Use: Critical for financial content requiring regulatory disclaimers
- Placement: Rendered prominently before article body begins

---

### 2. Author (Supporting Document Type)

Authors are distinct documents linked to articles via reference, enabling reuse across multiple articles and centralized profile management.

**Name:**
- Type: String
- Validation: Required
- Purpose: Display name shown on articles
- Note: Can be a pseudonym or real name

**Slug:**
- Type: URL slug (auto-generated from name)
- Validation: Required
- Purpose: Creates author archive page URL (e.g., `/author/john-doe`)
- Enables: Author page listing all their articles

**Avatar:**
- Type: Image with hotspot
- Optional field
- Purpose: Author photo displayed next to byline
- Importance: Google's E-E-A-T algorithm values real, recognizable author identity
- Recommendation: Use real photographs over generic avatars or icons
- Usage: Appears in article meta, author pages, and possibly search results with rich snippets

**Role:**
- Type: String (optional)
- Examples: "Senior Crypto Analyst", "Market Researcher", "Blockchain Developer"
- Purpose: Professional title shown with author name
- SEO Value: Helps establish expertise context for readers and search engines

**Credentials:**
- Type: String (optional)
- Examples: "CFA | 10 years in crypto markets", "Ethereum contributor | DeFi specialist"
- Purpose: Professional qualifications displayed under author name
- E-E-A-T Signal: Critical for Google's Expertise, Authoritativeness, Trustworthiness ranking factors
- Note: This is publicly displayed; only include credentials the author is comfortable sharing

**Bio:**
- Type: Text (multi-line)
- Optional but recommended
- Purpose: Detailed professional background
- Content: Should mention:
  - Years of experience in crypto/relevant field
  - Notable past employers or publications
  - Specific expertise areas
  - Educational background if relevant
- Impact: Displayed on author pages and in article sidebars; helps with E-E-A-T signals

**Social Links:**
- **Twitter/X URL:** Direct link to author's X profile
- **LinkedIn URL:** Direct link to author's LinkedIn profile
- **Identity Links Array:** Additional public profiles proving author identity

**Purpose of Social Links:**
- Verification: Helps readers verify author legitimacy
- JSON-LD Schema: Included in Person schema markup sent to Google
- E-E-A-T Signals: Demonstrates author has established public presence and identity
- Cross-Promotion: Enables direct audience reach to author's own social channels

---

### 3. Category (Supporting Document Type)

Categories are the primary content taxonomy. Each article belongs to exactly one category.

**Title:**
- Type: String
- Validation: Required
- Examples: "DeFi", "NFTs", "Markets", "Regulation", "Web3", "Bitcoin", "Ethereum"
- Purpose: Display name for category

**Slug:**
- Type: URL slug
- Validation: Required
- Purpose: Creates category listing page URL (e.g., `/categories/defi`)

**Description:**
- Type: Text (max 160 characters)
- Optional field
- Purpose: Meta description on category pages for SEO
- Note: Should include category keyword and summary of types of articles found there

**Badge Color (Hex):**
- Type: String (hex color value)
- Optional field
- Purpose: Visual differentiation of categories across the site
- Reference Color Scheme:
  - DeFi: `#7C3AED` (Purple)
  - NFTs: `#EC4899` (Pink)
  - Markets: `#10B981` (Green)
  - Regulation: `#F59E0B` (Amber)
  - Web3: `#00D4FF` (Cyan)
  - Bitcoin: `#F7931A` (Orange)
  - Ethereum: `#627EEA` (Blue)
- Usage: Applied to category badges on article cards and category pages

**SEO Title:**
- Type: String (max 60 characters)
- Optional field
- Purpose: Custom title tag for category listing pages
- If blank: Auto-generates from category title

---

### 4. Tag (Supporting Document Type)

Tags are optional secondary classifiers that cross categories.

**Title:**
- Type: String
- Validation: Required
- Examples: "Staking", "Security", "DeFi Protocol", "Regulatory", "ETF"
- Purpose: Display name for tag

**Slug:**
- Type: URL slug
- Validation: Required
- Purpose: Creates tag listing page URL (e.g., `/tags/staking`)

**Description:**
- Type: Text (optional)
- Purpose: Optional context on tag pages for SEO
- Use: Helps readers understand what types of articles have this tag

---

## Document Structure & Relationships

### Entity Relationship Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│                        ARTICLE                              │
│  (Primary content document)                                 │
├─────────────────────────────────────────────────────────────┤
│ • title, slug, excerpt, body (rich text)                    │
│ • coverImage (with alt text)                                │
│ • publishedAt, updatedAt                                    │
│ • SEO fields: seoTitle, seoDescription, canonicalUrl        │
│ • Settings: featured, sponsored, contentWarning, noIndex    │
└───────┬──────────────────┬────────────────────┬─────────────┘
        │ (references to)   │ (references to)    │ (references to)
        ▼                  ▼                    ▼
    ┌────────────┐   ┌────────────┐   ┌──────────────────┐
    │  AUTHOR    │   │ CATEGORY   │   │   TAG (array)    │
    ├────────────┤   ├────────────┤   ├──────────────────┤
    │ • name     │   │ • title    │   │ • title          │
    │ • slug     │   │ • slug     │   │ • slug           │
    │ • avatar   │   │ • color    │   │ • description    │
    │ • bio      │   │ • desc     │   │                  │
    │ • twitter  │   │            │   │ (zero or many    │
    │ • creds    │   │            │   │ tags per article)│
    └────────────┘   └────────────┘   └──────────────────┘
```

**Relationship Types:**
- **Article → Author:** One-to-One (each article has one author, but author can write many articles)
- **Article → Category:** One-to-One (each article in exactly one category, category has many articles)
- **Article → Tags:** One-to-Many (article can have multiple tags)

---

## Sanity Studio Interface Organization

### Navigation Structure in Sanity Studio

The studio is configured with three main views:

**1. All Articles**
- Lists all articles in the project
- Default sort: Published date (newest first)
- Shows article preview cards with:
  - Title
  - Category and Author
  - Featured (⭐) and noIndex (🚫) status badges
  - Cover image thumbnail
- Filterable and searchable by all fields

**2. Featured Articles**
- Filtered view showing only `featured == true` articles
- Useful for checking which article is currently featured
- Constraint: Only one should be featured at a time (editorial policy)

**3. Hidden/noIndex Articles**
- Shows articles with `noIndex == true`
- Alerts editors to content that won't appear in search results
- Useful for audit and cleanup

**Supporting Collections:**
- **Authors:** Manage author profiles and credentials
- **Categories:** Manage taxonomy and category metadata
- **Tags:** Manage secondary topic tags

---

## Data Flow: Content Creation to Frontend Display

### Publishing Workflow

```
1. EDITOR CREATES ARTICLE IN SANITY STUDIO
   ├─ Fills in all required fields (title, slug, author, category, etc.)
   ├─ Writes content in body using rich text editor
   ├─ Optionally sets featured, sponsored, or noIndex flags
   └─ Saves as draft (not yet visible to public)

2. DRAFT PREVIEW MODE (if token present)
   ├─ Article is written to Sanity's drafts perspective
   ├─ Frontend can access via preview mode using SANITY_API_TOKEN
   ├─ Editors can see unpublished content immediately
   └─ Public still cannot access (published perspective only)

3. PUBLISH ARTICLE
   ├─ Editor clicks publish in Sanity Studio
   ├─ Document moves from drafts → published perspective
   ├─ Sanity CDN invalidates cache for this document
   └─ Within seconds, live on website

4. FRONTEND QUERIES SANITY API
   ├─ Next.js uses GROQ queries (defined in lib/sanity/queries.ts)
   ├─ Client fetches via Sanity API with project ID and dataset
   ├─ Results are cached by Next.js (ISR, SWR, or SSG depending on route)
   └─ Content rendered to user
```

### Query Execution Flow

**Client Configuration:**
```
sanityClient (initialized in lib/sanity/client.ts)
├─ Project ID + Dataset + API Version
├─ Token handling (draft perspective if token exists)
└─ CDN enabled for performance (unless in preview mode)
```

**Query Execution:**
```
import { sanityClient } from "@/lib/sanity/client"

const article = await sanityClient.fetch(articleBySlugQuery, { 
  slug: "bitcoin-etf-approval" 
})
```

**Reusable Field Fragments:**

All queries use composed field fragments to ensure consistency:

- `authorFields`: Fetches author name, slug, role, credentials, bio, twitter, avatar
- `categoryFields`: Fetches category title, slug, color
- `articleCardFields`: Combines all fields needed for article cards (title, excerpt, cover image, category, author, tags, etc.)

This fragment approach ensures:
- DRY principle (don't repeat yourself)
- Consistency across all queries
- Easy updates to what fields are fetched globally

---

## GROQ Queries: Core Data Retrieval Patterns

### Query Categories & Use Cases

**1. Homepage Queries**

**Featured Article:** Fetches single featured article for hero banner
- Returns: Most recent featured article (if multiple marked, takes newest)
- Fields: Full card fields including body for preview

**Latest Articles:** Fetches N most recent articles
- Parameterized by `$limit` variable
- Used for homepage grid, typically 6-12 articles
- Ordered by publishedAt descending

**2. Listing Page Queries**

**All Articles (Paginated):** Full article list with pagination
- Variables: `$start` and `$end` for slice pagination
- Typically paginated to 10-20 articles per page
- Ordered by publishedAt descending

**Articles by Category:** Filters to single category
- Variable: `$category` (slug)
- Ordered by publishedAt descending
- Used on category archive pages

**3. Detail Page Queries**

**Article by Slug:** Fetches full article for reading
- Variable: `$slug` (unique identifier)
- Includes rich body content, sources array, SEO fields
- Used on single article detail pages

**4. Relational Queries**

**Related Articles:** 3 most recent articles in same category, excluding current article
- Variables: `$category`, `$currentSlug`
- Prevents showing the same article twice
- Displayed in sidebar or end-of-article section

**5. Taxonomy Queries**

**All Categories:** Fetches complete category list with article counts
- Includes dynamic article count per category
- Ordered alphabetically
- Used for navigation and category pages

**Category by Slug:** Fetches single category metadata
- Variable: `$slug`
- Returns title, description, color
- Used on category page headers

**Category Article Count:** Returns count of articles in category
- Variable: `$slug`
- Used for dynamic breadcrumbs ("16 articles in DeFi")

**6. Author Queries**

**All Authors:** Complete author list
- Ordered alphabetically by name
- Used for author directory pages

**Author by Slug:** Single author profile
- Includes name, avatar, bio, role, credentials, twitter

**Articles by Author:** All articles written by specific author
- Variable: `$slug`
- Ordered by publishedAt descending
- Used on author profile pages

**7. Search Query**

**Search Articles:** Full-text search across multiple fields
- Variable: `$search` (user search term)
- Searches: title, excerpt, body text, category name, tag names
- Uses GROQ text matching operators (case-insensitive)
- Returns up to 24 results
- Ordered by relevance (publishedAt descending)

**8. Special Queries**

**All Article Slugs:** For static site generation
- Returns all article slugs and publishedAt dates
- Used in `generateStaticParams()` for pre-rendering

**All Category Slugs:** For static site generation
- Returns all category slugs

**Total Article Count:** Returns count of all published articles
- Used for statistics, pagination info

**RSS Feed Query:** Exports recent articles for RSS readers
- Returns last 20 articles with title, slug, excerpt, publishedAt, author, category
- Minimal fields for feed efficiency

---

## Performance & Caching Strategies

### Sanity CDN

**Enabled for:** Production builds (perspective: "published")
- Sanity's global CDN caches published documents
- Cache invalidation: Automatic when document is published/unpublished
- Cache TTL: Default 60 seconds (can be configured)

**Disabled for:** Preview/draft mode (perspective: "drafts")
- Real-time API calls ensure editors see live changes immediately
- No caching layer; every query returns current state

### Next.js Integration

**Caching Layers:**

1. **Incremental Static Regeneration (ISR):**
   - Article detail pages pre-rendered at build time
   - Revalidated on-demand when article is updated
   - Fallback: Stale content served while regenerating in background

2. **Static Site Generation (SSG):**
   - Category pages and author pages generated at build time
   - Uses `generateStaticParams()` with all slugs from Sanity

3. **On-Demand ISR:**
   - Homepage and listing pages use `revalidatePath()` or `revalidateTag()`
   - Triggered by Sanity webhooks on publish/update

4. **SWR (Stale-While-Revalidate):**
   - Search results cached with short TTL
   - Client-side revalidation for freshness

### Webhook Integration

Sanity webhooks can be configured to trigger Next.js revalidation:
```
Event: Article published/unpublished
→ Webhook POST to /api/revalidate?slug=article-slug
→ Next.js revalidates article page and homepage
→ Cache refreshed within seconds
```

---

## Field Validation & Data Integrity

### Required vs Optional Fields

**Always Required:**
- `title` — Can't publish article without headline
- `slug` — URL path must be defined
- `author` — Every article must have attribution
- `coverImage` (with alt text) — Visual required for cards
- `category` — Taxonomy classification required
- `excerpt` — Summary required for cards/SERPs
- `body` — Content must exist
- `publishedAt` — Publication date required

**Recommended (but optional):**
- `updatedAt` — Should be set when content is materially updated
- `sources` — Best practice for journalism
- `seoTitle` / `seoDescription` — Should override defaults for competitive terms
- `tags` — Helpful for discovery but not required
- `contentWarning` — Required only for regulated/sensitive content
- `role`, `credentials` — Author credibility signals

**Feature Flags (optional):**
- `featured` — Default false; only set for homepage hero
- `sponsored` — Default false; only set for paid content
- `noIndex` — Default false; only set to hide from search

### Validation Rules

**String Length Validation:**
- Title: max 100 chars (too long gets truncated in SERPs)
- Slug: max 96 chars (URL length consideration)
- SEO Title: max 60 chars (search result title)
- SEO Description: max 160 chars (search result snippet)
- Excerpt: max 200 chars (card display, meta description)

**URL Validation:**
- Links must be valid URLs (http, https, or mailto)
- Relative URLs allowed within body links
- No validation on external links (could be broken, but intentional)

**Reference Validation:**
- Author must exist as a published author document
- Category must exist as a published category document
- Tag references must exist as published tag documents

**Image Validation:**
- Alt text is required for all images
- Encourages accessibility compliance

---

## Common Editorial Workflows & Best Practices

### Publishing a New Article

1. **Create New Article Document** in "All Articles" view
2. **Fill Content Group:**
   - Enter compelling title
   - Slug auto-generates; customize if needed
   - Select author (must exist already)
   - Upload cover image and write alt text (describe what's in image)
   - Select category (single choice)
   - Write excerpt (200 chars max, should be click-worthy)
   - Write body in rich text editor (H2/H3 for structure, links to sources)
   - Set publishedAt to now or future time (future date delays publication)
3. **Add SEO Metadata** (optional but recommended):
   - If article targets specific keyword, write custom SEO Title (60 chars)
   - If excerpt doesn't match search intent, write SEO Description (160 chars)
   - If republishing, set Canonical URL
4. **Configure Settings:**
   - Set featured if this is headline story (only one at a time)
   - Set sponsored if paid content
   - Add contentWarning if high-risk financial content
   - Leave noIndex OFF unless holding for editing
5. **Publish Article**
   - Click "Publish" button
   - Article appears on site within seconds (via ISR webhook)

### Updating Existing Article

1. **Find article** in "All Articles" or search by title
2. **Make edits** to content
3. **Update Last Updated:** Set `updatedAt` to current time
   - This signals to Google that content is fresh
   - Critical for crypto news where information changes rapidly
4. **Publish changes**
   - Updates cache via webhook
   - Appears on site immediately

### Hiding Article from Search (Without Deleting)

1. **Open article** in editor
2. **Go to SEO group**
3. **Check "Hide from Search Engines (noindex)"**
4. **Save and publish**
   - Article remains on site but tells Google not to index
   - Useful for outdated news or thin content you want to keep live

### Managing Authors

1. **Create New Author** in Authors section
2. **Enter core info:**
   - Name (required)
   - Slug (auto-generates from name)
   - Avatar image (real photo strongly recommended)
3. **Add Credentials:**
   - Role (job title)
   - Credentials (qualifications, years of experience)
   - Bio (detailed professional background)
4. **Add Social Links:**
   - Twitter/X URL
   - LinkedIn URL
   - Any other public profiles
5. **Publish**
   - Author profile now available for selection when creating/editing articles
   - Author appears on all articles they've written

---

## Technical Implementation Details

### Sanity Client Initialization

**Location:** `lib/sanity/client.ts`

**Configuration Strategy:**
- Creates Sanity client with project ID and dataset from environment variables
- Token handling:
  - If `SANITY_API_TOKEN` exists and `NODE_ENV !== "production"`: Client uses drafts perspective (preview mode)
  - Otherwise: Client uses published perspective and CDN (production)
- API version: `2024-01-01` ensures forward compatibility

**Fallback Behavior:**
- If env vars are missing, a fallback client is provided that returns null
- Prevents crashes in development if Sanity isn't configured
- Useful for local development or CI/CD environments

### Query Composition

**Location:** `lib/sanity/queries.ts`

**Fragment-Based Approach:**
- `authorFields`: Reusable author data selector
- `categoryFields`: Reusable category data selector
- `articleCardFields`: Combines author, category, and article fields for card displays

**GROQ Syntax Patterns:**
- Array filtering: `*[_type == "article" && featured == true]`
- Sorting: `| order(publishedAt desc)`
- Slicing: `[0..10]` for pagination limits
- Projection: `{ title, slug, author }` to select fields
- Reference resolution: `author->{ name }` to fetch referenced document fields
- Text functions: `pt::text(body)` to convert Portable Text to plain text

---

## Important Considerations & Constraints

### Immutability & Breaking Changes

**Slugs are Permanent:**
- Once an article is published and indexed by Google, changing its slug breaks existing links
- External sites may be linking to your article
- Bookmarked links break
- SEO equity (backlinks) transfer to 404 errors
- **Best Practice:** Set slug carefully before publishing; treat as immutable

**Category Deletions:**
- Deleting a category orphans all articles assigned to it
- Frontend will break when trying to render category for those articles
- **Best Practice:** Never delete categories; archive them instead (mark archived in custom field if needed)

**Author Deletions:**
- Articles still reference deleted author document
- Frontend may crash or show "Unknown Author"
- **Best Practice:** Never delete authors; inactivate them instead

### SEO Implications

**Meta Tags Generation:**
- Frontend uses seoTitle/seoDescription if present, falls back to title/excerpt
- Canonical URL prevents duplicate content penalties
- noIndex prevents competing with better versions elsewhere
- updatedAt sends freshness signals to Google crawlers

**E-E-A-T Signals:**
- Author credentials and social links establish expertise
- Real author photo (avatar) signals authentic identity
- Detailed bio establishes authority
- Sources and references build trustworthiness

**Content Warning Disclaimers:**
- Legally required for financial content
- Affects liability and FTC compliance
- Must be visible and prominent

### Content Moderation

**No Built-In Moderation:**
- Sanity has no spam filtering or content review workflow
- All editors have equal permissions
- Consider implementing approval workflow:
  - Draft articles not published until reviewed
  - Different roles for editors vs publishers
  - Scheduled publishing for time-based release

---

## Disaster Recovery & Data Integrity

### Backups

Sanity automatically maintains:
- Complete version history (all past states of documents)
- Document recovery (deleted documents can be restored for 30 days)
- API-level redundancy and geographically distributed data

### Audit Trail

Every document change is tracked with:
- Timestamp of change
- User who made change
- Change type (create, update, delete)
- Accessible via Sanity dashboard

### Prevention Measures

- **Slug Uniqueness:** Sanity prevents duplicate slugs in same type
- **Reference Integrity:** Can't delete a document if other documents reference it (with safeguards)
- **Data Validation:** All field validation rules prevent invalid states at save time

---

## Conclusion

The Sanity CMS architecture at Cryptic Daily is designed for:

1. **SEO Excellence:** Multiple fields for search optimization, freshness signals, canonical handling
2. **Editorial Flexibility:** Rich content editing with full formatting options
3. **Author Credibility:** Comprehensive author profiles supporting E-E-A-T signals
4. **Content Organization:** Clear taxonomy with categories and tags
5. **Performance:** CDN caching, incremental regeneration, efficient GROQ queries
6. **Compliance:** Sponsored content flags, content warnings, nofollow management
7. **User Experience:** Hotspot-based responsive images, rich media embedding, related content

The system balances editorial simplicity with technical power, allowing content creators to focus on storytelling while the infrastructure ensures content reaches the right audience through search, social, and direct channels.
