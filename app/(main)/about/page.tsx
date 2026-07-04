import type { Metadata } from "next";
import {
  Bebas_Neue,
  Syne,
  DM_Serif_Display,
  JetBrains_Mono,
} from "next/font/google";
import {
  mapSanityArticles,
  mapSanityAuthors,
} from "@/lib/sanity/adapters";
import {
  getAllArticleSlugs,
  getAllAuthors,
  getAllCategories,
  getLatestArticles,
} from "@/lib/sanity/queries";
import { AboutContent } from "./AboutContent";

const FALLBACK_ARTICLE_COUNT = 48;
const FALLBACK_CATEGORY_COUNT = 3;

/* ─── Fonts ──────────────────────────────────────────────────────────────── */
const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});
const dmSerif = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});
const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jb-mono",
  display: "swap",
});

/* ─── Metadata ───────────────────────────────────────────────────────────── */
export async function generateMetadata(): Promise<Metadata> {
  const description =
    "Learn about Cryptic Daily, our newsroom mission, and our coverage across Crypto Newswire, Web3 Builder, and Web3 Fraud Files.";

  return {
    title: "About Us",
    description,
    alternates: {
      canonical: "https://crypticdaily.com/about",
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: "About Us | Cryptic Daily",
      description,
      url: "https://crypticdaily.com/about",
      images: [{ url: "https://crypticdaily.com/og-default.png" }],
    },
  };
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default async function AboutPage() {
  const fontVars = [
    bebas.variable,
    syne.variable,
    dmSerif.variable,
    jbMono.variable,
  ].join(" ");

  const [articles, categories, authorsData, latestArticlesData] = await Promise.all([
    getAllArticleSlugs(),
    getAllCategories(),
    getAllAuthors(),
    getLatestArticles(4),
  ]);

  const articleCount =
    Array.isArray(articles) && articles.length > 0
      ? articles.length
      : FALLBACK_ARTICLE_COUNT;
  const categoryCount =
    Array.isArray(categories) && categories.length > 0
      ? categories.length
      : FALLBACK_CATEGORY_COUNT;
  const authors = mapSanityAuthors(authorsData);
  const latestArticles = mapSanityArticles(latestArticlesData);

  return (
    <AboutContent
      fontVars={fontVars}
      articleCount={articleCount}
      categoryCount={categoryCount}
      authors={authors}
      latestArticles={latestArticles}
    />
  );
}
