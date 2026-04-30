import { config as loadEnv } from "dotenv";
import { createClient } from "@sanity/client";

loadEnv({ path: ".env.local" });

const DRY_RUN = false;
const ARTICLE_TITLE = "Mined in America Act Targets US Bitcoin Hardware Risk";

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;

const LINKS_TO_REMOVE = [
  {
    text: "Reuters report on crypto-linked drone purchases",
    url: "https://www.reuters.com/technology/crypto-fuels-drone-purchases-russia-iran-report-says-2026-03-30/",
  },
  {
    text: "Chainalysis research on drone procurement and crypto",
    url: "https://www.chainalysis.com/blog/cryptocurrency-drones-research/",
  },
  {
    text: "C4ADS report on Russia-Iran drone production",
    url: "https://c4ads.org/reports/airborne-axis/",
  },
  {
    text: "OFAC guidance on Iran UAV-related activities",
    url: "https://ofac.treasury.gov/recent-actions/20230609",
  },
  {
    text: "Treasury action against Iran's UAV procurement network",
    url: "https://home.treasury.gov/news/press-releases/sb0313",
  },
];

const ARTICLE_QUERY = `
  *[
    _type == "article" &&
    title == $title
  ][0]
`;

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function getBlockText(block) {
  if (!Array.isArray(block?.children)) {
    return "";
  }

  return block.children
    .map((child) => (typeof child?.text === "string" ? child.text : ""))
    .join("")
    .trim();
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
  });
}

function removeInjectedLinkFromBlock(block, link) {
  const children = Array.isArray(block.children) ? [...block.children] : [];
  const markDefs = Array.isArray(block.markDefs) ? [...block.markDefs] : [];

  const markDefKeys = markDefs
    .filter((markDef) => markDef?._type === "link" && markDef?.href === link.url)
    .map((markDef) => markDef._key)
    .filter(Boolean);

  const linkSpanIndex = children.findIndex((child) => {
    if (child?._type !== "span" || child?.text !== link.text) {
      return false;
    }

    if (!Array.isArray(child.marks)) {
      return false;
    }

    if (markDefKeys.length === 0) {
      return true;
    }

    return child.marks.some((mark) => markDefKeys.includes(mark));
  });

  if (linkSpanIndex === -1) {
    return { changed: false, block };
  }

  const removeIndexes = new Set([linkSpanIndex]);
  const separatorIndex = linkSpanIndex - 1;
  const separator = children[separatorIndex];

  if (
    separator?._type === "span" &&
    separator?.text === " — " &&
    Array.isArray(separator.marks) &&
    separator.marks.length === 0
  ) {
    removeIndexes.add(separatorIndex);
  }

  const nextChildren = children
    .filter((_, index) => !removeIndexes.has(index))
    .map((child) => {
      if (!Array.isArray(child?.marks) || markDefKeys.length === 0) {
        return child;
      }

      return {
        ...child,
        marks: child.marks.filter((mark) => !markDefKeys.includes(mark)),
      };
    });

  const nextMarkDefs = markDefs.filter(
    (markDef) =>
      !(
        markDef?._type === "link" &&
        markDef?.href === link.url &&
        markDefKeys.includes(markDef._key)
      ),
  );

  return {
    changed: true,
    block: {
      ...block,
      children: nextChildren,
      markDefs: nextMarkDefs,
    },
  };
}

async function main() {
  try {
    const client = createSanityClient();
    const article = await client.fetch(ARTICLE_QUERY, {
      title: ARTICLE_TITLE,
    });

    if (!article?._id) {
      console.error(`No article found for title "${ARTICLE_TITLE}"`);
      return;
    }

    if (!Array.isArray(article.body)) {
      console.error(
        `Article "${ARTICLE_TITLE}" does not have a Portable Text body array`,
      );
      return;
    }

    const updatedBody = structuredClone(article.body);
    const h2Indexes = updatedBody.reduce((indexes, block, index) => {
      if (block?._type === "block" && block?.style === "h2") {
        indexes.push(index);
      }

      return indexes;
    }, []);

    if (h2Indexes.length === 0) {
      console.error(`No H2 blocks found in article "${ARTICLE_TITLE}"`);
      return;
    }

    if (h2Indexes.length < LINKS_TO_REMOVE.length) {
      console.log(
        `Found ${h2Indexes.length} H2 block(s); only ${h2Indexes.length} of ${LINKS_TO_REMOVE.length} links can be checked for removal`,
      );
    }

    const totalToCheck = Math.min(h2Indexes.length, LINKS_TO_REMOVE.length);
    let removedCount = 0;

    for (let index = 0; index < totalToCheck; index += 1) {
      const bodyIndex = h2Indexes[index];
      const block = updatedBody[bodyIndex];
      const link = LINKS_TO_REMOVE[index];
      const headingText = getBlockText(block);
      const result = removeInjectedLinkFromBlock(block, link);

      if (!result.changed) {
        console.log(
          `SKIP: Link ${index + 1} not found on H2 → "${headingText}"`,
        );
        continue;
      }

      updatedBody[bodyIndex] = result.block;
      removedCount += 1;

      if (DRY_RUN) {
        console.log(
          `DRY RUN: Would remove link ${index + 1} from H2 → "${headingText}"`,
        );
        console.log(`         Link text: "${link.text}"`);
        console.log(`         URL: ${link.url}`);
      } else {
        console.log(`LIVE: Removed link ${index + 1} from H2 → "${headingText}"`);
      }
    }

    if (removedCount === 0) {
      console.log("No injected links were found to remove");
      return;
    }

    if (DRY_RUN) {
      console.log("DRY RUN COMPLETE — set DRY_RUN = false to apply");
      return;
    }

    await client.patch(article._id).set({ body: updatedBody }).commit();
    console.log(`${removedCount} of ${LINKS_TO_REMOVE.length} links removed successfully`);
  } catch (error) {
    console.error("Failed to remove external links from article H2 blocks");
    console.error(error instanceof Error ? error.message : error);
  }
}

await main();
