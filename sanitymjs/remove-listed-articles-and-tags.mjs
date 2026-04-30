import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";

loadEnv({ path: ".env.local" });

const DRY_RUN = true;

const ARTICLE_TITLES = [
  "Bitcoin ETFs Bleed $171M as Iran Weekend Risk Spooks Initiatives",
  "UK Xinbi Sanctions: Anatomy of Scam-Centre Infrastructure",
  "ONUS Vietnam Arrests: Anatomy of a Fake-Liquidity Scam",
  "Steakhouse Frontend Hijack: DeFi's Real Attack Surface",
  "Uranium Finance Indictment: Why Old DeFi Hacks Are Now Cases",
  "FBI Tron Token Scam: How Wallet Phishing Is Evolving",
  "Justin Sun SEC Settlement: What the $10M Deal Signals",
  "Moonwell cbETH Oracle Bug: How $1.78M Vanished on Base",
  "Aave wstETH Oracle Error: Why One Bad Cap Triggered $27M",
  "Solv BRO Vault Exploit: How a Double Mint Drained SolvBTC",
  "YieldBlox Oracle Attack: Why Stellar Freeze Tools Matter",
  "Venus Thena Exploit: Why a Known Flaw Stayed Unfixed",
  "Resolv USR Exploit: Why One Off-Chain Key Broke the Peg",
];

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

const ARTICLES_QUERY = `
  *[
    _type == "article" &&
    title in $titles
  ]{
    _id,
    title,
    "slug": slug.current,
    tags[]->{
      _id,
      title,
      "slug": slug.current
    }
  }
`;

const TAG_USAGE_QUERY = `
  *[
    _type == "tag" &&
    _id in $tagIds
  ]{
    _id,
    title,
    "slug": slug.current,
    "remainingArticleCount": count(*[
      _type == "article" &&
      references(^._id) &&
      !(_id in $articleDocIds)
    ])
  }
`;

const TAG_DOCS_QUERY = `
  *[_id in $ids]{
    _id,
    title,
    "slug": slug.current
  }
`;

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function createSanityClient() {
  assertEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", SANITY_PROJECT_ID);
  assertEnv("NEXT_PUBLIC_SANITY_DATASET", SANITY_DATASET);
  assertEnv("SANITY_API_TOKEN", SANITY_TOKEN);

  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    apiVersion: "2026-04-04",
    useCdn: false,
    perspective: "raw",
  });
}

function getBaseId(documentId) {
  return documentId.startsWith("drafts.") ? documentId.slice(7) : documentId;
}

function unique(values) {
  return [...new Set(values)];
}

async function main() {
  try {
    const client = createSanityClient();
    const matchingArticles = await client.fetch(ARTICLES_QUERY, {
      titles: ARTICLE_TITLES,
    });

    if (!Array.isArray(matchingArticles) || matchingArticles.length === 0) {
      console.error("No matching articles found for the provided titles");
      return;
    }

    const foundTitles = new Set(
      matchingArticles.map((article) => article.title),
    );
    const missingTitles = ARTICLE_TITLES.filter(
      (title) => !foundTitles.has(title),
    );

    if (missingTitles.length > 0) {
      console.log("Titles not found:");
      for (const title of missingTitles) {
        console.log(`- ${title}`);
      }
    }

    const articleDocIds = unique(
      matchingArticles.map((article) => article._id),
    );
    const tagIds = unique(
      matchingArticles.flatMap((article) =>
        Array.isArray(article.tags)
          ? article.tags
              .map((tag) => tag?._id)
              .filter((tagId) => typeof tagId === "string")
          : [],
      ),
    );

    const tagUsage = tagIds.length
      ? await client.fetch(TAG_USAGE_QUERY, {
          tagIds,
          articleDocIds,
        })
      : [];

    const orphanedBaseTagIds = tagUsage
      .filter((tag) => (tag?.remainingArticleCount ?? 0) === 0)
      .map((tag) => tag._id)
      .filter((tagId) => typeof tagId === "string");

    const tagDocIdsToCheck = unique(
      orphanedBaseTagIds.flatMap((tagId) => [tagId, `drafts.${tagId}`]),
    );

    const tagDocsToDelete = tagDocIdsToCheck.length
      ? await client.fetch(TAG_DOCS_QUERY, { ids: tagDocIdsToCheck })
      : [];

    console.log(
      `Matched ${matchingArticles.length} article document(s) for deletion`,
    );
    for (const article of matchingArticles) {
      console.log(
        `${DRY_RUN ? "DRY RUN" : "LIVE"}: Delete article → "${article.title}" (${article._id})`,
      );
    }

    if (tagDocsToDelete.length > 0) {
      console.log(
        `Matched ${tagDocsToDelete.length} orphaned tag document(s) for deletion`,
      );
      for (const tag of tagDocsToDelete) {
        console.log(
          `${DRY_RUN ? "DRY RUN" : "LIVE"}: Delete tag → "${tag.title}" (${tag._id})`,
        );
      }
    } else {
      console.log("No orphaned tags will be deleted");
    }

    if (DRY_RUN) {
      console.log("DRY RUN COMPLETE — set DRY_RUN = false to apply");
      return;
    }

    let transaction = client.transaction();

    for (const articleId of articleDocIds) {
      transaction = transaction.delete(articleId);
    }

    for (const tag of tagDocsToDelete) {
      transaction = transaction.delete(tag._id);
    }

    await transaction.commit();

    console.log(
      `Removed ${articleDocIds.length} article document(s) and ${tagDocsToDelete.length} tag document(s) successfully`,
    );
  } catch (error) {
    console.error("Failed to remove listed articles and orphaned tags");
    console.error(error instanceof Error ? error.message : error);
  }
}

await main();
