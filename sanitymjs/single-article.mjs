/**
 * single-article.mjs
 *
 * Uploads only:
 * drafts.morgan-stanley-bitcoin-etf-advisor-channel
 */

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const PROJECT_ID =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
const API_VERSION = process.env.SANITY_API_VERSION || "2024-01-01";
const DRY_RUN = process.env.DRY_RUN === "1";

if (!DRY_RUN && (!PROJECT_ID || !TOKEN)) {
  console.error("Error: Set SANITY_PROJECT_ID and SANITY_TOKEN env vars.");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

let keyCounter = 0;
const key = () =>
  (++keyCounter).toString(16).padStart(12, "0") +
  Math.random().toString(36).slice(2, 6);

function textBlock(text, style = "normal") {
  return {
    _key: key(),
    _type: "block",
    style,
    markDefs: [],
    children: [{ _key: key(), _type: "span", marks: [], text }],
  };
}

function richTextBlock(parts, style = "normal") {
  const markDefs = [];

  const children = parts.map((part) => {
    if (typeof part === "string") {
      return {
        _key: key(),
        _type: "span",
        marks: [],
        text: part,
      };
    }

    const markKey = key();
    markDefs.push({
      _key: markKey,
      _type: "link",
      blank: part.blank ?? /^https?:\/\//.test(part.href),
      href: part.href,
      nofollow: part.nofollow ?? false,
    });

    return {
      _key: key(),
      _type: "span",
      marks: [markKey],
      text: part.text,
    };
  });

  return {
    _key: key(),
    _type: "block",
    style,
    markDefs,
    children,
  };
}

// ── Category & Author docs ───────────────────────────────────────────────────

const categoryDoc = {
  _id: "category-crypto-newswire",
  _type: "category",
  title: "Crypto Newswire",
  slug: { _type: "slug", current: "crypto-newswire" },
};

const authorMarketAnalyst = {
  _id: "author-market-analyst",
  _type: "author",
  name: "Market Analyst",
  slug: { _type: "slug", current: "market-analyst" },
};

// ── Article ──────────────────────────────────────────────────────────────────

const article = {
  _id: "drafts.morgan-stanley-bitcoin-etf-advisor-channel",
  _type: "article",
  title:
    "Morgan Stanley's Bitcoin ETF Bet Rests on Advisor Distribution, Not Just Fees",
  slug: {
    _type: "slug",
    current: "morgan-stanley-bitcoin-etf-advisor-channel",
  },
  category: { _ref: "category-crypto-newswire", _type: "reference" },
  author: { _ref: "author-market-analyst", _type: "reference" },
  mainImage: {
    _type: "image",
    alt: "Morgan Stanley Bitcoin ETF article cover image",
  },

  body: [
    richTextBlock([
      "Morgan Stanley's Bitcoin ETF, MSBT, is entering the U.S. spot market with a 0.14% fee and the backing of one of Wall Street's largest advisory networks, setting up a fresh test of whether distribution can beat incumbency. The launch matters now because the spot Bitcoin ETF trade has moved past first-mover hype: scale already belongs to BlackRock, so Morgan Stanley has to turn advisor shelf space into repeat demand."
    ]),

    textBlock("Morgan Stanley's Real Edge Sits Inside Its Advisor Channel", "h2"),
    richTextBlock([
      "The headline number on Morgan Stanley's new fund is the fee, but the deeper story is distribution. In ",
      {
        text: "Decrypt's report on the launch",
        href: "https://decrypt.co/363531/captive-audience-drive-demand-morgan-stanley-bitcoin-etf-bloomberg-analyst",
      },
      ", Bloomberg Intelligence ETF analyst Eric Balchunas argued that Morgan Stanley's \"captive audience\" could give the product a real opening even though it is arriving late. That phrase matters more than typical launch-day language because it points to the structure of the U.S. wealth business. A bank with thousands of advisors does not need to win every self-directed investor on day one. It needs to win inclusion on enough internal platforms, model portfolios, and client conversations to generate durable flows. That is a different playbook from the one that defined the first year of spot Bitcoin ETFs. Earlier winners built momentum through brand, liquidity, and early allocation enthusiasm. Morgan Stanley can instead sell familiarity. For readers tracking this institutional shift across ",
      {
        text: "Crypto Newswire",
        href: "/categories/crypto-newswire",
        blank: false,
      },
      ", the signal is plain: MSBT does not need to become the biggest Bitcoin ETF to matter. If advisors treat it as the house product, Morgan Stanley gains a built-in funnel that most crypto-native issuers and even many legacy asset managers do not have."
    ]),

    textBlock("The 0.14% Fee Works as a Signal, Not Just a Price Cut", "h2"),
    richTextBlock([
      "Morgan Stanley's amended registration statement shows the trust will charge a ",
      {
        text: "0.14% annualized delegated sponsor fee",
        href: "https://www.sec.gov/Archives/edgar/data/2103612/000110465926036138/tm2534140-10_s1a.htm",
      },
      ". That number is low enough to make headlines, but its job goes beyond undercutting rivals by a few basis points. In a product category where the underlying asset is the same and tracking error is expected to stay tight, fee language becomes positioning. Morgan Stanley is telling advisors and clients that it does not intend to arrive as a premium-priced latecomer. It wants to look disciplined, credible, and easy to defend in a fiduciary conversation. That matters because a cheap in-house product lets an advisor pitch convenience and platform alignment without appearing to steer assets into a more expensive wrapper. It also raises pressure on the rest of the field, because every issuer now has to answer a harder question: if a major bank can come in at 14 basis points, how much fee premium can anyone else still justify? The spot Bitcoin ETF market is no longer competing on access alone. It is competing on who can make access feel ordinary."
    ]),

    textBlock("BlackRock Still Owns the Benchmark Position", "h2"),
    richTextBlock([
      "Morgan Stanley may have a distribution edge, but it is still walking into a market where BlackRock has already become the default benchmark. On BlackRock's own ",
      {
        text: "iShares Bitcoin Trust page",
        href: "https://www.ishares.com/us/products/333011/ishares-bitcoin-trust-etf",
      },
      ", IBIT showed $54.57 billion in net assets as of April 6, 2026, a 0.25% sponsor fee, and a 30-day average volume above 52 million shares. Those figures tell the real story. IBIT is not just large. It is liquid, heavily trafficked, and deeply familiar to allocators, traders, and advisors who already use the iShares complex across other exposures. Late entrants into ETF categories rarely beat the incumbent by being marginally cheaper. They usually need a structural difference, a captive channel, or a regulatory angle. Morgan Stanley appears to know that. It is not trying to rewrite the scorecard by pretending IBIT's head start does not exist. It is trying to shift the terms of competition from public market dominance to private client distribution. That is a smart read of the board. It also explains why this story belongs alongside broader institutional product buildout covered in ",
      {
        text: "Web3 Builder",
        href: "/categories/web3-builder",
        blank: false,
      },
      ". The asset is Bitcoin, but the battleground is the machinery that decides what gets surfaced, approved, and repeated across wealth platforms."
    ]),

    textBlock("A Bank-Issued ETF Changes the Tone of Bitcoin Distribution", "h2"),
    richTextBlock([
      "When Reuters reported in January that ",
      {
        text: "Morgan Stanley had become the first big U.S. bank to seek approval for its own Bitcoin and Solana ETFs",
        href: "https://www.reuters.com/business/morgan-stanley-files-bitcoin-etf-2026-01-06/",
      },
      ", the filing looked like another sign of crypto normalization. It now looks like something more pointed. Banks have spent years acting as cautious intermediaries, offering access through private funds, approved products, or restricted channels while keeping public distance from full-throated crypto endorsement. A bank-branded Bitcoin ETF shifts that posture. It puts the institution's own name on the wrapper and turns Bitcoin exposure into a house product rather than a tolerated client request. Reuters also reported that Morgan Stanley expanded crypto access to all clients and account types in October. That context is what makes the ETF launch matter. MSBT is not a one-off experiment dropped into an isolated corner of the firm. It fits a broader arc in which large financial institutions are moving from custody and permissioning toward active packaging and advice. That does not erase risk, and it does not end the tension between compliance discipline and crypto volatility. But it does make Bitcoin harder to treat as a fringe allocation inside traditional wealth management."
    ]),

    textBlock("The Next Phase Turns on Model Portfolios and Allocation Language", "h2"),
    richTextBlock([
      "The most revealing line in this story may not come from the ETF filing at all. In Morgan Stanley's own ",
      {
        text: "crypto allocation guidance",
        href: "https://www.morganstanley.com/insights/articles/how-to-invest-in-crypto-asset-allocation",
      },
      ", the firm says aggressive \"opportunistic growth\" portfolios can hold up to 4% in crypto, while more moderate models step down from there. That does not guarantee MSBT will be pushed across every account. It does show that the firm has already built a framework for talking about crypto in portfolio terms instead of novelty terms. Once that language exists, a bank-issued ETF becomes easier to place. This is where the launch could outpunch its raw day-one flows. If Morgan Stanley can connect internal allocation guidance, advisor education, and a low-cost in-house wrapper, it creates a cleaner path from research note to client implementation. That is the kind of plumbing that changes markets quietly. The first phase of spot Bitcoin ETFs was about approval, headlines, and pent-up demand. The next phase looks more procedural. Which products get approved on advisory platforms? Which ones fit house views on risk? Which ones can advisors explain in one sentence without opening a compliance fight?"
    ]),

    textBlock("ETF Flow Context Will Decide Whether the Channel Advantage Converts", "h2"),
    richTextBlock([
      "The advisor channel matters, but the broader flow tape still sets the mood. Spot Bitcoin ETFs remain highly visible sentiment vehicles, and traders continue to track relative momentum across issuers through tools like ",
      {
        text: "CoinGlass ETF flow data",
        href: "https://www.coinglass.com/etf/bitcoin",
      },
      ". That means Morgan Stanley is launching into a market where distribution strength has to interact with broader ETF demand, Bitcoin price action, and the willingness of wealth platforms to treat crypto as a steady allocation rather than a tactical trade. If flows weaken across the category, MSBT's internal shelf space may help it hold attention. If flows stay strong, that same shelf space could accelerate adoption faster than many late entrants manage. Either way, the competitive question is no longer whether spot Bitcoin ETFs belong on Wall Street. That argument was settled when large asset managers won approval and built scale. The live question now is which institutions can translate brand, internal sales channels, and client trust into repeat asset gathering."
    ]),

    textBlock("The Competitive Story Is About Distribution Discipline", "h2"),
    richTextBlock([
      "If MSBT opens cleanly and wins fast placement on more advisor shelves, the spot Bitcoin ETF race will shift further away from launch-day spectacle and toward the slow mechanics of wealth management. That would make this less a story about one new ticker and more a story about whether Wall Street now treats Bitcoin exposure as a standard portfolio choice inside the firms that control client relationships at scale. It also sharpens the competitive frame for other issuers. BlackRock still owns the benchmark position. Fidelity still benefits from brand and early presence. But Morgan Stanley is trying to compete from inside the advisory stack, where client behavior can be shaped through platform defaults, house views, and internal product familiarity. That makes this a distribution story first, a fee story second, and a crypto market story only after those two pieces are understood. Readers following institutional product behavior and risk framing can track that broader theme across ",
      {
        text: "Web3 Fraud Files",
        href: "/categories/web3-fraud-files",
        blank: false,
      },
      ", where due diligence, wrapper design, and product framing often matter as much as the underlying asset."
    ]),

    richTextBlock([
      "Morgan Stanley is entering the spot Bitcoin ETF market late, but not quietly. If the bank can pair low fees with advisor adoption and portfolio language that already exists inside the firm, MSBT could matter less as a market-share killer and more as a sign that Bitcoin exposure has moved deeper into the standard machinery of wealth management."
    ]),

    textBlock(
      "This article is for informational purposes only and does not constitute financial or investment advice."
    ),
  ],

  excerpt:
    "Morgan Stanley's new Bitcoin ETF enters with a 0.14% fee, but the bigger story is whether its advisor network can turn late entry into durable demand.",

  seoDescription:
    "Morgan Stanley's Bitcoin ETF launch tests whether advisor distribution and low fees can challenge incumbents like BlackRock in the U.S. spot market.",

  publishedAt: "2026-04-08T12:00:00.000Z",
  featured: false,
  sponsored: false,
  noIndex: false,

  sources: [
    {
      _key: key(),
      label: "Decrypt",
      url: "https://decrypt.co/363531/captive-audience-drive-demand-morgan-stanley-bitcoin-etf-bloomberg-analyst",
    },
    {
      _key: key(),
      label: "SEC S-1/A Filing",
      url: "https://www.sec.gov/Archives/edgar/data/2103612/000110465926036138/tm2534140-10_s1a.htm",
    },
    {
      _key: key(),
      label: "BlackRock iShares Bitcoin Trust",
      url: "https://www.ishares.com/us/products/333011/ishares-bitcoin-trust-etf",
    },
    {
      _key: key(),
      label: "Reuters",
      url: "https://www.reuters.com/business/morgan-stanley-files-bitcoin-etf-2026-01-06/",
    },
    {
      _key: key(),
      label: "Morgan Stanley Insights",
      url: "https://www.morganstanley.com/insights/articles/how-to-invest-in-crypto-asset-allocation",
    },
    {
      _key: key(),
      label: "CoinGlass Bitcoin ETF Data",
      url: "https://www.coinglass.com/etf/bitcoin",
    },
  ],
};

// ── Upload via Sanity HTTP Mutations API ─────────────────────────────────────

async function upload() {
  console.log(`\n🚀 Uploading article: ${article._id}\n`);

  if (DRY_RUN) {
    console.log("📄", article._id, "—", article.title);
    console.log("\n── DRY RUN — no mutations sent ──");
    console.log("Full JSON:\n", JSON.stringify(article, null, 2));
    return;
  }

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

  const mutations = [
    { createIfNotExists: categoryDoc },
    { createIfNotExists: authorMarketAnalyst },
    { createOrReplace: article },
  ];

  console.log(`📦 Total mutations: ${mutations.length}`);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("❌ Failed:\n", JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log("✅ Article uploaded successfully!");
}

upload().catch(console.error);
