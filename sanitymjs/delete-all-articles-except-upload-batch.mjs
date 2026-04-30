import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";

loadEnv({ path: ".env.local" });

const DRY_RUN = process.env.DRY_RUN !== "0";

const SANITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;

const KEEP_SLUGS = [
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

const ARTICLES_TO_DELETE_QUERY = `
  *[
    _type == "article" &&
    (!defined(slug.current) || !(slug.current in $keepSlugs))
  ]{
    _id,
    title,
    "slug": slug.current
  }
`;

const KEPT_ARTICLES_QUERY = `
  *[
    _type == "article" &&
    slug.current in $keepSlugs
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
    apiVersion: "2026-04-05",
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

    const [keptArticles, articlesToDelete] = await Promise.all([
      client.fetch(KEPT_ARTICLES_QUERY, { keepSlugs: KEEP_SLUGS }),
      client.fetch(ARTICLES_TO_DELETE_QUERY, { keepSlugs: KEEP_SLUGS }),
    ]);

    const keptSlugs = new Set(
      keptArticles
        .map((article) => article?.slug)
        .filter((slug) => typeof slug === "string"),
    );
    const missingKeepSlugs = KEEP_SLUGS.filter((slug) => !keptSlugs.has(slug));

    console.log(`Keep list contains ${KEEP_SLUGS.length} slug(s)`);
    console.log(`Matched ${keptArticles.length} kept article document version(s)`);
    console.log(
      `Matched ${articlesToDelete.length} article document version(s) outside the keep list`,
    );

    if (missingKeepSlugs.length > 0) {
      console.log("Keep-list slugs not found:");
      for (const slug of missingKeepSlugs) {
        console.log(`- ${slug}`);
      }
    }

    if (articlesToDelete.length === 0) {
      console.log("No non-kept articles found. Nothing to delete.");
      return;
    }

    const docIdsToDelete = unique(
      articlesToDelete.flatMap((article) => {
        const baseId = getBaseId(article._id);
        return [baseId, `drafts.${baseId}`];
      }),
    );

    for (const article of articlesToDelete) {
      console.log(
        `${DRY_RUN ? "DRY RUN" : "LIVE"}: Delete article -> "${article.title}" (${article._id}) slug=${article.slug ?? "<missing>"}`,
      );
    }

    console.log(
      `${DRY_RUN ? "DRY RUN" : "LIVE"}: Delete ${docIdsToDelete.length} document id(s) after expanding draft/published pairs`,
    );

    if (DRY_RUN) {
      console.log("DRY RUN COMPLETE — rerun with DRY_RUN=0 to apply");
      return;
    }

    let transaction = client.transaction();

    for (const documentId of docIdsToDelete) {
      transaction = transaction.delete(documentId);
    }

    await transaction.commit();

    console.log(
      `Deleted ${docIdsToDelete.length} document id(s) for non-kept articles successfully`,
    );
  } catch (error) {
    console.error("Failed to delete non-kept articles");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
