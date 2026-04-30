/**
 * upload-franklin-templeton.mjs
 *
 * Uploads the Franklin Templeton 250 Digital acquisition article to Sanity.
 */

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
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

function linkBlock(label, href) {
  const markKey = key();
  return {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [{ _key: markKey, _type: "link", blank: true, href, nofollow: false }],
    children: [{ _key: key(), _type: "span", marks: [markKey], text: label }],
  };
}

function internalLinkBlock(anchorText, path) {
  const markKey = key();
  return {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [{ _key: markKey, _type: "link", blank: false, href: path, nofollow: false }],
    children: [{ _key: key(), _type: "span", marks: [markKey], text: anchorText }],
  };
}

// ── Article body (Portable Text) ─────────────────────────────────────────────

const body = [
  textBlock("Franklin Templeton's 250 Digital acquisition is more than another crypto headline from a big asset manager. The $1.7 trillion firm said on April 1 it will acquire the CoinFund spinoff, fold its team and liquid token strategies into a new unit called Franklin Crypto, and close the deal in the second quarter of 2026 if customary conditions and client consents are met. Reuters reported the transaction first, while Franklin Templeton added a detail that matters even more for market structure: part of the consideration will use BENJI tokens, tying the deal to the firm's existing tokenized fund stack."),

  textBlock("What Franklin Templeton actually bought", "h2"),
  textBlock("Reuters said Franklin Templeton agreed to acquire 250 Digital, a cryptocurrency investment unit spun out of venture firm CoinFund, with financial terms undisclosed. Franklin Templeton's own announcement went further: the transaction includes the 250 Digital investment team and all liquid cryptocurrency strategies previously run by CoinFund, and Franklin itself will invest in those strategies as part of the agreement."),
  textBlock("After closing, the unit will operate as Franklin Crypto. Christopher Perkins will lead the division, Seth Ginns will serve as chief investment officer, and both will work alongside Franklin Templeton digital-assets veteran Tony Pecore under Sandy Kaul, the firm's head of innovation. Franklin also said its Digital Assets business managed about $1.8 billion globally as of December 31, 2025, giving this deal a clearer operating base than a headline about \"expanding into crypto\" usually implies."),
  linkBlock("Reuters report on the acquisition", "https://www.reuters.com/technology/franklin-templeton-acquire-coinfund-spinoff-expand-crypto-push-2026-04-01/"),
  linkBlock("Franklin Templeton deal announcement", "https://www.franklintempleton.com/press-releases/news-room/2026/franklin-templeton-agrees-to-acquire-liquid-strategies-from-coinfund-spinoff-launches-franklin-crypto"),

  textBlock("Why the Franklin Templeton 250 Digital acquisition matters", "h2"),
  textBlock("The obvious read is that another traditional finance brand wants more crypto exposure. The better read is narrower and more useful: Franklin Templeton is choosing active liquid-token management, not just passive exposure through exchange-traded funds. That matters because the firm already launched the Franklin Bitcoin ETF in January 2024 and later expanded its digital-asset ETP lineup, so this deal fills a different gap in the stack."),
  textBlock("Passive products capture beta. A team like 250 Digital is supposed to deliver differentiated exposure, risk management, and portfolio construction for pensions, sovereign wealth funds, and other institutions that do not want their entire crypto allocation reduced to \"own bitcoin and wait.\" Franklin's own digital-assets pages say the firm has been active in the sector since 2018, which makes this acquisition look less like a sudden pivot and more like a move from product experimentation into full-service institutional coverage."),
  internalLinkBlock("more Crypto Newswire coverage", "/categories/crypto-newswire"),

  textBlock("The real signal is the BENJI token in the deal", "h2"),
  textBlock("The most interesting part of the transaction did not come from the Reuters write-up. Franklin Templeton said the deal \"will incorporate BENJI tokens as payment consideration,\" which it framed as a step toward conducting M&A transactions on-chain."),
  textBlock("BENJI is the fund number and tokenized interface tied to the Franklin OnChain U.S. Government Money Fund, whose public product page lists an inception date of April 6, 2021 and total net assets of $864.36 million as of February 28, 2026. In plain terms, Franklin is not only buying a crypto manager; it is using its own tokenized money-market infrastructure in the mechanics of the deal. That does not mean corporate M&A has suddenly moved on-chain. It does mean Franklin is turning tokenization from a product story into an operating one."),
  textBlock("For readers tracking real-world asset adoption, that is the harder signal to ignore: once tokenized fund shares become useful inside institutional transactions, they stop being a marketing demo and start becoming financial plumbing."),
  linkBlock("Franklin OnChain U.S. Government Money Fund (FOBXX)", "https://www.franklintempleton.com/Investments/options/money-market-funds/products/29386/SINGLCLASS/franklin-on-chain-u-s-government-money-fund/FOBXX"),

  textBlock("Who is affected and what changes from here", "h2"),
  textBlock("This move matters most for three groups. First, institutions that want active crypto mandates now have another familiar gatekeeper offering them through a legacy asset-management wrapper. Second, crypto-native managers should expect more competition from firms that already have distribution, compliance, and long-standing client relationships. Third, tokenization projects get a stronger reference case when a blue-chip manager uses a tokenized money fund rail inside a live transaction."),
  textBlock("Franklin Templeton's CEO Jenny Johnson said the addition strengthens the firm's digital-asset capabilities and places it among a small set of global managers with a dedicated institutional-grade crypto team. That is executive language, but the substance is clear. Franklin is trying to compress the distance between ETF manufacturing, tokenized cash management, venture exposure, and actively managed liquid strategies. For clients, that can simplify vendor selection. For rivals, it raises the bar from \"we have a crypto product\" to \"we have a crypto platform.\""),
  internalLinkBlock("our coverage of tokenized asset platforms", "/tags/tokenized-assets"),

  textBlock("What to watch next", "h2"),
  textBlock("There are four things worth tracking after the press release. The first is closing risk: Reuters said the deal is expected to close in the second quarter of 2026, subject to customary conditions and client approvals, while Franklin added definitive agreements and client consents to the list. The second is product cadence. If Franklin Crypto launches new active strategies quickly, that will show the acquisition was about distribution speed as much as talent."),
  textBlock("The third is whether BENJI or related on-chain fund rails appear in more operational workflows, not just investor-facing wrappers. The fourth is competitive response. Franklin is not alone in digital assets, but this deal gives it a tighter narrative than many incumbents: research since 2018, a spot bitcoin ETF, a tokenized money fund, and now an institutional active-management arm."),
  textBlock("The question now is whether client demand is strong enough to turn that stack into durable fee revenue before the next crypto drawdown tests it. Franklin Templeton did not disclose the purchase price, but the strategic logic is already visible. The firm is building a crypto business that can manage passive exposure, active mandates, tokenized cash, and on-chain transaction rails in one house."),
  internalLinkBlock("related institutional crypto strategy stories", "/news/nyse-securitize-tokenized-securities-platform"),
];

// ── Full document ────────────────────────────────────────────────────────────

const DOCUMENT_ID = "franklin-templeton-250-digital-crypto";

const doc = {
  _id: `drafts.${DOCUMENT_ID}`,
  _type: "article",
  title: "Franklin Templeton Buys 250 Digital for Crypto Push",
  slug: { _type: "slug", current: "franklin-templeton-250-digital-crypto" },
  category: { _ref: "category-crypto-newswire", _type: "reference" },
  author: { _ref: "author-market-analyst", _type: "reference" },
  body,
  excerpt: "Franklin Templeton is buying 250 Digital and launching Franklin Crypto, a sign that active token strategies and on-chain deal rails are moving deeper into mainstream asset management.",
  seoDescription: "Franklin Templeton's 250 Digital acquisition shows how active crypto strategies and on-chain settlement are moving deeper into institutional finance.",
  publishedAt: "2026-04-04T12:00:00.000Z",
  featured: false,
  sponsored: false,
  noIndex: false,
  sources: [
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/technology/franklin-templeton-acquire-coinfund-spinoff-expand-crypto-push-2026-04-01/" },
    { _key: key(), label: "Franklin Templeton Press Release", url: "https://www.franklintempleton.com/press-releases/news-room/2026/franklin-templeton-agrees-to-acquire-liquid-strategies-from-coinfund-spinoff-launches-franklin-crypto" },
    { _key: key(), label: "Franklin Templeton Digital Assets", url: "https://www.franklintempleton.com/investments/asset-class/digital-assets" },
    { _key: key(), label: "Franklin OnChain U.S. Government Money Fund (FOBXX/BENJI)", url: "https://www.franklintempleton.com/investments/options/money-market-funds/products/29386/SINGLCLASS/franklin-on-chain-u-s-government-money-fund/FOBXX" },
  ],
};

const categoryDoc = {
  _id: "category-crypto-newswire",
  _type: "category",
  title: "Crypto Newswire",
  slug: { _type: "slug", current: "crypto-newswire" },
};

const authorDoc = {
  _id: "author-market-analyst",
  _type: "author",
  name: "Market Analyst",
  slug: { _type: "slug", current: "market-analyst" },
};

// ── Upload via Sanity HTTP Mutations API ─────────────────────────────────────

async function upload() {
  console.log(`\n📄  Document _id: ${doc._id}`);
  if (DRY_RUN) {
    console.log("── DRY RUN — full document JSON ──\n", JSON.stringify(doc, null, 2));
    return;
  }
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
  const mutations = [{ createIfNotExists: categoryDoc }, { createIfNotExists: authorDoc }, { createOrReplace: doc }];
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ mutations }),
  });
  const result = await res.json();
  if (!res.ok) { console.error("❌ Failed:\n", JSON.stringify(result, null, 2)); process.exit(1); }
  console.log("✅ Success!", JSON.stringify(result, null, 2));
}

upload().catch(console.error);