import { HomePageClient } from "@/components/home/HomePageClient";
import {
  dedupeArticles,
  mapSanityArticle,
  mapSanityArticles,
  mapSanityCategories,
} from "@/lib/sanity/adapters";
import {
  getAllCategories,
  getHomepageFeaturedArticle,
  getHomepageLatestArticles,
  getTotalArticleCount,
} from "@/lib/sanity/queries";

export const revalidate = 300;

export default async function Homepage() {
  const [
    featuredArticleData,
    latestArticlesData,
    categoriesData,
    totalArticleCount,
  ] =
    await Promise.all([
      getHomepageFeaturedArticle(),
      getHomepageLatestArticles(12),
      getAllCategories(),
      getTotalArticleCount(),
    ]);

  const featuredArticle = mapSanityArticle(featuredArticleData);
  const latestArticles = dedupeArticles(mapSanityArticles(latestArticlesData));
  const categories = mapSanityCategories(categoriesData);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cryptic Daily — Crypto News & Analysis",
    url: "https://crypticdaily.com",
    description: "The latest cryptocurrency news, market analysis, and Web3 insights.",
    publisher: {
      "@type": "Organization",
      name: "Cryptic Daily",
      url: "https://crypticdaily.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <HomePageClient
        featuredArticle={featuredArticle}
        latestArticles={latestArticles}
        categories={categories}
        totalArticleCount={totalArticleCount}
      />
    </>
  );
}
