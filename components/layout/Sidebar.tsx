import Link from "next/link";
import type { Article } from "@/types/article";

const theme = {
  mono: '"JetBrains Mono", "Fira Mono", ui-monospace, monospace',
};

const ArrowIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

function TrendingSection({ articles }: { articles: Article[] }) {
  const visibleArticles = articles.slice(0, 5);

  if (!visibleArticles.length) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-white/8 bg-[#090909] shadow-[0_20px_60px_rgba(0,0,0,0.34)]">
      <div className="border-b border-white/8 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#D6AE69]" />
            <span
              className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#D6AE69]"
              style={{ fontFamily: theme.mono }}
            >
              Trending Desk
            </span>
          </div>
          <span
            className="text-[0.64rem] uppercase tracking-[0.22em] text-[#D6AE69]"
            style={{ fontFamily: theme.mono }}
          >
            Live
          </span>
        </div>
      </div>

      <div className="px-5 py-2">
        <div className="divide-y divide-white/8">
          {visibleArticles.map((article, index) => (
            <Link
              key={article.id ?? article.slug}
              href={`/news/${article.slug}`}
              prefetch={false}
              className="group grid grid-cols-[40px_1fr_auto] items-start gap-4 py-[15px]"
            >
              <span
                className="pt-0.5 text-[1.05rem] font-bold leading-none text-[#D6AE69]"
                style={{ fontFamily: theme.mono }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <p
                  className={`transition-colors duration-200 group-hover:text-white ${
                    index === 0
                      ? "text-[1rem] font-semibold leading-6 tracking-[-0.02em] text-[#F2EEE8]"
                      : "text-[0.96rem] leading-6 text-[#C9C1B6]"
                  }`}
                >
                  {article.title}
                </p>
              </div>

              <span className="pt-1 text-white/18 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#D6AE69]">
                <ArrowIcon className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="border-t border-white/8 pt-4 pb-2">
          <Link
            href="/news"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#D6AE69] transition-colors duration-200 hover:text-[#F3C981]"
          >
            Browse latest coverage
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

interface SidebarProps {
  trendingArticles: Article[];
}

export function Sidebar({ trendingArticles }: SidebarProps) {
  return (
    <aside className="w-full">
      <TrendingSection articles={trendingArticles} />
    </aside>
  );
}
