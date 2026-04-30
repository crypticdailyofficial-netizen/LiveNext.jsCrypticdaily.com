import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";

loadEnv({ path: ".env.local" });

const DRY_RUN = false;

const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;

const ARTICLE_SLUGS = [
  "franklin-templeton-250-digital-crypto",
  "nyse-securitize-tokenized-securities-platform",
  "anchorage-tron-us-institutional-rails",
  "coinbase-crypto-down-payments-homes",
  "mercado-pago-ends-mercado-coin",
  "bitcoin-iran-shock-global-markets",
  "stablecoin-velocity-2t-forecast",
  "moodys-new-hampshire-bitcoin-bond",
  "riot-sells-bitcoin-ai-pivot",
  "gamestop-bitcoin-covered-calls",
  "bitcoin-outperforms-stocks-oil-shock",
  "bitcoin-loss-supply-stress-signal",
  "todd-blanche-crypto-acting-ag",
  "bitcoin-difficulty-drops-miner-stress",
  "bitcoin-etfs-break-inflow-streak",
  "metaplanet-adds-5075-btc-q1",
];

const ARTICLES_QUERY = `
  *[
    _type == "article" &&
    slug.current in $slugs
  ]{
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
  assertEnv("NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_PROJECT_ID", SANITY_PROJECT_ID);
  assertEnv("NEXT_PUBLIC_SANITY_DATASET or SANITY_DATASET", SANITY_DATASET);
  assertEnv("SANITY_API_TOKEN or SANITY_TOKEN", SANITY_TOKEN);

  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    token: SANITY_TOKEN,
    apiVersion: "2026-04-04",
    useCdn: false,
    perspective: "raw",
  });
}

function unique(values) {
  return [...new Set(values)];
}

function getBaseId(documentId) {
  return documentId.startsWith("drafts.") ? documentId.slice(7) : documentId;
}

async function main() {
  try {
    const client = createSanityClient();
    const matches = await client.fetch(ARTICLES_QUERY, {
      slugs: ARTICLE_SLUGS,
    });

    if (!Array.isArray(matches) || matches.length === 0) {
      console.error("No matching article documents found for the upload batch slugs");
      return;
    }

    const foundSlugs = new Set(matches.map((article) => article.slug));
    const missingSlugs = ARTICLE_SLUGS.filter((slug) => !foundSlugs.has(slug));

    if (missingSlugs.length > 0) {
      console.log("Slugs not found:");
      for (const slug of missingSlugs) {
        console.log(`- ${slug}`);
      }
    }

    const docIdsToDelete = unique(
      matches.flatMap((article) => {
        const baseId = getBaseId(article._id);
        return [baseId, `drafts.${baseId}`];
      }),
    );

    console.log(`Matched ${matches.length} article record(s) across the upload batch`);
    for (const article of matches) {
      console.log(
        `${DRY_RUN ? "DRY RUN" : "LIVE"}: Delete article → "${article.title}" (${article._id})`,
      );
    }

    if (DRY_RUN) {
      console.log("DRY RUN COMPLETE — set DRY_RUN = false to apply");
      return;
    }

    let transaction = client.transaction();

    for (const documentId of docIdsToDelete) {
      transaction = transaction.delete(documentId);
    }

    await transaction.commit();

    console.log(
      `Deleted ${docIdsToDelete.length} article document id(s) from the upload batch successfully`,
    );
  } catch (error) {
    console.error("Failed to delete upload batch articles");
    console.error(error instanceof Error ? error.message : error);
  }
}

await main();
