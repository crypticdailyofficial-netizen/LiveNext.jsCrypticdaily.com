/**
 * single-article.mjs
 *
 * Uploads only:
 * japan-crypto-investment-trusts-sbi-rakuten
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

// ── Category, Author & Tags ──────────────────────────────────────────────────

const categoryDoc = {
  _id: "category-crypto-newswire",
  _type: "category",
  title: "Crypto Newswire",
  slug: { _type: "slug", current: "crypto-newswire" },
};

const tags = [
  {
    _id: "tag-japan-crypto",
    _type: "tag",
    title: "japan crypto",
    slug: { _type: "slug", current: "japan-crypto" },
  },
  {
    _id: "tag-sbi-securities",
    _type: "tag",
    title: "sbi securities",
    slug: { _type: "slug", current: "sbi-securities" },
  },
  {
    _id: "tag-rakuten-securities",
    _type: "tag",
    title: "rakuten securities",
    slug: { _type: "slug", current: "rakuten-securities" },
  },
  {
    _id: "tag-crypto-investment-trusts",
    _type: "tag",
    title: "crypto investment trusts",
    slug: { _type: "slug", current: "crypto-investment-trusts" },
  },
  {
    _id: "tag-bitcoin-ethereum-funds",
    _type: "tag",
    title: "bitcoin ethereum funds",
    slug: { _type: "slug", current: "bitcoin-ethereum-funds" },
  },
];

// ── Article ──────────────────────────────────────────────────────────────────

const article = {
  _id: "japan-crypto-investment-trusts-sbi-rakuten",
  _type: "article",
  title: "Japan Crypto Investment Trusts: SBI, Rakuten Gear Up",
  slug: {
    _type: "slug",
    current: "japan-crypto-investment-trusts-sbi-rakuten",
  },
  category: { _ref: "category-crypto-newswire", _type: "reference" },
  author: {
    _ref: "4c4e9409-351c-47a4-9034-91b27d8d5836",
    _type: "reference",
  },
  tags: tags.map((tag) => ({ _ref: tag._id, _type: "reference" })),
  mainImage: {
    _type: "image",
    alt: "SBI and Rakuten preparing Japan crypto investment trusts",
  },

  body: [
    textBlock(
      "SBI Securities and Rakuten Securities are preparing Japan crypto investment trusts that would move Bitcoin and Ether exposure into ordinary brokerage accounts rather than dedicated crypto wallets. The timing matters because Japan's Financial Services Agency is moving toward a fund-rule rewrite that could let investment trusts hold crypto assets by 2028.",
    ),

    textBlock(
      "Japan crypto investment trusts are moving from idea to product queue",
      "h2",
    ),
    richTextBlock([
      "Japan's brokerage race is now visible at the product level. According to ",
      {
        text: "Cointelegraph's May 17 report",
        href: "https://cointelegraph.com/news/sbi-rakuten-nomura-line-up-to-launch-crypto-investment-trusts-report",
      },
      ", SBI Securities plans to sell products developed by SBI Global Asset Management, including investment trusts and ETFs focused on liquid crypto assets such as Bitcoin and Ethereum. Rakuten Securities is preparing a similar route with Rakuten Investment Management and other group firms, with the aim of letting clients trade the products through smartphone apps.",
    ]),
    textBlock(
      "The same report said Nomura and Daiwa have announced plans to develop crypto investment trusts once the rulebook is set, while SMBC Group, including SMBC Nikko, has formed a cross-group task force. Asset Management One, linked to Mizuho Financial Group, has started early research. That is the part investors should not miss. This is no longer a single-bank experiment or a crypto exchange pitch. It is a coordinated product-readiness phase across Japan's largest brokerage groups, built before final regulatory clearance.",
    ),

    textBlock(
      "Why Japan crypto investment trusts matter for retail access",
      "h2",
    ),
    textBlock(
      "Crypto exposure in Japan still carries friction that traditional fund products do not. A retail investor who wants spot Bitcoin or Ether exposure usually has to open a crypto exchange account, pass exchange-specific onboarding, understand custody choices, and accept a product experience that sits outside the normal securities account. Investment trusts would compress that workflow into the same brokerage rails used for stocks, funds, and other listed products.",
    ),
    richTextBlock([
      "That shift matters for distribution. Cryptic Daily's ",
      {
        text: "Crypto Newswire",
        href: "/categories/crypto-newswire",
        blank: false,
      },
      " coverage has repeatedly tracked the same pattern in the U.S. and Europe: access changes behavior before ideology does. When crypto exposure is packaged inside regulated wrappers, allocators can size positions, report holdings, and manage risk through existing portfolio systems. Japan's version could be more conservative than U.S. spot ETFs, but it targets the same behavioral barrier. The story is less about a new crypto product and more about whether Japan's brokerage channel can turn Bitcoin and Ether into routine portfolio instruments.",
    ]),

    textBlock("Japan's fund-rule path is still the gating factor", "h2"),
    textBlock(
      "The core regulatory issue is whether Japanese investment trusts can formally hold crypto assets as specified assets. Cointelegraph reported that Japan's FSA is moving to revise the enforcement order of the Investment Trust Act by 2028, which would add cryptocurrencies to the list of assets that investment trusts can hold. That timetable means the current brokerage preparations are early positioning, not completed product launches.",
    ),
    richTextBlock([
      "Japan has been moving in stages. ",
      {
        text: "Reuters reported in March 2025",
        href: "https://www.reuters.com/technology/japan-give-crypto-assets-legal-status-financial-products-nikkei-says-2025-03-30/",
      },
      " that the FSA planned to revise the Financial Instruments and Exchange Act to give crypto assets legal status as financial products and place them under insider-trading restrictions. ",
      {
        text: "Reuters also reported in October 2025",
        href: "https://www.reuters.com/world/asia-pacific/japan-mulls-letting-banking-groups-offer-crypto-trading-services-nikkei-reports-2025-10-21/",
      },
      " that the regulator was considering changes that would let banking-group securities arms offer crypto trading services and compete with affiliates such as Rakuten Wallet and SBI Holdings units. Together, those steps point to a controlled migration from exchange-only access toward regulated financial-product access.",
    ]),

    textBlock("Brokerage groups gain control of the customer interface", "h2"),
    textBlock(
      "SBI and Rakuten are not just chasing another fee line. They are trying to own the interface through which Japanese clients receive crypto exposure. SBI's planned structure would place product design, asset management, and distribution inside the group. Rakuten's reported smartphone-app route points to the same logic: keep the investor inside the familiar securities interface, not outside it on a separate exchange account.",
    ),
    richTextBlock([
      "That has market structure consequences. If crypto investment trusts become available through brokerage accounts, crypto exchanges may lose some high-value passive buyers while gaining institutional-style liquidity demand from fund issuers. Custody providers, index providers, market makers, and compliance teams become more central. The same logic appeared in Cryptic Daily's coverage of ",
      {
        text: "Franklin Templeton's crypto asset-management push",
        href: "/news/franklin-templeton-250-digital-crypto",
        blank: false,
      },
      ", where large managers used acquisitions and product design to pull crypto exposure deeper into regulated asset-management channels. Japan's brokerages are moving toward the same endpoint, but under a slower, rule-led domestic process.",
    ]),

    textBlock("Bitcoin and Ether are the first assets to watch", "h2"),
    textBlock(
      "Bitcoin and Ethereum are the natural starting points because liquidity, pricing depth, and investor recognition matter most when regulators assess fund suitability. Cointelegraph's report said SBI's planned products would focus on highly liquid assets such as Bitcoin and Ethereum. Current market data also shows why those two assets dominate the first-product conversation: Bitcoin traded near $77,943 and Ether near $2,183 on May 17, 2026, with both assets remaining the reference points for institutional crypto exposure.",
    ),
    textBlock(
      "The risk is that retail access becomes easier before risk understanding improves. Japan's regulator has already signaled concern about volatility and loss disclosure. Reuters reported in October 2025 that bank-affiliated securities firms would be required to clearly explain crypto risks to retail investors if rules are changed. That points to a product market where disclosure, suitability, and risk labels may matter as much as fees. That is why the brokerage list matters. SBI, Rakuten, Nomura, Daiwa, SMBC Nikko, and Asset Management One serve different investor bases, but their shared direction signals that the next competitive fight may be distribution, not whether crypto belongs in regulated accounts. If the first products are limited to Bitcoin and Ether, the second wave could test whether diversified baskets can pass liquidity, custody, and disclosure reviews. For investors, the first signal to watch is not a marketing campaign from SBI or Rakuten. It is the legal text that defines which crypto assets funds can hold, what disclosures must accompany them, and whether tax treatment changes alongside fund eligibility.",
    ),
    textBlock(
      "Japan's 2028 fund-rule timetable is now the key milestone. If the FSA finalizes the Investment Trust Act changes and the Financial Instruments and Exchange Act amendments move into effect in fiscal 2027, SBI, Rakuten, Nomura, and other brokers could already have the product stack ready for launch.",
    ),
    textBlock(
      "This article is for informational purposes only and does not constitute financial or investment advice.",
    ),
  ],

  excerpt:
    "SBI and Rakuten are preparing crypto investment trusts as Japan moves toward fund rules that could bring Bitcoin and Ether exposure into brokerage accounts by 2028, shifting access away from exchange-only rails.",

  seoTitle: "Japan Crypto Investment Trusts: SBI, Rakuten Gear Up",
  seoDescription:
    "Japan crypto investment trusts from SBI and Rakuten could route Bitcoin and Ether exposure through brokerages as Japan rewrites fund rules in 2028.",

  publishedAt: "2026-05-17T15:30:00.000Z",
  featured: false,
  sponsored: false,
  noIndex: false,

  sources: [
    {
      _key: key(),
      label: "Cointelegraph",
      url: "https://cointelegraph.com/news/sbi-rakuten-nomura-line-up-to-launch-crypto-investment-trusts-report",
    },
    {
      _key: key(),
      label: "Reuters",
      url: "https://www.reuters.com/technology/japan-give-crypto-assets-legal-status-financial-products-nikkei-says-2025-03-30/",
    },
    {
      _key: key(),
      label: "Reuters",
      url: "https://www.reuters.com/world/asia-pacific/japan-mulls-letting-banking-groups-offer-crypto-trading-services-nikkei-reports-2025-10-21/",
    },
    {
      _key: key(),
      label: "Japan Financial Services Agency",
      url: "https://www.fsa.go.jp/en/newsletter/weekly2026/686.html",
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
    ...tags.map((tag) => ({ createIfNotExists: tag })),
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
