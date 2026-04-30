import Link from "next/link";
import Community from "@/components/community/Community";
import { DesktopAnimatedHero } from "@/components/home/DesktopAnimatedHero";
import { Hero } from "@/components/home/Hero";
import { LatestNewsSection } from "@/components/home/LatestNewsSection";
import { Sidebar } from "@/components/layout/Sidebar";
import type { CategorySummary } from "@/lib/sanity/adapters";
import type { Article } from "@/types/article";

interface HomePageClientProps {
  featuredArticle: Article | null;
  latestArticles: Article[];
  categories: CategorySummary[];
  totalArticleCount: number;
}

export function HomePageClient({
  featuredArticle,
  latestArticles,
  categories,
  totalArticleCount,
}: HomePageClientProps) {
  const heroArticleRaw = featuredArticle ?? latestArticles[0] ?? null;
  const heroArticle = heroArticleRaw
    ? {
        ...heroArticleRaw,
        coverImage: null,
        coverImageBlurDataURL: null,
      }
    : null;

  const articlesWithoutHero = heroArticle
    ? latestArticles.filter((article) => article.slug !== heroArticle.slug)
    : latestArticles;
  const marqueeArticles = heroArticle
    ? [heroArticle, ...articlesWithoutHero]
    : latestArticles;
  const compactMarqueeArticles = marqueeArticles.slice(0, 6);

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-5">
        <div className="relative mb-10 overflow-hidden rounded-[28px] border border-[#3A1A1A] bg-[#110707] shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(239,68,68,0.1),transparent_16%,transparent_84%,rgba(239,68,68,0.1))]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,#0D0A07,rgba(13,10,7,0))]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,#0D0A07,rgba(13,10,7,0))]" />

          <div className="relative flex items-center gap-4 px-4 py-3 sm:px-5">
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#EF4444]/20 bg-[#1A0C0C] px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[#FCA5A5]">
              <span className="h-2 w-2 rounded-full bg-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
              Breaking
            </span>

            <div className="relative flex-1 overflow-hidden">
              <div
                className="animate-marquee whitespace-nowrap"
                style={{
                  display: "inline-block",
                  width: "max-content",
                  animationDuration: "85s",
                }}
              >
                {[...compactMarqueeArticles, ...compactMarqueeArticles].map(
                  (article, i) => (
                    <span
                      key={`${article.slug}-${i}`}
                      className="mr-8 inline-flex items-center text-[13px]"
                    >
                      <Link
                        href={`/news/${article.slug}`}
                        prefetch={false}
                        className="text-[#A69292] transition-colors duration-200 hover:text-[#FEE2E2]"
                      >
                        {article.title}
                      </Link>
                      <span className="mx-4 text-[#6B3030]">•</span>
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden pb-10 md:block md:min-h-[290px]">
          <DesktopAnimatedHero />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-14">
            <Hero article={heroArticle} />
            <Community />
          </div>

          <Sidebar trendingArticles={marqueeArticles.slice(0, 5)} />
        </div>

        <LatestNewsSection
          articles={articlesWithoutHero}
          categories={categories}
          totalArticleCount={totalArticleCount}
        />

        <Community />
      </div>
    </div>
  );
}
