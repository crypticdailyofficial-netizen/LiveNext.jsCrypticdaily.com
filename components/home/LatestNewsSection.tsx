"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GlassPremiumArticleGrid } from "@/components/article/GlassPremiumArticleGrid";
import type { CategorySummary } from "@/lib/sanity/adapters";
import type { Article } from "@/types/article";

interface LatestNewsSectionProps {
  articles: Article[];
  categories: CategorySummary[];
  totalArticleCount: number;
}

export function LatestNewsSection({
  articles,
  categories,
  totalArticleCount,
}: LatestNewsSectionProps) {
  const [activeTab, setActiveTab] = useState("all");
  const tabs = useMemo(
    () => [{ slug: "all", title: "All" }, ...categories],
    [categories],
  );
  const filteredArticles =
    activeTab === "all"
      ? articles
      : articles.filter((article) => article.category.slug === activeTab);
  const activeStoryCount =
    activeTab === "all"
      ? totalArticleCount
      : categories.find((category) => category.slug === activeTab)
          ?.articleCount ?? filteredArticles.length;
  const activeLabel =
    tabs.find((tab) => tab.slug === activeTab)?.title ?? "All";
  const activeDeskHref =
    activeTab === "all" ? "/news" : `/categories/${activeTab}`;

  return (
    <section style={{ contentVisibility: "auto", containIntrinsicSize: "900px" }}>
      <div className="max-w-7xl overflow-hidden py-12">
        <div className="relative overflow-hidden rounded-[36px] border border-[#33281B] bg-[#0B0907] text-white shadow-[0_28px_90px_rgba(0,0,0,0.36)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(245,158,11,0.18),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(255,255,255,0.06),transparent_16%),linear-gradient(135deg,rgba(16,12,8,0.98)_0%,rgba(11,9,7,0.98)_44%,rgba(8,7,6,1)_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(135,102,53,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(135,102,53,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,241,211,0.4),transparent)]" />
          <div className="pointer-events-none absolute left-0 top-0 h-20 w-20 border-l border-t border-[#F59E0B]/35" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 border-b border-r border-[#F59E0B]/28" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_320px] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/18 bg-[#1A130C]/88 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#FCD34D]">
                    <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                    Editorial Feed
                  </span>
                  <span className="text-[0.66rem] font-medium uppercase tracking-[0.26em] text-[#8A7660]">
                    Continuous desk rotation
                  </span>
                </div>

                <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[0.9] tracking-[-0.06em] text-[#F6F1E8] sm:text-5xl lg:text-[4rem]">
                  Latest News
                </h2>

                <div className="mt-5 h-[2px] max-w-3xl bg-[linear-gradient(90deg,rgba(245,158,11,0.95)_0%,rgba(255,255,255,0.18)_42%,transparent_100%)]" />

                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#BCA890] sm:text-[15px]">
                  Real-time alerts, market briefs, and curated opportunities
                  from across the ecosystem.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/15 bg-[#1A130C]/72 px-3 py-2 text-xs font-medium text-[#EFD8B1]">
                    <span className="h-2 w-2 rounded-full bg-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.55)]" />
                    Active: {activeLabel}
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-[#9F8F7D]">
                    <span className="text-[#F6F1E8]">
                      {String(activeStoryCount).padStart(2, "0")}
                    </span>
                    stories available
                  </div>
                </div>
              </div>

              <aside className="rounded-[28px] border border-[#3C2E1E] bg-[linear-gradient(180deg,rgba(34,25,16,0.92)_0%,rgba(15,12,9,0.96)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#8A7660]">
                    Feed Monitor
                  </p>
                  <span className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#FCD34D]">
                    Live
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex items-end justify-between gap-4 border-b border-white/6 pb-4">
                    <div>
                      <p className="text-[0.64rem] uppercase tracking-[0.18em] text-[#9E8E7A]">
                        Current Desk
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#F6F1E8]">
                        {activeLabel}
                      </p>
                    </div>
                    <span className="text-3xl font-black tracking-[-0.08em] text-[#F59E0B]">
                      {String(activeStoryCount).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.64rem] uppercase tracking-[0.18em] text-[#9E8E7A]">
                        Coverage Mode
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#BCA890]">
                        Fast desk switching without leaving the main news rail.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-7 hidden rounded-[28px] border border-white/8 bg-[#0F0D0B]/86 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:block">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#8A7660]">
                  Switch Desk
                </p>
                <span className="text-[0.66rem] uppercase tracking-[0.22em] text-[#D6B77A]">
                  {tabs.length} tabs
                </span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.slug}
                    onClick={() => {
                      setActiveTab(tab.slug);
                    }}
                    className={`mr-4 flex h-12 shrink-0 items-center justify-center rounded-md px-4 text-sm font-bold transition-all duration-100 sm:px-6 ${
                      activeTab === tab.slug
                        ? "bg-[#F0EDE8] text-black [box-shadow:5px_5px_rgb(0_212_255)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(0_212_255)]"
                        : "border border-white/40 bg-[#121212] text-white [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]"
                    }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlassPremiumArticleGrid articles={filteredArticles} />

      <div className="mt-8 flex justify-center">
        <Link
          href={activeDeskHref}
          prefetch={false}
          className="group inline-flex items-center gap-3 rounded-full border border-[#F59E0B]/18 bg-[linear-gradient(180deg,rgba(26,19,12,0.94),rgba(12,10,8,0.98))] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#F6F1E8] shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#F59E0B]/32 hover:text-[#FCD34D]"
        >
          <span>Load More Articles</span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#D6B77A] transition-all duration-200 group-hover:border-[#F59E0B]/25 group-hover:bg-[#F59E0B]/10 group-hover:text-[#FCD34D]">
            ↗
          </span>
        </Link>
      </div>
    </section>
  );
}
