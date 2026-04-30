import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";

loadEnv({ path: ".env.local" });

const DRY_RUN = true;
const ALT_TEXT = "CRYPTIC-DAILY";

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

const TARGET_ARTICLES = [
  { label: "Article 1", slug: "franklin-templeton-250-digital-crypto" },
  { label: "Article 2", slug: "nyse-securitize-tokenized-securities-platform" },
  { label: "Article 3", slug: "anchorage-tron-us-institutional-rails" },
  { label: "Article 4", slug: "coinbase-crypto-down-payments-homes" },
  { label: "Article 5", slug: "mercado-pago-ends-mercado-coin" },
  { label: "Article 6", slug: "bitcoin-iran-shock-global-markets" },
  { label: "Article 7", slug: "stablecoin-velocity-2t-forecast" },
  { label: "Article 8", slug: "moodys-new-hampshire-bitcoin-bond" },
  { label: "Article 9", slug: "riot-sells-bitcoin-ai-pivot" },
  { label: "Article 10", slug: "gamestop-bitcoin-covered-calls" },
  { label: "Article 11", slug: "bitcoin-outperforms-stocks-oil-shock" },
  { label: "Article 12", slug: "bitcoin-loss-supply-stress-signal" },
  { label: "Article 13", slug: "todd-blanche-crypto-acting-ag" },
  { label: "Article 14", slug: "bitcoin-difficulty-drops-miner-stress" },
  { label: "Article 15", slug: "bitcoin-etfs-break-inflow-streak" },
  { label: "Article 16", slug: "metaplanet-adds-5075-btc-q1" },
];

const ARTICLE_VERSIONS_QUERY = `
  *[
    _type == "article" &&
    slug.current in $slugs
  ]{
    ...
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

function stripSystemFields(document, publishedId) {
  const { _rev, _createdAt, _updatedAt, _originalId, ...rest } = document;

  return {
    ...rest,
    _id: publishedId,
  };
}

function groupArticleVersions(records) {
  const groups = new Map();

  for (const record of records) {
    const baseId = getBaseId(record._id);
    const existing = groups.get(baseId) ?? {
      baseId,
      slug: record.slug?.current ?? "",
      published: null,
      draft: null,
    };

    if (record._id.startsWith("drafts.")) {
      existing.draft = record;
    } else {
      existing.published = record;
    }

    if (!existing.slug && record.slug?.current) {
      existing.slug = record.slug.current;
    }

    groups.set(baseId, existing);
  }

  return [...groups.values()];
}

async function main() {
  try {
    const client = createSanityClient();
    const records = await client.fetch(ARTICLE_VERSIONS_QUERY, {
      slugs: TARGET_ARTICLES.map((article) => article.slug),
    });

    const groups = groupArticleVersions(records ?? []);
    const groupBySlug = new Map(groups.map((group) => [group.slug, group]));
    const targetSlugs = new Set(TARGET_ARTICLES.map((article) => article.slug));
    const duplicateSlugGroups = groups.filter(
      (group) =>
        group.slug &&
        targetSlugs.has(group.slug) &&
        !group.published &&
        !group.draft,
    );

    if (duplicateSlugGroups.length > 0) {
      console.log(
        `WARN: ${duplicateSlugGroups.length} grouped article entries had no published or draft record`,
      );
    }

    let transaction = client.transaction();
    let updatedCount = 0;
    let publishedCount = 0;

    for (const target of TARGET_ARTICLES) {
      const group = groupBySlug.get(target.slug);

      if (!group) {
        console.log(`MISS: No article found for slug "${target.slug}"`);
        continue;
      }

      const sourceDoc = group.draft ?? group.published;

      if (!sourceDoc) {
        console.log(
          `SKIP: No usable document version found for slug "${target.slug}"`,
        );
        continue;
      }

      if (!sourceDoc.coverImage?.asset?._ref) {
        console.log(`SKIP: "${sourceDoc.title}" has no cover image asset`);
        continue;
      }

      const currentAlt = sourceDoc.coverImage?.alt ?? "";
      const nextUpdatedAt = new Date().toISOString();
      const publishMode = group.draft ? "publish draft" : "update published";

      if (DRY_RUN) {
        console.log(
          `DRY RUN: Would set coverImage.alt to "${ALT_TEXT}" on "${sourceDoc.title}"`,
        );
        console.log(`         ${target.label}`);
        console.log(`         Slug: "${target.slug}"`);
        console.log(`         Current alt: "${currentAlt || "(empty)"}"`);
        console.log(`         Action: ${publishMode}`);
        continue;
      }

      if (group.draft) {
        const publishedId = group.baseId;
        const nextDoc = structuredClone(sourceDoc);
        nextDoc.coverImage = {
          ...(nextDoc.coverImage ?? {}),
          alt: ALT_TEXT,
        };
        nextDoc.updatedAt = nextUpdatedAt;

        transaction = transaction
          .createOrReplace(stripSystemFields(nextDoc, publishedId))
          .delete(group.draft._id);
        publishedCount += 1;
      } else {
        transaction = transaction.patch(group.baseId, (patch) =>
          patch.set({
            "coverImage.alt": ALT_TEXT,
            updatedAt: nextUpdatedAt,
          }),
        );
      }

      updatedCount += 1;
      console.log(`LIVE: Updated alt text on "${sourceDoc.title}"`);
    }

    if (DRY_RUN) {
      console.log("DRY RUN COMPLETE — set DRY_RUN = false to apply");
      return;
    }

    if (updatedCount === 0) {
      console.log("No article documents were updated");
      return;
    }

    await transaction.commit();

    console.log(
      `Updated ${updatedCount} article(s); published ${publishedCount} draft article(s) with alt text "${ALT_TEXT}"`,
    );
  } catch (error) {
    console.error("Failed to set alt text and publish matched articles");
    console.error(error instanceof Error ? error.message : error);
  }
}

await main();
