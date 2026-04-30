/**
 * add-inline-links.mjs
 *
 * Finds phrases in existing Sanity article bodies and wraps them in hyperlinks.
 * Non-destructive: only patches body blocks that contain a match.
 *
 * Usage:
 *   SANITY_TOKEN=<token> SANITY_PROJECT_ID=<id> node add-inline-links.mjs
 *
 * Optional:
 *   SANITY_DATASET=<dataset>   – defaults to "production"
 *   DRY_RUN=1                  – logs what would change without writing
 *   SINGLE=<slug>              – process only one article by slug
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN;
const API_VERSION = process.env.SANITY_API_VERSION || "2024-01-01";
const DRY_RUN = process.env.DRY_RUN === "1";
const SINGLE = process.env.SINGLE || null;

if (!PROJECT_ID || !TOKEN) {
  console.error("Error: Set SANITY_PROJECT_ID and SANITY_TOKEN env vars.");
  process.exit(1);
}

const BASE_URL = "https://www.crypticdaily.com";

// ── Link map: slug → [{phrases[], href}] ────────────────────────────────────
// phrases is an array of alternatives — first match wins per rule.

const LINK_MAP = {
  "franklin-templeton-250-digital-crypto": [
    {
      phrases: ["tokenized fund stack"],
      href: "/news/nyse-securitize-tokenized-securities-platform",
    },
    { phrases: ["real-world asset adoption"], href: "/tags/tokenized-assets" },
    {
      phrases: ["exchange-traded funds"],
      href: "/news/bitcoin-etfs-break-inflow-streak",
    },
  ],
  "nyse-securitize-tokenized-securities-platform": [
    {
      phrases: ["institutional-grade crypto team", "institutional crypto"],
      href: "/news/franklin-templeton-250-digital-crypto",
    },
    { phrases: ["tokenized securities"], href: "/tags/tokenized-securities" },
    {
      phrases: ["regulated capital markets"],
      href: "/news/moodys-new-hampshire-bitcoin-bond",
    },
  ],
  "anchorage-tron-us-institutional-rails": [
    {
      phrases: ["regulated counterparty", "institutional custody"],
      href: "/tags/crypto-custody",
    },
    {
      phrases: ["SEC settlement", "civil fraud case"],
      href: "/news/sec-crypto-enforcement-senate-scrutiny",
    },
    {
      phrases: ["tokenized securities", "institutional market structure"],
      href: "/news/nyse-securitize-tokenized-securities-platform",
    },
  ],
  "coinbase-crypto-down-payments-homes": [
    {
      phrases: ["bitcoin collateral", "BTC collateral"],
      href: "/tags/bitcoin-collateral",
    },
    {
      phrases: ["institutional crypto", "institutional adoption"],
      href: "/news/franklin-templeton-250-digital-crypto",
    },
    {
      phrases: ["spot bitcoin ETF", "spot Bitcoin ETF"],
      href: "/news/bitcoin-etfs-break-inflow-streak",
    },
  ],
  "mercado-pago-ends-mercado-coin": [
    {
      phrases: ["stablecoins", "stablecoin"],
      href: "/news/stablecoin-velocity-2t-forecast",
    },
    {
      phrases: ["crypto strategy", "crypto products"],
      href: "/categories/crypto-newswire",
    },
    {
      phrases: ["institutional custody", "regulated access"],
      href: "/news/anchorage-tron-us-institutional-rails",
    },
  ],
  "bitcoin-iran-shock-global-markets": [
    {
      phrases: [
        "spot Bitcoin ETFs had just ended a four-week inflow streak",
        "spot Bitcoin ETFs",
      ],
      href: "/news/bitcoin-etfs-break-inflow-streak",
    },
    {
      phrases: ["leveraged traders", "crypto positions were liquidated"],
      href: "/news/bitcoin-loss-supply-stress-signal",
    },
    {
      phrases: ["miner stress", "treasury sales"],
      href: "/news/riot-sells-bitcoin-ai-pivot",
    },
  ],
  "stablecoin-velocity-2t-forecast": [
    {
      phrases: ["tokenization", "tokenized finance"],
      href: "/news/nyse-securitize-tokenized-securities-platform",
    },
    {
      phrases: ["institutional crypto", "institutional infrastructure"],
      href: "/news/franklin-templeton-250-digital-crypto",
    },
    {
      phrases: ["Latin American", "emerging-market"],
      href: "/news/mercado-pago-ends-mercado-coin",
    },
  ],
  "moodys-new-hampshire-bitcoin-bond": [
    { phrases: ["bitcoin collateral"], href: "/tags/bitcoin-collateral" },
    {
      phrases: ["institutional crypto rails", "tokenized securities"],
      href: "/news/nyse-securitize-tokenized-securities-platform",
    },
    {
      phrases: ["corporate bitcoin", "treasury companies"],
      href: "/news/gamestop-bitcoin-covered-calls",
    },
  ],
  "riot-sells-bitcoin-ai-pivot": [
    {
      phrases: ["bitcoin treasury", "treasury and capital-allocation"],
      href: "/tags/bitcoin-treasury-companies",
    },
    {
      phrases: ["mining difficulty", "miner stress"],
      href: "/news/bitcoin-difficulty-drops-miner-stress",
    },
    {
      phrases: ["covered call", "options overlay"],
      href: "/news/gamestop-bitcoin-covered-calls",
    },
  ],
  "gamestop-bitcoin-covered-calls": [
    {
      phrases: ["bitcoin treasury companies"],
      href: "/tags/bitcoin-treasury-companies",
    },
    { phrases: ["Riot"], href: "/news/riot-sells-bitcoin-ai-pivot" },
    {
      phrases: ["ETF", "spot bitcoin ETF", "spot Bitcoin ETF"],
      href: "/news/bitcoin-etfs-break-inflow-streak",
    },
  ],
  "bitcoin-outperforms-stocks-oil-shock": [
    {
      phrases: ["Bitcoin ETFs", "ETF demand"],
      href: "/news/bitcoin-etfs-break-inflow-streak",
    },
    {
      phrases: ["Iran war", "Strait of Hormuz"],
      href: "/news/bitcoin-iran-shock-global-markets",
    },
    {
      phrases: ["miner", "mining stress"],
      href: "/news/bitcoin-difficulty-drops-miner-stress",
    },
  ],
  "bitcoin-loss-supply-stress-signal": [
    {
      phrases: ["ETF behavior", "ETF"],
      href: "/news/bitcoin-etfs-break-inflow-streak",
    },
    {
      phrases: ["bitcoin outperforming stocks", "relative resilience"],
      href: "/news/bitcoin-outperforms-stocks-oil-shock",
    },
    {
      phrases: ["miner stress", "treasury sales"],
      href: "/news/riot-sells-bitcoin-ai-pivot",
    },
  ],
  "todd-blanche-crypto-acting-ag": [
    {
      phrases: ["SEC", "crypto enforcement"],
      href: "/news/sec-crypto-enforcement-senate-scrutiny",
    },
    {
      phrases: ["Justin Sun"],
      href: "/news/anchorage-tron-us-institutional-rails",
    },
    {
      phrases: ["developer cases", "Tornado Cash"],
      href: "/tags/tornado-cash",
    },
  ],
  "bitcoin-difficulty-drops-miner-stress": [
    {
      phrases: [
        "treasury and capital-allocation decisions",
        "treasury and capital-allocation",
      ],
      href: "/news/metaplanet-adds-5075-btc-q1",
    },
    {
      phrases: ["non-mining infrastructure", "AI infrastructure"],
      href: "/news/riot-sells-bitcoin-ai-pivot",
    },
    {
      phrases: ["bitcoin investors", "ETF"],
      href: "/news/bitcoin-etfs-break-inflow-streak",
    },
  ],
  "bitcoin-etfs-break-inflow-streak": [
    {
      phrases: ["Iran", "geopolitical tension"],
      href: "/news/bitcoin-iran-shock-global-markets",
    },
    {
      phrases: ["macro stress", "oil"],
      href: "/news/bitcoin-outperforms-stocks-oil-shock",
    },
    {
      phrases: ["underwater", "holder stress"],
      href: "/news/bitcoin-loss-supply-stress-signal",
    },
  ],
  "metaplanet-adds-5075-btc-q1": [
    {
      phrases: ["bitcoin treasury companies"],
      href: "/tags/bitcoin-treasury-companies",
    },
    {
      phrases: ["covered call", "options overlay"],
      href: "/news/gamestop-bitcoin-covered-calls",
    },
    {
      phrases: ["miner", "mining"],
      href: "/news/bitcoin-difficulty-drops-miner-stress",
    },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

let keyCounter = Date.now();
const key = () => (++keyCounter).toString(36);

async function sanityQuery(query, params = {}) {
  const qs = new URLSearchParams({ query });
  for (const [k, v] of Object.entries(params))
    qs.set(`$${k}`, JSON.stringify(v));
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?${qs}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

async function sanityMutate(mutations) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  return res.json();
}

/**
 * Given a body block array and a {phrases, href} rule, find the FIRST
 * occurrence of any phrase (in priority order) across all spans.
 * Returns null if no match, or {blockIndex, spanIndex, phraseMatch} on hit.
 */
function findPhrase(body, rule) {
  for (const phrase of rule.phrases) {
    const lowerPhrase = phrase.toLowerCase();
    for (let bi = 0; bi < body.length; bi++) {
      const block = body[bi];
      if (block._type !== "block" || !block.children) continue;
      for (let si = 0; si < block.children.length; si++) {
        const span = block.children[si];
        if (span._type !== "span") continue;
        const lowerText = span.text.toLowerCase();
        const idx = lowerText.indexOf(lowerPhrase);
        if (idx !== -1) {
          // Check span isn't already linked
          if (span.marks && span.marks.length > 0) {
            const existingLinkMarks = (block.markDefs || []).filter(
              (md) => md._type === "link" && span.marks.includes(md._key),
            );
            if (existingLinkMarks.length > 0) continue; // already linked
          }
          return {
            blockIndex: bi,
            spanIndex: si,
            matchStart: idx,
            matchEnd: idx + phrase.length,
            phraseMatch: span.text.substring(idx, idx + phrase.length), // preserve original case
          };
        }
      }
    }
  }
  return null;
}

/**
 * Apply a link to a matched phrase inside a block.
 * Splits the span into up to 3 parts: before, linked, after.
 * Mutates the body array in place.
 */
function applyLink(body, match, href) {
  const block = body[match.blockIndex];
  const span = block.children[match.spanIndex];
  const fullHref = `${BASE_URL}${href}`;

  const markKey = key();
  if (!block.markDefs) block.markDefs = [];
  block.markDefs.push({
    _key: markKey,
    _type: "link",
    blank: false,
    href: fullHref,
    nofollow: false,
  });

  const before = span.text.substring(0, match.matchStart);
  const linked = match.phraseMatch;
  const after = span.text.substring(match.matchEnd);

  const newChildren = [];

  if (before) {
    newChildren.push({
      _key: key(),
      _type: "span",
      marks: [...(span.marks || [])],
      text: before,
    });
  }

  newChildren.push({
    _key: key(),
    _type: "span",
    marks: [...(span.marks || []), markKey],
    text: linked,
  });

  if (after) {
    newChildren.push({
      _key: key(),
      _type: "span",
      marks: [...(span.marks || [])],
      text: after,
    });
  }

  // Replace the original span with the new children
  block.children.splice(match.spanIndex, 1, ...newChildren);
}

/**
 * Check if a destination href is already linked anywhere in the body
 * (to avoid linking same destination twice).
 */
function isDestAlreadyLinked(body, href) {
  const fullHref = `${BASE_URL}${href}`;
  for (const block of body) {
    if (block._type !== "block" || !block.markDefs) continue;
    for (const md of block.markDefs) {
      if (md._type === "link" && (md.href === href || md.href === fullHref)) {
        return true;
      }
    }
  }
  return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const slugs = SINGLE ? [SINGLE] : Object.keys(LINK_MAP);

  console.log(`\n🔗 Inline link injection — ${slugs.length} article(s)`);
  if (DRY_RUN) console.log("   (DRY RUN — no writes)\n");
  else console.log("");

  let totalLinked = 0;
  let totalSkipped = 0;
  let totalNotFound = 0;

  for (const slug of slugs) {
    const rules = LINK_MAP[slug];
    if (!rules) {
      console.log(`⚠️  No rules for slug "${slug}", skipping.`);
      continue;
    }

    // Fetch both draft and published, prefer draft
    const docs = await sanityQuery(
      `*[_type == "article" && slug.current == $slug] | order(_id asc)`,
      { slug },
    );

    if (!docs || docs.length === 0) {
      console.log(`❌ Article not found: ${slug}`);
      totalNotFound += rules.length;
      continue;
    }

    // Prefer draft over published
    const doc = docs.find((d) => d._id.startsWith("drafts.")) || docs[0];
    console.log(`📄 ${slug}  (${doc._id})`);

    // Deep clone body so we can mutate
    const body = JSON.parse(JSON.stringify(doc.body));
    let linksAdded = 0;

    for (const rule of rules) {
      // Skip if destination already linked in this body
      if (isDestAlreadyLinked(body, rule.href)) {
        console.log(
          `   ⏭️  "${rule.phrases[0]}" → already linked to ${rule.href}`,
        );
        totalSkipped++;
        continue;
      }

      const match = findPhrase(body, rule);
      if (!match) {
        console.log(`   ⚠️  No match for: ${rule.phrases.join(" | ")}`);
        totalNotFound++;
        continue;
      }

      applyLink(body, match, rule.href);
      linksAdded++;
      console.log(`   ✅ "${match.phraseMatch}" → ${rule.href}`);
    }

    if (linksAdded === 0) {
      console.log(`   — No changes needed.\n`);
      continue;
    }

    totalLinked += linksAdded;

    if (DRY_RUN) {
      console.log(`   — Would patch ${linksAdded} link(s).\n`);
      continue;
    }

    // Patch only the body field
    const result = await sanityMutate([
      {
        patch: {
          id: doc._id,
          set: { body },
        },
      },
    ]);

    if (result.error) {
      console.error(`   ❌ Patch failed:`, result.error.description);
    } else {
      console.log(`   ✍️  Patched ${linksAdded} link(s).\n`);
    }
  }

  console.log("─".repeat(50));
  console.log(`✅ Links added: ${totalLinked}`);
  console.log(`⏭️  Already linked: ${totalSkipped}`);
  console.log(`⚠️  Phrases not found: ${totalNotFound}`);
  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
