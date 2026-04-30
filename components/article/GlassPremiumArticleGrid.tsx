import Link from "next/link";
import Image from "next/image";
import { AuthorAvatar } from "./AuthorAvatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatRelativeDate } from "@/lib/utils";
import type { Article } from "@/types/article";

interface GlassPremiumArticleGridProps {
  articles: Article[];
  loading?: boolean;
}

function GlassPremiumCard({ article }: { article: Article }) {
  return (
    <article
      className="group block overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
    >
      <Link href={`/news/${article.slug}`} prefetch={false} className="block">
        <div className="relative overflow-hidden rounded-[26px] border border-white/10">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/10 to-white/10" />
          <div className="relative h-56 w-full bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_35%),linear-gradient(180deg,rgba(18,18,18,0.9)_0%,rgba(7,7,7,0.96)_100%)]">
            {article.coverImage ? (
              <Image
                src={article.coverImage}
                alt={article.coverImageAlt || article.title}
                fill
                sizes="(max-width: 767px) calc(100vw - 56px), (max-width: 1279px) calc((100vw - 88px) / 2), 384px"
                quality={65}
                className="object-cover transition duration-500 group-hover:scale-105"
                placeholder={article.coverImageBlurDataURL ? "blur" : "empty"}
                blurDataURL={article.coverImageBlurDataURL ?? undefined}
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_35%),linear-gradient(180deg,rgba(18,18,18,0.9)_0%,rgba(7,7,7,0.96)_100%)]" />
            )}
          </div>
        </div>
      </Link>

      <div className="p-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <Link
            href={`/categories/${article.category.slug}`}
            prefetch={false}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.18em] text-zinc-300"
          >
            {article.category.title}
          </Link>
          <span>{article.readingTime ?? 5} min read</span>
        </div>

        <Link href={`/news/${article.slug}`} prefetch={false} className="block">
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white transition duration-200 group-hover:text-zinc-200">
            {article.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-zinc-300">
            {article.excerpt}
          </p>
        </Link>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-sm text-zinc-400">
          <div className="flex min-w-0 items-center gap-3">
            <AuthorAvatar
              name={article.author.name}
              src={article.author.avatar}
              className="h-8 w-8 flex-shrink-0"
              fallbackClassName="text-xs"
            />
            <Link
              href={`/author/${article.author.slug}`}
              prefetch={false}
              className="truncate transition duration-200 hover:text-white"
            >
              {article.author.name}
            </Link>
          </div>
          <span className="whitespace-nowrap">
            {formatRelativeDate(article.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

export function GlassPremiumArticleGrid({
  articles,
  loading = false,
}: GlassPremiumArticleGridProps) {
  if (loading && !articles.length) {
    return (
      <div className="border-white/10 p-4 md:p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`glass-grid-skeleton-${index}`}
              className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            >
              <Skeleton className="h-56 w-full rounded-[26px]" />
              <div className="space-y-4 p-4 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.09),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_35%),linear-gradient(180deg,rgba(18,18,18,0.9)_0%,rgba(7,7,7,0.96)_100%)] p-10 text-center">
        <p className="text-zinc-300">No articles found</p>
      </div>
    );
  }

  return (
    <div className=" border-white/10 p-4 md:p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <GlassPremiumCard
            key={article.id ?? article.slug}
            article={article}
          />
        ))}
      </div>
    </div>
  );
}
