/**
 * upload-alttext-by-title.mjs
 *
 * Reads title/alt-text pairs from ./alttext, matches Sanity articles by exact
 * title, and updates image alt text.
 *
 * Notes:
 * - Current schema uses coverImage.alt
 * - Older import scripts in this repo used mainImage.alt
 * - This script updates whichever image field exists on the document
 *
 * Usage:
 *   node upload-alttext-by-title.mjs
 *   DRY_RUN=0 node upload-alttext-by-title.mjs
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";

loadEnv({ path: ".env.local" });

const DRY_RUN = process.env.DRY_RUN !== "0";
const ALT_TEXT_FILE =
  process.env.ALT_TEXT_FILE || resolve(process.cwd(), "alttext");
const PROJECT_ID =
  process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET =
  process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET;
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
const API_VERSION = process.env.SANITY_API_VERSION || "2024-01-01";

const ARTICLE_QUERY = `
  *[
    _type == "article" &&
    title in $titles
  ]{
    _id,
    title,
    "slug": slug.current,
    coverImage,
    mainImage
  }
`;

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function createSanityClient() {
  assertEnv("SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID", PROJECT_ID);
  assertEnv("SANITY_DATASET or NEXT_PUBLIC_SANITY_DATASET", DATASET);
  assertEnv("SANITY_API_TOKEN or SANITY_TOKEN", TOKEN);

  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    token: TOKEN,
    apiVersion: API_VERSION,
    useCdn: false,
    perspective: "raw",
  });
}

function parseAltTextFile(fileContents) {
  const blocks = fileContents
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  const entries = [];
  const seenTitles = new Set();

  for (const block of blocks) {
    const titleMatch = block.match(/^title:\s*(.+)$/im);
    const altMatch = block.match(/^(?:alttext|altext):\s*([\s\S]+)$/im);

    if (!titleMatch || !altMatch) {
      throw new Error(`Could not parse alttext block:\n\n${block}`);
    }

    const title = titleMatch[1].trim();
    const altText = altMatch[1].replace(/\s+/g, " ").trim();

    if (!title || !altText) {
      throw new Error(`Invalid title/alt text block:\n\n${block}`);
    }

    if (seenTitles.has(title)) {
      throw new Error(`Duplicate title in alttext file: "${title}"`);
    }

    seenTitles.add(title);
    entries.push({ title, altText });
  }

  return entries;
}

function groupByTitle(documents) {
  const groups = new Map();

  for (const document of documents) {
    const existing = groups.get(document.title) ?? [];
    existing.push(document);
    groups.set(document.title, existing);
  }

  return groups;
}

function buildSetOperations(document, altText) {
  const setOperations = {};

  if (document.coverImage && document.coverImage.alt !== altText) {
    setOperations["coverImage.alt"] = altText;
  }

  if (document.mainImage && document.mainImage.alt !== altText) {
    setOperations["mainImage.alt"] = altText;
  }

  return setOperations;
}

async function main() {
  try {
    const rawFile = await readFile(ALT_TEXT_FILE, "utf8");
    const entries = parseAltTextFile(rawFile);
    const client = createSanityClient();
    const documents = await client.fetch(ARTICLE_QUERY, {
      titles: entries.map((entry) => entry.title),
    });
    const documentsByTitle = groupByTitle(documents ?? []);

    let transaction = client.transaction();
    let matchedTitles = 0;
    let plannedUpdates = 0;
    let updatedDocuments = 0;

    console.log(
      `Parsed ${entries.length} title/alt-text pair(s) from ${ALT_TEXT_FILE}`,
    );

    for (const entry of entries) {
      const matches = documentsByTitle.get(entry.title) ?? [];

      if (matches.length === 0) {
        console.log(`MISS: No Sanity article found for title "${entry.title}"`);
        continue;
      }

      matchedTitles += 1;

      for (const document of matches) {
        const setOperations = buildSetOperations(document, entry.altText);

        if (Object.keys(setOperations).length === 0) {
          console.log(
            `SKIP: "${document.title}" (${document._id}) already has matching alt text or no coverImage/mainImage field`,
          );
          continue;
        }

        plannedUpdates += 1;

        if (DRY_RUN) {
          console.log(
            `DRY RUN: Would update "${document.title}" (${document._id})`,
          );
          console.log(`         Slug: ${document.slug || "(no slug)"}`);
          console.log(`         Alt text: ${entry.altText}`);
          continue;
        }

        transaction = transaction.patch(document._id, (patch) =>
          patch.set(setOperations),
        );
        updatedDocuments += 1;

        console.log(`LIVE: Queued alt text update for "${document.title}"`);
      }
    }

    if (DRY_RUN) {
      console.log(
        `DRY RUN COMPLETE: matched ${matchedTitles} title(s), would update ${plannedUpdates} document(s) after switching DRY_RUN=0`,
      );
      return;
    }

    if (updatedDocuments === 0) {
      console.log("No Sanity article documents needed alt text updates");
      return;
    }

    await transaction.commit();

    console.log(
      `Updated ${updatedDocuments} Sanity article document(s) across ${matchedTitles} matched title(s)`,
    );
  } catch (error) {
    console.error("Failed to upload alt text by title");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
