/**
 * assign-category-authors.mjs
 *
 * Assigns existing Sanity author documents to every article in the mapped
 * category.
 *
 * Category -> Author mapping:
 * - Web3 Fraud Files -> Berat Oshily
 * - Crypto Newswire -> Marcus Bishop
 * - Web3 Builder -> Zashleen Singh
 */

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const PROJECT_ID =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
const API_VERSION = process.env.SANITY_API_VERSION || "2024-01-01";
const DRY_RUN = process.env.DRY_RUN === "1";

if (!PROJECT_ID || !TOKEN) {
  console.error(
    "Error: Set SANITY_PROJECT_ID and SANITY_TOKEN env vars before running this script.",
  );
  process.exit(1);
}

const categoryAuthorMappings = [
  {
    categoryTitle: "Web3 Fraud Files",
    categorySlug: "web3-fraud-files",
    authorName: "Berat Oshily",
    authorSlug: "berat-oshily",
  },
  {
    categoryTitle: "Crypto Newswire",
    categorySlug: "crypto-newswire",
    authorName: "Marcus Bishop",
    authorSlug: "marcus-bishop",
  },
  {
    categoryTitle: "Web3 Builder",
    categorySlug: "web3-builder",
    authorName: "Zashleen Singh",
    authorSlug: "zashleen-singh",
  },
];

async function sanityQuery(query, params = {}) {
  const searchParams = new URLSearchParams({
    query,
  });

  for (const [key, value] of Object.entries(params)) {
    searchParams.set(`$${key}`, JSON.stringify(value));
  }

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?${searchParams.toString()}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });

  const result = await res.json();

  if (!res.ok) {
    console.error("Query failed:\n", JSON.stringify(result, null, 2));
    process.exit(1);
  }

  return result.result;
}

async function sendMutations(mutations) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;

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
    console.error("Mutation failed:\n", JSON.stringify(result, null, 2));
    process.exit(1);
  }

  return result;
}

async function upload() {
  const authorQuery = `
    *[
      _type == "author" &&
      slug.current == $authorSlug
    ][0] {
      _id,
      name,
      "slug": slug.current
    }
  `;

  const articleQuery = `
    *[
      _type == "article" &&
      category->slug.current == $categorySlug
    ] | order(publishedAt desc) {
      _id,
      title,
      "currentAuthorId": author._ref,
      "currentAuthorName": author->name
    }
  `;

  const mutations = [];

  for (const mapping of categoryAuthorMappings) {
    const author = await sanityQuery(authorQuery, {
      authorSlug: mapping.authorSlug,
    });

    if (!author?._id) {
      console.error(
        `Author not found in Sanity: ${mapping.authorName} (${mapping.authorSlug})`,
      );
      process.exit(1);
    }

    const articles = await sanityQuery(articleQuery, {
      categorySlug: mapping.categorySlug,
    });

    console.log(
      `\n${mapping.categoryTitle}: ${articles.length} article(s) found -> ${author.name}`,
    );

    const articlesToPatch = articles.filter(
      (article) => article.currentAuthorId !== author._id,
    );

    if (articlesToPatch.length === 0) {
      console.log("  No article author changes needed.");
      continue;
    }

    for (const article of articlesToPatch) {
      console.log(
        `  - ${article._id} (${article.currentAuthorName || "No author"} -> ${author.name})`,
      );

      mutations.push({
        patch: {
          id: article._id,
          set: {
            author: {
              _type: "reference",
              _ref: author._id,
            },
          },
        },
      });
    }
  }

  console.log(`\nPlanned mutations: ${mutations.length}`);

  if (DRY_RUN) {
    console.log("\nDRY RUN - no mutations sent");
    return;
  }

  const BATCH_SIZE = 50;

  for (let i = 0; i < mutations.length; i += BATCH_SIZE) {
    const batch = mutations.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

    console.log(`Sending batch ${batchNumber} (${batch.length} mutations)...`);
    await sendMutations(batch);
    console.log(`Batch ${batchNumber} succeeded.`);
  }

  console.log("\nCategory author assignment complete.");
}

upload().catch((error) => {
  console.error(error);
  process.exit(1);
});
