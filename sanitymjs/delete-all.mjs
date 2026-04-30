/**
 * delete-all.mjs
 *
 * Fetches all article documents from Sanity (published + drafts) and
 * deletes every one EXCEPT drafts.morgan-stanley-bitcoin-etf-advisor-channel.
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
  console.error("Error: Set SANITY_PROJECT_ID and SANITY_TOKEN env vars.");
  process.exit(1);
}

const KEEP_SLUG = "morgan-stanley-bitcoin-etf-advisor-channel";

async function fetchAllArticleIds() {
  // Query both published and draft articles via the /data/query endpoint
  // including: *[_type == "article"]{_id}
  const query = encodeURIComponent('*[_type == "article"]{_id}');
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${query}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("❌ Query failed:\n", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  return data.result.map((doc) => doc._id);
}

async function deleteAll() {
  console.log("\n🔍 Fetching all article IDs from Sanity...\n");

  const allIds = await fetchAllArticleIds();

  const toDelete = allIds.filter(
    (id) => !id.includes(KEEP_SLUG)
  );

  console.log(`📋 Found ${allIds.length} articles total`);
  console.log(`🔒 Keeping: ${allIds.find((id) => id.includes(KEEP_SLUG)) ?? "(not found)"}`);
  console.log(`🗑️  Deleting: ${toDelete.length} articles\n`);

  if (DRY_RUN) {
    for (const id of toDelete) {
      console.log(`  would delete: ${id}`);
    }
    console.log("\n── DRY RUN — no mutations sent ──");
    return;
  }

  if (toDelete.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
  const mutations = toDelete.map((id) => ({ delete: { id } }));

  const BATCH_SIZE = 50;
  for (let i = 0; i < mutations.length; i += BATCH_SIZE) {
    const batch = mutations.slice(i, i + BATCH_SIZE);
    console.log(`📤 Batch ${Math.floor(i / BATCH_SIZE) + 1}: deleting ${batch.length} documents...`);

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

  console.log(`\n🎉 Deleted ${toDelete.length} articles successfully!`);
}

deleteAll().catch(console.error);
