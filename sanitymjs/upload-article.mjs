/**
 * upload-resolv-infinite-mint-article.mjs
 *
 * Uploads only:
 * drafts.resolv-infinite-mint-stablecoin-security-failure
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

// Helpers

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

// Category and Author docs

const categoryDoc = {
  _id: "category-web3-fraud-files",
  _type: "category",
  title: "Web3 Fraud Files",
  slug: { _type: "slug", current: "web3-fraud-files" },
};
// Article

const article = {
  _id: "drafts.resolv-infinite-mint-stablecoin-security-failure",
  _type: "article",
  title:
    "Resolv Infinite Mint Exposed the Soft Underbelly of Stablecoin Issuance",
  slug: {
    _type: "slug",
    current: "resolv-infinite-mint-stablecoin-security-failure",
  },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-alex-carter", _type: "reference" },
  mainImage: {
    _type: "image",
    alt: "Resolv infinite mint exploit and stablecoin issuance failure article cover image",
  },

  body: [
    richTextBlock([
      "The infinite mint at Resolv Labs on March 22 was not a pricing glitch or a routine stablecoin wobble. It was a direct failure of issuance control: an attacker used a compromised privileged key to mint about 80 million unbacked USR and pull roughly $23 million to $25 million in value out of the system, a sequence that broke the peg within hours and turned a design assumption into a balance-sheet event. ",
      {
        text: "Chainalysis",
        href: "https://www.chainalysis.com/blog/lessons-from-the-resolv-hack/",
      },
      " and ",
      {
        text: "CoinDesk",
        href: "https://www.coindesk.com/markets/2026/03/23/resolv-stablecoin-drops-70-after-usd80-million-exploit-after-attacker-mints-usr",
      },
      " both framed the episode as a stablecoin crisis, but the deeper signal is about how much DeFi supply control still sits outside hard onchain limits.",
    ]),

    textBlock(
      "The infinite mint at Resolv was an authority failure, not a market accident",
      "h2",
    ),
    richTextBlock([
      "Resolv did not lose control because traders attacked a weak pool or because an oracle printed the wrong number. It lost control because the protocol’s mint path trusted a privileged actor to decide how much USR should exist, and the contract itself did not enforce a ceiling tied to collateral. ",
      {
        text: "Chainalysis’ incident write-up",
        href: "https://www.chainalysis.com/blog/lessons-from-the-resolv-hack/",
      },
      " says the attacker first got access to Resolv’s AWS KMS environment, then used the protocol’s SERVICE_ROLE key to authorize output amounts far beyond the deposited USDC. That distinction matters. A lot of incident coverage still separates smart contract risk from operational risk as if the second category is softer and somehow less structural. In practice, once a service role can finalize supply, offchain key custody becomes monetary policy. The issue is not just that a key was compromised. The issue is that a compromised key could still ask the contract to mint nonsense and receive a yes. That is why this story belongs in ",
      {
        text: "Web3 Fraud Files",
        href: "/categories/web3-fraud-files",
        blank: false,
      },
      " rather than in the narrower bucket of token volatility or market panic. The peg break was downstream. The source event was governance over issuance without onchain enforcement of the issuer’s own economic promise.",
    ]),

    textBlock(
      "USR’s off-chain settlement path turned a 1:1 promise into blind trust",
      "h2",
    ),
    richTextBlock([
      "Resolv’s own documentation marketed USR as an overcollateralized stablecoin that users could mint and redeem on a 1:1 basis for liquid collateral. The ",
      {
        text: "USR overview",
        href: "https://docs.resolv.xyz/litepaper/overview/usr",
      },
      " says the token can be minted and redeemed 1:1, while the ",
      {
        text: "mint documentation",
        href: "https://docs.resolv.xyz/litepaper/using-resolv/usr/mint",
      },
      " says USR is created by depositing liquid USD-neutral assets on a 1:1 value basis. Those statements read like hard economic rules. In operational terms, they were softer than they looked. Chainalysis describes a two-step process where users request a swap, then a privileged offchain service completes it and specifies the amount of USR to mint. The contract checked for authorized completion and a minimum output. It did not bind the output to the input with an onchain ratio check, an oracle guard, or a max mint ceiling. That gap turned a stablecoin promise into a trust assumption about a backend signer. Once that assumption broke, the 1:1 rule stopped being a rule and became a description of normal behavior. That is the real violence of an infinite mint. It does not just add fake supply. It reveals that the monetary constraint was social or operational all along. Builders watching similar role-based flows across issuance systems, treasuries, and wrappers should read this through the lens of ",
      {
        text: "Web3 Builder",
        href: "/categories/web3-builder",
        blank: false,
      },
      ", because the attack surface sits in system design, not just in contract syntax.",
    ]),

    textBlock(
      "Audits and allowlists did not bound issuance where it mattered",
      "h2",
    ),
    richTextBlock([
      "Resolv’s security page did not signal negligence in the lazy sense. The ",
      {
        text: "security documentation",
        href: "https://docs.resolv.xyz/litepaper/resources/security",
      },
      " lists allowlisted mint and redeem access, a public Immunefi bug bounty, and a long series of audits spanning token contracts, request managers, treasury components, staking logic, and the ExternalRequestsCoordinator. That stack tells you the team took formal review seriously. It also tells you where the standard playbook stops. Audits can validate code paths. They cannot rescue an architecture that leaves the core economic bound outside the contract. If the protocol says a dollar in should mean roughly a dollar out, then the contract needs to enforce that invariant or at least bracket it tightly. Resolv instead left the amount decision in the hands of a privileged service flow, which meant the control that mattered most was neither public nor credibly machine-bounded at settlement. This is why the case lands harder than a simple key compromise headline suggests. Key compromise happens. The system design decides whether that compromise becomes inconvenience, temporary pause, or immediate insolvency pressure. The market has started to price that distinction more aggressively, especially as large exploits move from exotic code bugs toward operator, signer, and backend failures that spill into broad trust damage across ",
      {
        text: "Crypto Newswire",
        href: "/categories/crypto-newswire",
        blank: false,
      },
      ".",
    ]),

    textBlock(
      "wstUSR conversion and thin liquidity turned fake supply into real losses",
      "h2",
    ),
    richTextBlock([
      "The attacker did not stop at minting unbacked USR. Chainalysis says the position was converted into wstUSR, then routed through stablecoin pools and into ETH, which made the exploit more than a supply distortion on paper. It became a liquidity extraction event. That route matters because it shows how wrappers and staking layers can act as shock absorbers for the attacker rather than for users. By shifting into wstUSR, the attacker moved from the token that would absorb the first impact of panic selling into a derivative that represented a claim on the staking pool, then cashed out through the market’s own conversion rails. The price data underscores how fast the damage hit. ",
      {
        text: "CoinGecko’s historical data",
        href: "https://www.coingecko.com/en/coins/resolv-usr/historical_data",
      },
      " shows USR near $0.9969 on March 21 and about $0.3022 on March 22, the day of the exploit. That is not a slow confidence bleed. That is a one-day repricing of whether the token’s supply discipline still meant anything. CoinDesk’s reporting also described a roughly 70% collapse after the attacker minted 80 million USR, reinforcing the point that the market did not wait for a postmortem. It priced the broken issuance model immediately. The lesson here is not that liquidity failed to save the peg. It is that liquidity became the exit path through which fabricated supply translated into hard losses for everyone else.",
    ]),

    textBlock(
      "Infinite mint is becoming a system design test for DeFi issuers",
      "h2",
    ),
    richTextBlock([
      "Rekt’s source brief chose infinite mint as the headline for a reason. The phrase captures a class of failure that still cuts through every layer of crypto sophistication. The exploit does not need a novel primitive, cross-chain complexity, or market-wide dislocation. It needs one trusted path to create assets without a hard bound. Resolv’s own docs describe USR as overcollateralized, redeemable, and supported by an insurance layer through RLP. Those features matter in normal operation. They do not matter enough when the creation function itself can exceed the collateral function. Once that happens, insurance becomes secondary and redemption logic becomes a queueing problem around a false numerator. This is why the attack should be read as a warning to every protocol that still uses service roles, coordinators, or backend signers to finalize issuance or withdrawal values. The next security premium in DeFi will go to systems that publish their offchain assumptions and reduce them where they can. Max mint caps, ratio checks, per-request ceilings, segmented keys, and fast pause conditions are no longer hardening extras. They are table stakes for anything that wants to present itself as money, quasi-money, or collateral-adjacent. The protocols that ignore that shift will keep discovering that fully collateralized means much less than users think when the contract does not enforce the phrase at the point of issuance.",
    ]),

    textBlock(
      "The next wave of post-Resolv changes will show up in supply operations before it shows up in token branding. Watch for protocols to bind privileged mint flows to hard ceilings, split service roles across narrower permissions, and publish clearer machine-enforced invariants around issuance and redemption.",
    ),

    textBlock(
      "This article is for informational purposes only and does not constitute financial or investment advice.",
    ),
  ],

  excerpt:
    "Resolv’s infinite mint exploit exposed how a compromised service role and weak issuance controls can turn a stablecoin backend into a balance-sheet failure.",
  seoDescription:
    "The Resolv infinite mint exploit shows how backend signer risk and weak issuance enforcement can break stablecoin supply discipline in hours.",
  publishedAt: "2026-04-08T16:00:00.000Z",
  featured: false,
  sponsored: false,
  noIndex: false,

  sources: [
    {
      _key: key(),
      label: "Chainalysis - Lessons from the Resolv Hack",
      url: "https://www.chainalysis.com/blog/lessons-from-the-resolv-hack/",
    },
    {
      _key: key(),
      label:
        "CoinDesk - Resolv Stablecoin Drops 70% After $80M Exploit After Attacker Mints USR",
      url: "https://www.coindesk.com/markets/2026/03/23/resolv-stablecoin-drops-70-after-usd80-million-exploit-after-attacker-mints-usr",
    },
    {
      _key: key(),
      label: "Resolv Docs - USR Overview",
      url: "https://docs.resolv.xyz/litepaper/overview/usr",
    },
    {
      _key: key(),
      label: "Resolv Docs - USR Mint",
      url: "https://docs.resolv.xyz/litepaper/using-resolv/usr/mint",
    },
    {
      _key: key(),
      label: "Resolv Docs - Security",
      url: "https://docs.resolv.xyz/litepaper/resources/security",
    },
    {
      _key: key(),
      label: "CoinGecko - Resolv USR Historical Data",
      url: "https://www.coingecko.com/en/coins/resolv-usr/historical_data",
    },
  ],
};

// Upload via Sanity HTTP Mutations API

async function upload() {
  console.log(`\nUploading article: ${article._id}\n`);

  if (DRY_RUN) {
    console.log("Document:", article._id, "-", article.title);
    console.log("\nDRY RUN - no mutations sent");
    console.log("Full JSON:\n", JSON.stringify(article, null, 2));
    return;
  }

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

  const mutations = [
    { createIfNotExists: categoryDoc },
    { createOrReplace: article },
  ];

  console.log(`Total mutations: ${mutations.length}`);

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
    console.error("Upload failed:\n", JSON.stringify(result, null, 2));
    process.exit(1);
  }

  console.log("Article uploaded successfully!");
}

upload().catch(console.error);
