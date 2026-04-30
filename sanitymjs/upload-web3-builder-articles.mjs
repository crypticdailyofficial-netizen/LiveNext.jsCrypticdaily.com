/**
 * upload-web3-builder-articles.mjs
 *
 * Uploads all 12 Web3 Builder articles to Sanity.
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

function imageBlock(altText = "Cryptic daily") {
  return {
    _key: key(),
    _type: "image",
    alt: altText,
  };
}

// ── Tags ─────────────────────────────────────────────────────────────────────

const allTags = [
  // Article 1 tags
  { _id: "tag-safenet-beta", _type: "tag", title: "Safenet Beta", slug: { _type: "slug", current: "safenet-beta" }, seoDescription: "Safenet Beta coverage on transaction attestation, validator design, staking incentives, and Safe's push to enforce wallet security onchain." },
  { _id: "tag-safe-token", _type: "tag", title: "SAFE Token", slug: { _type: "slug", current: "safe-token" }, seoDescription: "SAFE token news and analysis covering governance, staking, token utility, treasury decisions, market moves, and protocol-level incentives." },
  { _id: "tag-wallet-security", _type: "tag", title: "Wallet Security", slug: { _type: "slug", current: "wallet-security" }, seoDescription: "Wallet security stories covering smart account defense, phishing prevention, transaction checks, validator networks, and self-custody risk controls." },
  { _id: "tag-protocol-staking", _type: "tag", title: "Protocol Staking", slug: { _type: "slug", current: "protocol-staking" }, seoDescription: "Protocol staking coverage focused on validator incentives, delegation design, fee transitions, and how token security models work in production." },
  // Article 2 tags
  { _id: "tag-safe-wallet", _type: "tag", title: "Safe Wallet", slug: { _type: "slug", current: "safe-wallet" }, seoDescription: "Safe wallet news and analysis covering smart accounts, security architecture, protocol upgrades, developer tooling, and custody infrastructure." },
  { _id: "tag-transaction-security", _type: "tag", title: "Transaction Security", slug: { _type: "slug", current: "transaction-security" }, seoDescription: "Transaction security stories covering pre-execution checks, validator attestations, phishing resistance, wallet controls, and onchain enforcement." },
  { _id: "tag-safe-staking", _type: "tag", title: "SAFE Staking", slug: { _type: "slug", current: "safe-staking" }, seoDescription: "SAFE staking coverage tracking validator design, delegation, reward mechanics, token utility, and SafeDAO-funded security incentives." },
  { _id: "tag-smart-account-security", _type: "tag", title: "Smart Account Security", slug: { _type: "slug", current: "smart-account-security" }, seoDescription: "Smart account security coverage for guards, modules, fallback handlers, policy enforcement, and protocol-level wallet defenses in Web3." },
  // Article 3 tags
  { _id: "tag-bitcoin-wallet-backups", _type: "tag", title: "Bitcoin Wallet Backups", slug: { _type: "slug", current: "bitcoin-wallet-backups" }, seoDescription: "Bitcoin wallet backup coverage focused on recovery formats, encrypted exports, descriptor portability, metadata standards, and wallet migration safety." },
  { _id: "tag-descriptor-wallets", _type: "tag", title: "Descriptor Wallets", slug: { _type: "slug", current: "descriptor-wallets" }, seoDescription: "Descriptor wallet stories covering output descriptors, wallet policies, interoperability, signing flows, and modern Bitcoin wallet architecture." },
  { _id: "tag-psbt-standards", _type: "tag", title: "PSBT Standards", slug: { _type: "slug", current: "psbt-standards" }, seoDescription: "PSBT standards coverage tracking transaction portability, signer compatibility, multisig tooling, and proposal updates for Bitcoin wallet builders." },
  { _id: "tag-bitcoin-wallet-interoperability", _type: "tag", title: "Bitcoin Wallet Interoperability", slug: { _type: "slug", current: "bitcoin-wallet-interoperability" }, seoDescription: "Bitcoin wallet interoperability news on exports, imports, backup standards, descriptors, labels, and cross-wallet recovery design." },
  { _id: "tag-bitcoin-dev-proposals", _type: "tag", title: "Bitcoin Dev Proposals", slug: { _type: "slug", current: "bitcoin-dev-proposals" }, seoDescription: "Bitcoin developer proposal coverage spanning draft BIPs, wallet standards, relay changes, script upgrades, and infrastructure design debates." },
  // Article 4 tags
  { _id: "tag-lightning-splicing", _type: "tag", title: "Lightning Splicing", slug: { _type: "slug", current: "lightning-splicing" }, seoDescription: "Lightning splicing coverage on channel resize flows, liquidity management, cross-splice tooling, and the protocol changes entering the BOLTs." },
  { _id: "tag-lightning-bolts", _type: "tag", title: "Lightning BOLTs", slug: { _type: "slug", current: "lightning-bolts" }, seoDescription: "Lightning BOLTs stories tracking specification changes, interoperability rules, test vectors, and protocol updates that affect node operators and builders." },
  { _id: "tag-core-lightning", _type: "tag", title: "Core Lightning", slug: { _type: "slug", current: "core-lightning" }, seoDescription: "Core Lightning coverage on node releases, new RPCs, liquidity tooling, routing updates, and implementation changes for Lightning operators." },
  { _id: "tag-lightning-liquidity", _type: "tag", title: "Lightning Liquidity", slug: { _type: "slug", current: "lightning-liquidity" }, seoDescription: "Lightning liquidity coverage on channel management, rebalancing, splice-in and splice-out flows, fee design, and routing capital efficiency." },
  { _id: "tag-bitcoin-infrastructure", _type: "tag", title: "Bitcoin Infrastructure", slug: { _type: "slug", current: "bitcoin-infrastructure" }, seoDescription: "Bitcoin infrastructure stories covering node software, wallet standards, Lightning protocol upgrades, relay policy, and production tooling for builders." },
  // Article 5 tags
  { _id: "tag-erc-8004", _type: "tag", title: "ERC-8004", slug: { _type: "slug", current: "erc-8004" }, seoDescription: "ERC-8004 coverage for builders tracking agent identity, reputation registries, validation design, mainnet deployments, and cross-protocol integrations." },
  { _id: "tag-agent-identity", _type: "tag", title: "Agent Identity", slug: { _type: "slug", current: "agent-identity" }, seoDescription: "Agent identity stories covering onchain registries, discovery standards, portable service endpoints, ownership proofs, and machine-readable trust data." },
  { _id: "tag-agent-reputation", _type: "tag", title: "Agent Reputation", slug: { _type: "slug", current: "agent-reputation" }, seoDescription: "Agent reputation coverage on feedback registries, scoring models, attestations, portable trust signals, and open marketplace coordination." },
  { _id: "tag-agentic-commerce", _type: "tag", title: "Agentic Commerce", slug: { _type: "slug", current: "agentic-commerce" }, seoDescription: "Agentic commerce coverage focused on agent payments, escrow flows, evaluator hooks, reputation-aware policies, and machine-to-machine marketplaces." },
  { _id: "tag-ethereum-ai-agents", _type: "tag", title: "Ethereum AI Agents", slug: { _type: "slug", current: "ethereum-ai-agents" }, seoDescription: "Ethereum AI agent stories covering trust standards, registry infrastructure, validation models, and production tooling for open agent economies." },
  // Article 6 tags
  { _id: "tag-onchain-market-design", _type: "tag", title: "Onchain Market Design", slug: { _type: "slug", current: "onchain-market-design" }, seoDescription: "Onchain market design coverage focused on execution rules, transaction inclusion, auction mechanics, censorship resistance, and builder tradeoffs." },
  { _id: "tag-defi-infrastructure", _type: "tag", title: "DeFi Infrastructure", slug: { _type: "slug", current: "defi-infrastructure" }, seoDescription: "DeFi infrastructure stories covering trading rails, settlement design, execution layers, MEV constraints, and protocol primitives for builders." },
  { _id: "tag-transaction-inclusion", _type: "tag", title: "Transaction Inclusion", slug: { _type: "slug", current: "transaction-inclusion" }, seoDescription: "Transaction inclusion coverage on block construction, censorship resistance, ordering guarantees, leader design, and low-latency chain architecture." },
  { _id: "tag-onchain-trading", _type: "tag", title: "Onchain Trading", slug: { _type: "slug", current: "onchain-trading" }, seoDescription: "Onchain trading stories covering order books, auctions, latency, execution quality, liquidity provision, and infrastructure for serious markets." },
  { _id: "tag-mev-research", _type: "tag", title: "MEV Research", slug: { _type: "slug", current: "mev-research" }, seoDescription: "MEV research coverage on proposer power, order flow privacy, censorship risk, transaction ordering, and market structure in crypto systems." },
  // Article 7 tags
  { _id: "tag-tokenized-securities", _type: "tag", title: "Tokenized Securities", slug: { _type: "slug", current: "tokenized-securities" }, seoDescription: "Tokenized securities coverage on exchanges, settlement rails, digital share issuance, tokenized funds, and market-structure changes in capital markets." },
  { _id: "tag-institutional-tokenization", _type: "tag", title: "Institutional Tokenization", slug: { _type: "slug", current: "institutional-tokenization" }, seoDescription: "Institutional tokenization stories covering exchanges, clearinghouses, custody, settlement, and how major financial firms are moving assets onchain." },
  { _id: "tag-capital-markets-infrastructure", _type: "tag", title: "Capital Markets Infrastructure", slug: { _type: "slug", current: "capital-markets-infrastructure" }, seoDescription: "Capital markets infrastructure coverage on trading venues, clearing, settlement, collateral mobility, and the technology stack behind financial markets." },
  { _id: "tag-tokenized-treasuries", _type: "tag", title: "Tokenized Treasuries", slug: { _type: "slug", current: "tokenized-treasuries" }, seoDescription: "Tokenized Treasuries coverage on fund launches, collateral use, settlement rails, issuer growth, and how government debt is moving onchain." },
  { _id: "tag-onchain-finance-rails", _type: "tag", title: "Onchain Finance Rails", slug: { _type: "slug", current: "onchain-finance-rails" }, seoDescription: "Onchain finance rails coverage on settlement design, middleware, compliance tooling, tokenized deposits, and infrastructure for regulated financial markets." },
  // Article 8 tags
  { _id: "tag-stablecoin-clearing", _type: "tag", title: "Stablecoin Clearing", slug: { _type: "slug", current: "stablecoin-clearing" }, seoDescription: "Stablecoin clearing coverage on issuer interoperability, conversion rails, settlement design, treasury workflows, and business payment infrastructure." },
  { _id: "tag-stablecoin-payments", _type: "tag", title: "Stablecoin Payments", slug: { _type: "slug", current: "stablecoin-payments" }, seoDescription: "Stablecoin payments stories covering cross-border settlement, treasury operations, payment networks, issuer fragmentation, and enterprise adoption." },
  { _id: "tag-payment-infrastructure", _type: "tag", title: "Payment Infrastructure", slug: { _type: "slug", current: "payment-infrastructure" }, seoDescription: "Payment infrastructure coverage on clearing layers, settlement rails, money movement software, interoperability, and financial plumbing built on crypto." },
  { _id: "tag-treasury-operations", _type: "tag", title: "Treasury Operations", slug: { _type: "slug", current: "treasury-operations" }, seoDescription: "Treasury operations stories covering liquidity movement, corporate cash management, stablecoin conversion, settlement speed, and payment workflow design." },
  { _id: "tag-stablecoin-interoperability", _type: "tag", title: "Stablecoin Interoperability", slug: { _type: "slug", current: "stablecoin-interoperability" }, seoDescription: "Stablecoin interoperability coverage on issuer fungibility, cross-chain and cross-issuer settlement, conversion mechanics, and clearinghouse models." },
  // Article 9 tags
  { _id: "tag-cirbtc", _type: "tag", title: "cirBTC", slug: { _type: "slug", current: "cirbtc" }, seoDescription: "cirBTC coverage tracking Circle's wrapped bitcoin product, reserve design, launch plans, multichain rollout, and institutional DeFi positioning." },
  { _id: "tag-wrapped-bitcoin", _type: "tag", title: "Wrapped Bitcoin", slug: { _type: "slug", current: "wrapped-bitcoin" }, seoDescription: "Wrapped Bitcoin stories covering BTC-backed tokens, reserve transparency, redemption models, market competition, and Bitcoin liquidity in DeFi." },
  { _id: "tag-bitcoin-defi-infrastructure", _type: "tag", title: "Bitcoin DeFi Infrastructure", slug: { _type: "slug", current: "bitcoin-defi-infrastructure" }, seoDescription: "Bitcoin DeFi infrastructure coverage on tokenized BTC rails, institutional market access, lending integrations, and cross-chain liquidity design." },
  { _id: "tag-circle-products", _type: "tag", title: "Circle Products", slug: { _type: "slug", current: "circle-products" }, seoDescription: "Circle product coverage tracking USDC, EURC, Circle Mint, Arc, CPN, and new infrastructure launches across trading and payments." },
  { _id: "tag-tokenized-bitcoin-markets", _type: "tag", title: "Tokenized Bitcoin Markets", slug: { _type: "slug", current: "tokenized-bitcoin-markets" }, seoDescription: "Tokenized bitcoin market coverage on wrapped BTC issuers, market-share shifts, reserve models, and competition for Bitcoin liquidity onchain." },
  // Article 10 tags
  { _id: "tag-hyperliquid-mobile-app", _type: "tag", title: "Hyperliquid Mobile App", slug: { _type: "slug", current: "hyperliquid-mobile-app" }, seoDescription: "Hyperliquid mobile app coverage on Android rollout, feature updates, trading UX, native app strategy, and product expansion for active traders." },
  { _id: "tag-hyperliquid", _type: "tag", title: "Hyperliquid", slug: { _type: "slug", current: "hyperliquid" }, seoDescription: "Hyperliquid stories covering app launches, trading infrastructure, HyperEVM, product updates, liquidity design, and platform strategy." },
  { _id: "tag-mobile-trading-infrastructure", _type: "tag", title: "Mobile Trading Infrastructure", slug: { _type: "slug", current: "mobile-trading-infrastructure" }, seoDescription: "Mobile trading infrastructure coverage on native exchange apps, alerts, execution UX, wallet flows, and on-the-go trading product design." },
  { _id: "tag-perpetuals-trading", _type: "tag", title: "Perpetuals Trading", slug: { _type: "slug", current: "perpetuals-trading" }, seoDescription: "Perpetuals trading coverage on exchange UX, order types, collateral models, derivatives access, and infrastructure shaping crypto trading venues." },
  { _id: "tag-defi-product-strategy", _type: "tag", title: "DeFi Product Strategy", slug: { _type: "slug", current: "defi-product-strategy" }, seoDescription: "DeFi product strategy stories on app distribution, interface control, user retention, mobile adoption, and vertical integration in onchain trading." },
  // Article 11 tags
  { _id: "tag-meta-stablecoin-payments", _type: "tag", title: "Meta Stablecoin Payments", slug: { _type: "slug", current: "meta-stablecoin-payments" }, seoDescription: "Meta stablecoin payments coverage on WhatsApp, Instagram, creator payouts, partner infrastructure, and the company's post-Diem crypto strategy." },
  { _id: "tag-stablecoin-payments-infrastructure", _type: "tag", title: "Stablecoin Payments Infrastructure", slug: { _type: "slug", current: "stablecoin-payments-infrastructure" }, seoDescription: "Stablecoin payments infrastructure stories covering issuers, orchestration layers, regulated settlement rails, and enterprise payment integrations." },
  { _id: "tag-cross-border-creator-payouts", _type: "tag", title: "Cross-Border Creator Payouts", slug: { _type: "slug", current: "cross-border-creator-payouts" }, seoDescription: "Cross-border creator payouts coverage on stablecoin rails, platform payments, fee reduction, settlement speed, and global monetization infrastructure." },
  { _id: "tag-stripe-bridge", _type: "tag", title: "Stripe Bridge", slug: { _type: "slug", current: "stripe-bridge" }, seoDescription: "Stripe Bridge coverage on stablecoin orchestration, enterprise issuance, payment APIs, trust-bank ambitions, and digital dollar infrastructure." },
  { _id: "tag-diem-aftermath", _type: "tag", title: "Diem Aftermath", slug: { _type: "slug", current: "diem-aftermath" }, seoDescription: "Diem aftermath stories covering how Meta's failed stablecoin bid still shapes platform payment strategy, regulation, and partner-led crypto integration." },
  // Article 12 tags
  { _id: "tag-tokenized-deposits", _type: "tag", title: "Tokenized Deposits", slug: { _type: "slug", current: "tokenized-deposits" }, seoDescription: "Tokenized deposit coverage on commercial bank money onchain, settlement design, interoperability, regulation, and bank-led digital cash infrastructure." },
  { _id: "tag-european-bank-tokenization", _type: "tag", title: "European Bank Tokenization", slug: { _type: "slug", current: "european-bank-tokenization" }, seoDescription: "European bank tokenization stories covering deposit tokens, settlement rails, capital markets pilots, and how banks are building onchain cash products." },
  { _id: "tag-digital-money-infrastructure", _type: "tag", title: "Digital Money Infrastructure", slug: { _type: "slug", current: "digital-money-infrastructure" }, seoDescription: "Digital money infrastructure coverage on stablecoins, tokenized deposits, central bank money, interoperability, and payment architecture for builders." },
  { _id: "tag-tokenized-settlement-assets", _type: "tag", title: "Tokenized Settlement Assets", slug: { _type: "slug", current: "tokenized-settlement-assets" }, seoDescription: "Tokenized settlement asset stories covering commercial bank money, stablecoins, wholesale settlement, and the plumbing for tokenized markets." },
  { _id: "tag-european-payments-rails", _type: "tag", title: "European Payments Rails", slug: { _type: "slug", current: "european-payments-rails" }, seoDescription: "European payments rail coverage on digital euro policy, bank-led payment networks, tokenized deposits, and competition with dollar stablecoins." },
];

// ── Categories & Authors ─────────────────────────────────────────────────────

const categoryDoc = {
  _id: "category-web3-builder",
  _type: "category",
  title: "Web3 Builder",
  slug: { _type: "slug", current: "web3-builder" },
};

const authorDeveloperJournalist = {
  _id: "author-developer-journalist",
  _type: "author",
  name: "Developer Journalist",
  slug: { _type: "slug", current: "developer-journalist" },
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 1: Safe Safenet Beta Gives SAFE Token a Security Role
// ══════════════════════════════════════════════════════════════════════════════

const article1 = {
  _id: "drafts.safenet-beta-safe-token-utility",
  _type: "article",
  title: "Safe Safenet Beta Gives SAFE Token a Security Role",
  slug: { _type: "slug", current: "safenet-beta-safe-token-utility" },
  category: { _ref: "category-web3-builder", _type: "reference" },
  author: { _ref: "author-developer-journalist", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("Safe's Safenet Beta is live, but the part that would turn the SAFE token into a working security asset still needs DAO approval. On April 2, Safe entities published SEP-55, asking SafeDAO to commit 5 million SAFE over six months to reward validators and delegators while Safenet Beta tests protocol-level wallet security."),
    textBlock("What Safe is actually asking DAO voters to approve", "h2"),
    textBlock("According to the SEP-55 draft posted on the Safe Community Forum, the proposal would move 5,000,000 SAFE from the SafeDAO treasury to the Safe Ecosystem Foundation for a tightly scoped six-month program, with 4.5 million SAFE reserved for staking rewards and 0.5 million SAFE earmarked for an open request-for-proposals process for third-party staking interfaces. That split is the first clue about what Safe is really trying to fund. This is not only a validator subsidy. It is also an attempt to prevent the staking layer from depending on a single front end, because the proposal itself says the current interface operated by Core Contributors creates centralization, operational dependency, and single-point-of-failure risk. The request also arrives after SafeDAO paused broader resource allocation under SEP-54, so SEP-55 is framed as a narrow exception rather than a reopening of the treasury pipeline. That gives the vote a sharper meaning than a routine incentives package. Safe is asking whether token holders will pay to bootstrap protocol infrastructure before transaction-fee revenue exists."),
    linkBlock("SEP-55 governance proposal", "https://forum.safefoundation.org/t/sep-55-phase-1-fund-safenet-beta-for-safe-token-utility/6967"),
    textBlock("Why Safenet Beta matters for SAFE token utility", "h2"),
    textBlock("The core claim behind SEP-55 is that Safenet Beta gives SAFE its first live economic role beyond governance. Safe's proposal and documentation describe Safenet as an onchain transaction-security layer where validators inspect proposed Safe transactions, produce cryptographic attestations when those transactions pass deterministic checks, and rely on a Safe Guard to verify those attestations before execution. If a transaction fails the protocol's requirements and an owner still wants to proceed, Safe says that can happen only with explicit additional approval after a time delay. That architecture pushes SAFE closer to a network-security asset than a governance token attached to a smart-account brand. The token is being positioned as economic backing for a validator network that is supposed to make transaction checking auditable, harder to bypass through phishing or compromised interfaces, and eventually funded by usage rather than emissions. That is why this matters now. If the DAO funds the bridge from beta to fee-backed security, SAFE utility becomes operational. If it does not, the token-utility thesis stays mostly theoretical."),
    linkBlock("Safenet overview", "https://docs.safefoundation.org/safenet/overview/introduction"),
    internalLinkBlock("Web3 Builder coverage", "/categories/web3-builder"),
    textBlock("How Safenet Beta works in production today", "h2"),
    textBlock("Safenet Beta launches with a small permissioned validator set and a deliberately narrow security scope. SEP-55 says six validators currently anchor the network: Gnosis, Core Contributors, Greenfield, Safe Labs, Rockaway, and Blockchain Capital, and each one must maintain a minimum self-stake of 3.5 million SAFE to stay eligible for rewards. Safe's docs explain that validators are not making subjective risk calls in the beta. They attest to deterministic rules where every honest validator should reach the same outcome from the same transaction data. The proposal lists the current static checks: blocking unexpected delegatecalls, allowing upgrades only to trusted Safe singleton contracts, and restricting which modules, fallback handlers, and guards can be added. Safe's docs also say the network tolerates up to one-third of validators acting dishonestly while still preserving correct attestations through Byzantine fault tolerance. That is a serious architectural claim, but beta status still matters. Safe is testing whether validators can stay online, process checks reliably, and create an enforceable security layer before it opens the design to broader participation and more context-sensitive rules."),
    linkBlock("Safenet validators and onchain enforcement overview", "https://docs.safefoundation.org/safenet/overview/introduction"),
    textBlock("The trade-off: stronger token utility, weaker decentralization", "h2"),
    textBlock("SEP-55 is technically ambitious, but it is not trustless in its current form. The validator set is permissioned, the first operators were selected rather than permissionlessly elected, and Safe's docs say slashing is not yet active. That leaves delegators and users with a concentrated trust surface even as Safe argues it is moving away from centralized wallet warning services. The reward design tries to manage that tension without pretending it has already solved it. Safe's rewards docs say validators below a 75% participation threshold generate no rewards for themselves or their delegators during that period, validators take a fixed 5% commission on delegated rewards, and reward growth is penalized once a validator's stake becomes too large relative to the network average. The staking system also slows exits. Safe's lock-up docs set a mandatory two-day waiting period before unstaked SAFE can be withdrawn, and say any future increase must be announced seven days in advance and can never exceed seven days under the current contract. Those are sensible guardrails for a beta. They also show how much of the current model still depends on governance-set parameters rather than open-market equilibrium."),
    linkBlock("Safenet staking rewards design", "https://docs.safefoundation.org/safenet/staking/rewards"),
    internalLinkBlock("wallet security stories", "/tags/wallet-security"),
    textBlock("What builders and SAFE holders should watch next", "h2"),
    textBlock("The real test is not whether Safenet sounds compelling. It is whether it becomes part of normal wallet execution. SEP-55 says the purpose of the six-month subsidy is to prove that validator participation can be measured and enforced, that onchain attestations are reliably visible, and that SAFE staking can bootstrap enough economic security to matter. Builders should focus on integrator demand and front-end diversity, because the proposal includes 500,000 SAFE for an open RFP precisely because one staking interface is not enough for a network that wants to call itself resilient. SAFE holders should watch whether delegation spreads across validators or clusters around a few familiar names, and governance participants should watch what happens after the six-month window. Safe's stated long-term aim is for users and wallet operators to fund security through fees. If that demand appears, Safenet starts to look like real protocol infrastructure. If it does not, the DAO will have to decide whether it funded a bridge to sustainable utility or just the first extension of a subsidy cycle."),
    linkBlock("Safenet lock-up periods", "https://docs.safefoundation.org/safenet/staking/lockup"),
    internalLinkBlock("SAFE token archive", "/tags/safe-token"),
    textBlock("Safe has finally moved the SAFE token utility debate out of governance theory and into a live production test. The next milestone is simple to state and hard to fake: whether users and integrators will pay for enforced wallet security once the treasury support runs out."),
  ],
  excerpt: "Safe wants its token to do more than vote. SEP-55 would fund Safenet Beta rewards and test whether onchain wallet security can support a real staking economy while the network remains permissioned.",
  seoDescription: "Safe's Safenet Beta asks DAO voters to fund 5M SAFE in rewards, testing whether staking can turn wallet security into real token utility for holders.",
  publishedAt: "2026-04-05T10:35:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Safe Community Forum", url: "https://forum.safefoundation.org/t/sep-55-phase-1-fund-safenet-beta-for-safe-token-utility/6967" },
    { _key: key(), label: "Safe Docs: Overview", url: "https://docs.safefoundation.org/safenet/overview/introduction" },
    { _key: key(), label: "Safe Docs: Rewards", url: "https://docs.safefoundation.org/safenet/staking/rewards" },
    { _key: key(), label: "Safe Docs: Lock-up periods", url: "https://docs.safefoundation.org/safenet/staking/lockup" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 2: Safenet Beta Puts Wallet Defense Into Execution
// ══════════════════════════════════════════════════════════════════════════════

const article2 = {
  _id: "drafts.safenet-beta-wallet-defense",
  _type: "article",
  title: "Safenet Beta Puts Wallet Defense Into Execution",
  slug: { _type: "slug", current: "safenet-beta-wallet-defense" },
  category: { _ref: "category-web3-builder", _type: "reference" },
  author: { _ref: "author-developer-journalist", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("Bankless called Safenet Beta \"crypto's new defense protocol,\" but the real significance is narrower and more useful: Safe is trying to move wallet security out of warning banners and into the execution path itself. Safe launched Safenet Beta on April 2 at EthCC, with staking live and a separate DAO proposal asking for 5 million SAFE to subsidize validator rewards for six months."),
    textBlock("What Safenet Beta actually built", "h2"),
    textBlock("Safenet Beta is a transaction-security network for Safe accounts. When a transaction is proposed, validators check it against predefined rules and produce cryptographic attestations if it passes. A Safe Guard then verifies those attestations onchain before execution. Without a valid attestation, the transaction does not proceed. That is the key architectural shift. Most wallet security tooling today still depends on interfaces, simulations, warnings, and user judgment. Safenet tries to make the security check part of the transaction's execution requirements rather than a suggestion shown before signing. Safe Foundation described the launch as the first live economic role for SAFE beyond governance, while Bankless framed it as a defense layer designed for the part of crypto security that increasingly breaks at the human and interface level."),
    textBlock("The current beta is intentionally narrow. Bankless reported that the system launches with five baseline checks, including blocking unauthorized delegatecalls, restricting upgrades to trusted contracts, and limiting which modules, fallback handlers, and guards can be installed. Those constraints line up with how many high-value wallet compromises actually happen: not through brute-force failures in core contracts, but through transactions that look normal in a UI while quietly changing account permissions, execution paths, or upgrade targets. Safe's own launch materials say the design is meant to replace centralized warning systems and offchain heuristics with onchain attestations. That makes the product less about generic fraud detection and more about hardening a Safe account's execution environment itself."),
    textBlock("Why this matters more than another wallet warning layer", "h2"),
    textBlock("The strongest case for Safenet Beta is not that crypto needs more alerts. It is that alerts have already hit their limits. Safe's July 2025 strategy update said the project intentionally pivoted away from cross-chain abstraction and toward protocol-level self-custody security after concluding that security had become the real bottleneck. In that post, Safe pointed to recent self-custody incidents and argued that users were still being asked to verify too much on their own: transaction intent, counterparty checks, policy setup, and execution safeguards. That shift is now visible in product form."),
    textBlock("This is also why the Bankless framing lands, even if the brief itself is thin on sourcing. The useful idea is that transaction integrity is becoming its own infrastructure layer. If a compromised interface can present a malicious transaction in a way that looks benign, then stronger simulations or better UX only go so far. Safenet's model assumes the interface may fail and pushes validation into a network of independent validators. That does not eliminate risk, but it changes where the risk sits. Builders working on treasury tooling, DAO controls, and high-value signer flows should care because this is closer to protocol-enforced policy than to a wallet plugin."),
    internalLinkBlock("Web3 Builder coverage", "/categories/web3-builder"),
    textBlock("How the validator network and staking model work", "h2"),
    textBlock("Safenet Beta is not permissionless yet. The governance proposal and supporting materials say the beta starts with six permissioned validators: Greenfield, Gnosis, Safe Labs, Rockaway, Blockchain Capital, and Core Contributors GmbH. Each validator must maintain at least 3.5 million SAFE to remain eligible for rewards. Delegators can stake SAFE to those validators without running infrastructure themselves, while validators take a fixed 5% commission on delegator rewards. Rewards are also gated by performance: validators below a 75% participation threshold receive no rewards."),
    textBlock("That design says a lot about the stage this network is in. Safe is not pretending decentralization is solved on day one. It is using a permissioned set to test whether validators can reliably process transaction checks at scale and whether participation can be measured and enforced through incentives. The proposal says the six-month subsidy is meant to prove both technical reliability and economic viability before later phases add slashing, more advanced checks, and fee-funded sustainability. Safe's public launch page also notes that staking rewards remain pending SafeDAO approval under SEP-55 and that later phases are supposed to introduce slashing and fee-based rewards."),
    internalLinkBlock("SAFE staking archive", "/tags/safe-staking"),
    textBlock("The real trade-off is enforceability versus decentralization", "h2"),
    textBlock("The best argument against overhyping Safenet Beta is simple: this is still a controlled beta with treasury-funded incentives. The same proposal that gives SAFE a live security role also admits the validator set is selected, not open, and that there is no immediate fee income offsetting the 5 million SAFE subsidy. It explicitly flags centralization, validator underperformance, and fee-transition risk as real concerns. If adoption does not produce enough organic demand after six months, SafeDAO may face pressure to extend subsidies. That is not a theoretical governance footnote. It is the core business-model question behind the whole launch."),
    textBlock("Still, there is a reason to take the experiment seriously. Safe says its protocol has processed more than $1 trillion in cumulative transfers. Even if that figure is cumulative rather than current TVL, it points to the scale of flows that move through Safe accounts and the size of the security surface the team is trying to protect. If Safenet can make transaction-policy enforcement auditable and hard to bypass for even a meaningful slice of that flow, it would mark a more consequential product shift than another wallet feature release."),
    internalLinkBlock("transaction security stories", "/tags/transaction-security"),
    textBlock("What builders should watch next", "h2"),
    textBlock("The next milestone is not the launch event. It is whether Safenet becomes a habit inside products that already route value through Safe accounts. Builders should watch three things. First, whether integrators adopt the Guard-and-attestation model rather than treating it as an optional extra. Second, whether delegation spreads broadly or clusters around the best-known genesis operators. Third, whether Safe can move from subsidy-backed staking to fee-backed security without blunting participation. The proposal says reward accounting would start retroactively from April 7, 2026 if approved, making the coming governance window the first real checkpoint for whether token holders want to finance this path."),
    textBlock("There is also a deeper product question. If Safe succeeds, other smart account and wallet stacks will have to answer whether transaction security should remain an interface feature or become part of the protocol path. Safenet Beta does not settle that debate yet. But it does make one thing harder to ignore: crypto's next security upgrade may look less like another dashboard warning and more like a validator-enforced rule set that sits between \"sign\" and \"execute.\""),
  ],
  excerpt: "Safe's Safenet Beta is trying to make wallet defense enforceable, not advisory. The bigger bet is that transaction security can become a protocol primitive and a real job for the SAFE token.",
  seoDescription: "Safenet Beta moves wallet defense onchain with validator attestations, testing whether Safe can turn transaction security into protocol infrastructure.",
  publishedAt: "2026-04-05T10:48:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Bankless", url: "https://www.bankless.com/read/cryptos-new-defense-protocol" },
    { _key: key(), label: "Safe Community Forum", url: "https://forum.safefoundation.org/t/sep-55-phase-1-fund-safenet-beta-for-safe-token-utility/6967" },
    { _key: key(), label: "Safe Foundation", url: "https://www.globenewswire.com/news-release/2026/4/2/3267250/0/en/Safe-Launches-Safenet-Beta-Giving-SAFE-Token-Holders-a-Role-in-Network-Security.html" },
    { _key: key(), label: "Safe Foundation Blog", url: "https://safefoundation.org/blog/safenet-update-open-sourcing-our-work" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 3: Bitcoin Wallet Backup Format Targets Safer Migration
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle3() {
  return {
    _id: "drafts.bitcoin-wallet-backup-format",
    _type: "article",
    title: "Bitcoin Wallet Backup Format Targets Safer Migration",
    slug: { _type: "slug", current: "bitcoin-wallet-backup-format" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("Bitcoin wallets have standardized seeds, descriptors, and labels in pieces, but they still lack a common way to export the full context needed to restore a modern wallet cleanly. Bitcoin Optech's April 3 newsletter highlighted a new draft BIP for a Bitcoin wallet backup format that would package descriptors, keys, labels, PSBTs, and related metadata into a single structured export."),
      textBlock("What the proposed Bitcoin wallet backup format actually does", "h2"),
      textBlock("According to Bitcoin Optech, the draft proposal was introduced by pythcoiner on the Bitcoin-Dev mailing list as a common structure for wallet backup metadata. Optech says the format is designed as a UTF-8 encoded text file containing one valid JSON object, with optional fields for account descriptors, keys, labels, PSBTs, and other wallet data. The draft BIP itself describes the idea as an encrypted backup scheme for Bitcoin wallet-related metadata, which matters because today's backup flows often split wallet state across several incompatible exports or device-specific files."),
      textBlock("That design is more ambitious than another seed-export shortcut. Modern Bitcoin wallets increasingly depend on descriptor data to define how funds are derived and spent. BIP 380 formalizes output script descriptors as a general language for expressing collections of output scripts, while BIP 388 defines wallet policies for descriptor wallets as a way to package descriptor templates and key information together. A portable backup that does not carry this context can restore keys without restoring the wallet's actual spending logic. That is the failure mode the new proposal is trying to close."),
      textBlock("Why seed phrases are no longer enough for serious wallet portability", "h2"),
      textBlock("The builder problem here is not theoretical. A mnemonic can regenerate seed material, but it does not necessarily preserve script type, multisig policy, labels, partially signed transaction state, or wallet-specific metadata needed for a full recovery across implementations. That gap is exactly why the Optech write-up frames the proposal as a compatibility and migration tool rather than a convenience feature. In practice, wallet teams have spent years creating partial standards around labels and transaction construction while leaving complete cross-wallet recovery fragmented."),
      textBlock("BIP 329 already specifies an export format for wallet labels, but only for labels. BIP 174 defines the PSBT format for transaction handoff between software and signers, and BIP 370 extends PSBT so inputs and outputs can be modified after creation. Those standards solve real portability problems, yet none of them alone describe a wallet as a recoverable product. A Bitcoin wallet backup format would sit above those components and turn them into a coherent export surface. For wallet builders, that means fewer restore edge cases, less brittle migrations, and a clearer contract between software vendors."),
      internalLinkBlock("Web3 Builder coverage", "/categories/web3-builder"),
      textBlock("How the draft fits into Bitcoin's descriptor-first direction", "h2"),
      textBlock("The proposal also fits a broader shift in Bitcoin wallet architecture. Descriptor wallets have moved the stack away from opaque wallet internals and toward explicit spending definitions that different tools can understand. BIP 380 defines the descriptor language itself, while BIP 387 extends that framework to tapscript multisig, showing how descriptor-based design continues to absorb newer Bitcoin features rather than remaining a niche implementation detail. The more Bitcoin wallets rely on descriptors, taproot trees, wallet policies, and PSBT workflows, the harder it becomes to pretend that a seed phrase alone is a complete backup story."),
      textBlock("This is where the draft BIP could become useful even before standardization is complete. If wallets begin converging around a shared JSON structure for encrypted metadata, the result is not only better recovery. It also improves auditability and vendor interoperability. A user moving from one descriptor wallet to another should not need to reconstruct labels manually, guess derivation assumptions, or lose unsigned transaction state along the way. For institutions, multisig coordinators, and hardware-integrated stacks, that matters more than a nicer export button."),
      internalLinkBlock("descriptor wallet stories", "/tags/descriptor-wallets"),
      textBlock("What wallet builders should watch before adopting it", "h2"),
      textBlock("The draft is still early, and that matters. The GitHub pull request is marked draft, and the visible discussion is thin so far, with one early comment asking how it relates to an earlier proposal. That means builders should treat this as directionally important but not ready for blind implementation. The core questions now are whether the format stays JSON-based, how encryption and key handling are specified, how optional fields are normalized across wallet types, and whether major wallet maintainers agree on what minimum viable interoperability actually requires."),
      textBlock("There is also a design tension that will decide whether the standard succeeds. A backup format that is too narrow becomes another partial export spec. One that is too broad risks becoming difficult to implement consistently across simple single-sig wallets, hardware-assisted multisig coordinators, and advanced descriptor stacks. Optech's summary points to optional fields and implementation freedom, which helps adoption, but too much freedom can also recreate the fragmentation the draft is trying to fix. The standard will need enough structure to make exports portable without forcing every wallet into the same product model."),
      internalLinkBlock("bitcoin wallet interoperability archive", "/tags/bitcoin-wallet-interoperability"),
      textBlock("Why this proposal matters now", "h2"),
      textBlock("The timing makes sense. Bitcoin wallet infrastructure is becoming more modular, more descriptor-heavy, and more dependent on cross-tool coordination. PSBTs moved transaction assembly into a shared format. Labels got their own draft standard. Wallet policies and descriptor BIPs made spending logic more explicit. A wallet backup format is the missing layer that ties those parts together into something a user can actually recover elsewhere without guesswork. That is the larger builder angle inside this week's Optech newsletter."),
      textBlock("If this draft matures, the biggest win will not be prettier backups. It will be fewer silent failures when users change wallets, replace devices, rotate signers, or recover after a partial loss of wallet state. Bitcoin has standards for many wallet components already. What it still lacks is a widely accepted way to move the whole machine without dropping parts on the floor."),
    ],
    excerpt: "Bitcoin still lacks a common wallet export standard that carries the context modern wallets need. A new draft BIP aims to fix that with a JSON-based backup metadata format.",
    seoDescription: "A draft Bitcoin wallet backup format would standardize descriptors, labels, and PSBT metadata, making wallet recovery and migration less fragile.",
    publishedAt: "2026-04-05T11:04:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "Bitcoin Optech Newsletter #399", url: "https://bitcoinops.org/en/newsletters/2026/04/03/" },
      { _key: key(), label: "Bitcoin BIPs PR #2130", url: "https://github.com/bitcoin/bips/pull/2130" },
      { _key: key(), label: "BIP 329", url: "https://bips.dev/329/" },
      { _key: key(), label: "BIP 174", url: "https://bips.dev/174/" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 4: Lightning Splicing Spec Finally Reaches the BOLTs
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle4() {
  return {
    _id: "drafts.lightning-splicing-spec-bolts",
    _type: "article",
    title: "Lightning Splicing Spec Finally Reaches the BOLTs",
    slug: { _type: "slug", current: "lightning-splicing-spec-bolts" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("The Lightning splicing spec has finally moved into the BOLTs, turning a long-running draft into part of the network's shared rulebook. Bitcoin Optech flagged the merge in its March 27 newsletter, and the change matters because splicing gives Lightning implementations a standard way to add or remove funds from channels without closing them first."),
      textBlock("What the Lightning splicing spec adds to the BOLTs", "h2"),
      textBlock("According to the merged BOLTs pull request, splicing lets peers spend the current funding transaction and replace it with a new one that changes channel capacity while keeping the channel relationship alive. The same pull request says negotiation begins from a quiescent state so both peers have the same view of commitments before the splice starts. That alone is a meaningful protocol milestone. Before this merge, splicing lived in draft form and implementation-specific experimentation. Now the basic flow, edge cases, and test vectors sit inside the Lightning specification itself."),
      textBlock("Bitcoin Optech's summary adds the production-level detail builders care about: the merged BOLT2 text covers interactive construction of the splice transaction, continued channel operation while a splice remains unconfirmed, replace-by-fee handling for pending splices, reconnect behavior, splice_locked after sufficient depth, and updated channel announcements. In other words, the spec is not just blessing the concept of channel resizing. It is defining how nodes keep the channel usable while the funding transition is still in flight."),
      textBlock("Why this matters for Lightning liquidity management", "h2"),
      textBlock("The practical value of splicing is capital efficiency. Without it, operators often need to close a channel and reopen another one to resize capacity or move liquidity, which creates downtime, extra onchain footprint, and more operational complexity. The merged spec instead formalizes a path where funds can move in or out while the channel remains part of the network. The pull request states that once the splice transaction is signed, channel operation returns to normal while waiting for confirmation, as long as payments remain valid for all pending splice transactions. That is the key improvement."),
      textBlock("For routing nodes, payment processors, and service providers that manage many channels, this pushes liquidity adjustment closer to routine channel maintenance instead of a disruptive lifecycle event. That matters because Lightning's bottleneck is often not raw transaction throughput but where liquidity sits and how quickly operators can reposition it. A standard splicing flow gives implementations a better base for channel resizing, liquidity rotation, and fee management without forcing users through channel closures that fragment history and routing continuity."),
      internalLinkBlock("Web3 Builder coverage", "/categories/web3-builder"),
      textBlock("Core Lightning shows what builder adoption looks like", "h2"),
      textBlock("This is not only a paper spec story. Core Lightning 26.04rc1 shipped user-facing tools around the same time, including new splicein and spliceout commands for conveniently adding funds to a channel or removing funds from a channel. The release notes also say operators can now \"cross-splice\" by specifying a second channel ID as the destination of a splice-out, effectively moving liquidity between channels without treating splicing as a manual low-level construction task."),
      textBlock("Bitcoin Optech adds useful implementation context here. It says Core Lightning extended its splice scripting engine to handle cross-channel splices, more than three channels in multi-channel splices, and dynamic fee calculation. Optech highlights a real engineering problem: adding wallet inputs increases transaction weight and therefore required fees, which can then require more inputs in a circular loop. The new scripting work is what underlies the higher-level RPCs. That is the difference between a specification milestone and an operator-ready feature set."),
      internalLinkBlock("Core Lightning archive", "/tags/core-lightning"),
      textBlock("The hard part was never the idea, it was the edge cases", "h2"),
      textBlock("The interesting part of the splicing merge is how much of it is about handling ugly coordination problems rather than inventing a flashy new feature. The BOLTs pull request explicitly notes that the rewrite replaced an earlier draft that failed in some edge cases, and points readers to test vectors for message concurrency and disconnections. The same discussion also shows how much care went into reserve handling, fee pressure, and what happens when multiple pending splices exist at once."),
      textBlock("That matters because Lightning channels are stateful relationships, not simple UTXOs. A resize flow has to preserve spendability, policy constraints, and peer coordination under real network conditions. If a splice can hang, mis-handle reserves, or create ambiguous state after reconnects, it becomes dangerous fast. The value of standardization here is not that everyone suddenly discovers splicing. It is that implementations now have a shared, better-tested description of how to survive the operational edge cases that used to sit in draft comments and implementation folklore."),
      internalLinkBlock("Lightning BOLTs coverage", "/tags/lightning-bolts"),
      textBlock("What builders and node operators should watch next", "h2"),
      textBlock("The merge does not mean every Lightning stack now offers the same splicing UX. It means the interoperability layer is stronger. Builders should watch which implementations expose splicing through stable RPCs, how channel announcements for spliced channels behave across the network, and whether liquidity tools start treating splice-in and splice-out as default operations rather than advanced node-operator tricks. Optech's note that channels can continue routing while a splice is unconfirmed is especially important here, because it points toward a future where resizing liquidity does not automatically imply service interruption."),
      textBlock("The other thing to watch is composability. Core Lightning's cross-splice support hints at a more interesting direction than simple top-ups and withdrawals. Once implementations can reliably move funds between channels and handle fee dynamics automatically, splicing starts to look like a foundational liquidity primitive rather than just a convenient channel feature. The March 27 Optech issue was light on headline news, but this change was real progress: Lightning channel management is moving out of the draft era and into the spec and tooling layer that production systems can actually build on."),
    ],
    excerpt: "Lightning splicing has moved from draft status to the core spec. That gives node teams a cleaner path to resize channels without closing them and keeps liquidity management closer to normal operations.",
    seoDescription: "The Lightning splicing spec is now in the BOLTs, giving node teams a standard way to resize channels without closing them or pausing payments.",
    publishedAt: "2026-04-05T11:19:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "Bitcoin Optech Newsletter #398", url: "https://bitcoinops.org/en/newsletters/2026/03/27/" },
      { _key: key(), label: "Lightning BOLTs PR #1160", url: "https://github.com/lightning/bolts/pull/1160" },
      { _key: key(), label: "Core Lightning v26.04rc1 Release Notes", url: "https://github.com/ElementsProject/lightning/releases/tag/v26.04rc1" },
      { _key: key(), label: "Lightning BOLTs PR #869", url: "https://github.com/lightning/bolts/pull/869" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 5: ERC-8004 Mainnet Launch Gives Agents a Trust Layer
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle5() {
  return {
    _id: "drafts.erc-8004-mainnet-launch",
    _type: "article",
    title: "ERC-8004 Mainnet Launch Gives Agents a Trust Layer",
    slug: { _type: "slug", current: "erc-8004-mainnet-launch" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("ERC-8004 mainnet launch marks a shift from agent demos to shared infrastructure. Week in Ethereum News highlighted the launch on March 20, but the real builder takeaway is narrower: Ethereum now has live agent identity and reputation registries, even as the standard stays in Draft and its validation layer remains unfinished."),
      textBlock("What ERC-8004 mainnet launch actually shipped", "h2"),
      textBlock("ERC-8004, titled \"Trustless Agents,\" is an ERC proposal for discovering agents and establishing trust through three registries: Identity, Reputation, and Validation. The EIP says those registries are meant to let agents interact across organizational boundaries without pre-existing trust, and it explicitly frames the problem as a gap left by existing agent communication standards. On March 20, Week in Ethereum News called the mainnet launch the highlight of the week, and the ERC-8004 contracts repository now lists deployed IdentityRegistry and ReputationRegistry contracts on Ethereum mainnet, alongside deployments on Base and Abstract. That is why the launch matters. This is no longer only a design discussion on Ethereum Magicians. Parts of the standard are now live as shared infrastructure that developers can integrate against."),
      textBlock("The deployment pattern also shows the project is thinking beyond one chain. The EIP says the registries are expected to be deployed as per-chain singletons, and notes that an agent registered and receiving feedback on one chain can still operate and transact on others. The contracts repository lines up with that model by listing mainnet deployments across several EVM networks plus Sepolia test deployments. For builders, that is the more useful signal inside the launch. ERC-8004 is trying to make identity and trust portable across agent markets that may execute, pay, and settle in different places."),
      linkBlock("ERC-8004 EIP", "https://eips.ethereum.org/EIPS/eip-8004"),
      textBlock("Why agent builders needed more than MCP and A2A", "h2"),
      textBlock("The core motivation in the EIP is straightforward. MCP can expose capabilities, and A2A can handle messaging and task orchestration, but neither standard solves discovery and trust on its own. ERC-8004 tries to fill that missing layer. The proposal says developers need a way to discover agents and evaluate them in untrusted settings if open, cross-organizational agent markets are going to work at all. Without that, most agent systems drift back toward closed directories, curated marketplaces, or reputation controlled by one platform."),
      textBlock("That is the strongest reason to care about the launch. ERC-8004 does not try to replace every agent protocol. It tries to become the trust and identity layer that sits underneath them. The standard's registration file can advertise A2A endpoints, MCP endpoints, ENS names, DIDs, email addresses, and other service pointers, which makes it more like a portable agent passport than a single-purpose API spec. For Ethereum builders, that matters because it keeps discovery composable. A team can build its own marketplace, coordinator, or evaluation layer without having to invent a new identity primitive for each product."),
      internalLinkBlock("Web3 Builder coverage", "/categories/web3-builder"),
      textBlock("How the registries work in practice", "h2"),
      textBlock("The Identity Registry is an ERC-721 with URI storage. In plain terms, an agent gets an NFT-style onchain handle whose tokenURI points to a registration file containing metadata and service endpoints. The EIP says this gives each agent a portable, censorship-resistant identifier, and the spec lets that registration file advertise several endpoint types at once, from A2A agent cards to MCP endpoints and onchain wallet references. The standard also reserves an agentWallet field that must be re-verified if ownership changes, using EIP-712 signatures for EOAs or ERC-1271 for smart contract wallets. That detail is easy to miss, but it matters because it ties advertised payment or control addresses back to the onchain identity rather than leaving them as unverified strings."),
      textBlock("The Reputation Registry is the second live piece. The EIP describes it as a standard interface for posting and fetching feedback signals, with simple filtering and composability onchain and more advanced aggregation expected offchain. That split is sensible. Onchain storage gives public, queryable raw signals. Offchain scoring lets builders create more sophisticated trust products without forcing one canonical ranking algorithm into the base standard."),
      internalLinkBlock("agent identity archive", "/tags/agent-identity"),
      textBlock("The Validation Registry is where the design becomes more ambitious. ERC-8004 envisions validators posting responses tied to request hashes, potentially using stake-secured re-execution, zkML proofs, or TEE oracles. But the contracts repository warns that this part of the spec is still under active update and discussion with the TEE community, with a follow-up revision expected later in 2026. That means the current mainnet launch is real, but partial."),
      textBlock("Why the launch matters even though the spec is still Draft", "h2"),
      textBlock("The most honest way to read this launch is as a live start, not a finished standard. The EIP page still labels ERC-8004 as \"Draft,\" and the proposal's citation section itself refers to the document as \"ERC-8004: Trustless Agents [DRAFT].\" The repository also makes clear that the validation registry is not yet stable. So builders should avoid reading \"mainnet launch\" as \"finalized Ethereum standard.\" It means deployed contracts and active experimentation, not full closure on the specification."),
      textBlock("That distinction is exactly what makes the story useful. Ethereum often ships this way: interfaces begin attracting integrations before the governance and implementation edges are fully settled. In ERC-8004's case, that means developers can already build against live identity and reputation registries while treating validation as an evolving extension rather than a settled base layer. The advantage is obvious. Teams do not need to wait for the entire stack to be complete before testing discovery, registration, and feedback flows in production. The risk is also obvious. If the unfinished parts change materially, early integrations may have to adapt."),
      textBlock("There is already evidence the standard is being pulled into adjacent work. ERC-8183, \"Agentic Commerce,\" recommends integrating with ERC-8004 for onchain reputation and attestation, and describes patterns for mapping job outcomes into trust signals or using hooks to enforce reputation-aware policies. That is the kind of composability signal builders should watch more closely than generic hype around AI agents on Ethereum."),
      internalLinkBlock("agentic commerce archive", "/tags/agentic-commerce"),
      textBlock("What builders should watch next", "h2"),
      textBlock("The next test is not whether more demos appear. It is whether ERC-8004 becomes a default integration target for agent products that need portable identity, public reputation, or machine-readable service discovery. Builders should watch three things. First, whether major agent frameworks and wallets start resolving ERC-8004 registration files directly. Second, whether marketplaces and commerce protocols actually write feedback into the reputation layer instead of keeping ratings in app databases. Third, whether the validation registry matures into something credible enough for higher-stakes use cases."),
      textBlock("That last point will decide how far the standard can go. Identity and feedback are enough for discovery and low-stakes marketplaces. They are not enough for sensitive workflows where developers want verifiable execution or stronger guarantees about what an agent actually ran. The EIP explicitly leaves room for multiple trust models, from reviewer feedback to zkML and TEE-backed validation. If those extensions land cleanly, ERC-8004 could become useful infrastructure for open agent economies. If they do not, the launch will still matter, but mostly as a discovery standard with a reputation rail attached."),
      linkBlock("ERC-8183 Agentic Commerce", "https://eips.ethereum.org/EIPS/eip-8183"),
      textBlock("Ethereum has now put a live onchain trust layer for agents in front of builders. The harder question is whether enough products will use it before the unfinished parts of the spec settle into place."),
    ],
    excerpt: "ERC-8004 is now live on mainnet, giving AI agents an onchain identity and reputation layer. The bigger builder question is whether the unfinished validation piece can catch up.",
    seoDescription: "ERC-8004 mainnet launch puts agent identity and reputation onchain, giving Ethereum builders a common trust layer for open agent marketplaces and apps.",
    publishedAt: "2026-04-05T11:36:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "Week in Ethereum News", url: "https://buttondown.com/angelaxli/archive/week-in-ethereum-news-march-20-2026/" },
      { _key: key(), label: "ERC-8004: Trustless Agents", url: "https://eips.ethereum.org/EIPS/eip-8004" },
      { _key: key(), label: "ERC-8004 Contracts Repository", url: "https://github.com/erc-8004/erc-8004-contracts" },
      { _key: key(), label: "ERC-8183: Agentic Commerce", url: "https://eips.ethereum.org/EIPS/eip-8183" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 6: Onchain Market Predictability Is Becoming Chain Design
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle6() {
  return {
    _id: "drafts.onchain-market-predictability",
    _type: "article",
    title: "Onchain Market Predictability Is Becoming Chain Design",
    slug: { _type: "slug", current: "onchain-market-predictability" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("Onchain market predictability is becoming a chain-design problem, not just an app-layer optimization. In a March 25 research essay, a16z crypto argued that throughput alone will not make onchain order books, auctions, and other latency-sensitive markets competitive if chains cannot guarantee fast inclusion and protect transactions from being observed before ordering is fixed."),
      textBlock("Why throughput is no longer enough for serious onchain markets", "h2"),
      textBlock("The starting point in the a16z piece is simple: blockchains can now plausibly claim the raw capacity needed to compete with traditional financial infrastructure, but financial applications also need predictability. The authors argue that a trade, cancel, bid, or option exercise only works well when builders can rely on the transaction landing as soon as possible, rather than merely \"within the next few seconds.\" They use an onchain order book as the clearest example. Market makers need to constantly update quotes when the outside world changes, and if those updates land late while arbitrageurs get in first, the market maker absorbs the loss. The expected response is wider spreads, worse prices, and weaker venue quality. That is an infrastructure problem, not a user-interface problem."),
      textBlock("This matters because crypto has spent years treating performance as a headline number. Transactions per second are easy to advertise. Predictable inclusion is much harder to deliver and much easier to ignore until a real market has to react to live information. The a16z essay argues that for onchain finance to support high-value markets rather than just basic settlement, chains need short-term inclusion guarantees. Their linked research paper makes the same point in more formal terms, arguing that efficient onchain auctions require selective-censorship resistance and hiding, meaning no adversary can selectively delay a transaction or learn its contents before confirmation finalizes ordering."),
      textBlock("Why single-proposer chains create a market structure problem", "h2"),
      textBlock("The essay's strongest contribution is that it frames block design as market structure. In a single-leader system, the current proposer has unusual power over both inclusion and visibility. A leader can delay a cancel order by tens of milliseconds, choose one trader's transaction over another, or insert its own order after seeing the incoming flow. The a16z piece argues that either of two powers can break a market: the power to censor another participant's transaction, or the power to see that transaction before choosing one's own response. The paper's abstract connects this directly to MEV, describing traditional single-proposer systems as giving validators a serial monopoly over inclusion and ordering."),
      textBlock("That logic applies well beyond a toy auction. If a rate decision, liquidation wave, or large external price move hits, the market maker who cannot cancel stale quotes quickly becomes the subsidy for everyone else. The a16z article argues that once builders know a proposer can behave this way, markets either become thinner or move away from the chain's native execution path. Even if leaders do not fully exploit the advantage today, the authors say relying on social restraint is weak design because higher onchain financial activity raises the payoff for exploitative behavior. Their timing-games example makes the point cleanly: once one operator pushes farther for extra rewards, others have an incentive to follow."),
      textBlock("Why so much market logic still moves offchain", "h2"),
      textBlock("One reason DeFi still functions, despite those problems, is that applications route around them. The a16z essay explicitly says that protocols needing fast auctions often run the critical mechanism offchain and only settle the result onchain, naming UniswapX and CoW Swap as examples. Uniswap's own documentation shows why. UniswapX is an auction-based protocol where swappers broadcast signed orders and fillers compete to execute them; on Ethereum mainnet, Uniswap uses a two-role system with permissioned quoters plus permissionless fillers because 12-second blocks and high gas costs make direct onchain price discovery less workable there. On faster L2s, the docs say fillers can compete directly onchain without RFQ."),
      textBlock("CoW Protocol's documentation reveals a related compromise from another angle. It uses a fair combinatorial batch auction where solvers compute candidate solutions for a batch and the protocol selects winners according to a defined objective function. That design is powerful, but it also shows how much valuable trading logic sits in auction coordination and solver competition rather than in raw base-layer execution alone. The a16z article argues that when too much of this mechanism moves offchain, the chain risks becoming mostly a settlement rail. That weakens one of DeFi's core promises: composability between applications executing in the same shared environment."),
      internalLinkBlock("Web3 Builder coverage", "/categories/web3-builder"),
      textBlock("What builders actually need: inclusion guarantees and hiding", "h2"),
      textBlock("The most useful part of the article is its attempt to specify the missing properties. The authors argue that the right target is not vague \"faster execution\" but two concrete guarantees. First is short-term censorship resistance: a valid transaction that reaches an honest node on time should be included in the next possible block. Second is hiding: except for the node that first receives a transaction, no other party should learn anything about it before inclusion has been finalized. The essay suggests that if these properties hold, proposers cannot selectively hold back trades and cannot front-run them after inspecting the contents. The linked paper then proposes a multiple concurrent proposer protocol intended to offer exactly those properties."),
      textBlock("This is where the builder angle becomes more interesting than the investment framing. The proposal is not merely \"better MEV mitigation.\" It is a claim that chain architecture for markets should minimize concentrated proposer discretion. The a16z article sketches mechanisms such as timelock encryption or threshold encryption as ways to keep transaction contents hidden until consensus is already done. It also argues that having several viable entry points per slot is better than depending on a single leader. The paper does not mean every market needs full privacy or every chain needs the same ordering rule. It means high-frequency onchain markets need a design where no single actor both sees the flow and decides who gets to move first."),
      internalLinkBlock("transaction inclusion archive", "/tags/transaction-inclusion"),
      textBlock("What this means for chain teams and onchain market builders", "h2"),
      textBlock("The practical implication is that infrastructure teams should stop treating order books, auctions, and derivatives as applications that can simply be \"deployed later\" once throughput improves. The article's argument is that these products reveal whether a chain can support adversarial finance rather than just passive settlement. Builders evaluating new execution environments should ask harder questions: How many entry points can reliably land a transaction in a slot? Can a proposer peek at order flow before ordering is final? Are auction-critical flows forced offchain because the base layer cannot offer robust inclusion? Those questions map much more directly to whether a market can survive than generic performance claims."),
      textBlock("For market builders, the near-term takeaway is not that a complete solution has arrived. It has not. The paper is a preprint, and the a16z article itself presents the right ordering rule and the robustness-performance tradeoff as active research problems. But the direction is clear. Chains that want serious capital markets on top of them will need stronger guarantees around inclusion and pre-confirmation privacy, while protocols that cannot get those guarantees will keep leaning on offchain auctions, solver networks, and permissioned coordination. That split will likely define the next phase of onchain market design more than another round of TPS marketing."),
      internalLinkBlock("onchain trading archive", "/tags/onchain-trading"),
      textBlock("The a16z essay is useful because it names the bottleneck plainly. If onchain finance wants tighter spreads, deeper books, and less fragile auction design, the next breakthrough may not be more throughput at all. It may be a chain that can make inclusion predictable while keeping order flow unreadable until it is too late to exploit."),
    ],
    excerpt: "Throughput is no longer the only question for serious onchain markets. The harder builder problem is whether chains can offer fast inclusion and protect order flow before confirmation.",
    seoDescription: "Onchain market predictability is becoming a design priority as builders chase faster inclusion, censorship resistance, and hidden order flow today.",
    publishedAt: "2026-04-05T11:58:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "a16z crypto", url: "https://a16zcrypto.com/posts/article/future-onchain-markets-role-predictability/" },
      { _key: key(), label: "arXiv", url: "https://arxiv.org/abs/2509.23984" },
      { _key: key(), label: "Uniswap Docs", url: "https://docs.uniswap.org/contracts/uniswapx/overview" },
      { _key: key(), label: "CoW Protocol Docs", url: "https://docs.cow.fi/cow-protocol/reference/core/auctions" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 7: Wall Street's Onchain Shift Is Becoming Infrastructure
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle7() {
  return {
    _id: "drafts.wall-street-onchain-shift",
    _type: "article",
    title: "Wall Street's Onchain Shift Is Becoming Infrastructure",
    slug: { _type: "slug", current: "wall-street-onchain-shift" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("Wall Street onchain shift is no longer best understood as a crypto narrative. It is turning into a capital-markets infrastructure story. In a March 25 essay, a16z argued that exchanges, clearinghouses, and electronic trading platforms are moving from blockchain experiments toward production rails, and the strongest evidence is that the institutions building market plumbing are now announcing tokenized trading, settlement, and treasury-financing systems rather than isolated proofs of concept."),
      textBlock("Why Wall Street is moving onchain now", "h2"),
      textBlock("a16z's core argument is that tokenization is being pulled forward by one practical promise: higher velocity for money and collateral. The essay frames tokenized assets as programmable versions of real-world instruments that can trade around the clock, settle faster, and move across jurisdictions without the time-zone and batch-processing constraints baked into legacy market infrastructure. That thesis is not just rhetorical. DTCC said on December 11, 2025 that the SEC's no-action letter cleared the way for DTC to offer tokenization services for DTC-custodied assets in a controlled production environment, with rollout expected in the second half of 2026. That matters because DTCC sits at the center of U.S. post-trade infrastructure rather than at the edge of crypto experimentation."),
      textBlock("The timing also makes more sense when paired with market data. RWA.xyz's April 2026 overview shows $27.65 billion in distributed tokenized assets and about $12.98 billion in tokenized U.S. Treasuries, which suggests that tokenization has already moved beyond a niche sandbox and into a market large enough for incumbents to treat as infrastructure rather than branding. A March RWA.xyz primer likewise said tokenized Treasuries had already crossed $10 billion by late February 2026. The institutional read is straightforward: once onchain Treasury products become a meaningful collateral and cash-management category, the pressure grows to modernize the rest of the rails around them."),
      textBlock("The institutions are no longer talking in pilot language", "h2"),
      textBlock("The most concrete example is ICE and the New York Stock Exchange. ICE announced on January 19, 2026 that it is developing a digital platform for tokenized securities that would support 24/7 operations, instant settlement, dollar-sized orders, and stablecoin-based funding, while working with BNY and Citi on tokenized deposit support. Reuters' coverage of the same announcement reinforces that the project is aimed at tokenized U.S. equities and ETFs and still depends on regulatory approval. That combination matters. This is not \"blockchain for back office efficiency\" in the abstract. It is an exchange operator planning a venue where tokenized securities can trade continuously with onchain post-trade logic."),
      textBlock("Tradeweb's August 2025 onchain Treasury financing transaction points in the same direction from the fixed-income side. Tradeweb said an industry working group completed real-time, fully onchain U.S. Treasury financing against USDC on the Canton Network, and the announcement tied the effort to round-the-clock financing, collateral mobility, and live production workflows rather than lab conditions. a16z cites this as a sign that the scope is expanding from one-off demonstrations to recurring use cases. The underlying point is stronger than the headline: when firms like Tradeweb, DTCC, and large dealer institutions start using blockchain to move collateral and financing outside traditional settlement windows, the conversation shifts from tokenization as distribution to tokenization as market operations."),
      textBlock("The real target is the hidden tax inside legacy market structure", "h2"),
      textBlock("The best part of the a16z piece is not the hype around a bigger market. It is the framing of legacy finance as a stack full of embedded timing costs. The article argues that brokers, custodians, transfer agents, clearinghouses, and settlement cycles each take a slice of value or trap capital in ways most users treat as normal. Even after the U.S. moved to T+1 settlement in 2024, capital still gets locked overnight across many workflows, which means the system remains optimized for intermediary coordination rather than real-time market finality. a16z's claim is that smart contracts and atomic settlement compress that stack."),
      textBlock("That framing lines up with why tokenized Treasury products have gained traction first. These products are not simply \"digital wrappers\" for familiar instruments. They also behave like cash-management and collateral tools that can settle faster and operate continuously. RWA.xyz's Treasury dashboard shows tens of thousands of holders and double-digit billions in tokenized government debt, which is enough to make collateral mobility and after-hours financing operational questions rather than crypto-theory debates. In other words, the first large institutional wins are happening where faster settlement and programmable ownership solve a direct balance-sheet problem."),
      internalLinkBlock("tokenized Treasuries archive", "/tags/tokenized-treasuries"),
      textBlock("What builders should notice before the market gets crowded", "h2"),
      textBlock("a16z's most useful builder claim is that the incumbents moving fastest may be customers rather than direct competitors. DTCC is building tokenization services, NYSE is building a tokenized securities venue, and Tradeweb is proving onchain financing rails. None of those institutions is likely to build every middleware layer, compliance workflow, distribution system, wallet control, and data interface needed for a functioning onchain capital-markets stack. That is where the opportunity sits. The institutions are laying regulated foundations; the missing pieces are often software categories rather than balance-sheet businesses."),
      textBlock("The more sober way to say this is that not every tokenized asset becomes open DeFi collateral overnight. DTCC's own tokenization page says launch support will be limited to eligible networks that satisfy the SEC no-action letter standards, and the initial service is designed for a controlled production environment. That means the first wave is likely to be permissioned, regulated, and operationally conservative. But that does not weaken the builder case. It narrows it. The immediate demand is likely to sit in institutional-grade onboarding, reporting, reconciliation, eligibility controls, transfer logic, and interoperability between closed and more open rails."),
      internalLinkBlock("capital markets infrastructure archive", "/tags/capital-markets-infrastructure"),
      textBlock("Why tokenized Treasuries are the bridge asset", "h2"),
      textBlock("The a16z essay treats tokenization broadly, but tokenized Treasuries have become the bridge between crypto-native demand and traditional financial adoption. RWA.xyz's data shows the category now represents roughly half of distributed tokenized asset value, which helps explain why this part of the market has moved ahead of tokenized equities and many private-market assets. Treasuries are easier to model, easier to regulate, and already useful as yield-bearing cash substitutes and collateral instruments. Once those instruments live onchain in meaningful size, the supporting rails for financing, settlement, and distribution become more valuable too."),
      textBlock("That is why the Wall Street move onchain should be read less as a bet on retail tokenized stocks and more as a restructuring of plumbing around high-quality collateral and regulated securities. The NYSE story gets attention because it is visible. The more foundational signal may be the combination of DTCC tokenization, Tradeweb onchain Treasury financing, and the growth of tokenized Treasury funds tracked by RWA.xyz. Those pieces suggest that institutional tokenization is consolidating around instruments that already matter to balance sheets, treasury desks, and settlement operations."),
      internalLinkBlock("institutional tokenization coverage", "/tags/institutional-tokenization"),
      textBlock("What happens next", "h2"),
      textBlock("The next phase will probably not look like a sudden \"everything moves onchain\" moment. It will look like a growing number of tokenized assets and market utilities that start in controlled environments, add specific eligible chains and counterparties, and then expand once regulators and operators gain comfort. DTCC's timetable points to the second half of 2026 for rollout, while ICE's platform remains subject to regulatory approvals. That is enough to show direction without pretending the migration is complete."),
      textBlock("For builders, the practical conclusion is narrower than the a16z slogan but stronger in substance. The opportunity is not just to issue more tokens. It is to build the software layer that makes tokenized securities, collateral, and settlement usable inside regulated production systems. Wall Street's onchain shift is becoming real infrastructure. The builders who win from it will probably be the ones solving boring, expensive, necessary problems before the migration feels obvious to everyone else."),
    ],
    excerpt: "Wall Street's move onchain is no longer a pilot story. Exchanges, clearinghouses, and treasury-financing networks are laying real market rails, and builders now have a clearer customer than many expected.",
    seoDescription: "Wall Street's onchain shift is accelerating as exchanges and market utilities build tokenized trading, settlement, and treasury rails.",
    publishedAt: "2026-04-05T12:18:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "a16z crypto", url: "https://a16zcrypto.com/posts/article/why-wall-street-is-moving-onchain/" },
      { _key: key(), label: "ICE / NYSE announcement", url: "https://ir.theice.com/press/news-details/2026/The-New-York-Stock-Exchange-Develops-Tokenized-Securities-Platform/default.aspx" },
      { _key: key(), label: "DTCC", url: "https://www.dtcc.com/news/2025/december/11/paving-the-way-to-tokenized-dtc-custodied-assets" },
      { _key: key(), label: "Tradeweb", url: "https://www.tradeweb.com/newsroom/media-center/in-the-news/digital-asset-and-industry-working-group-complete-groundbreaking-on-chain-us-treasury-financing-on-canton-network/" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 8: Stablecoin Clearing Is Becoming a Real Infrastructure Bet
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle8() {
  return {
    _id: "drafts.stablecoin-clearing-infrastructure",
    _type: "article",
    title: "Stablecoin Clearing Is Becoming a Real Infrastructure Bet",
    slug: { _type: "slug", current: "stablecoin-clearing-infrastructure" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("Stablecoin clearing infrastructure is starting to look like its own category. In a March 31 investment note, a16z crypto said it was leading a $10 million seed round for The Better Money Company, a startup building a stablecoin clearinghouse designed to let businesses move from one dollar-pegged token to another at predictable prices and speeds, without relying on DEX swaps or OTC desks. Fortune separately reported the $10 million round and identified the founders as Sam Broner and Adam Zuckerman."),
      textBlock("What The Better Money Company says it is building", "h2"),
      textBlock("The pitch is specific. a16z says Better Money is building a \"stablecoin clearinghouse\" where businesses can go from \"any stablecoin in\" to \"any stablecoin out\" with no slippage, using direct participation from banking partners and issuers instead of routing through liquidity pools. That is a different product from a wallet, exchange, or payment app. It is closer to financial plumbing: a conversion and settlement layer meant to make separate dollar tokens function more like interchangeable forms of cash. a16z's note says the company views current stablecoin conversion as too dependent on DEX liquidity, minimum-size OTC workflows, or manual operational chains through multiple intermediaries."),
      textBlock("That framing matters because stablecoin fragmentation is real even when all the tokens are \"worth a dollar.\" USDC, USDT, PYUSD, and other issuer-backed tokens may trade near par most of the time, but they are not operationally identical for treasuries, exchanges, or payment companies. Different issuers have different redemption rails, compliance postures, banking relationships, supported geographies, and settlement preferences. a16z's core claim is that stablecoins do not yet behave as fully fungible business money, and Better Money is trying to close that gap with a neutral clearing layer."),
      textBlock("Why issuer fragmentation becomes more important as stablecoins scale", "h2"),
      textBlock("This would be a niche problem if stablecoins were still small. They are not. DefiLlama's stablecoin dashboard showed total stablecoin market cap above $315 billion in early April 2026, with USDT representing roughly 58% of supply. That means a payments or treasury team entering stablecoins is entering a market with multiple large issuers rather than one dominant universal dollar rail. The bigger the category gets, the more likely it becomes that one business receives funds in one issuer's token and needs to settle obligations, treasury balances, or counterparties in another."),
      textBlock("That is also why the \"better money\" thesis is more than a crypto-trading story. Circle markets its Circle Payments Network around 24/7 near-instant settlement and improved capital efficiency for global payments, while Mastercard has already rolled out end-to-end stablecoin transaction capabilities and Reuters recently reported its agreement to acquire stablecoin infrastructure firm BVNK for up to $1.8 billion. Taken together, those moves suggest major payment players increasingly treat stablecoins as money-movement rails, not only exchange collateral. Once that happens, interoperability problems become operational bottlenecks."),
      textBlock("The real product is a clearing layer, not another stablecoin", "h2"),
      textBlock("The a16z note is useful because it identifies a missing layer rather than proposing another branded dollar token. Stablecoin issuers already solve issuance and redemption for their own liabilities. Payment companies solve acceptance, onboarding, and distribution. Exchanges solve trading. What none of those automatically solve is a business-grade way to move across issuer liabilities at face value, on demand, in operational size. Better Money's clearinghouse concept is effectively trying to import a familiar financial function into stablecoin markets: neutral clearing between different forms of dollar exposure."),
      textBlock("The analogy to bank deposits is not accidental. SUERF argued in late 2025 that stablecoins issued by different issuers could become fungible means of payment under the right conditions, including credible settlement finality and interoperability. An ECB working paper made a similar point, arguing that interoperability and seamless convertibility are prerequisites if stablecoins on different ledgers are to be treated like money from different banks. Better Money is, in effect, a private-market attempt to supply that convertibility layer before the market has achieved it natively."),
      textBlock("Why builders should pay attention even if they are not payment companies", "h2"),
      textBlock("The obvious audience for this product is treasury teams, exchanges, and payment processors. But the builder angle is broader. If stablecoins keep expanding into payouts, remittances, merchant settlement, and cross-border treasury use, then every application that touches stablecoin balances inherits a fragmentation problem. Which issuers do you support? Which tokens can you settle out in? What happens when your user receives one token but your downstream counterparty demands another? Today many teams solve this with ad hoc exchange routing, manual treasury ops, or restricted token support. A clearing layer turns that into infrastructure instead of product-specific workaround."),
      internalLinkBlock("Web3 Builder coverage", "/categories/web3-builder"),
      textBlock("There is also a regulatory and risk angle. Fortune reported that Better Money plans to focus on compliant, dollar-backed stablecoins rather than simply every token with dollar branding. That matters because interoperability is not purely a technical issue. It is also about whether regulated businesses are willing to treat different issuer liabilities as acceptable settlement assets in production. A clearinghouse model only works at payments scale if the input and output assets are acceptable to banks, counterparties, and compliance teams."),
      textBlock("The hardest part is proving \"no slippage\" can scale", "h2"),
      textBlock("The boldest claim in the a16z article is not that stablecoins are growing. It is that Better Money can offer face-value exchange with predictable speed and no slippage. That is easy to write in a funding announcement and much harder to prove in live market conditions. The viability of the model will depend on banking access, issuer participation, balance-sheet design, compliance architecture, and whether the system can maintain dependable conversion during stress rather than only in calm markets. a16z says the clearinghouse will rely on direct participation from banking partners and issuers, which implies this is not supposed to be an algorithmic pricing trick layered on public liquidity pools."),
      textBlock("That is also where the startup's differentiation will live or die. If it becomes merely a nicer front end over existing exchange liquidity, it will not justify a new infrastructure category. If it can actually abstract away issuer fragmentation for enterprise users, then it starts to resemble a missing primitive in stablecoin finance. The March 31 launch does not prove that outcome. It does, however, show that at least one prominent crypto investor now sees stablecoin clearing as a standalone market worth funding."),
      textBlock("What to watch next", "h2"),
      textBlock("The next milestones are concrete. Builders should watch whether Better Money announces named issuer or banking partners, whether it supports only a narrow list of regulated dollar tokens or aims for broader coverage, and whether payment companies or treasury platforms integrate it as backend infrastructure rather than treating it as a retail conversion venue. Those details will show whether this is really a clearing layer or just a new access point to existing liquidity."),
      textBlock("The broader market signal is already clear. Stablecoin growth has reached a scale where conversion, acceptability, and issuer interoperability matter more than they did two years ago. If stablecoins are going to function like business money instead of a patchwork of branded dollar tokens, the market may need exactly the kind of unglamorous infrastructure Better Money says it wants to build."),
      internalLinkBlock("stablecoin interoperability archive", "/tags/stablecoin-interoperability"),
    ],
    excerpt: "Better Money is betting that stablecoins will need their own clearing layer, not just more wallets and payment apps. The real builder question is whether issuer fragmentation becomes a payments-scale problem.",
    seoDescription: "Stablecoin clearing infrastructure is emerging as issuers and businesses need faster, face-value conversion between fragmented dollar tokens.",
    publishedAt: "2026-04-05T12:31:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "a16z crypto", url: "https://a16zcrypto.com/posts/article/the-better-money-company/" },
      { _key: key(), label: "Fortune", url: "https://fortune.com/2026/03/31/the-better-money-company-stablecoin-clearinghouse-a16z-crypto-seed-round/" },
      { _key: key(), label: "DefiLlama Stablecoins", url: "https://defillama.com/stablecoins" },
      { _key: key(), label: "Circle Payments Network", url: "https://www.circle.com/cpn" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 9: Circle's cirBTC Push Turns Wrapped BTC Into Infra
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle9() {
  return {
    _id: "drafts.circle-cirbtc-wrapped-btc",
    _type: "article",
    title: "Circle's cirBTC Push Turns Wrapped BTC Into Infra",
    slug: { _type: "slug", current: "circle-cirbtc-wrapped-btc" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("Circle cirBTC is the company's clearest attempt yet to move beyond stablecoins and compete for Bitcoin-native liquidity on smart-contract chains. Bankless reported on April 2 that Circle plans to launch a wrapped bitcoin product called cirBTC, backed 1:1 by BTC with reserves \"readily and independently verifiable onchain,\" while Circle's own product page says the asset will launch first on Ethereum and Arc, subject to regulatory approvals."),
      textBlock("What Circle is actually launching with cirBTC", "h2"),
      textBlock("The core product pitch is narrow and deliberate. Circle says cirBTC is \"coming soon\" and is designed as a wrapped BTC product for institutional markets, not a retail meme around Bitcoin composability. The company's page says every cirBTC will be backed 1:1 by native BTC, with reserves independently verifiable onchain in real time by counterparties. It also says cirBTC is being built to integrate with Circle's existing stack, including USDC, Arc, and Circle Mint. Bankless' summary matches that framing and adds that the target user base is institutional, which fits Circle's own emphasis on OTC desks, market makers, and lending protocols."),
      textBlock("That positioning matters because wrapped BTC has never really been a branding problem. It has been a trust and distribution problem. To move meaningful Bitcoin balances into DeFi or other smart-contract environments, users need a wrapper they believe can maintain backing, redemption credibility, and operational continuity under stress. Circle is effectively trying to apply the same playbook it used for USDC: make the product look neutral, highly legible, and institution-friendly rather than merely liquid. The phrase \"independently verifiable onchain\" is doing most of the work here. Circle is signaling that reserve transparency, not only distribution muscle, is its wedge into a market that already has scaled incumbents."),
      textBlock("Why wrapped BTC is already a serious market, not an empty category", "h2"),
      textBlock("Circle is not entering a greenfield segment. CoinGecko data on April 5 shows Wrapped Bitcoin (WBTC) with a market capitalization of about $7.97 billion and Coinbase Wrapped BTC (cbBTC) at about $5.96 billion. Those two products alone show that tokenized bitcoin is already one of the larger infrastructure layers in onchain markets, with billions of dollars in BTC liquidity routed into lending, trading, and collateral use on smart-contract chains."),
      textBlock("That changes how cirBTC should be read. This is less a product launch into an underbuilt niche than an attempt to redistribute trust and flow inside an existing market. WBTC still carries the scale advantage, while cbBTC has grown quickly by leaning on Coinbase's distribution and exchange footprint. Circle's bet appears to be that there is room for a third serious issuer if it can combine institutional credibility with reserve transparency and a cleaner infrastructure story. That is plausible, but it is not trivial. Wrapped BTC products tend to benefit from deep liquidity, broad protocol support, and early integration flywheels. Those are hard to dislodge once they form."),
      internalLinkBlock("tokenized bitcoin market coverage", "/tags/tokenized-bitcoin-markets"),
      textBlock("The real product is trust infrastructure, not just tokenized BTC", "h2"),
      textBlock("Circle's messaging makes the strategic angle fairly clear. cirBTC is described as \"neutral,\" \"secure,\" \"verifiable,\" and built for \"institutional peace of mind.\" Those are not generic launch adjectives. They are references to the specific weaknesses that wrapped BTC users and counterparties care about: who controls the reserves, how quickly those reserves can be checked, whether the wrapper fits into regulated operational workflows, and whether the issuer can support multichain usage without degrading credibility. Circle says cirBTC will be multichain over time, with Ethereum and Arc as the first supported chains, and explicitly ties the asset to its broader end-to-end stack."),
      textBlock("That stack matters more than it might seem. Circle is not just selling a token; it is trying to offer a package where wrapped BTC can sit next to USDC liquidity, Circle Mint access, and its other institutional services. Reuters reported in February that Circle's USDC circulation rose 72% year over year to $75.3 billion in the fourth quarter and that the company is increasingly positioning itself as broader financial infrastructure, with partnerships including Visa and a conditional national trust bank charter approval. cirBTC fits that trajectory. It is a way to tell institutional clients that Circle can handle more than tokenized dollars."),
      internalLinkBlock("Circle product coverage", "/tags/circle-products"),
      textBlock("Why reserve transparency is a stronger pitch after cbBTC and WBTC", "h2"),
      textBlock("Circle's best entry argument is that reserve visibility and issuer neutrality matter more now than they did during earlier wrapped BTC growth phases. CoinGecko's listing for cbBTC says the asset is backed 1:1 by native Bitcoin held by Coinbase and is designed for DeFi compatibility. That gives cbBTC a credible institutional sponsor and major distribution. WBTC, meanwhile, still has the deepest pool of market presence, with about 120,000 tokens in circulation according to CoinGecko. So Circle cannot win by merely saying \"we also wrapped BTC.\" It needs a reason for protocols, desks, and counterparties to prefer its version."),
      textBlock("Its chosen reason is transparency plus a more neutral market identity. Circle's cirBTC page repeats that reserves can be independently verified onchain in real time and frames the product as suitable for institutional users that want secure, high-performance tokenized BTC. That pitch is aimed directly at the part of the market that worries about concentration of custody, disclosure quality, or reliance on one trading venue's balance sheet and distribution logic. Whether it works will depend less on launch-day announcements and more on which lending protocols, market makers, and treasury systems actually support cirBTC as first-class collateral or routing inventory."),
      internalLinkBlock("wrapped bitcoin archive", "/tags/wrapped-bitcoin"),
      textBlock("What builders and markets should watch next", "h2"),
      textBlock("The next test is distribution, not branding. Builders should watch which protocols list cirBTC early, whether Circle publishes reserve-verification mechanics with enough specificity to satisfy institutional counterparties, and how quickly usable liquidity appears on Ethereum after launch. The Circle page says cirBTC is still subject to regulatory approvals and does not yet constitute a launch commitment, which means integration timelines matter as much as product design. A wrapped BTC product can be technically clean and still fail to matter if it arrives without deep collateral venues, market-making support, and redemption confidence."),
      textBlock("The bigger market question is whether wrapped BTC is becoming a segmented infrastructure category rather than a winner-take-most one. If WBTC remains the deepest neutral pool, cbBTC keeps using Coinbase's distribution to grow, and cirBTC attracts users who want Circle-style transparency and institutional packaging, then tokenized BTC could start to look more like stablecoins: several large issuers competing on trust, integration, and market access rather than one dominant wrapper. Circle cirBTC does not prove that shift on its own. It does show that the wrapped bitcoin market has become important enough for one of crypto's biggest infrastructure companies to attack it directly."),
    ],
    excerpt: "Circle's cirBTC is a bet that wrapped bitcoin needs the same trust pitch USDC used to scale. The bigger question is whether transparency is enough to break into a market incumbents already dominate.",
    seoDescription: "Circle's cirBTC launch targets wrapped bitcoin with onchain-verifiable reserves, aiming to win institutional DeFi flows from older BTC wrappers.",
    publishedAt: "2026-04-05T12:49:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "Bankless", url: "https://www.bankless.com/read/news/circle" },
      { _key: key(), label: "Circle", url: "https://www.circle.com/cirbtc" },
      { _key: key(), label: "CoinGecko WBTC", url: "https://www.coingecko.com/en/coins/wrapped-bitcoin" },
      { _key: key(), label: "CoinGecko cbBTC", url: "https://www.coingecko.com/en/coins/coinbase-wrapped-btc" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 10: Hyperliquid Mobile App Turns a Trading Venue Into a Habit
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle10() {
  return {
    _id: "drafts.hyperliquid-mobile-app",
    _type: "article",
    title: "Hyperliquid Mobile App Turns a Trading Venue Into a Habit",
    slug: { _type: "slug", current: "hyperliquid-mobile-app" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("The Hyperliquid mobile app is live on Android, but the first release matters less for what it does today than for what it lets Hyperliquid control next. Bankless reported on April 3 that Hyperliquid Labs had released a Google Play MVP for testing, initially limited to order fill notifications, while the Play Store listing shows the official app was updated on March 19 and had already passed 500 downloads when Bankless wrote about it."),
      textBlock("What Hyperliquid actually shipped on Android", "h2"),
      textBlock("According to Bankless, Hyperliquid announced the app through Discord on April 1 as an MVP \"intentionally limited in scope,\" with order fill notifications as the only live function in the first release. Bankless also described the app as an incremental upgrade from Hyperliquid's earlier progressive web app approach, meant to collect user feedback on priorities and device-specific issues before broader feature expansion."),
      textBlock("The Play Store listing already points to where the product is supposed to go. It describes Hyperliquid as a non-custodial trading app with 24/7 perpetuals trading across crypto, equities, commodities, and FX, spot trading and deposits and withdrawals for multiple assets, advanced order types including TWAP and take-profit/stop-loss, portfolio margin using HYPE, BTC, and USDC as collateral, real-time tracking of positions and balances, and onboarding through either email or a DeFi wallet. That description is much broader than the current MVP behavior Bankless reported, which suggests Google Play is being used as the distribution shell for a fuller native trading stack that has not yet been fully switched on."),
      textBlock("Why a thin mobile app still matters for product strategy", "h2"),
      textBlock("A notification-only launch can look underwhelming if read as a trading feature release. It looks more meaningful if read as a product-control move. Bankless reported that third-party Hyperliquid interfaces account for roughly 10% of platform trading volume, with most of that share coming from mobile interfaces. Even if that figure came from outside analysis rather than Hyperliquid directly, the logic is strong: mobile usage already exists, and Hyperliquid has had less control over that surface than over its main web app. By launching an official native app, it can begin reclaiming distribution, alerts, and the habitual \"check the venue\" loop from independent front ends."),
      textBlock("That shift matters because in trading products, the interface is not just cosmetics. It shapes retention, responsiveness, and where execution starts. Hyperliquid's docs already say users can trade through a normal DeFi wallet or by logging in with an email address, and they explicitly list multiple external interfaces and apps alongside the main web app, including Based, Dexari, MetaMask, and Phantom. That makes Hyperliquid unusually open at the access layer. The trade-off is that openness also leaves room for third-party apps to own mobile mindshare. A first-party Android client is Hyperliquid's clearest signal yet that it wants a larger share of that relationship for itself."),
      internalLinkBlock("DeFi product strategy coverage", "/tags/defi-product-strategy"),
      textBlock("The bigger story is vertical integration of the trading flow", "h2"),
      textBlock("The mobile app also fits Hyperliquid's larger design philosophy. The Play Store description emphasizes low fees, deep liquidity, transparency, portfolio margin, multiple collateral types, and real-time monitoring inside one client. Hyperliquid's onboarding docs reinforce the same integrated model: users can connect a wallet or log in by email, deposit a wide range of assets, and trade directly on the platform's own interface stack. In practice, that means Hyperliquid has spent the last year building toward a more vertically integrated environment where onboarding, trading, collateral management, and now mobile engagement can live inside one branded surface."),
      textBlock("That is not a trivial product change for a derivatives-first venue. Many crypto trading products still treat mobile as a secondary wrapper around the main desktop experience, or they rely on wallets and third-party terminals to fill the gaps. Hyperliquid's official app suggests the team wants tighter ownership over the full loop: the alert arrives on your phone, the position is checked in the official client, and eventually the order is likely placed there too. Once that loop exists, mobile stops being an access convenience and becomes part of execution infrastructure."),
      internalLinkBlock("mobile trading infrastructure archive", "/tags/mobile-trading-infrastructure"),
      textBlock("What the MVP says about Hyperliquid's priorities", "h2"),
      textBlock("The choice to start with order fill notifications is revealing. Notifications are not glamorous, but they are one of the highest-value mobile primitives for active traders. They reduce latency between market events and user response, and they help keep the venue present even when the user is away from desktop. A native push channel is also something a web app rarely handles as cleanly across devices and operating-system rules. Bankless explicitly described the app as an MVP for testing and feedback, which implies Hyperliquid is prioritizing reliability and product iteration over headline feature breadth in the first phase."),
      textBlock("The Play Store page, meanwhile, already sketches the end state more clearly than the MVP. It advertises not just monitoring but complete trading functions, from advanced order types to deposits, withdrawals, and collateral handling. That mismatch between present functionality and stated product scope suggests a staged rollout rather than a one-off experiment. Hyperliquid seems to be using Android distribution to establish authenticity, gather device feedback, and create a native channel before broadening the live feature set. That is sensible in a segment where bugs, wallet integration issues, and fake app risk can all damage trust quickly."),
      internalLinkBlock("Hyperliquid archive", "/tags/hyperliquid"),
      textBlock("What builders and traders should watch next", "h2"),
      textBlock("The next milestone is not whether the app exists. It is whether the official client starts to absorb more of the trading flow that currently lives in browsers and third-party wrappers. Builders should watch for three signals: first, whether Hyperliquid enables actual order placement and richer portfolio management in the native app; second, whether wallet and email onboarding remain equally smooth on mobile; and third, whether Hyperliquid continues supporting a broad external interface layer even as it builds a stronger first-party mobile presence. Hyperliquid's docs still present the platform as accessible through many different apps and interfaces, so the strategic question is whether the official mobile app complements that openness or starts to compete against it more directly."),
      textBlock("For traders, the more practical question is trust and distribution. The official Play Store page links directly to Hyperliquid's site, docs, support, and social channels, and it warns users to beware of phishing and fake support. That matters because native mobile distribution in crypto comes with impersonation risk as well as convenience. If Hyperliquid can keep the official app credible, expand features without breaking wallet flows, and turn mobile alerts into real mobile execution, this MVP will look less like a tiny launch and more like the first step in turning a web-native exchange into a habit-forming trading platform."),
      internalLinkBlock("perpetuals trading archive", "/tags/perpetuals-trading"),
      textBlock("The first version of the Hyperliquid mobile app is deliberately small. The strategic move is not. Native mobile gives Hyperliquid a direct line to the user's attention, and in crypto trading, that can matter almost as much as the order book."),
    ],
    excerpt: "Hyperliquid's Android MVP is sparse by design, but that is the point. Native mobile distribution gives the exchange a tighter grip on alerts, retention, and the trading flow it previously shared with third-party apps.",
    seoDescription: "Hyperliquid mobile app launches on Android as an MVP, giving the exchange a native path for alerts, retention, and deeper mobile trading control.",
    publishedAt: "2026-04-05T13:07:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "Bankless", url: "https://www.bankless.com/read/news/hyperliquid-launches-mvp-mobile-trading-app-on-google-play-store" },
      { _key: key(), label: "Google Play Store", url: "https://play.google.com/store/apps/details?id=xyz.hyperliquid.app" },
      { _key: key(), label: "Hyperliquid Docs: How to start trading", url: "https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/how-to-start-trading" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 11: Meta's Stablecoin Return Runs on Partners, Not Power
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle11() {
  return {
    _id: "drafts.meta-stablecoin-partner-model",
    _type: "article",
    title: "Meta's Stablecoin Return Runs on Partners, Not Power",
    slug: { _type: "slug", current: "meta-stablecoin-partner-model" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("Meta stablecoin partners are the real story behind the company's reported return to crypto payments. Cointelegraph argued this week that Meta's 2026 push is built around integration rather than issuance, and earlier reporting from Fortune and The Block said Meta had been exploring stablecoin use for cross-border payouts and had sent requests to outside providers instead of reviving its own coin. That distinction matters. It suggests Meta wants the distribution upside of stablecoins without repeating the political and regulatory fight that killed Libra and Diem."),
      textBlock("Why Meta is choosing partners instead of issuing its own stablecoin", "h2"),
      textBlock("The most obvious reason is historical. Meta's last attempt to build a currency stack ended in one of the most visible political rejections in crypto history. Reuters reported in 2021 that the Diem project had already been reshaped into a U.S. dollar stablecoin after major backlash, and by 2022 Coindesk reported Meta was shutting down the Novi wallet pilot, effectively closing the chapter on that strategy. The lesson was hard to miss: governments were willing to tolerate stablecoins more than they were willing to tolerate a Big Tech company trying to create and govern a quasi-sovereign payment instrument."),
      textBlock("That is why the Cointelegraph framing is useful. A partner-led model lets Meta use existing regulated dollar tokens and orchestration providers rather than forcing regulators to ask whether Meta is trying to become a private monetary authority again. Under this approach, Meta distributes a payment feature across WhatsApp, Instagram, or Messenger, while someone else handles issuance, reserve management, custody, and possibly payout conversion. The company keeps the user relationship and product surface without taking on the most politically sensitive part of the stack."),
      textBlock("Regulation changed, but not in a way that favors a Meta-issued coin", "h2"),
      textBlock("The regulatory environment has become clearer since Diem, but clearer rules do not automatically make Meta a natural issuer. The GENIUS Act was signed into law on July 18, 2025, establishing a U.S. framework for payment stablecoins, and the OCC followed with a February 2026 notice of proposed rulemaking on how the law would be implemented. The statute generally restricts issuance in the United States to permitted payment stablecoin issuers operating under defined oversight. That clarity helps infrastructure providers and licensed issuers. It does not obviously invite a consumer platform giant to mint its own token."),
      textBlock("This is the strategic shift underneath Meta's reported plans. In the Libra era, Meta tried to own the monetary layer and distribution layer together. In the post-GENIUS era, it makes more sense to let regulated specialists handle the monetary layer while Meta handles reach, product integration, and user acquisition. That reduces licensing friction, lowers political risk, and gives Meta room to move faster if it wants to test payments in narrow use cases such as creator payouts or cross-border transfers."),
      internalLinkBlock("stablecoin payments infrastructure coverage", "/tags/stablecoin-payments-infrastructure"),
      textBlock("Why creator payouts are the likely starting point", "h2"),
      textBlock("Fortune's 2025 report said Meta's early conversations focused on stablecoins as a way to pay creators across regions without the fees and delays attached to wire transfers and conventional cross-border methods. That is a much smaller and more defensible use case than launching a new global currency. It also fits the economics of Meta's platforms. Small payouts to creators, affiliates, or service providers are exactly the kind of flows where bank rails feel expensive and slow relative to the payment size."),
      textBlock("The broader payments case is real too. A recent Federal Reserve note on payment stablecoins and cross-border payments describes how traditional correspondent banking relies on high fixed costs, fragmented compliance processes, and intermediary layers that are especially burdensome for smaller cross-border flows. Stablecoin rails do not erase those frictions entirely, but they can reduce settlement delays and streamline the movement of dollar-denominated value across jurisdictions when the compliance and access layers are in place. That makes creator payouts a natural first deployment: the use case is simple, global, and painful enough that better rails matter immediately."),
      internalLinkBlock("cross-border creator payouts archive", "/tags/cross-border-creator-payouts"),
      textBlock("The most likely partners are infrastructure companies, not consumer brands", "h2"),
      textBlock("The reported shortlist has not been confirmed by Meta publicly, so specific counterparties should still be treated as tentative. But the structure of the market makes the likely partner type pretty clear. Stripe completed its acquisition of Bridge in February 2025, and Reuters reported in February 2026 that Bridge had received conditional approval to establish a national trust bank that could support custody, issuance, orchestration, and reserve management for enterprises. Paxos, meanwhile, markets regulated blockchain infrastructure and launched a stablecoin payments platform in 2024 that it says powers products such as Stripe's Pay with Crypto. Those are the kinds of companies that let Meta add stablecoin functionality without becoming an issuer itself."),
      textBlock("That is also why a partner model is stronger than it first appears. Meta does not need to pick a single consumer-facing stablecoin winner on day one. It can use orchestration and settlement providers that abstract parts of issuer selection, compliance, payout routing, and redemption logic. In practice, that means Meta's payment feature could be built on top of infrastructure from firms like Bridge or Paxos while relying on one or more regulated stablecoin issuers underneath. The point is less \"Meta chooses USDC versus USDT\" and more \"Meta chooses a stack that lets it stay out of the issuance business.\""),
      internalLinkBlock("Stripe Bridge archive", "/tags/stripe-bridge"),
      textBlock("Why this is better understood as distribution strategy than crypto strategy", "h2"),
      textBlock("Meta's advantage has never been stablecoin design. It is distribution. Billions of users across messaging and social platforms give the company something issuers and infrastructure providers do not have: a global consumer and creator surface that can turn payment rails into everyday product features. That makes Meta more valuable as a distribution partner than as a monetary operator. The partner-led model reflects that division of labor cleanly. Stablecoin firms bring compliance, reserves, licensing, and settlement. Meta brings reach, engagement, and payout demand."),
      textBlock("This also lines up with a broader market pattern. Reuters reported in March that Mastercard is buying stablecoin infrastructure firm BVNK for up to $1.8 billion as part of its push into blockchain-based transfers. Large incumbents increasingly want stablecoin capability, but many are buying or integrating infrastructure rather than building every layer internally. Meta appears to be following the same logic from the platform side."),
      internalLinkBlock("Diem aftermath coverage", "/tags/diem-aftermath"),
      textBlock("What builders should watch next", "h2"),
      textBlock("The next important signal is not whether Meta \"likes stablecoins.\" It is whether the company announces a narrow payments corridor, a named infrastructure partner, or a limited product rollout tied to payouts. Those are the milestones that would show this is moving from internal exploration into deployable infrastructure. Until then, the most grounded interpretation is that Meta is assembling optionality while avoiding the mistake of owning too much of the stack."),
      textBlock("For builders, the useful lesson is broader than Meta itself. Consumer platforms may end up being distribution engines for stablecoin payments without ever becoming issuers. That could be the winning model for the next wave of adoption: regulated specialists handle the money, infrastructure firms handle orchestration, and massive platforms handle reach. Meta's stablecoin return looks much less like a Libra sequel and much more like a bet that the best power move is not to own the coin at all."),
    ],
    excerpt: "Meta's stablecoin comeback is defined by what it is not doing. After Diem, the company appears to want payment rails it can distribute at scale without trying to control the money itself.",
    seoDescription: "Meta's stablecoin return relies on partners instead of issuing its own coin, aiming to scale payouts without repeating the Diem backlash.",
    publishedAt: "2026-04-05T13:28:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "Cointelegraph", url: "https://cointelegraph.com/news/why-meta-chooses-partners-over-power-in-its-2026-stablecoin-push" },
      { _key: key(), label: "Fortune", url: "https://fortune.com/crypto/2025/05/08/meta-stablecoins-exploration-usdc-circle-diem-libra/" },
      { _key: key(), label: "OCC", url: "https://www.occ.treas.gov/news-issuances/bulletins/2026/bulletin-2026-3.html" },
      { _key: key(), label: "Stripe", url: "https://stripe.com/newsroom/news/stripe-completes-bridge-acquisition" },
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 12: European Banks Push Tokenized Deposits Over Stablecoins
// ══════════════════════════════════════════════════════════════════════════════

function buildArticle12() {
  return {
    _id: "drafts.european-banks-tokenized-deposits",
    _type: "article",
    title: "European Banks Push Tokenized Deposits Over Stablecoins",
    slug: { _type: "slug", current: "european-banks-tokenized-deposits" },
    category: { _ref: "category-web3-builder", _type: "reference" },
    author: { _ref: "author-developer-journalist", _type: "reference" },
    mainImage: { _type: "image", alt: "Cryptic daily" },
    body: [
      textBlock("European banks tokenized deposits are emerging as a serious response to the onchain cash race. Cointelegraph reported in late March that banks are testing tokenized deposits as a way to move commercial bank money onto blockchain-based payment and settlement rails, and the bigger point is that many banks now want digital money infrastructure without ceding the monetary layer to stablecoin issuers."),
      textBlock("What tokenized deposits are actually trying to do", "h2"),
      textBlock("RWA.io's March 2026 research note says tokenized commercial bank deposits are being positioned as a crucial building block for digital finance, especially where institutions want blockchain-native settlement while keeping money inside the regulated banking system. That matters because tokenized deposits are not just another euro- or dollar-linked token competing for exchange listings. They are digital representations of bank deposits, meant to function as commercial bank money on blockchain rails. Reuters' September 2025 reporting on UK banks described the same basic logic: tokenized deposits let banks innovate with programmable, near-instant payments while keeping funds within bank balance sheets rather than shifting activity to external stablecoin issuers."),
      textBlock("That distinction is why the category is getting more attention in Europe. Stablecoins can solve availability and interoperability problems, but they also move settlement and liquidity into issuer-driven structures that banks do not control. Tokenized deposits offer a different answer: keep the liability as bank money, but make it programmable and usable in tokenized markets. Deutsche Bank's 2026 digital-assets outlook makes this contrast explicit, arguing that stablecoins found early traction because bank money was not available on a 24/7 basis, while broader real-world use cases now depend on expanding the menu of digital money forms."),
      textBlock("Why European banks prefer this route over handing the rail to stablecoins", "h2"),
      textBlock("The strategic reason is simple. Banks want digital cash onchain, but they do not necessarily want third-party stablecoin issuers to become the default money layer for tokenized securities, collateral movement, and wholesale settlement. The ECB sharpened that point in March 2026, saying tokenized central bank money should remain the settlement anchor for wholesale transactions, complemented by private settlement assets such as tokenized deposits and properly regulated euro-denominated stablecoins. In a separate speech, ECB Executive Board member Piero Cipollone said tokenized central bank money would act as the settlement bridge that makes private settlement assets convertible to one another, including transfers between tokenized deposits or settlement of stablecoins into fiat on DLT."),
      textBlock("That framing helps explain why banks are not simply becoming stablecoin issuers across the board. A bank-issued stablecoin can work, and Europe is already seeing that path explored too. Reuters reported in December 2025 that a consortium led by major European banks was preparing a euro stablecoin plan for the second half of 2026. But tokenized deposits solve a different institutional problem: how to keep commercial bank money native to tokenized workflows rather than treating stablecoins as the universal settlement asset by default. For banks, that is as much about preserving their place in market plumbing as it is about launching a new product."),
      internalLinkBlock("digital money infrastructure coverage", "/tags/digital-money-infrastructure"),
      textBlock("The real builder issue is interoperability, not just issuance", "h2"),
      textBlock("Issuing deposit tokens is the easy part compared with making them useful across banks, platforms, and settlement environments. RWA.io's report says large-scale adoption will depend on interoperability and regulatory coordination across platforms and jurisdictions. The ECB is making the same point from the public-money side: without tokenized central bank money, participants in tokenized markets may receive payment in an asset they do not want to hold, whether because of credit risk, asset mismatch, or conversion friction. In plain terms, a tokenized market does not scale cleanly if every participant has to worry about which private money token arrives on the other side of the trade."),
      textBlock("This is why the debate is increasingly about settlement architecture rather than \"who has the best coin.\" Tokenized deposits only become powerful when they can move between banks or settle alongside tokenized securities without constant bilateral reconciliation. ECB officials are effectively arguing that tokenized central bank money is needed as the public anchor, while tokenized deposits and stablecoins can operate above it as private forms of digital money. That model is less exciting than the pitch for a single dominant stablecoin, but it is closer to how real financial systems usually scale."),
      internalLinkBlock("tokenized settlement assets archive", "/tags/tokenized-settlement-assets"),
      textBlock("Europe is moving from theory into production-minded experiments", "h2"),
      textBlock("The European and adjacent market signals are becoming harder to dismiss as pilots with no path forward. ECB speeches in March describe tokenized capital markets in Europe as moving from exploration to production. Reuters reported last week that BMO plans to launch a tokenized cash platform with CME Group and Google Cloud in the second half of 2026, with tokenized deposits also part of the roadmap. While that is North American rather than European, it reinforces the same institutional direction: large banks and market operators are trying to put bank-linked money onto always-on financial rails."),
      textBlock("In Europe specifically, tokenized deposit work is showing up in multiple forms. Reuters reported that major UK lenders including HSBC, NatWest, Lloyds, Barclays, Nationwide, and Santander were pressing ahead with tokenized deposit plans after Bank of England Governor Andrew Bailey urged the industry to prioritize that technology over stablecoins. At the same time, industry reporting around Germany's Commercial Bank Money Token initiative shows banks such as Commerzbank, Deutsche Bank, DZ Bank, and UniCredit working toward pre-production trials for bank-money tokens. The exact implementation paths differ, but the pattern is consistent: banks increasingly want digital cash products that remain legible as bank money, not merely as exchangeable crypto instruments."),
      internalLinkBlock("European bank tokenization archive", "/tags/european-bank-tokenization"),
      textBlock("What builders and markets should watch next", "h2"),
      textBlock("The next phase will be decided less by headlines about \"tokenized money\" and more by narrow infrastructure questions. Builders should watch whether banks expose tokenized deposits only in closed institutional environments or make them interoperable with tokenized securities venues, treasury workflows, and other regulated blockchain systems. They should also watch whether Europe gets the public settlement layer the ECB keeps arguing for, because that will determine whether tokenized deposits stay fragmented bank products or become part of a broader market-wide money stack."),
      textBlock("The bigger market implication is straightforward. Stablecoins are not going away, but Europe's banks are signaling that they do not want stablecoins to be the only credible onchain cash option. Tokenized deposits are their answer: keep commercial bank money programmable, regulated, and institutionally native. The race is no longer just about who issues digital money first. It is about which settlement design becomes the default once tokenized finance moves from pilots into production."),
      internalLinkBlock("European payments rails coverage", "/tags/european-payments-rails"),
    ],
    excerpt: "European banks are pushing tokenized deposits because they want onchain cash without handing the money layer to stablecoin issuers. The fight is increasingly about settlement architecture, not branding.",
    seoDescription: "European banks are pushing tokenized deposits to keep commercial bank money onchain as stablecoins and digital euro plans reshape settlement.",
    publishedAt: "2026-04-05T13:47:00.000Z",
    featured: false, sponsored: false, noIndex: false,
    sources: [
      { _key: key(), label: "Cointelegraph", url: "https://cointelegraph.com/news/tokenized-deposits-europe-banks-stablecoins" },
      { _key: key(), label: "RWA.io", url: "https://www.rwa.io/post/tokenized-deposits-essential-to-the-future-of-digital-finance-finds-industry-backed-rwa-io-research" },
      { _key: key(), label: "ECB speech", url: "https://www.ecb.europa.eu/press/key/date/2026/html/ecb.sp260323~a88f20c049.en.html" },
      { _key: key(), label: "ECB strategy", url: "https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.pr260331~04561d8476.en.html" },
    ],
  };
}

// ── Build all articles ──────────────────────────────────────────────────────

const article3 = buildArticle3();
const article4 = buildArticle4();
const article5 = buildArticle5();
const article6 = buildArticle6();
const article7 = buildArticle7();
const article8 = buildArticle8();
const article9 = buildArticle9();
const article10 = buildArticle10();
const article11 = buildArticle11();
const article12 = buildArticle12();

// ── Collect all articles ─────────────────────────────────────────────────────

const allArticles = [
  article1, article2, article3, article4, article5, article6,
  article7, article8, article9, article10, article11, article12,
];

// ── Upload via Sanity HTTP Mutations API ─────────────────────────────────────

async function upload() {
  console.log(`\n🚀 Uploading ${allArticles.length} articles + ${allTags.length} tags...\n`);

  if (DRY_RUN) {
    for (const a of allArticles) {
      console.log(`📄  ${a._id} — ${a.title}`);
    }
    console.log("\n── DRY RUN — no mutations sent ──");
    console.log("Full JSON for first article:\n", JSON.stringify(allArticles[0], null, 2));
    return;
  }

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

  // Build mutations: tags first, then category/author, then articles
  const mutations = [
    // Category & Author
    { createIfNotExists: categoryDoc },
    { createIfNotExists: authorDeveloperJournalist },
    // Tags
    ...allTags.map((t) => ({ createIfNotExists: t })),
    // Articles
    ...allArticles.map((a) => ({ createOrReplace: a })),
  ];

  console.log(`📦 Total mutations: ${mutations.length}`);

  // Sanity has a mutation limit per request, so batch if needed
  const BATCH_SIZE = 50;
  for (let i = 0; i < mutations.length; i += BATCH_SIZE) {
    const batch = mutations.slice(i, i + BATCH_SIZE);
    console.log(`\n📤 Sending batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} mutations)...`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ mutations: batch }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error("❌ Failed:\n", JSON.stringify(result, null, 2));
      process.exit(1);
    }
    console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} succeeded!`);
  }

  console.log("\n🎉 All articles uploaded successfully!");
}

upload().catch(console.error);
