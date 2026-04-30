/**
 * upload-web3-fraud-files.mjs
 *
 * Uploads all 10 Web3 Fraud Files articles to Sanity.
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
  { _id: "tag-drift-protocol-exploit", _type: "tag", title: "drift protocol exploit", slug: { _type: "slug", current: "drift-protocol-exploit" }, seoDescription: "Coverage of the Drift Protocol exploit, including attack mechanics, fund flows, recovery efforts, and what the breach means for Solana DeFi security." },
  { _id: "tag-solana-defi-hacks", _type: "tag", title: "solana defi hacks", slug: { _type: "slug", current: "solana-defi-hacks" }, seoDescription: "Reporting and analysis on Solana DeFi hacks, covering exploits, governance failures, bridge attacks, and protocol security responses." },
  { _id: "tag-multisig-security", _type: "tag", title: "multisig security", slug: { _type: "slug", current: "multisig-security" }, seoDescription: "Stories on multisig security in crypto, from signer compromise and timelock design to operational controls and governance risk." },
  { _id: "tag-dprk-crypto-laundering", _type: "tag", title: "dprk crypto laundering", slug: { _type: "slug", current: "dprk-crypto-laundering" }, seoDescription: "Coverage of DPRK crypto laundering patterns, attribution signals, cross-chain fund movement, and sanctions-linked blockchain investigations." },

  // Article 2 tags
  { _id: "tag-crypto-wash-trading", _type: "tag", title: "crypto wash trading", slug: { _type: "slug", current: "crypto-wash-trading" }, seoDescription: "Reporting on crypto wash trading cases, market manipulation tactics, enforcement actions, and how fake volume distorts token prices and listings." },
  { _id: "tag-market-maker-fraud", _type: "tag", title: "market maker fraud", slug: { _type: "slug", current: "market-maker-fraud" }, seoDescription: "Coverage of fraudulent market making in digital assets, including spoofed liquidity, fake volume, pump-and-dump schemes, and investor harm." },
  { _id: "tag-gotbit-case", _type: "tag", title: "gotbit case", slug: { _type: "slug", current: "gotbit-case" }, seoDescription: "News and analysis on the Gotbit case, from U.S. criminal charges and guilty pleas to market manipulation allegations and forfeiture actions." },
  { _id: "tag-crypto-enforcement", _type: "tag", title: "crypto enforcement", slug: { _type: "slug", current: "crypto-enforcement" }, seoDescription: "Coverage of crypto enforcement by U.S. agencies, including DOJ, FBI, IRS-CI, and SEC actions against fraud, manipulation, and illicit finance." },

  // Article 3 tags
  { _id: "tag-ledger-phishing-scam", _type: "tag", title: "ledger phishing scam", slug: { _type: "slug", current: "ledger-phishing-scam" }, seoDescription: "Coverage of Ledger phishing scams, from fake support messages and mailed letters to seed phrase theft, tracing, and victim recovery efforts." },
  { _id: "tag-crypto-asset-seizure", _type: "tag", title: "crypto asset seizure", slug: { _type: "slug", current: "crypto-asset-seizure" }, seoDescription: "Reporting on crypto asset seizures, forfeiture actions, blockchain tracing, and how law enforcement recovers stolen digital funds." },
  { _id: "tag-seed-phrase-theft", _type: "tag", title: "seed phrase theft", slug: { _type: "slug", current: "seed-phrase-theft" }, seoDescription: "News and analysis on seed phrase theft, including phishing routes, wallet drains, laundering patterns, and self-custody security failures." },
  { _id: "tag-usdt-forfeiture", _type: "tag", title: "usdt forfeiture", slug: { _type: "slug", current: "usdt-forfeiture" }, seoDescription: "Coverage of USDT forfeiture cases tied to fraud, laundering, and recovery actions, with a focus on tracing and victim restitution." },

  // Article 4 tags
  { _id: "tag-resolv-exploit", _type: "tag", title: "resolv exploit", slug: { _type: "slug", current: "resolv-exploit" }, seoDescription: "Coverage of the Resolv exploit, including unauthorized USR minting, depeg mechanics, recovery efforts, and the protocol failures behind the attack." },
  { _id: "tag-stablecoin-depeg", _type: "tag", title: "stablecoin depeg", slug: { _type: "slug", current: "stablecoin-depeg" }, seoDescription: "Reporting on stablecoin depegs, reserve stress, mint failures, and the market structure problems that can break dollar pegs in crypto." },
  { _id: "tag-compromised-key-attacks", _type: "tag", title: "compromised key attacks", slug: { _type: "slug", current: "compromised-key-attacks" }, seoDescription: "Stories on compromised key attacks in crypto, from signer failures and mint abuse to governance breakdowns and treasury losses." },
  { _id: "tag-usr-stablecoin", _type: "tag", title: "usr stablecoin", slug: { _type: "slug", current: "usr-stablecoin" }, seoDescription: "News and analysis on USR stablecoin, including price dislocations, collateral design, exploit fallout, and protocol recovery updates." },

  // Article 5 tags
  { _id: "tag-aleksei-volkov", _type: "tag", title: "aleksei volkov", slug: { _type: "slug", current: "aleksei-volkov" }, seoDescription: "Coverage of Aleksei Volkov, the Russian initial access broker tied to U.S. ransomware cases, restitution orders, and cybercrime enforcement." },
  { _id: "tag-ransomware-payments", _type: "tag", title: "ransomware payments", slug: { _type: "slug", current: "ransomware-payments" }, seoDescription: "Reporting on ransomware payments, crypto extortion flows, victim response, enforcement pressure, and the money trails behind cybercrime." },
  { _id: "tag-initial-access-brokers", _type: "tag", title: "initial access brokers", slug: { _type: "slug", current: "initial-access-brokers" }, seoDescription: "Stories on initial access brokers, the cybercriminals who sell network footholds that later fuel ransomware, data theft, and extortion." },
  { _id: "tag-yanluowang", _type: "tag", title: "yanluowang", slug: { _type: "slug", current: "yanluowang" }, seoDescription: "Coverage of the Yanluowang ransomware group, including attacks, leak-site activity, operator exposure, and law-enforcement action." },

  // Article 6 tags
  { _id: "tag-clifton-collins-bitcoin", _type: "tag", title: "clifton collins bitcoin", slug: { _type: "slug", current: "clifton-collins-bitcoin" }, seoDescription: "Coverage of the Clifton Collins bitcoin case, including lost wallet keys, forfeiture orders, Garda seizures, and crypto asset recovery efforts." },
  { _id: "tag-crypto-asset-recovery", _type: "tag", title: "crypto asset recovery", slug: { _type: "slug", current: "crypto-asset-recovery" }, seoDescription: "Reporting on crypto asset recovery, wallet access, forensic tracing, forfeiture proceedings, and the limits of law enforcement seizures." },
  { _id: "tag-irish-criminal-assets-bureau", _type: "tag", title: "irish criminal assets bureau", slug: { _type: "slug", current: "irish-criminal-assets-bureau" }, seoDescription: "News and analysis on Ireland's Criminal Assets Bureau, including crypto seizures, forfeiture actions, and proceeds-of-crime enforcement." },
  { _id: "tag-seized-bitcoin-wallets", _type: "tag", title: "seized bitcoin wallets", slug: { _type: "slug", current: "seized-bitcoin-wallets" }, seoDescription: "Coverage of seized bitcoin wallets, from lost keys and dormant holdings to court orders, forensic access, and asset disposal questions." },

  // Article 7 tags
  { _id: "tag-balancer-labs-shutdown", _type: "tag", title: "balancer labs shutdown", slug: { _type: "slug", current: "balancer-labs-shutdown" }, seoDescription: "Coverage of Balancer Labs' shutdown, DAO restructuring, exploit fallout, and what the wind-down means for Balancer's future." },
  { _id: "tag-balancer-exploit", _type: "tag", title: "balancer exploit", slug: { _type: "slug", current: "balancer-exploit" }, seoDescription: "Reporting on the Balancer exploit, including attack mechanics, losses, recovery efforts, and the operational fallout across DeFi." },
  { _id: "tag-defi-governance-risk", _type: "tag", title: "defi governance risk", slug: { _type: "slug", current: "defi-governance-risk" }, seoDescription: "Analysis of DeFi governance risk, including DAO structures, corporate wrappers, legal exposure, and post-exploit restructuring." },
  { _id: "tag-bal-tokenomics", _type: "tag", title: "bal tokenomics", slug: { _type: "slug", current: "bal-tokenomics" }, seoDescription: "Coverage of BAL tokenomics, including emissions cuts, veBAL changes, treasury routing, and buyback proposals tied to protocol sustainability." },

  // Article 8 tags
  { _id: "tag-uranium-finance-hack", _type: "tag", title: "uranium finance hack", slug: { _type: "slug", current: "uranium-finance-hack" }, seoDescription: "Coverage of the Uranium Finance hack, from exploit mechanics and stolen funds to law-enforcement recovery and criminal charges." },
  { _id: "tag-defi-exploit-indictment", _type: "tag", title: "defi exploit indictment", slug: { _type: "slug", current: "defi-exploit-indictment" }, seoDescription: "Reporting on criminal indictments tied to DeFi exploits, including fraud charges, laundering counts, and smart contract attack cases." },
  { _id: "tag-tornado-cash-laundering", _type: "tag", title: "tornado cash laundering", slug: { _type: "slug", current: "tornado-cash-laundering" }, seoDescription: "Stories on Tornado Cash laundering in exploit cases, including fund obfuscation, tracing methods, seizures, and prosecution trends." },
  { _id: "tag-jonathan-spalletta", _type: "tag", title: "jonathan spalletta", slug: { _type: "slug", current: "jonathan-spalletta" }, seoDescription: "Coverage of Jonathan Spalletta, the Maryland man charged in the Uranium Finance hack and related money laundering allegations." },

  // Article 9 tags
  { _id: "tag-crypto-sanctions-evasion", _type: "tag", title: "crypto sanctions evasion", slug: { _type: "slug", current: "crypto-sanctions-evasion" }, seoDescription: "Coverage of how sanctioned states and networks use crypto for procurement, settlement, and financial workarounds under international pressure." },
  { _id: "tag-drone-procurement-networks", _type: "tag", title: "drone procurement networks", slug: { _type: "slug", current: "drone-procurement-networks" }, seoDescription: "Reporting on drone procurement networks, including dual-use components, military supply chains, sanctions risk, and covert payment flows." },
  { _id: "tag-iran-crypto-activity", _type: "tag", title: "iran crypto activity", slug: { _type: "slug", current: "iran-crypto-activity" }, seoDescription: "Analysis of Iran's crypto activity, from sanctions pressure and state-linked wallets to exchange flows, stablecoins, and procurement risk." },
  { _id: "tag-russia-crypto-procurement", _type: "tag", title: "russia crypto procurement", slug: { _type: "slug", current: "russia-crypto-procurement" }, seoDescription: "Coverage of Russia-linked crypto procurement, including fundraising, sanctions evasion, dual-use purchases, and military-adjacent payment flows." },

  // Article 10 tags
  { _id: "tag-sec-crypto-enforcement", _type: "tag", title: "sec crypto enforcement", slug: { _type: "slug", current: "sec-crypto-enforcement" }, seoDescription: "Coverage of SEC crypto enforcement, including case withdrawals, settlements, leadership changes, and shifting U.S. regulatory priorities." },
  { _id: "tag-margaret-ryan-resignation", _type: "tag", title: "margaret ryan resignation", slug: { _type: "slug", current: "margaret-ryan-resignation" }, seoDescription: "Reporting on Margaret Ryan's SEC resignation, internal disputes, enforcement strategy, and the fallout for financial regulation." },
  { _id: "tag-paul-atkins-sec", _type: "tag", title: "paul atkins sec", slug: { _type: "slug", current: "paul-atkins-sec" }, seoDescription: "Analysis of Paul Atkins' SEC leadership, including policy shifts, crypto oversight, enforcement decisions, and political scrutiny." },
  { _id: "tag-crypto-regulatory-rollback", _type: "tag", title: "crypto regulatory rollback", slug: { _type: "slug", current: "crypto-regulatory-rollback" }, seoDescription: "Coverage of crypto regulatory rollback in the U.S., from dropped cases and softer settlements to political and market implications." },
];

// ── Categories & Authors ─────────────────────────────────────────────────────

const categoryDoc = {
  _id: "category-web3-fraud-files",
  _type: "category",
  title: "Web3 Fraud Files",
  slug: { _type: "slug", current: "web3-fraud-files" },
};

const authorInvestigativeReporter = {
  _id: "author-investigative-reporter",
  _type: "author",
  name: "Investigative Reporter",
  slug: { _type: "slug", current: "investigative-reporter" },
};

const authorRegulatoryReporter = {
  _id: "author-regulatory-reporter",
  _type: "author",
  name: "Regulatory Reporter",
  slug: { _type: "slug", current: "regulatory-reporter" },
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 1: Drift Protocol Exploit Exposes DeFi's Human-Layer Risk
// ══════════════════════════════════════════════════════════════════════════════

const article1 = {
  _id: "drafts.drift-protocol-exploit-human-layer-risk",
  _type: "article",
  title: "Drift Protocol Exploit Exposes DeFi's Human-Layer Risk",
  slug: { _type: "slug", current: "drift-protocol-exploit-human-layer-risk" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("The Drift Protocol exploit was not just another DeFi drain. The April 1 attack stripped roughly $285 million to $286 million from one of Solana's biggest trading venues and did it by compromising governance controls, not by finding a plain vanilla smart contract bug. That distinction matters because it points to a deeper failure inside DeFi's human layer: signer security, admin design, and the speed at which privileged actions can become irreversible."),
    textBlock("What happened in the Drift Protocol exploit?", "h2"),
    textBlock("Decrypt reported that Drift said a malicious actor gained unauthorized administrative access through what the team described as a \"novel attack,\" likely involving sophisticated social engineering. That access let the attacker modify key controls, introduce a fake asset into the system, inflate its value, and then abuse borrowing and withdrawal mechanics to drain real liquidity. Elliptic and TRM both place the losses at about $285 million to $286 million, making it the largest DeFi hack of 2026 so far. DeFiLlama classifies the incident as \"Compromised Admin + Fake Token Price Manipulation,\" which matches the broad forensic picture now taking shape."),
    linkBlock("Decrypt's initial report on the exploit", "https://decrypt.co/363176/drift-protocol-285-million-exploit-solana-defi-security?amp=1"),
    textBlock("The speed of the drain is part of the story. TRM said the attacker executed the core theft in roughly 12 minutes after staging infrastructure and permissions well in advance. Its reconstruction says the attacker used social engineering to get Security Council signers to pre-sign authorizations, then exploited a zero-timelock configuration to list a fabricated token as collateral and push through 31 withdrawal transactions. Some of those details remain part of an initial forensic narrative rather than a full public post-mortem from Drift, so they should still be treated as attributed investigative findings rather than final, uncontested fact. But even at this stage, the pattern is clear: privileged controls failed before code-level guardrails had any chance to matter."),
    textBlock("Why this hack matters beyond Drift", "h2"),
    textBlock("Drift is not a fringe venue. Its own website says the protocol has handled more than $50 billion in cumulative volume, 19.2 million total trades, and at one point marketed itself as Solana's \"most reliable trading platform.\" That scale gave the exploit system-wide importance. When a protocol this large can be drained through signer compromise and admin abuse, the lesson is not limited to one team's opsec. It challenges a familiar DeFi claim: that audited contracts and decentralization rhetoric are enough to protect user funds when emergency councils, multisigs, and privileged upgrade paths still sit behind the curtain."),
    linkBlock("Drift's official product page", "https://www.drift.trade/"),
    textBlock("The market impact showed up fast in protocol-level liquidity. Elliptic said Drift's TVL collapsed from about $550 million to under $250 million after the exploit, while DeFiLlama's hack database now records the loss at $285 million. That is why the exploit sits in the same conversation as the biggest Solana security failures, even if it did not match the absolute scale of the 2022 Wormhole bridge theft. The core implication for builders and users is brutal but simple: admin paths are part of the attack surface, and if they can be moved instantly, then \"decentralized\" can still mean \"one phishing campaign away from failure.\""),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("How the attack appears to have worked", "h2"),
    textBlock("The standout feature of this case is that the attacker seems to have manufactured legitimacy before stealing value. Decrypt said the exploit hinged on introducing a fake digital asset and modifying withdrawal limits. TRM's more detailed reconstruction says the attacker created a fictitious token, seeded minimal liquidity, and used it as collateral once privileged permissions were in hand. In other words, the exploit chain fused governance compromise, oracle or listing trust, and withdrawal logic into one sequence. That makes this less like a classic bug bounty disclosure and more like a full-spectrum operational breach."),
    linkBlock("TRM's forensic reconstruction", "https://www.trmlabs.com/resources/blog/north-korean-hackers-attack-drift-protocol-in-285-million-heist"),
    textBlock("Security experts quoted by Decrypt pushed the same conclusion from different angles. David Schwed of SVRN argued that DeFi engineers often overfocus on technical architecture while underweighting people and process risk. Stefan Byer of Oak Security said timelocks would have helped by buying response time, but called the compromised privileged key the real issue. Dan Hongfei of Neo Blockchain and Or Dadosh of Venn Network both pointed to the need for enforced delays and automatic circuit breakers around high-risk administrative actions. None of that reverses the theft. It does, however, frame the broader design error: Drift appears to have combined concentrated admin power with insufficient friction on dangerous changes."),
    textBlock("What on-chain evidence says about the money trail", "h2"),
    textBlock("The post-exploit fund movement is one reason investigators quickly focused on organized threat actors. Elliptic said on-chain behavior, laundering methodologies, and network-level indicators are consistent with past DPRK-linked operations. Its report says the attacker's wallet was created about eight days before the exploit, received a small test transfer from a Drift vault, then converted stolen assets on Solana into USDC before bridging much of the value to Ethereum and swapping into ETH. That kind of cross-chain laundering playbook is familiar to compliance teams because it prioritizes speed, fragmentation, and chain-hopping immediately after compromise."),
    linkBlock("Elliptic's attribution analysis", "https://www.elliptic.co/blog/drift-protocol-exploited-for-286-million-in-suspected-dprk-linked-attack"),
    textBlock("TRM also said its initial investigation points to North Korean hackers, but attribution is still best treated as probable rather than settled. What is verifiable right now is the shape of the laundering route and the scale of the theft. Elliptic added that if the DPRK link is confirmed, this would be the eighteenth DPRK-related incident it has tracked in 2026, with more than $300 million stolen so far this year. The firm also repeated a broader estimate that DPRK-linked actors have stolen more than $6.5 billion in crypto in recent years, echoing long-running U.S. government claims that such theft supports weapons programs. That matters because the Drift exploit is no longer only a protocol-security story; it is potentially a sanctions, national security, and exchange-screening story too."),
    internalLinkBlock("crypto laundering investigations", "/news/crypto-laundering-investigations"),
    textBlock("Why the comparison to Ronin matters", "h2"),
    textBlock("Decrypt's comparison to Ronin is more than rhetorical. In 2022, Chainalysis and Ronin both said attackers gained control of five of nine validator keys, using that majority to authorize withdrawals from the bridge. That breach became a defining example of how \"decentralized\" systems can still fail through concentrated key control and weak operational security. Drift looks different on the surface because this was not a bridge hack, but the structural lesson overlaps: once privileged signers are compromised, the protocol's formal design stops being the main defense."),
    linkBlock("Chainalysis on the Ronin validator compromise", "https://www.chainalysis.com/blog/axie-infinity-ronin-bridge-dprk-hack-seizure/"),
    textBlock("That is also why timelocks matter so much here. TRM said Drift migrated its Security Council to a two-of-five threshold with zero timelock on March 27, which removed the delay that could have exposed or interrupted malicious admin actions. If that account is accurate, then the exploit was not just about phishing or signer compromise. It was about the absence of time-based friction around catastrophic actions. Protocols that let admin permissions alter collateral listings, withdrawal limits, or vault access instantly are effectively trusting their signer set to be perfect. History says that is a bad bet."),
    internalLinkBlock("multisig security best practices", "/news/multisig-security-best-practices"),
    textBlock("What to watch next after the Drift exploit", "h2"),
    textBlock("The next phase will decide whether this story remains a large exploit or becomes a lasting case study in governance failure. First, the industry needs a detailed public post-mortem from Drift that separates confirmed facts from early forensic reconstruction. Second, exchanges, bridges, and compliance vendors will keep tracing the Ethereum-side funds for any freezing or seizure opportunities. Third, Solana DeFi teams now have a live stress test: review signer policies, timelocks, circuit breakers, collateral-listing controls, and the privileges held by emergency councils before users force the issue through withdrawals."),
    linkBlock("DeFiLlama's hack classification entry", "https://defillama.com/protocol/drift-trade"),
    textBlock("Drift's biggest problem is not only the money already gone. It is that the exploit undermined a trust model shared by much of DeFi: that admin compromise is rare enough to tolerate, and fast governance is worth the risk. After April 1, that argument looks weaker. The real question now is which major protocol admits it has the same design exposure before attackers prove it for them."),
  ],
  excerpt: "Drift's $285 million exploit was not a classic smart contract bug. It was a governance failure that let a staged attacker turn fake collateral into real withdrawals across Solana DeFi.",
  seoDescription: "Drift Protocol exploit analysis: how a $285 million Solana hack used social engineering, fake collateral, and zero timelocks to drain DeFi liquidity.",
  publishedAt: "2026-04-05T11:00:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Decrypt", url: "https://decrypt.co/363176/drift-protocol-285-million-exploit-solana-defi-security?amp=1" },
    { _key: key(), label: "Elliptic", url: "https://www.elliptic.co/blog/drift-protocol-exploited-for-286-million-in-suspected-dprk-linked-attack" },
    { _key: key(), label: "TRM Labs", url: "https://www.trmlabs.com/resources/blog/north-korean-hackers-attack-drift-protocol-in-285-million-heist" },
    { _key: key(), label: "DeFiLlama", url: "https://defillama.com/protocol/drift-trade" },
    { _key: key(), label: "Drift Protocol", url: "https://www.drift.trade/" },
    { _key: key(), label: "Chainalysis", url: "https://www.chainalysis.com/blog/axie-infinity-ronin-bridge-dprk-hack-seizure/" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 2: Crypto Wash Trading Charges Hit Global Market Makers
// ══════════════════════════════════════════════════════════════════════════════

const article2 = {
  _id: "drafts.crypto-wash-trading-charges-market-makers",
  _type: "article",
  title: "Crypto Wash Trading Charges Hit Global Market Makers",
  slug: { _type: "slug", current: "crypto-wash-trading-charges-market-makers" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("Crypto wash trading charges against ten foreign nationals have pushed one of the market's dirtiest open secrets back into full view. U.S. prosecutors say executives and employees at four overseas market-making firms artificially inflated token trading volume and prices, then sold into that manufactured demand. The case matters because it targets not just issuers, but the service providers that help make weak tokens look liquid, active, and exchange-ready."),
    textBlock("What happened in the crypto wash trading charges?", "h2"),
    textBlock("The U.S. Attorney's Office for the Northern District of California said on March 30 that federal grand juries indicted ten executives and employees tied to four firms—Gotbit, Vortex, Antier, and Contrarian—for orchestrating fraud schemes to inflate cryptocurrency trading volume and prices. Prosecutors said the firms acted as illicit market makers, using coordinated self-trading to create fake market activity before allegedly selling tokens at inflated levels to \"unwitting investors.\" Authorities said three defendants were arrested and extradited from Singapore, two other defendants had already pleaded guilty and been sentenced, and more than $1 million in cryptocurrency had been seized."),
    textBlock("Decrypt's summary got the broad frame right, but the DOJ release adds the more important detail: the charges stemmed from an undercover operation by the FBI and IRS Criminal Investigation targeting illicit wash trading in crypto. As part of that operation, the FBI created several cryptocurrency tokens to see which firms would offer manipulation services anyway. That point matters because it turns the case from a standard retrospective enforcement story into a live market-integrity probe. The government is not only saying fake volume happened. It is saying service firms agreed to provide it on demand."),
    linkBlock("DOJ press release on the market manipulation case", "https://www.justice.gov/usao-ndca/pr/ten-foreign-nationals-charged-international-operation-targeting-cryptocurrency-market"),
    textBlock("Why this case is bigger than another pump-and-dump story", "h2"),
    textBlock("Wash trading is one of crypto's oldest credibility problems. The basic tactic is simple: the same trader, or a coordinated group, acts as both buyer and seller to make a token appear more active than it really is. That fake activity can boost ranking-site visibility, create the illusion of liquidity, and help a project pitch itself to real traders or larger exchanges. The DOJ release explicitly says the alleged schemes were designed to inflate trading volume and price, then profit by selling at those manipulated levels."),
    textBlock("That is why this case reaches beyond ten defendants. Reuters' 2024 reporting on the earlier federal crackdown described the FBI's \"Operation Token Mirrors\" as the first time U.S. authorities brought criminal charges against crypto financial-services firms for market manipulation and wash trading. The earlier operation charged 18 individuals and entities, including market makers and token-company leaders, showing that U.S. agencies were moving upstream toward the infrastructure behind fake price discovery rather than only chasing the final dump. This 2026 case extends that strategy. It suggests prosecutors believe the commercial market for fake liquidity is still alive even after 2024's headline arrests and plea deals."),
    linkBlock("Reuters on the 2024 crypto fraud crackdown", "https://www.reuters.com/legal/us-charges-18-people-companies-cryptocurrency-fraud-2024-10-09/"),
    textBlock("How these market makers allegedly sold fake liquidity", "h2"),
    textBlock("The case against the firms turns on their role as service providers. According to the indictments summarized by DOJ, the firms were not merely accused of making opportunistic trades. They allegedly sold a repeatable product: artificial volume, higher token prices, and a more attractive market profile for clients. That is a different category of risk than a founder quietly dumping treasury tokens. It means the manipulation function was outsourced, professionalized, and marketed as a business line."),
    textBlock("The SEC's 2024 civil case against Gotbit helps explain why that matters. In its complaint, the SEC alleged that Gotbit used self-trading and bots to generate artificial volume on platforms tracked by investors, and that the firm at times created more than $1 million of fake daily trading volume. The complaint quoted internal chat messages in which Gotbit personnel said they could produce almost any volume a client wanted and confirmed that much of the observed activity was manufactured. Those allegations are from a separate case, but they show the playbook regulators think these firms were running: fake depth, fake prints, real investor harm."),
    linkBlock("SEC complaint and litigation release involving Gotbit", "https://www.sec.gov/enforcement-litigation/litigation-releases/lr-26156"),
    textBlock("Why Gotbit is central to the pattern", "h2"),
    textBlock("Gotbit is the clearest example of how long this business model may have operated before law enforcement caught up. Reuters reported in March 2025 that founder Aleksei Andriunin pleaded guilty in the U.S. to charges tied to market manipulation and wire fraud, and that Gotbit agreed to forfeit roughly $23 million in crypto assets. Reuters also said the case grew out of the FBI's undercover token operation and that Gotbit had helped inflate token volumes for clients seeking exchange listings."),
    textBlock("That background changes how this new indictment should be read. This is not a one-off case against one rogue desk. It looks more like a continuing offensive against a business niche that existed in plain sight during the last cycle: firms that offered \"market making\" services but allegedly delivered manufactured volume instead of legitimate liquidity support. There is a real difference between lawful market making and wash trading. Genuine market makers take inventory risk, tighten spreads, and facilitate trading. Wash traders stage activity with no economic purpose beyond deception."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("Who is exposed if the DOJ's theory holds", "h2"),
    textBlock("Token issuers are the first group that should be worried. If prosecutors keep treating manipulative liquidity services as fraud, then any issuer that knowingly hired firms to fake activity could face discovery risk from chats, contracts, invoices, and exchange-listing discussions. The Reuters coverage of the 2024 case and the SEC's filings both show regulators are interested in the chain of coordination, not only the traders executing the prints. That means liability pressure can travel from market makers to project teams and potentially to intermediaries that ignored obvious red flags."),
    textBlock("Exchanges and data aggregators also face pressure. Fake volume does not work unless it is surfaced somewhere that real investors trust. When manipulated trades help a token climb liquidity rankings or appear more established than it is, the downstream effect is market-wide. The case is a reminder that \"high volume\" in crypto still cannot be treated as a clean signal without context around venue quality, self-trading controls, and who is actually providing the flow."),
    internalLinkBlock("market integrity in digital assets", "/news/market-integrity-digital-assets"),
    textBlock("What to watch after these indictments", "h2"),
    textBlock("The most important next step is whether the government publishes more evidence showing how the firms pitched or priced manipulation services. That would clarify whether this was a handful of bad actors or part of a normalized gray-market industry. The second question is whether more extraditions or plea agreements follow. DOJ said the defendants face up to 20 years in prison and fines of $250,000 per wire-fraud count if convicted, which gives prosecutors leverage to pursue cooperation."),
    textBlock("The third thing to watch is whether this enforcement wave changes behavior in token launch markets. If issuers become less willing to pay for artificial volume, small-cap tokens may look far less liquid than they did in the last cycle. That would be healthy, even if painful. Crypto does not fix its credibility problem by talking about transparency while volume can still be bought behind the scenes. It fixes it by making fake liquidity expensive to run and dangerous to sell."),
    internalLinkBlock("crypto enforcement tracker", "/news/crypto-enforcement-tracker"),
  ],
  excerpt: "The DOJ's new case against four overseas crypto market makers shows how fake volume still props up token launches, exchange listings, and retail demand long after the last bull cycle's scandals.",
  seoDescription: "Crypto wash trading charges target four market makers accused of pumping token volume and prices, showing how fake liquidity still shapes crypto markets.",
  publishedAt: "2026-04-05T11:20:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Decrypt", url: "https://decrypt.co/362999/doj-charges-10-foreign-nationals-over-crypto-wash-trading-scheme?amp=1" },
    { _key: key(), label: "U.S. Department of Justice", url: "https://www.justice.gov/usao-ndca/pr/ten-foreign-nationals-charged-international-operation-targeting-cryptocurrency-market" },
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/legal/us-charges-18-people-companies-cryptocurrency-fraud-2024-10-09/" },
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/technology/cryptocurrency-firm-founder-pleads-guilty-us-market-manipulation-scheme-2025-03-21/" },
    { _key: key(), label: "SEC", url: "https://www.sec.gov/enforcement-litigation/litigation-releases/lr-26156" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 3: Ledger Wallet Scam Recovery Shows Seizure Limits
// ══════════════════════════════════════════════════════════════════════════════

const article3 = {
  _id: "drafts.ledger-wallet-scam-recovery-seizure-limits",
  _type: "article",
  title: "Ledger Wallet Scam Recovery Shows Seizure Limits",
  slug: { _type: "slug", current: "ledger-wallet-scam-recovery-seizure-limits" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("Ledger wallet scam recovery is the headline, but the deeper story is uglier. Federal prosecutors in Connecticut said they recovered and forfeited more than $600,000 in cryptocurrency tied to a fraud scheme that began with a fake letter mailed to a Ledger user, then turned into a seed phrase theft and a rapid wallet drain. The recovery matters, but so does the mismatch between what was stolen, what was seized, and how easily physical-world phishing can still break self-custody."),
    textBlock("What happened in the Connecticut Ledger fraud case?", "h2"),
    textBlock("The Justice Department said on April 1 that the U.S. Attorney's Office for the District of Connecticut, working with the FBI and other agencies, recovered and forfeited more than $600,000 in cryptocurrency associated with a fraud scheme. According to the government's press release, the victim, identified as \"T.M.,\" received a physical letter in September 2025 claiming to come from \"Ledger Security & Compliance.\" The letter falsely said the device needed a mandatory security check. After the victim followed the instructions, fraudsters compromised the wallet and stole about $234,000 in crypto. Investigators later traced the funds across multiple wallets and seized roughly $600,000 worth of Tether. The government filed civil forfeiture case 3:26-cv-28, and the court entered a forfeiture decree on March 31, 2026."),
    textBlock("Decrypt's report captured the broad outline, but local court-based reporting adds useful detail. CT Insider reported that the victim was a Weston resident and that the scam moved fast: after the seed phrase was exposed on a fake Ledger-style website, the wallet was drained in about six minutes. The court papers cited by CT Insider say the stolen assets included Ethereum, Solana, Bitcoin, and Chainlink before being laundered and converted into Tether. That timeline matters because it shows how little reaction time a victim has once a recovery phrase is surrendered. In practice, the theft is over before most users even realize the prompt was fraudulent."),
    linkBlock("DOJ press release on the forfeiture", "https://www.justice.gov/usao-ct/pr/us-attorneys-office-recovers-and-forfeits-more-600k-cryptocurrency-fraud-scheme"),
    textBlock("How the seed phrase theft actually worked", "h2"),
    textBlock("This was not a device hack. It was a trust hack. The government says the victim was tricked by a mailed letter, and CT Insider reports that the letter claimed to come from Ledger's chief technology officer and pushed the user toward a fake \"Transaction Check\" flow. Once the victim scanned the QR code and entered the seed phrase into the fraudulent portal, the attackers gained full control over the wallet. That distinction is the whole story: the attacker did not defeat the hardware. The attacker convinced the user to hand over the keys."),
    textBlock("Ledger itself has been warning users about this exact tactic. Its support materials say physical-mail phishing scams may instruct customers to verify an account, scan a QR code, or enter the Secret Recovery Phrase, and it states clearly that Ledger will never ask for the recovery phrase. The official phishing-status page also lists ongoing campaigns aimed at Ledger customers. For crypto users, that means the lesson is narrower and harsher than \"buy a hardware wallet and you are safe.\" A hardware wallet protects keys from many digital threats, but it does not protect users from social engineering that persuades them to export control voluntarily."),
    linkBlock("Ledger warning on physical mail phishing", "https://support.ledger.com/article/I-received-a-Letter-in-the-Mail-from-Ledger"),
    textBlock("Why the seizure total was larger than the original theft", "h2"),
    textBlock("The most eye-catching number in this case is the gap between the roughly $234,000 initially stolen and the more than $600,000 later forfeited. The DOJ release does not fully explain that difference, but it says investigators traced the transactions through multiple wallets and ultimately seized approximately $600,000 worth of Tether that was alleged to be proceeds of wire fraud and involved in money laundering. CT Insider likewise says investigators followed a \"sophisticated laundering process\" before reaching the seized USDT. The most defensible inference is that the assets appreciated, were pooled, or were mixed with related proceeds before seizure, though the public press materials do not fully break down the chain. That means the exact composition of the recovered funds remains partly opaque in the public record."),
    textBlock("That opacity is worth flagging because crypto recovery stories can sound cleaner than they are. A seizure is not the same thing as instant restitution, and a forfeiture order is still part of a legal process. The Connecticut U.S. Attorney's Office says it typically first seeks forfeiture and then works with the Justice Department's Money Laundering, Narcotics and Forfeiture Section to return assets to crime victims so that victims receive clear title without further litigation risk. That is a real win for the victim if it happens. It is also a reminder that law enforcement can sometimes trace and freeze proceeds after the fact, but only when funds remain reachable and identifiable."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("Why this story points back to Ledger's data exposure problem", "h2"),
    textBlock("The Connecticut case did not prove that this specific victim was targeted because of a known data breach. But the context makes that possibility hard to ignore. Decrypt tied the scam to a broader pattern of physical letters sent to wallet users and noted the continuing fallout from Ledger-related data exposures. Ledger's own 2020 incident disclosure says an e-commerce and marketing data breach exposed customer information, while its January 2026 notice says a separate incident at e-commerce partner Global-e affected order data. Those two facts matter because mail phishing only works at scale when scammers know who bought hardware wallets and where to reach them."),
    textBlock("That is the part of the self-custody debate that the industry still struggles to confront directly. Wallet makers often stress that private keys were never exposed in these incidents. Technically true. Operationally incomplete. If names, addresses, emails, or order histories leak, scammers can weaponize that data into highly credible lures. CT Insider's reporting shows exactly how that plays out: a real user receives a realistic letter at a real address, sees company branding and a QR code, and reacts under time pressure. In that environment, the boundary between a data leak and a theft event is thinner than many companies like to admit."),
    linkBlock("Ledger's 2020 breach disclosure", "https://www.ledger.com/addressing-the-july-2020-e-commerce-and-marketing-data-breach"),
    textBlock("What this reveals about self-custody risk", "h2"),
    textBlock("This case is a good example of why crypto's security stack cannot stop at device design. Self-custody puts users in direct control, which is the point, but it also removes the fraud controls that exist in traditional finance. CT Insider quoted the court filing's explanation that once a seed phrase is compromised, the attacker effectively controls the accounts as if they were the legitimate owner, and crypto transfers are irreversible after confirmation. That is why seed phrase theft remains one of the most damaging attack vectors in the market."),
    textBlock("The practical implication is straightforward. Wallet makers need to treat customer-data exposure as a live security issue, not a public-relations issue. Users need to treat any inbound \"security verification\" request as hostile by default. Investigators, meanwhile, are getting better at blockchain tracing and stablecoin seizure, as this case shows. But tracing is not prevention, and not every attacker leaves funds in places where civil forfeiture can reach them."),
    internalLinkBlock("seed phrase theft cases", "/news/seed-phrase-theft-cases"),
    textBlock("What to watch after this forfeiture", "h2"),
    textBlock("The first thing to watch is whether the government releases more detail on the laundering path and the identity of the fraud network behind it. So far, the public record centers on the recovery, not on arrests. The second is whether more victims tied to mailed-letter phishing campaigns come forward, especially after Ledger's January 2026 Global-e incident. The third is whether hardware wallet makers start changing customer-notification design, support workflows, and breach-response protocols to reduce the value of stolen customer data."),
    textBlock("The seizure is real progress. But the market should not mistake a successful forfeiture for a solved problem. The harder question is whether crypto firms can cut off the data leaks and social-engineering paths that make these thefts work in the first place."),
    internalLinkBlock("crypto asset seizure tracker", "/news/crypto-asset-seizure-tracker"),
  ],
  excerpt: "Connecticut prosecutors recovered more than $600,000 in USDT after a Ledger mail phishing case, but the story shows how self-custody scams can still outrun recovery.",
  seoDescription: "Ledger wallet scam recovery in Connecticut shows how phishing, seed phrase theft, and USDT seizures intersect in crypto fraud enforcement.",
  publishedAt: "2026-04-05T11:40:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "U.S. Department of Justice", url: "https://www.justice.gov/usao-ct/pr/us-attorneys-office-recovers-and-forfeits-more-600k-cryptocurrency-fraud-scheme" },
    { _key: key(), label: "Decrypt", url: "https://decrypt.co/363126/us-attorneys-office-recovers-600k-crypto-fraud-scheme-ledger-wallets?amp=1" },
    { _key: key(), label: "CT Insider", url: "https://www.ctinsider.com/news/article/weston-234k-crypto-currency-heist-22187151.php" },
    { _key: key(), label: "Ledger Support", url: "https://support.ledger.com/article/I-received-a-Letter-in-the-Mail-from-Ledger" },
    { _key: key(), label: "Ledger", url: "https://www.ledger.com/addressing-the-july-2020-e-commerce-and-marketing-data-breach" },
    { _key: key(), label: "Ledger Support", url: "https://support.ledger.com/article/Global-e-Incident-to-Order-Data---January-2026" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 4: Resolv Stablecoin Depeg Exposes Synthetic Dollar Fragility
// ══════════════════════════════════════════════════════════════════════════════

const article4 = {
  _id: "drafts.resolv-stablecoin-depeg-synthetic-dollar",
  _type: "article",
  title: "Resolv Stablecoin Depeg Exposes Synthetic Dollar Fragility",
  slug: { _type: "slug", current: "resolv-stablecoin-depeg-synthetic-dollar" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("The Resolv stablecoin depeg was the predictable end state of a deeper failure. After an attacker used a compromised privileged key to mint roughly 80 million unbacked USR, the synthetic dollar lost its peg and crashed as confidence evaporated faster than the protocol could respond. What looked like a $25 million exploit was also a stress test of whether newer stablecoin designs can survive when issuance integrity breaks."),
    textBlock("What happened in the Resolv stablecoin depeg?", "h2"),
    textBlock("Decrypt reported on March 23 that Resolv Labs' USR stablecoin plunged about 74% after an attacker exploited a compromised key and illegally minted 80 million USR tokens. Resolv's own website confirms the broad incident framing, saying the team was investigating \"unauthorized minting of USR\" while claiming the collateral pool remained fully intact and no underlying assets were lost. Chainalysis, Halborn, and other incident writeups converged on the same core sequence: a privileged key linked to issuance was compromised, unbacked USR was created, and the attacker extracted around $23 million to $25 million in value before the system could contain the damage."),
    textBlock("That distinction matters. This was not a clean reserve theft where backing disappeared from the vault. It was an issuance failure. The protocol still had collateral, but it suddenly had far more liabilities than it was supposed to have because counterfeit stablecoins entered circulation. CoinDesk reported that the protocol held about $95 million in assets against roughly $173 million in liabilities after the attack, leaving it functionally insolvent at that point in time. That is why USR's market reaction was so violent: traders were not only pricing a hack, they were pricing the possibility that the token's claim on the system had been permanently diluted."),
    textBlock("How the attack worked: one key, unlimited damage", "h2"),
    textBlock("Chainalysis said the attacker exploited a compromised key to authorize the minting of about 80 million unbacked USR, then extracted roughly $23 million from the protocol. Halborn's reconstruction similarly said the attacker used a compromised private key to mint 80 million USR against only about $100,000 to $200,000 in collateral. Several reconstructions also pointed to weak controls around the minting path, with Cincodías summarizing Chainalysis' explanation that the issuance process lacked an effective cap on token creation. Even where outside analyses differ slightly on the exact infrastructure details, the common finding is that a privileged credential sat too close to catastrophic mint authority."),
    textBlock("That design failure is worse than a simple coding error because it turns security into a binary question. If an attacker gets the key, the system breaks at the monetary layer. Stablecoins live and die on issuance discipline. Once users believe that supply can be expanded outside the rules, the peg stops being a reserve question alone and becomes a trust question. That is why a single compromised key can create more damage in a synthetic dollar system than in many other DeFi products. It does not just drain value. It rewrites the market's belief about what one token is worth."),
    linkBlock("Chainalysis on the Resolv hack", "https://www.chainalysis.com/blog/lessons-from-the-resolv-hack/"),
    textBlock("Why the depeg became a solvency event, not just a price shock", "h2"),
    textBlock("The market reaction exposed the real weakness in synthetic-dollar structures. Resolv said the collateral pool remained intact, but that did not preserve the peg because the problem was not just asset theft. It was excess liabilities flooding the market. CoinDesk reported that USR traded around $0.27 after the exploit, while CoinMarketCap's current listing still shows the token far below $1, around $0.24, long after the initial incident. In other words, the market did not treat Resolv's claim about intact collateral as enough to restore confidence. It treated the token as impaired."),
    textBlock("That is the difference between a temporary stablecoin wobble and a structural break. Major fiat-backed stablecoins like USDC and USDT have depegged briefly in the past, but they recovered because markets still believed the issuer could honor redemptions close to par. USR's case was different because the exploit raised doubt about the integrity of issuance itself. Once tens of millions of unbacked tokens hit liquidity pools, every holder faced the same question: how much of the circulating supply still represented a valid claim on the collateral base? The peg failed because confidence in the accounting rule failed first."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("Who got hurt beyond Resolv holders", "h2"),
    textBlock("The damage did not stop at USR spot holders. DL News reported that vault curators on Morpho with exposure to USR also suffered losses, showing how newer stable assets can spread risk across lending layers before the market fully prices their fragility. Cincodías likewise reported that the attacker rapidly dumped minted USR into DeFi liquidity pools, swapping into USDC, USDT, and then ETH, which transmitted the exploit through connected venues rather than confining it inside Resolv. This is the standard DeFi pattern in 2026: when a token breaks, the blast radius travels through pools, vaults, and integrations faster than governance can post a forum update."),
    textBlock("That is why this story matters even for protocols with no direct link to Resolv. Integrators often accept stablecoins based on category logic—\"it is a dollar token, so it belongs in lending and liquidity routes\"—without giving enough weight to issuance design, admin key risk, and kill-switch structure. The Resolv incident is a reminder that not all stablecoins fail the same way. Some fail because reserves are missing. Others fail because the minting path itself is not credibly constrained. For downstream protocols, the second category may be harder to contain because the damage starts with counterfeit supply entering the system."),
    linkBlock("CoinDesk on Resolv's post-exploit balance sheet", "https://www.coindesk.com/markets/2026/03/23/resolv-stablecoin-drops-70-after-usd80-million-exploit-after-attacker-mints-usr"),
    textBlock("What Resolv's response solved, and what it did not", "h2"),
    textBlock("Resolv paused protocol functions and warned users not to interact with affected assets while the team investigated. Its public notice emphasized that underlying collateral remained untouched, which was an important clarification but not a complete solution. That statement addressed reserve theft. It did not, by itself, resolve the liability overhang, the price damage, or the question of how honest holders would be made whole relative to counterfeit USR created during the exploit. Chainalysis framed the event as a lesson in how quickly DeFi can unravel when key security assumptions fail, and that is the right reading here. Crisis messaging can buy time, but it cannot restore a peg if the market no longer trusts the issuance system."),
    textBlock("The harder issue is whether Resolv can rebuild credibility without a clean, detailed public post-mortem and a believable recovery framework. CoinMarketCap's Academy writeup said the team paused protocol functions shortly after discovery and described the issue as isolated to issuance mechanics, but the token's persistent dislocation shows the market is still asking for more than containment language. Stablecoins do not recover on branding. They recover on redemption certainty, balance-sheet clarity, and proof that the failure mode cannot recur."),
    internalLinkBlock("stablecoin stress events", "/news/stablecoin-stress-events"),
    textBlock("What this reveals about the next stablecoin risk cycle", "h2"),
    textBlock("The Resolv stablecoin depeg fits a pattern the market should stop treating as niche. The next wave of stablecoin risk is not limited to reserve opacity or algorithmic death spirals. It includes operational and privileged-access failures in supposedly sophisticated issuance systems. Newer stablecoins often market design nuance—yield sources, hedged backing, diversified collateral—as a strength. But complexity also widens the surface area where key management, approvals, and off-chain infrastructure can fail. Chainalysis called Resolv a case of security assumptions collapsing fast; the market should read it as a warning that clever stablecoin architecture does not reduce the need for brutally simple issuance controls."),
    textBlock("What happens next is specific. Traders will watch whether USR can reclaim anything close to par, whether Resolv publishes a full technical post-mortem, and whether integrated protocols cut exposure to experimental dollar products with privileged mint paths. The broader market question is even sharper: after Terra taught crypto to fear reflexive stablecoin designs, will Resolv teach it to fear key-dependent synthetic dollars just as much?"),
    linkBlock("Resolv incident notice", "https://resolv.xyz/"),
    internalLinkBlock("stablecoin risk framework", "/news/stablecoin-risk-framework"),
  ],
  excerpt: "Resolv's USR collapse was not just a hack. It showed how a single compromised key can turn a synthetic dollar design into a fast-moving insolvency event.",
  seoDescription: "Resolv stablecoin depeg analysis: how a compromised key, 80M unbacked USR, and thin confidence broke a synthetic dollar in hours.",
  publishedAt: "2026-04-05T11:55:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Decrypt", url: "https://decrypt.co/361984/resolv-labs-stablecoin-depegs-plunges-74-after-25m-exploit" },
    { _key: key(), label: "Chainalysis", url: "https://www.chainalysis.com/blog/lessons-from-the-resolv-hack/" },
    { _key: key(), label: "Resolv", url: "https://resolv.xyz/" },
    { _key: key(), label: "CoinDesk", url: "https://www.coindesk.com/markets/2026/03/23/resolv-stablecoin-drops-70-after-usd80-million-exploit-after-attacker-mints-usr" },
    { _key: key(), label: "CoinMarketCap", url: "https://coinmarketcap.com/currencies/resolv-usr/" },
    { _key: key(), label: "Halborn", url: "https://www.halborn.com/blog/post/explained-the-resolv-hack-march-2026" },
    { _key: key(), label: "DL News", url: "https://www.dlnews.com/articles/defi/resolve-labs-stablecoin-falls-80-per-cent-as-millions-tokens-minted/" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 5: Russian Ransomware Broker Sentence Tests Deterrence
// ══════════════════════════════════════════════════════════════════════════════

const article5 = {
  _id: "drafts.russian-ransomware-broker-sentence",
  _type: "article",
  title: "Russian Ransomware Broker Sentence Tests Deterrence",
  slug: { _type: "slug", current: "russian-ransomware-broker-sentence" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("The Russian ransomware broker sentence handed to Aleksei Volkov is more than a routine cybercrime judgment. A U.S. court sentenced the 26-year-old Russian national to 81 months in prison after prosecutors said he helped ransomware crews, including Yanluowang, break into U.S. companies and drive more than $9 million in actual losses. The case matters because it targets a specialist in the middle of the extortion chain, not just the operators who send the ransom demand."),
    textBlock("What happened in the Aleksei Volkov case?", "h2"),
    textBlock("The U.S. Department of Justice said on March 23 that a court in the Southern District of Indiana sentenced Volkov to 81 months in prison for assisting major cybercrime groups in \"numerous attacks\" against U.S. companies and other organizations. DOJ said those attacks caused more than $9 million in actual losses and more than $24 million in intended losses. Prosecutors also said Volkov had been indicted in both Indiana and the Eastern District of Pennsylvania, was arrested in Rome, extradited to the United States, and later pleaded guilty after the two cases were consolidated."),
    textBlock("The Decrypt report adds the details most readers will recognize immediately: Volkov was described as an \"initial access broker,\" meaning he specialized in finding vulnerabilities, gaining unauthorized access to corporate systems, and then selling that access to ransomware crews. Decrypt also reported that the court ordered him to pay about $9.2 million in restitution and forfeit equipment used in the crimes. Those details line up with separate reporting from The Record, which said Volkov agreed to pay at least $9 million to victims and surrender hardware used in the hacking operation."),
    textBlock("Why the \"initial access broker\" role matters more than the sentencing headline", "h2"),
    textBlock("The prison term is the headline, but the access-broker role is the real story. DOJ said Volkov's work was to identify ways into company networks and sell that illicit access to other threat actors, who then deployed malware, encrypted victim data, and demanded cryptocurrency ransoms. That means Volkov was not merely adjacent to the extortion. He supplied the entry point that made the extortion possible."),
    textBlock("That division of labor is one reason ransomware remains resilient. Chainalysis reported that ransomware payments totaled about $820 million in 2025, down modestly from prior peaks but still enormous, even as claimed attacks kept rising. The lesson is straightforward: ransomware is not just a malware problem. It is a labor market. Some actors gain access, some run the malware, some negotiate, and some launder the proceeds. Going after a broker like Volkov matters because it hits a specialist function that many groups would rather outsource than build internally."),
    linkBlock("DOJ sentencing release", "https://www.justice.gov/opa/pr/russian-citizen-sentenced-prison-hacking-us-companies-and-enabling-major-cybercrime-groups"),
    linkBlock("Chainalysis 2026 ransomware report", "https://www.chainalysis.com/blog/crypto-ransomware-2026/"),
    textBlock("How the ransomware scheme worked", "h2"),
    textBlock("According to DOJ, Volkov found vulnerabilities in networks and systems, sold that access to co-conspirators, and then shared in the proceeds once those conspirators deployed ransomware and extorted victims. Prosecutors said victims were often told to pay in cryptocurrency, sometimes in the tens of millions of dollars, in exchange for restored access and promises not to leak stolen data on public leak sites. Volkov admitted in his plea that the conspirators hacked numerous victims, stole data, deployed ransomware, demanded payment, and divided ransom payments among themselves."),
    textBlock("The Record's reporting adds a useful bridge to the broader threat picture. It said FBI investigators found evidence that Volkov had communicated with members of LockBit in addition to his role helping Yanluowang-linked operations. That does not mean he was formally inside every major group he touched. It does suggest that the same broker infrastructure can service multiple ransomware brands, which is one reason enforcement built around a single gang name often fails to capture the full market structure."),
    textBlock("Why Yanluowang still matters in 2026", "h2"),
    textBlock("Yanluowang is no longer one of the market's loudest ransomware brands, but the group still matters because it exposed how modern extortion crews operate. Trellix reported in 2022 that leaked Yanluowang messages offered insight into the group's internal workings, victims, and likely links to other Russian-speaking ransomware actors. WatchGuard separately noted that despite the group's Chinese-themed branding, leaked chat logs pointed analysts toward Russian-speaking operators masquerading as Chinese to mislead investigators."),
    linkBlock("Trellix analysis of Yanluowang leaks", "https://www.trellix.com/en-ca/blogs/research/yanluowang-ransomware-leaks-analysis/"),
    textBlock("That context makes the Volkov sentencing more revealing than it first appears. It is not just a case about one broker and one gang. It is a case about the cybercrime market's modular design. Crews can rebrand, leak sites can go dark, and affiliates can migrate, but the services behind them, access brokers, credential sellers, negotiators, money movers, often persist. When prosecutors target one of those middle-layer actors, they are trying to disrupt the supply chain, not only punish a single incident."),
    textBlock("What the sentence says, and what it does not", "h2"),
    textBlock("An 81-month sentence is meaningful, especially when combined with restitution and forfeiture. It signals that U.S. prosecutors are willing to spend years building extraditable cases against foreign cybercriminals and are not limiting themselves to the ransomware operators who write the extortion notes. CyberScoop reported that Volkov was sentenced for serving as an initial access broker for ransomware groups and that the case stemmed from his role in helping launch attacks against banks, telecoms, and other U.S. organizations."),
    textBlock("But the sentence also shows the limits of deterrence. Chainalysis' 2026 ransomware report says payments remain high even after repeated disruptions, indictments, and infrastructure takedowns. That is partly because the business can absorb personnel losses if replacement brokers remain available. One prison term does not close the market for access sales. It raises the cost of participating in that market, which is useful, but it does not remove the demand from crews that still want footholds into corporate networks."),
    textBlock("What crypto readers should watch next", "h2"),
    textBlock("The immediate next step is not on-chain drama. It is whether law enforcement can keep turning infrastructure cases into extraditions and guilty pleas. Volkov was arrested in Italy and extradited, which is a reminder that ransomware actors are most exposed when they travel through jurisdictions willing to cooperate with U.S. warrants. That is a more practical pressure point than hoping a leak site disappears on its own."),
    textBlock("The second thing to watch is how far investigators keep pushing up the supply chain. If prosecutors can tie access brokers, money launderers, negotiators, and exchange off-ramps together in the same cases, then the crypto side of ransomware becomes harder to monetize. The third thing is economic: ransomware payments are still large enough to keep attracting new entrants. Until that revenue line falls much harder than it has, sentencing wins like this one will matter, but they will not be enough by themselves."),
    textBlock("Volkov's sentence is a solid law-enforcement result. It is also a reminder that ransomware is a business stack, and business stacks do not collapse just because one specialist gets caught. The market should judge this case not only by the prison term, but by whether it is followed by more arrests higher and lower in the same crypto-extortion pipeline."),
  ],
  excerpt: "Aleksei Volkov's 81-month sentence hits a key ransomware middleman, but the case also shows how much crypto extortion still depends on specialist brokers selling access before a single note appears.",
  seoDescription: "Russian ransomware broker sentence: why Aleksei Volkov's 81-month term matters for crypto extortion, access sales, and deterrence.",
  publishedAt: "2026-04-05T12:10:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "U.S. Department of Justice", url: "https://www.justice.gov/opa/pr/russian-citizen-sentenced-prison-hacking-us-companies-and-enabling-major-cybercrime-groups" },
    { _key: key(), label: "Decrypt", url: "https://decrypt.co/362217/russian-hacker-jailed-for-81-months-over-9m-ransomware-attacks" },
    { _key: key(), label: "The Record", url: "https://therecord.media/hacker-russian-ransomware-sentenced-doj" },
    { _key: key(), label: "Chainalysis", url: "https://www.chainalysis.com/blog/crypto-ransomware-2026/" },
    { _key: key(), label: "Trellix", url: "https://www.trellix.com/en-ca/blogs/research/yanluowang-ransomware-leaks-analysis/" },
    { _key: key(), label: "WatchGuard", url: "https://www.watchguard.com/wgrd-security-hub/ransomware-tracker/yanluowang" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 6: Irish Bitcoin Seizure Breakthrough Exposes Recovery Limits
// ══════════════════════════════════════════════════════════════════════════════

const article6 = {
  _id: "drafts.irish-bitcoin-seizure-recovery-limits",
  _type: "article",
  title: "Irish Bitcoin Seizure Breakthrough Exposes Recovery Limits",
  slug: { _type: "slug", current: "irish-bitcoin-seizure-recovery-limits" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("The Irish Bitcoin seizure of one long-inaccessible wallet is a real enforcement breakthrough, but it is not the clean victory headline makes it sound like. Ireland's Criminal Assets Bureau, working with Europol's European Cybercrime Centre, said on March 24 that it gained access to a wallet containing 500 BTC worth about €30 million. That wallet is only the first of 12 linked to convicted cannabis grower Clifton Collins, whose broader 6,000 BTC stash is still largely beyond the state's reach."),
    textBlock("What happened in the Irish Bitcoin seizure?", "h2"),
    textBlock("The confirmed facts are unusually specific. Gardaí said CAB, supported by Europol, \"gained access to and seized\" a cryptocurrency wallet containing 500 bitcoin, which it described as proceeds of crime. Europol hosted operational meetings in The Hague and supplied \"highly complex technical expertise and decryption resources\" to support the operation. The official Garda release values the seized wallet at approximately €30 million, while The Irish Times reported the broader set of 6,000 BTC was worth roughly €360 million at then-current prices."),
    linkBlock("Garda statement on the 500 BTC seizure", "https://www.garda.ie/en/about-us/our-departments/office-of-corporate-communications/press-releases/2026/march/seizure-of-30-million-cryptocurrency-criminal-assets-bureau-cab-europol-24th-march-2026.html"),
    textBlock("That distinction matters because the public story can easily blur together two different things: ownership and access. The Irish state already had forfeiture control over the Collins wallets years ago. What it lacked was the technical ability to open them after the access codes were lost. The March 2026 development is not that CAB suddenly discovered the coins existed. It is that investigators appear to have successfully unlocked one wallet that had been effectively trapped since the case first became public in 2020."),
    linkBlock("The Irish Times on the 6,000 BTC total", "https://www.irishtimes.com/crime-law/2026/03/24/gardai-seize-bitcoin-valued-at-30m-in-cab-operation-supported-by-europol/"),
    textBlock("Why the Clifton Collins case became so famous", "h2"),
    textBlock("The Collins case became one of crypto's strangest forfeiture stories because it flipped the usual law-enforcement problem. In most seizures, authorities know where the assets are but must prove they are criminal proceeds. Here, the High Court froze the assets, Collins did not contest CAB's application, and the state obtained legal control, but the seed phrases had been hidden in a fishing rod case that disappeared after Collins went to prison. Irish Times and RTÉ reporting from 2020 said the 12 wallets held 6,000 BTC then worth about €52 million to €55 million."),
    linkBlock("RTÉ on the original High Court freezing order", "https://www.rte.ie/news/courts/2020/0219/1116299-bit-coin-clifton-collins/"),
    textBlock("Since then, Bitcoin's price appreciation has turned a bizarre forfeiture story into a huge asset-recovery question. By March 2026, The Irish Times valued the 6,000 BTC at around €360 million, and Decrypt's framing put the figure near $418 million. That gap is mostly a matter of exchange rates and market pricing, not a disagreement about the underlying stash size. The important point is simpler: a wallet problem that once looked embarrassing but manageable has grown into one of Europe's most visible unresolved crypto-seizure cases."),
    textBlock("What this reveals about crypto asset recovery", "h2"),
    textBlock("The seizure of one wallet is a breakthrough, but it also exposes the hardest truth in crypto enforcement: a forfeiture order is not the same thing as recoverable value. If law enforcement cannot access the keys, seized assets remain economically stranded no matter how strong the court order looks on paper. That is exactly why this case has mattered for years. Justice Minister Jim O'Callaghan said in a parliamentary reply, cited by Irish outlets, that the state still could not realize the value of the remaining 6,000 BTC because the access codes were lost."),
    textBlock("That makes the 500 BTC recovery significant beyond Ireland. It suggests wallet access is not always a binary \"keys found or funds gone forever\" problem. With the right technical support, some supposedly lost or inaccessible crypto may still be recoverable. But the Garda statement is careful. It confirms access to one wallet, not all of them, and does not explain the full method. Smart readers should resist the temptation to assume the rest of the Collins stash will now fall quickly. One successful access event does not prove the other 11 wallets share the same recoverability path."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("Why Europol's role is the real story behind the headline", "h2"),
    textBlock("Europol's involvement is the most revealing operational detail in the official record. Gardaí said Europol's European Cybercrime Centre provided the technical expertise and decryption resources vital to the operation. That wording strongly suggests the breakthrough depended on specialized forensic capabilities beyond ordinary asset seizure or exchange cooperation. This was not a case of sending a preservation order to a custodial platform. It was a case of getting into a wallet that had remained closed despite years of legal control."),
    textBlock("That matters because it says something about where enforcement capability is moving. The next phase of crypto policing is not just tracing flows on-chain or freezing exchange off-ramps. It is also about technical recovery of assets that sit in self-custodied wallets with broken or incomplete access chains. The Collins wallet opening points to a more advanced model of asset recovery, one that combines court orders, international cybercrime support, and forensic key-access work. For governments sitting on seized but inaccessible crypto, that is the real signal to watch."),
    internalLinkBlock("crypto asset recovery cases", "/news/crypto-asset-recovery-cases"),
    textBlock("Who is affected beyond Ireland", "h2"),
    textBlock("The obvious stakeholder is CAB, which now has a proof point that at least part of the Collins bitcoin haul may be monetizable. But the implications reach beyond one bureau. Courts, receivers, and criminal-asset agencies across Europe have had to treat some self-custodied crypto as functionally frozen even after successful seizure orders. This case suggests at least some of those assumptions may be changing. If one dormant wallet can be opened after years of apparent deadlock, agencies will face more pressure to revisit other \"inaccessible\" digital assets rather than writing them off."),
    textBlock("There is also a market-structure angle. Once seized crypto becomes accessible, authorities need a compliant disposal route. Irish reporting says the state has sold other seized cryptocurrency through regulated exchanges, including prior bitcoin and Ethereum disposals. That creates a very different pipeline from the older era of ad hoc liquidation. The broader signal is that crypto enforcement is maturing from seizure theater into operational asset management, even if the Collins case shows that the technical gap between those two stages can still be enormous."),
    textBlock("What to watch next after the first wallet was opened", "h2"),
    textBlock("The most important next question is whether the 500 BTC wallet was a special case or the first domino. Gardaí have not said whether the remaining 11 wallets share the same access structure, nor have they disclosed whether the recovered wallet was moved to a specific disposal venue. Some third-party outlets have speculated about transfers to major exchanges, but the official statements do not confirm that, so it should not be treated as established fact yet."),
    textBlock("The second question is valuation timing. If more wallets are opened, Irish authorities will have to decide whether to liquidate in stages, hold temporarily, or coordinate sales in a way that minimizes execution risk and public attention. The third is precedent. If Europol-backed recovery can crack one of Europe's most famous lost-key cases, other agencies will want to know what exactly made this wallet accessible and whether the same method can be applied elsewhere. The Collins case started as a story about a man who lost a fortune in a fishing rod case. It is now a story about whether law enforcement can convert legal seizure into real recovery in the age of self-custody."),
    internalLinkBlock("law enforcement bitcoin seizures", "/news/law-enforcement-bitcoin-seizures"),
  ],
  excerpt: "Ireland finally accessed one of 12 bitcoin wallets tied to Clifton Collins. The win is real, but it also shows how asset seizure means little if law enforcement still cannot open the keys.",
  seoDescription: "Irish Bitcoin seizure analysis: how Gardaí opened one 500 BTC wallet, and why most of Clifton Collins' 6,000 BTC stash remains out of reach.",
  publishedAt: "2026-04-05T12:25:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Garda Síochána", url: "https://www.garda.ie/en/about-us/our-departments/office-of-corporate-communications/press-releases/2026/march/seizure-of-30-million-cryptocurrency-criminal-assets-bureau-cab-europol-24th-march-2026.html" },
    { _key: key(), label: "The Irish Times", url: "https://www.irishtimes.com/crime-law/2026/03/24/gardai-seize-bitcoin-valued-at-30m-in-cab-operation-supported-by-europol/" },
    { _key: key(), label: "RTÉ", url: "https://www.rte.ie/news/crime/2026/0324/1565007-cryptocurrency-seizure/" },
    { _key: key(), label: "The Irish Times", url: "https://www.irishtimes.com/news/crime-and-law/drug-dealer-loses-codes-for-53-6m-bitcoin-accounts-1.4180182" },
    { _key: key(), label: "RTÉ", url: "https://www.rte.ie/news/courts/2020/0219/1116299-bit-coin-clifton-collins/" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 7: Balancer Labs Shutdown Exposes DeFi's Corporate Problem
// ══════════════════════════════════════════════════════════════════════════════

const article7 = {
  _id: "drafts.balancer-labs-shutdown-defi-corporate-problem",
  _type: "article",
  title: "Balancer Labs Shutdown Exposes DeFi's Corporate Problem",
  slug: { _type: "slug", current: "balancer-labs-shutdown-defi-corporate-problem" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("The Balancer Labs shutdown is not a protocol death notice. It is a post-exploit corporate amputation. Balancer's founding company is being wound down after the team concluded that legal exposure from the November 3, 2025 exploit, weak revenue capture, and a broken token incentive model made the entity more dangerous than useful to the protocol's future."),
    textBlock("What is actually shutting down at Balancer?", "h2"),
    textBlock("What is ending is Balancer Labs, the original corporate entity that incubated and funded the protocol. What is not ending is the Balancer protocol itself. In a March 23 forum post, co-founder Fernando Martinelli said Balancer Labs had become \"a liability rather than an asset\" and was no longer sustainable without revenue. He said the protocol would continue through the DAO, the Balancer Foundation, and a service-provider structure, with essential team members expected to move into Balancer OpCo subject to governance approval. That distinction is the core fact readers need to understand: this is a company wind-down, not a chain halt or smart-contract shutdown."),
    linkBlock("Fernando Martinelli's forum post", "https://forum.balancer.fi/t/on-the-future-of-balancer-shutting-down-balancer-labs-supporting-the-path-forward/7002"),
    textBlock("The companion operational restructuring proposal makes that separation even clearer. It says Balancer Labs has ceased operations and frames the split as protective because it isolates prior legal exposure from ongoing protocol activity. In other words, Balancer is trying to preserve the product by cutting loose the entity most exposed to the consequences of the past year. For DeFi, that is a telling move. Many protocols talk as if the DAO is the protocol. Balancer is showing that when things go wrong, the corporate wrapper still matters a lot."),
    linkBlock("Operational restructuring proposal", "https://forum.balancer.fi/t/bip-918-operational-restructuring-for-balancer/7000"),
    textBlock("Why the November exploit changed everything", "h2"),
    textBlock("The shutdown cannot be understood without the November 2025 hack. Martinelli wrote that the exploit created \"real and ongoing legal exposure,\" and the operational proposal says the attack and the market conditions that followed made previously approved growth plans unworkable. DL News reported that the exploit drained Balancer's liquidity pools and accelerated a sharp collapse in deposits, with TVL falling from about $775 million before the hack to roughly $154 million by March 23. That post-hack loss of trust appears to have mattered at least as much as the direct dollar loss."),
    linkBlock("DL News on Balancer's TVL decline", "https://www.dlnews.com/articles/defi/balancer-labs-shuts-down-as-ceo-says-next-12-months-will-be-crucial/"),
    textBlock("Security researchers described the exploit as a precision and rounding flaw in Balancer V2 Composable Stable Pools. BlockSec said the attack targeted stable-pool math designed for like-kind assets and turned a seemingly small arithmetic issue into a large-scale drain. Check Point Research put the losses at about $128.64 million across six chains in under 30 minutes, while several later reports rounded the impact down to about $110 million in broad summaries. That spread in reported totals should be treated as a matter of measurement methodology and timing, not proof that the exploit size is unresolved. The important point is that the breach was large enough to trigger both reputational and legal aftershocks months later."),
    linkBlock("BlockSec exploit analysis", "https://blocksec.com/blog/in-depth-analysis-the-balancer-v2-exploit"),
    textBlock("Why this is really a revenue and tokenomics story", "h2"),
    textBlock("The Balancer Labs shutdown is also a balance-sheet story. Martinelli said the protocol was still generating real revenue and therefore did not deserve a full wind-down. His forum post said Balancer generated over $1 million in total fees annualized over the prior three months. But the restructuring proposal shows why that was not enough: under the old model, the DAO captured only about $290,000 a year, or 17.5% of protocol fees, against an annual operating budget of about $2.87 million and an estimated annual deficit of about $2.6 million."),
    textBlock("That mismatch explains why the team moved beyond a simple cost-cutting memo and into a full tokenomics reset. The tokenomics proposal says BAL emissions would be cut to zero from roughly 3.78 million BAL a year, protocol fee routing would shift to 100% of fees going to the DAO treasury, and veBAL's economic function would be wound down. The proposal estimates that would reduce the annual deficit from roughly $2.6 million to about $700,000 and extend treasury runway from under four years to about nine years in a neutral scenario. This is the real editorial angle: Balancer did not only get hacked. It discovered that its economics were too weak to absorb a major hack and keep the corporate shell intact."),
    linkBlock("BAL tokenomics revamp proposal", "https://forum.balancer.fi/t/bip-919-bal-tokenomics-revamp/7001"),
    textBlock("How Balancer plans to survive without Balancer Labs", "h2"),
    textBlock("The survival plan is leaner, more centralized operationally, and less generous to legacy token incentives. The restructuring proposal cuts the operating budget to about $1.9 million, down 34% from the roughly $2.87 million previously approved, and reduces headcount to 12.5 full-time equivalents. It consolidates operations under Balancer OpCo as an agent of the DAO after the Labs wind-down. Martinelli also argued for a narrower product focus around reCLAMM, LBPs, stables and LST pools, weighted pools, and fewer EVM chains."),
    textBlock("The tokenomics side is just as aggressive. The proposal says BAL emissions stop immediately on passage, veBAL fee flows cease, V3 protocol swap fees fall from 50% to 25% so liquidity providers retain more of the economics, and all protocol fees route to the treasury. The idea is to stop renting liquidity with token inflation and start operating more like a protocol that must live on revenue. That is not a cosmetic governance tweak. It is a rejection of the old DeFi playbook in which token dilution papered over weak business fundamentals."),
    textBlock("What this reveals about DeFi's corporate wrapper problem", "h2"),
    textBlock("Balancer's move says something bigger than \"one protocol had a bad year.\" Martinelli's own explanation is blunt: the technology was still useful, the team still believed the product could work, but the economic model and the weight of prior security incidents had eroded trust. That makes Balancer a case study in a problem the market still understates. A DAO can claim decentralization, but if a separate corporate entity funds development, handles operations, or becomes the obvious target after an exploit, that entity can become a pressure point that threatens the broader protocol."),
    textBlock("This is why the Balancer Labs shutdown belongs in Web3 Fraud Files even though it is not a fresh exploit report. The fraud and exploit cycle does not end when the attacker drains pools. It continues in the legal, governance, and treasury consequences that follow. Balancer is one of the clearest examples yet of a DeFi project concluding that its company structure had become a source of risk after a major hack. The protocol may survive. The corporate body that launched it did not."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("What to watch next for Balancer", "h2"),
    textBlock("The next twelve months will show whether the shutdown was a clean reset or a slower decline. Martinelli said that period will be crucial for proving there is still product-market fit and a path to sustainability. The first checkpoint is governance: whether the community fully backs the operational restructuring and tokenomics overhaul. The second is revenue quality: whether Balancer can attract organic liquidity after cutting emissions and lowering V3 protocol fees. The third is legal overhang: whether winding down Labs actually contains the liability that the team says threatened the protocol's future."),
    textBlock("For DeFi more broadly, Balancer is now a warning shot. Protocols that still rely on token emissions to subsidize liquidity while keeping thin DAO revenue capture and exposed corporate entities should read this closely. The hack may have forced the decision, but the harder lesson is that unsound economics left Balancer too fragile to take the hit without cutting itself in half."),
    internalLinkBlock("DeFi governance risk", "/news/defi-governance-risk"),
    internalLinkBlock("token emissions in DeFi", "/news/token-emissions-defi"),
  ],
  excerpt: "Balancer Labs is shutting down, but the protocol is not. The real story is how a post-hack DeFi protocol decided its corporate shell had become more dangerous than useful.",
  seoDescription: "Balancer Labs shutdown analysis: how a post-exploit legal risk, weak revenue capture, and token dilution pushed a DeFi pioneer to unwind.",
  publishedAt: "2026-04-05T12:45:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Balancer Forum", url: "https://forum.balancer.fi/t/on-the-future-of-balancer-shutting-down-balancer-labs-supporting-the-path-forward/7002" },
    { _key: key(), label: "Balancer Forum", url: "https://forum.balancer.fi/t/bip-918-operational-restructuring-for-balancer/7000" },
    { _key: key(), label: "Balancer Forum", url: "https://forum.balancer.fi/t/bip-919-bal-tokenomics-revamp/7001" },
    { _key: key(), label: "DL News", url: "https://www.dlnews.com/articles/defi/balancer-labs-shuts-down-as-ceo-says-next-12-months-will-be-crucial/" },
    { _key: key(), label: "BlockSec", url: "https://blocksec.com/blog/in-depth-analysis-the-balancer-v2-exploit" },
    { _key: key(), label: "Check Point Research", url: "https://research.checkpoint.com/2025/how-an-attacker-drained-128m-from-balancer-through-rounding-error-exploitation/" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 8: Uranium Finance Indictment Revives a 2021 DeFi Ghost
// ══════════════════════════════════════════════════════════════════════════════

const article8 = {
  _id: "drafts.uranium-finance-indictment-defi-ghost",
  _type: "article",
  title: "Uranium Finance Indictment Revives a 2021 DeFi Ghost",
  slug: { _type: "slug", current: "uranium-finance-indictment-defi-ghost" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("The Uranium Finance indictment turns one of 2021's ugliest DeFi exploits into a 2026 criminal case with a named defendant, a laundering trail, and a long tail of recovery. U.S. prosecutors in the Southern District of New York unsealed charges against Maryland resident Jonathan Spalletta, alleging he stole more than $50 million from the now-defunct Binance Smart Chain exchange across two April 2021 hacks. What matters now is not only the arrest. It is the proof that old DeFi cases no longer die just because the protocol did."),
    textBlock("What happened in the Uranium Finance indictment?", "h2"),
    textBlock("The official charging document is blunt. SDNY said on March 30 that Jonathan Spalletta, also known as \"Cthulhon\" and \"Jspalletta,\" was charged with computer fraud and money laundering in connection with two hacks of Uranium Finance. Prosecutors allege he first exploited Uranium on April 8, 2021 to drain roughly $1.4 million in rewards tokens through deceptive transactions, then carried out a second attack later that month that stole more than $50 million and effectively destroyed the exchange. SDNY said Spalletta surrendered, appeared before a magistrate judge, and faces charges carrying a maximum combined sentence of up to 30 years if convicted. Those are allegations, not findings of guilt, but they are now formal federal criminal allegations rather than rumor or blockchain sleuthing."),
    linkBlock("SDNY charging announcement", "https://www.justice.gov/usao-sdny/pr/maryland-man-charged-defrauding-crypto-exchange-over-50-million-hacks"),
    textBlock("The detail that makes this indictment more than a recycled hack story is how prosecutors framed the conduct. According to SDNY, Spalletta did not just exploit a protocol and disappear. He allegedly wrote afterward that he had done a \"crypto heist,\" described crypto as \"fake internet money anyway,\" laundered funds, and spent them on rare collectibles including a Black Lotus card, sealed Alpha Booster packs, Pokémon cards, antique Roman coins, and a Wright brothers relic carried to the moon. Those claims give the case a more traditional fraud shape for a jury: theft, concealment, conversion into luxury items, and bragging in writing. That is a very different posture from the old DeFi-era argument that an exploit was just \"using the code as written.\""),
    textBlock("How the Uranium Finance hack actually worked", "h2"),
    textBlock("Uranium's second exploit remains one of the cleaner examples of how a tiny smart-contract error can become catastrophic. TRM Labs says the April 28, 2021 attack exploited a single-character code mistake in Uranium Finance's trading logic, allowing the attacker to withdraw far more value than intended from the protocol's liquidity pools. Halborn's technical writeup similarly says the attacker abused a flaw in Uranium's pair contracts and drained about $50 million from 26 pools on Binance Smart Chain. The practical lesson is ugly but familiar: DeFi does not always fail through exotic zero-days. Sometimes it fails because a basic arithmetic or logic error sits in the wrong place in production code."),
    linkBlock("Halborn's exploit analysis", "https://www.halborn.com/blog/post/explained-the-uranium-finance-hack-april-2021"),
    textBlock("The first exploit matters too, because it changes the narrative from \"one lucky strike\" to repeated abuse. SDNY says the April 8 hack involved a deceptive sequence of reward withdrawals that extracted around $1.4 million, after which some funds were returned but hundreds of thousands were kept. TRM says approximately $1 million was returned after negotiations while about $385,500 was retained and later laundered through Tornado Cash. That pattern matters because prosecutors can point to two episodes in the same month: one smaller exploit that appears to have tested the perimeter, then a much larger follow-up that finished the job. For readers tracking DeFi security, the broader point is that early exploit signals often look containable right before they become existential."),
    internalLinkBlock("DeFi exploit recovery cases", "/news/defi-exploit-recovery-cases"),
    textBlock("Why the 2025 seizure changed the case", "h2"),
    textBlock("The indictment is getting the headlines, but the real inflection point may have come a year earlier. TRM said U.S. authorities seized approximately $31 million in February 2025 linked to the Uranium Finance exploits, nearly four years after the original thefts. Its account says investigators traced laundering patterns across multiple chains, linked flows through Tornado Cash and swaps, and ultimately identified assets that could still be seized. The Block also reported the $31 million seizure in February 2025, confirming that law enforcement had recovered a meaningful share of the stolen funds before the criminal charges were publicly unsealed."),
    linkBlock("TRM on the $31 million seizure", "https://www.trmlabs.com/resources/blog/u-s-authorities-seize-31-million-in-uranium-finance-exploits-investigation"),
    textBlock("That matters because it changes how crypto crime cases should be read. In earlier cycles, many DeFi exploits looked economically final once funds crossed mixers, bridges, and dormant wallets. The Uranium case suggests that assumption is getting weaker. Investigators do not need instant recovery to make a case. They need time, chain analysis, and enough mistakes or touchpoints in the laundering path to freeze assets later. The Uranium Finance indictment is therefore not only a prosecution story. It is a tracing story. The charges look stronger because asset recovery and blockchain forensics already narrowed the field."),
    textBlock("Why this case matters beyond Uranium Finance", "h2"),
    textBlock("Uranium Finance itself is gone, but the structure of the case reaches much further. For years, DeFi exploit culture has lived in a gray zone between \"hacker,\" \"arbitrageur,\" and \"uninvited bug bounty hunter.\" Prosecutors are clearly trying to collapse that ambiguity. SDNY's release frames the alleged conduct as straightforward theft and laundering, not clever adversarial testing. The quoted line from U.S. Attorney Jay Clayton is the point: stealing from a crypto exchange is still stealing, and claiming that crypto is different does not change the harm to victims."),
    textBlock("That framing is important because it signals where U.S. enforcement is heading in DeFi cases. If the government can show unauthorized extraction, fund obfuscation, and later conversion into personal spending, then it can tell a criminal narrative that looks very familiar to judges and juries. The technical novelty of the exploit becomes secondary. That raises the legal risk for anyone still relying on the idea that immutable code automatically legitimizes whatever an attacker can pull out of a pool. The market can debate disclosure norms and white-hat boundaries all it wants. Prosecutors are drawing a much simpler line when money laundering follows the exploit."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("What this reveals about Tornado Cash and laundering evidence", "h2"),
    textBlock("The laundering allegations are central, not decorative. SDNY says Spalletta laundered stolen funds before using them to buy high-end collectibles. TRM says the first exploit proceeds were routed through Tornado Cash and that the larger exploit's funds moved across decentralized exchanges, bridging services, and dormant wallets before seizure. That matters because prosecutors do not need to prove only that a bug was used. They need to show what happened after the funds left the protocol. In crypto cases, that post-exploit behavior is often what turns a difficult technical story into a legible criminal one."),
    textBlock("There is also a strategic message here for exploiters and for the market. Tornado Cash and similar obfuscation routes still make tracing harder, but they do not guarantee immunity, especially when years of blockchain intelligence, exchange records, and spending patterns can be stacked together. The Uranium case is one more sign that time may now help investigators as much as it helps attackers. Dormancy is not necessarily safety. It can simply be a pause before a wallet cluster becomes actionable evidence."),
    internalLinkBlock("crypto laundering enforcement tracker", "/news/crypto-laundering-enforcement-tracker"),
    textBlock("What to watch after the Uranium Finance indictment", "h2"),
    textBlock("The first thing to watch is whether the government discloses more about the second exploit's exact code path and the laundering chain in later filings. The press release is strong on narrative detail but lighter on deeper forensic specifics. The second thing is victims. SDNY and HSI previously asked Uranium victims to come forward around the 2025 seizure, which suggests restitution and victim accounting may remain active parts of the case. The third is precedent: if prosecutors secure a conviction or plea here, the Uranium case could become one of the clearer legal templates for treating DeFi exploits as classic fraud-plus-laundering cases rather than protocol-native disputes."),
    textBlock("For crypto readers, the big takeaway is not that Uranium finally got justice. That remains to be proved in court. The real takeaway is that DeFi crime now has a longer enforcement half-life. A protocol can disappear in 2021 and still produce seizures in 2025 and an indictment in 2026. That is a different environment from the one many exploiters thought they were operating in."),
  ],
  excerpt: "The Uranium Finance indictment is not just a late arrest in an old case. It shows prosecutors can now trace, seize, and charge long after a DeFi exploit seemed finished.",
  seoDescription: "Uranium Finance indictment analysis: how a 2021 DeFi exploit became a 2026 criminal case built on tracing, seizure, and laundering evidence.",
  publishedAt: "2026-04-05T13:05:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "U.S. Department of Justice", url: "https://www.justice.gov/usao-sdny/pr/maryland-man-charged-defrauding-crypto-exchange-over-50-million-hacks" },
    { _key: key(), label: "TRM Labs", url: "https://www.trmlabs.com/resources/blog/u-s-authorities-seize-31-million-in-uranium-finance-exploits-investigation" },
    { _key: key(), label: "Halborn", url: "https://www.halborn.com/blog/post/explained-the-uranium-finance-hack-april-2021" },
    { _key: key(), label: "The Block", url: "https://www.theblock.co/post/343165/us-authorities-seize-31-million-in-crypto-linked-to-2021-uranium-finance-hack" },
    { _key: key(), label: "Cointelegraph", url: "https://www.tradingview.com/news/cointelegraph%3Ada0e8a485094b%3A0-alleged-54m-uranium-finance-hacker-faces-30-years-in-prison/" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 9: Crypto Drone Procurement Ties Russia and Iran to On-Chain Trails
// ══════════════════════════════════════════════════════════════════════════════

const article9 = {
  _id: "drafts.crypto-drone-procurement-russia-iran",
  _type: "article",
  title: "Crypto Drone Procurement Ties Russia and Iran to On-Chain Trails",
  slug: { _type: "slug", current: "crypto-drone-procurement-russia-iran" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-investigative-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("Crypto drone procurement is still small relative to state military budgets, but a new Chainalysis report argues it is already important for another reason: it leaves an unusually traceable record of how Russia- and Iran-linked networks buy commercially available drones and parts. Reuters reported on March 30 that Chainalysis tied specific on-chain payments to low-cost drone purchases and components, including flows linked to pro-Russia groups and an Iran-linked wallet connected to procurement activity. The key point is not that crypto has replaced traditional finance. It has not. The point is that blockchain rails are becoming a visible layer inside procurement networks that were once much harder to map."),
    textBlock("What the Chainalysis drone report actually found", "h2"),
    textBlock("According to Reuters, citing Chainalysis, groups linked to Russia and Iran are increasingly using cryptocurrency to finance purchases of low-cost military drones and drone components. Chainalysis said blockchain researchers could trace wallet flows from addresses connected to drone developers or paramilitary groups to vendors on e-commerce platforms. Reuters also quoted Andrew Fierman, Chainalysis' head of national security intelligence, saying analysts matched crypto payments between roughly $2,200 and $3,500 to exact drone and component price points listed online. That level of transactional specificity is what makes the report more than another broad sanctions-evasion warning. It suggests investigators can move from generic suspicion to a much tighter procurement narrative."),
    linkBlock("Reuters on the Chainalysis drone report", "https://www.reuters.com/technology/crypto-fuels-drone-purchases-russia-iran-report-says-2026-03-30/"),
    textBlock("The Russia side of the story is grounded in a longer funding pattern. Reuters reported that since Russia's full-scale invasion of Ukraine in 2022, pro-Russia groups have raised more than $8.3 million in crypto donations, and drones were among the specifically itemized purchases cited in the report. Chainalysis' own writeup adds that low-cost, commercially available drones have become central to modern conflict because they let both state and non-state actors project power cheaply. That matters for crypto readers because small-ticket purchases can still have strategic significance when the goods are dual-use, widely available, and bought repeatedly through dispersed channels."),
    textBlock("Why this is a fraud and sanctions story, not just a tech story", "h2"),
    textBlock("This belongs in Web3 Fraud Files because the issue is not consumer crypto adoption or fintech experimentation. It is the use of blockchain rails inside sanctions-sensitive procurement and state-linked military support networks. Chainalysis' March 2026 sanctions report says value received by sanctioned entities surged 694% in 2025 to $104 billion, and it argues that nation-states now use crypto not only for evasion but also for trade settlement, procurement of dual-use goods, and broader strategic finance. Russia, Iran, and North Korea each use different methods, but Chainalysis says crypto is no longer peripheral to their operations."),
    linkBlock("Chainalysis sanctions report", "https://www.chainalysis.com/blog/crypto-sanctions-2026/"),
    textBlock("That broader context is what makes the drone angle significant. A one-off crypto payment for hardware would not mean much by itself. But when it sits inside a larger pattern of sanctions evasion, military procurement, and state-linked wallet activity, it becomes evidence of a system. The report does not claim crypto is financing entire war machines. Reuters explicitly notes that total crypto volume tied to drone procurement remains small compared with overall military spending. The real finding is narrower and more actionable: blockchain can expose specific parts of procurement chains that traditional finance might obscure."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("Why Russia-linked drone fundraising matters", "h2"),
    textBlock("The Russia-linked side is easier to understand because it combines public fundraising and identifiable defense-adjacent groups. Reuters said pro-Russia groups have raised over $8.3 million in crypto since 2022, with drones among the named end uses. Chainalysis had already documented one example in 2024 when OFAC sanctioned KB Vostok, a Russian UAV developer whose drones were used by Russian forces in Ukraine. Chainalysis said KB Vostok had solicited cryptocurrency donations on its website and likely facilitated drone sales with crypto. OFAC's action placed the company inside a larger sanctions package targeting Russia's military supply chain."),
    linkBlock("Chainalysis on OFAC's KB Vostok sanctions", "https://www.chainalysis.com/blog/ofac-sanctions-russian-drone-developer-kb-vostok/"),
    textBlock("That history matters because it shows the Reuters story is not arriving out of nowhere. It fits an existing pattern in which crypto is used both for donations and for direct acquisition. The sums involved in individual transactions may look small by institutional standards, but the goods in question are inexpensive enough that payments in the low thousands of dollars can line up with actual drone units or parts. That is exactly what Reuters said Chainalysis was able to match. For investigators, that is a stronger signal than a generic transfer to a suspicious wallet because the payment amount itself can correspond to a known procurement item."),
    textBlock("Why Iran is the more strategically important angle", "h2"),
    textBlock("Iran makes the story bigger than battlefield crowdfunding. Reuters reported that the Chainalysis research highlighted a crypto wallet with links to Iran's Islamic Revolutionary Guard Corps purchasing drone parts from a Hong Kong-based supplier. That matters because it shifts the frame from sympathetic donor networks to state-linked procurement. It also fits Reuters' earlier February reporting that U.S. investigators were examining whether crypto platforms had helped Iranian officials evade sanctions to move money abroad, access hard currency, or procure goods. Reuters said Chainalysis estimated Iranian wallets received a record $7.8 billion in 2025, while TRM estimated roughly $10 billion in Iran-linked crypto activity that year."),
    linkBlock("Reuters on Iran's surging crypto activity", "https://www.reuters.com/business/finance/irans-surging-crypto-activity-draws-us-scrutiny-2026-02-03/"),
    textBlock("Chainalysis' sanctions and Iran research goes further. Its March sanctions report said IRGC and proxy networks accounted for over 50% of value received in Iran in the fourth quarter of 2025, totaling more than $3 billion in transfers throughout the year. Its January Iran analysis said the country's crypto ecosystem reached more than $7.78 billion in 2025. That does not prove every state-linked flow is tied to procurement. It does show that Iran's crypto footprint is large enough that procurement use is not an edge case anymore. It sits inside a much broader on-chain financial architecture shaped by sanctions pressure and geopolitical stress."),
    internalLinkBlock("crypto sanctions evasion cases", "/news/crypto-sanctions-evasion-cases"),
    textBlock("What blockchain adds that traditional finance often does not", "h2"),
    textBlock("The strongest part of the Reuters report is not the geopolitical claim. It is the methodological claim. Fierman told Reuters that blockchain gives investigators an unusual chance to see the counterparty activity once a vendor is identified, helping them assess how a product was used and what the buyer's intent may have been. That matters because drones and components are dual-use goods. A payment to an e-commerce seller may not look meaningful in a bank-centric investigation, especially if the item is cheap and globally available. On-chain, however, the same payment can be connected to fundraising, logistics, or other sanctioned actors through wallet clustering and transaction history."),
    textBlock("That is the real intelligence value here. Crypto leaves a public transaction ledger. If analysts can map buyers, vendors, and intermediary wallets, they can reconstruct supply relationships that would otherwise remain murky. Reuters was careful to note that most drone purchases still move over traditional rails. But the purchases that do touch blockchain may actually be easier to analyze once the relevant addresses are identified. In other words, crypto is not only a sanctions challenge. In some cases it is also a visibility opportunity for investigators."),
    textBlock("What to watch next after the Reuters report", "h2"),
    textBlock("The first thing to watch is policy response. If more procurement cases are tied to state-linked wallets, regulators will face pressure to expand sanctions designations, watchlists, and exchange-screening expectations around dual-use goods. The second is vendor exposure. Reuters said Chainalysis traced drone-related flows to e-commerce platforms and a Hong Kong-based supplier. That suggests procurement enforcement may increasingly focus not just on wallets, but on sellers, intermediaries, and logistics counterparts that sit downstream from them."),
    textBlock("The third thing to watch is scale. Right now, the report's core finding is not that crypto is financing war at macro size. It is that blockchain rails are creeping into procurement in ways that leave detectable trails. If that trend expands, the market will have to stop treating sanctions-evasion and military procurement as niche compliance stories. They will become part of the basic risk model for exchanges, stablecoin issuers, analytics firms, and any platform that touches cross-border flows linked to high-risk jurisdictions. Crypto drone procurement is still a narrow category today. The wider compliance architecture it points to is not."),
    internalLinkBlock("state-linked wallet investigations", "/news/state-linked-wallet-investigations"),
  ],
  excerpt: "A new Chainalysis report says crypto is helping Russia- and Iran-linked networks buy drones and parts. The bigger story is how on-chain trails are turning procurement into an intelligence map.",
  seoDescription: "Crypto drone procurement analysis: how Russia- and Iran-linked networks use blockchain payments to buy drones, parts, and dual-use goods.",
  publishedAt: "2026-04-05T13:20:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/technology/crypto-fuels-drone-purchases-russia-iran-report-says-2026-03-30/" },
    { _key: key(), label: "Chainalysis", url: "https://www.chainalysis.com/blog/cryptocurrency-drones-research/" },
    { _key: key(), label: "Chainalysis", url: "https://www.chainalysis.com/blog/crypto-sanctions-2026/" },
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/business/finance/irans-surging-crypto-activity-draws-us-scrutiny-2026-02-03/" },
    { _key: key(), label: "Chainalysis", url: "https://www.chainalysis.com/blog/ofac-sanctions-russian-drone-developer-kb-vostok/" },
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// ARTICLE 10: SEC Crypto Enforcement Retreat Draws Senate Scrutiny
// ══════════════════════════════════════════════════════════════════════════════

const article10 = {
  _id: "drafts.sec-crypto-enforcement-senate-scrutiny",
  _type: "article",
  title: "SEC Crypto Enforcement Retreat Draws Senate Scrutiny",
  slug: { _type: "slug", current: "sec-crypto-enforcement-senate-scrutiny" },
  category: { _ref: "category-web3-fraud-files", _type: "reference" },
  author: { _ref: "author-regulatory-reporter", _type: "reference" },
  mainImage: { _type: "image", alt: "Cryptic daily" },
  body: [
    textBlock("SEC crypto enforcement is now under fresh political scrutiny after Democratic lawmakers demanded answers from Chairman Paul Atkins over the abrupt departure of Enforcement Director Margaret Ryan. Reuters reported on March 30 that senators are questioning whether Ryan's exit followed clashes over cases tied to high-profile crypto figures connected to President Donald Trump and his family. The story matters because it is no longer just about one resignation. It is about whether the SEC is stepping back from crypto enforcement at the exact moment the industry is gaining deeper political access."),
    textBlock("What happened after Margaret Ryan left the SEC?", "h2"),
    textBlock("Reuters reported that Senator Richard Blumenthal pressed SEC Chair Paul Atkins for records and explanations after Ryan resigned suddenly in March, just over six months into the job. Reuters had previously reported that Ryan clashed with SEC leadership over enforcement decisions and then exited abruptly. In his March 30 letter, Blumenthal wrote that Ryan's departure was reportedly tied to disagreements about whether the Enforcement Division could pursue cases against crypto firms and individuals with political ties to Trump-world. The Senate Banking Committee also published a related letter showing lawmakers wanted detailed information about enforcement staffing, case selection, and decisions involving crypto matters."),
    linkBlock("Reuters on the Senate inquiry", "https://www.reuters.com/legal/government/us-lawmaker-presses-secs-top-official-after-enforcement-director-quits-2026-03-30/"),
    textBlock("That sequence matters because Ryan was not a long-serving legacy official quietly retiring. Reuters reported earlier that her departure came after a short, unstable tenure at an SEC already changing under Republican leadership. The SEC publicly framed her exit as part of a broader enforcement reset focused on fraud and market manipulation rather than technical compliance breaches. But the political question raised by lawmakers is narrower and more serious: was Ryan pushed out because she wanted a tougher line in specific crypto cases that agency leadership no longer wanted to pursue? Reuters said the White House and affected crypto figures denied improper contact with the SEC, but the existence of the inquiry alone shows that the agency's crypto retreat is now being treated as a governance issue, not just a policy choice."),
    linkBlock("Reuters on Ryan's internal clashes", "https://www.reuters.com/business/finance/us-secs-ex-enforcement-chief-clashed-with-bosses-before-leaving-sources-say-2026-03-23/"),
    textBlock("Why senators think crypto cases sit at the center of this fight", "h2"),
    textBlock("Reuters said Blumenthal and Elizabeth Warren focused on cases involving Justin Sun and Binance founder Changpeng Zhao, both of whom became symbols of the SEC's shifting posture. The Reuters report said senators were concerned that the agency had resolved or outright dropped a number of crypto cases under a softer enforcement approach. The March 30 Senate letter explicitly asks for records tied to case decisions and communications involving entities with potential Trump-family links, including World Liberty Financial. That means lawmakers are not treating the resignation as an internal personnel dispute. They are treating it as a possible sign that politically connected crypto actors are receiving unusual leniency."),
    linkBlock("Senate Banking Committee letter", "https://www.banking.senate.gov/imo/media/doc/20260330lettertoseconenforcementdivisionanddata.pdf"),
    textBlock("This is the part that turns a regulatory story into a Fraud Files story. Markets can live with a pro-crypto SEC if the rules are clear and applied consistently. What they cannot absorb cleanly is the perception that enforcement is being switched off selectively for well-connected players. If senators can show that major crypto defendants benefited from political proximity rather than a transparent change in legal theory, then the issue stops being \"lighter-touch regulation\" and starts looking like differential enforcement risk. For sophisticated market participants, that is worse. It undermines confidence in the basic fairness of oversight and invites future legal challenge from firms that did not get the same treatment."),
    internalLinkBlock("Web3 Fraud Files archive", "/categories/web3-fraud-files"),
    textBlock("How much has SEC enforcement actually changed?", "h2"),
    textBlock("The recent reporting points to a real shift, even before the Ryan controversy. Reuters reported on March 16 that Ryan's short tenure coincided with a dramatic change at the SEC under Republican leadership, including a slowdown in enforcement output and the dropping of several crypto-related matters. Barron's and the Financial Times both described her tenure as unusually brief and tied it to a broader decline in enforcement activity, though those outlets also noted the SEC's official line that the division was prioritizing impactful cases over volume. In other words, even without proving improper interference, the directional change is visible: fewer crypto fights, more emphasis on narrower fraud theories, and less appetite for expansive enforcement."),
    linkBlock("Reuters on Ryan's initial resignation", "https://www.reuters.com/business/finance/us-sec-enforcement-director-leave-agency-after-months-job-sources-say-2026-03-16/"),
    textBlock("That distinction matters because the SEC can defend a tougher threshold for bringing cases. It is allowed to change priorities. But the Senate letters suggest lawmakers believe the problem may not simply be a change in philosophy. They appear to suspect the agency intervened to prevent or soften cases involving politically sensitive crypto defendants. If that allegation proves overstated, Atkins can still respond by showing a documented policy rationale for case dismissals and settlements. If he cannot, the narrative hardens quickly: the SEC did not just reprioritize. It retreated."),
    internalLinkBlock("SEC crypto case tracker", "/news/sec-crypto-case-tracker"),
    textBlock("Why the Justin Sun and Zhao angle matters so much", "h2"),
    textBlock("The names matter because they are not obscure targets. Reuters said lawmakers specifically focused on Justin Sun and Changpeng Zhao as examples of crypto defendants whose cases were resolved or eased amid the broader enforcement shift. Sun's inclusion raises the stakes because Reuters also linked the inquiry to questions about Trump-family-adjacent crypto ventures, especially World Liberty Financial. That makes the concern less about abstract deregulatory philosophy and more about whether the SEC treated politically connected crypto figures differently from the rest of the market."),
    textBlock("For readers in crypto, this is the point to watch. U.S. enforcement does not need to be maximalist to be credible. But it does need to be legible. If major cases are dropped, settled lightly, or deprioritized, the agency has to explain why in a way that survives scrutiny from Congress, courts, and competitors. Otherwise the result is a two-tier market perception: aggressive enforcement for ordinary firms and negotiated relief for names with political access. Even the suspicion of that structure is damaging because it changes how exchanges, founders, and investors price regulatory risk."),
    textBlock("What this reveals about the next phase of U.S. crypto oversight", "h2"),
    textBlock("The Ryan episode suggests the next phase of U.S. crypto oversight may be less about rulemaking headlines and more about selective silence. A regulator does not need to announce a formal rollback to create one. It can narrow investigative ambition, settle strategically, avoid controversial defendants, or simply stop pushing hard cases. That is why Ryan's resignation drew so much attention so quickly. It appeared to some lawmakers as the visible sign of a quieter institutional change already underway. Reuters' earlier reporting said Ryan herself was seen as more supportive of staff and more willing to back stronger enforcement in at least some crypto matters. If that is right, then her departure is not random turnover. It is evidence of an internal defeat for the harder-line side of the argument."),
    textBlock("This also raises a broader structural question: what kind of SEC does the market now have? One possibility is a genuinely narrower fraud-focused agency that still goes after clear misconduct but abandons policy-by-enforcement in crypto. Another is a politically filtered regulator that keeps fraud rhetoric while stepping around sensitive targets. Those are very different institutions. The Senate inquiry exists because lawmakers appear to think the second possibility cannot be dismissed."),
    internalLinkBlock("U.S. crypto enforcement shifts", "/news/us-crypto-enforcement-shifts"),
    textBlock("What to watch next after the Senate inquiry", "h2"),
    textBlock("The first thing to watch is whether Atkins produces the documents senators requested, including communications about Ryan's departure and records tied to case decisions involving crypto defendants and Trump-linked interests. The second is whether more lawmakers join the inquiry. Right now, the pressure is concentrated among top Democrats, but the issue could expand if document production reveals unusually direct intervention. The third is the enforcement docket itself. Markets should watch not just what the SEC says about crypto, but which cases it declines to file, which ones it settles softly, and which defendants receive time or space others did not get."),
    textBlock("For crypto, the long-term consequence may be sharper than one news cycle suggests. A lighter-touch SEC can help markets in the short run. A politicized SEC cannot. If the agency wants to convince the market that its new posture is principled rather than preferential, it will need more than speeches about smarter enforcement. It will need a paper trail that shows the same rules still apply when the defendants are powerful."),
  ],
  excerpt: "Senators are pressing SEC Chair Paul Atkins after the abrupt exit of enforcement chief Margaret Ryan. The deeper issue is whether crypto oversight is being softened under political pressure.",
  seoDescription: "SEC crypto enforcement retreat faces Senate scrutiny after Margaret Ryan's exit raised questions over dropped cases and political interference.",
  publishedAt: "2026-04-05T13:35:00.000Z",
  featured: false, sponsored: false, noIndex: false,
  sources: [
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/legal/government/us-lawmaker-presses-secs-top-official-after-enforcement-director-quits-2026-03-30/" },
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/business/finance/us-secs-ex-enforcement-chief-clashed-with-bosses-before-leaving-sources-say-2026-03-23/" },
    { _key: key(), label: "Reuters", url: "https://www.reuters.com/business/finance/us-sec-enforcement-director-leave-agency-after-months-job-sources-say-2026-03-16/" },
    { _key: key(), label: "U.S. Senate Banking Committee", url: "https://www.banking.senate.gov/imo/media/doc/20260330lettertoseconenforcementdivisionanddata.pdf" },
  ],
};

// ── Collect all articles ─────────────────────────────────────────────────────

const allArticles = [
  article1, article2, article3, article4, article5,
  article6, article7, article8, article9, article10,
];

// ── Upload via Sanity HTTP Mutations API ─────────────────────────────────────

async function upload() {
  console.log(`\n🚀 Uploading ${allArticles.length} Web3 Fraud Files articles + ${allTags.length} tags...\n`);

  if (DRY_RUN) {
    for (const a of allArticles) {
      console.log(`📄  ${a._id} — ${a.title}`);
    }
    console.log("\n── DRY RUN — no mutations sent ──");
    console.log("Full JSON for first article:\n", JSON.stringify(allArticles[0], null, 2));
    return;
  }

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

  // Build mutations: tags first, then categories/authors, then articles
  const mutations = [
    // Category & Authors
    { createIfNotExists: categoryDoc },
    { createIfNotExists: authorInvestigativeReporter },
    { createIfNotExists: authorRegulatoryReporter },
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

  console.log("\n🎉 All Web3 Fraud Files articles uploaded successfully!");
}

upload().catch(console.error);
