import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { TypedObject } from "sanity";
import { LazyAdUnit as AdUnit } from "@/components/ads/LazyAdUnit";
import { AuthorAvatar } from "@/components/article/AuthorAvatar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { ArticleDetail } from "@/components/article/ArticleDetail";
import { ShareButtons } from "@/components/article/ShareButtons";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { SITE_URL } from "@/lib/constants";
import { mapSanityArticle, mapSanityArticles } from "@/lib/sanity/adapters";
import { urlFor } from "@/lib/sanity/image";
import { countPortableTextWords } from "@/lib/utils";
import {
  getAllArticleSlugs,
  getArticleBySlug,
  getLatestArticles,
  getRelatedArticles,
} from "@/lib/sanity/queries";
import { generateArticleMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();

  return (slugs ?? []).flatMap((item: { slug?: string | null }) =>
    item?.slug ? [{ slug: item.slug }] : [],
  );
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const isRemovedTagLink =
        href === "/tags" ||
        href.startsWith("/tags/") ||
        href === `${SITE_URL}/tags` ||
        href.startsWith(`${SITE_URL}/tags/`);

      if (isRemovedTagLink) {
        return <>{children}</>;
      }

      return (
        <a
          href={href}
          target={value?.blank ? "_blank" : undefined}
          rel={
            value?.blank
              ? value?.nofollow
                ? "noopener noreferrer nofollow"
                : "noopener noreferrer"
              : value?.nofollow
                ? "nofollow"
                : undefined
          }
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }

      const imageUrl = urlFor(value)
        .width(1400)
        .fit("max")
        .auto("format")
        .url();

      return (
        <figure className="my-8">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111827]">
            <Image
              src={imageUrl}
              alt={value.alt || "Article image"}
              width={1400}
              height={788}
              className="h-auto w-full object-cover"
            />
          </div>
          {value.caption ? (
            <figcaption className="mt-3 text-sm text-[#9CA3AF]">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const article = mapSanityArticle(await getArticleBySlug(slug));

  if (!article) return {};

  return generateArticleMetadata({
    title: article.seoTitle || article.title,
    excerpt: article.seoDescription || article.excerpt,
    slug: article.slug,
    coverImage: article.coverImage || `${SITE_URL}/og-default.png`,
    publishedAt: article.publishedAt,
    author: { name: article.author.name },
  });
}

const mergedBeams = [
  "left-[10%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.14)_16%,rgba(255,255,255,0.04)_82%,transparent)]",
  "left-[28%] w-px bg-[linear-gradient(180deg,transparent,rgba(251,191,36,0.18)_20%,rgba(255,255,255,0.02)_84%,transparent)]",
  "left-[52%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_78%,transparent)]",
  "right-[24%] w-px bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.16)_20%,rgba(255,255,255,0.02)_84%,transparent)]",
  "right-[9%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12)_16%,rgba(255,255,255,0.03)_80%,transparent)]",
];

const magazineShapes = [
  "left-[8%] top-[16%] h-2.5 w-2.5 rounded-full",
  "left-[18%] top-[32%] h-2 w-2 rounded-full",
  "left-[24%] top-[14%] h-3 w-3 rounded-full",
  "left-[34%] bottom-[18%] h-2.5 w-2.5 rounded-full",
  "left-[42%] top-[20%] h-2 w-2 rounded-full",
  "left-[48%] bottom-[28%] h-3 w-3 rounded-full",
  "right-[34%] top-[14%] h-2 w-2 rounded-full",
  "right-[26%] top-[30%] h-3 w-3 rounded-full",
  "right-[18%] top-[18%] h-2.5 w-2.5 rounded-full",
  "right-[12%] bottom-[18%] h-2 w-2 rounded-full",
  "right-[8%] top-[26%] h-3 w-3 rounded-full",
  "right-[20%] bottom-[10%] h-2.5 w-2.5 rounded-full",
];

const shapeTone = [
  "bg-white/60 border-white/15 shadow-[0_0_18px_rgba(255,255,255,0.12)]",
  "bg-amber-300/80 border-amber-200/30 shadow-[0_0_18px_rgba(251,191,36,0.28)]",
  "bg-cyan-300/80 border-cyan-200/30 shadow-[0_0_18px_rgba(34,211,238,0.24)]",
  "bg-white/50 border-white/15 shadow-[0_0_16px_rgba(255,255,255,0.1)]",
  "bg-amber-200/70 border-amber-100/25 shadow-[0_0_16px_rgba(251,191,36,0.22)]",
  "bg-cyan-200/70 border-cyan-100/25 shadow-[0_0_16px_rgba(34,211,238,0.2)]",
];

function getSourceDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = mapSanityArticle(await getArticleBySlug(slug));

  if (!article) notFound();

  const [relatedArticlesData, sidebarArticlesData] = await Promise.all([
    getRelatedArticles(article.category.slug, article.slug),
    getLatestArticles(5),
  ]);

  const wordCount = countPortableTextWords(article.body);
  const isLongForm = wordCount >= 600;
  const relatedArticles = mapSanityArticles(relatedArticlesData);
  const sidebarArticles = mapSanityArticles(sidebarArticlesData);
  const breadcrumbTitle =
    article.title.length > 40
      ? `${article.title.slice(0, 40).trimEnd()}…`
      : article.title;

  const coverPreloadUrl = article.coverImage
    ? `/_next/image?url=${encodeURIComponent(article.coverImage)}&w=1080&q=75`
    : null;

  return (
    <>
      {coverPreloadUrl && (
        <link
          rel="preload"
          as="image"
          href={coverPreloadUrl}
          // @ts-expect-error — fetchpriority valid HTML, missing from React types
          fetchpriority="high"
        />
      )}
      <ArticleJsonLd
        title={article.title}
        excerpt={article.excerpt}
        slug={article.slug}
        coverImage={article.coverImage || `${SITE_URL}/og-default.png`}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        authorName={article.author.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          {
            name: article.category.title,
            path: `/categories/${article.category.slug}`,
          },
          { name: article.title, path: `/news/${article.slug}` },
        ]}
      />

      <div className="max-w-7xl mx-auto">
        <section className="relative mt-5 overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#050607_0%,#040506_48%,#010101_100%)] text-white shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(251,191,36,0.1),transparent_22%),radial-gradient(circle_at_88%_24%,rgba(34,211,238,0.08),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_26%,transparent_74%,rgba(255,255,255,0.02))]" />
          <div className="absolute inset-0 opacity-70 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_11.8%,rgba(255,255,255,0.028)_11.8%,rgba(255,255,255,0.028)_12.05%),repeating-linear-gradient(180deg,transparent_0,transparent_18%,rgba(255,255,255,0.018)_18%,rgba(255,255,255,0.018)_18.35%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.26),transparent)]" />
          <div className="absolute left-0 top-10 h-px w-24 bg-[linear-gradient(90deg,rgba(251,191,36,0.75),transparent)]" />
          <div className="absolute right-0 bottom-16 h-px w-28 bg-[linear-gradient(270deg,rgba(34,211,238,0.65),transparent)]" />

          {mergedBeams.map((cls, index) => (
            <div
              key={`beam-${index}`}
              className={`absolute top-0 h-full ${cls}`}
            />
          ))}

          {magazineShapes.map((cls, index) => (
            <div
              key={`shape-${index}`}
              className={`absolute border ${shapeTone[index % shapeTone.length]} ${cls}`}
            />
          ))}

          <div className="relative z-10 flex min-h-[520px] items-center justify-center p-6 md:p-12">
            <div className="relative w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,16,20,0.95)_0%,rgba(5,7,10,0.98)_100%)] px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_70px_rgba(0,0,0,0.55)] md:px-9 before:absolute before:inset-x-7 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(251,191,36,0.48),transparent)] after:absolute after:inset-x-7 after:bottom-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.34),transparent)]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_24%,transparent_68%,rgba(255,255,255,0.02)),radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_24%)]" />
              <div className="pointer-events-none absolute inset-y-8 left-8 w-px bg-[linear-gradient(180deg,transparent,rgba(251,191,36,0.38),transparent)]" />
              <div className="pointer-events-none absolute inset-y-8 right-8 w-px bg-[linear-gradient(180deg,transparent,rgba(34,211,238,0.3),transparent)]" />

              <div className="relative z-10 mx-auto w-full max-w-5xl">
                <nav
                  aria-label="Breadcrumb"
                  className="mb-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/46"
                >
                  <Link
                    href="/"
                    className="transition-colors duration-200 hover:text-amber-100"
                  >
                    Home
                  </Link>
                  <span className="text-white/30">›</span>
                  <Link
                    href={`/categories/${article.category.slug}`}
                    className="transition-colors duration-200 hover:text-amber-100"
                  >
                    {article.category.title}
                  </Link>
                  <span className="text-white/30">›</span>
                  <span className="truncate text-white/75">{breadcrumbTitle}</span>
                </nav>

                <Link
                  href={`/categories/${article.category.slug}`}
                  className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-amber-100/80 transition-colors duration-200 hover:border-amber-200/35 hover:text-amber-50"
                >
                  {article.category.title}
                </Link>

                <h1 className="mt-6 max-w-5xl text-4xl font-semibold leading-[0.94] tracking-[-0.045em] text-white md:text-6xl">
                  {article.title}
                </h1>

                <div className="mt-6 w-full border-t border-white/10 pt-5 text-white/58">
                  <ArticleMeta article={article} views={article.views} />
                </div>

                <div className="mt-6 mb-0">
                  <ShareButtons title={article.title} slug={article.slug} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="rounded-3xl mt-5 max-w-7xl mx-auto border border-white/10 bg-neutral-950/20 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Article */}
          <article>
            {/* Hero Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
              {article.coverImage ? (
                <Image
                  src={article.coverImage}
                  alt={article.coverImageAlt || article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 65vw, 800px"
                  className="object-cover"
                  priority
                  fetchPriority="high"
                  placeholder={article.coverImageBlurDataURL ? "blur" : "empty"}
                  blurDataURL={article.coverImageBlurDataURL ?? undefined}
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.16),transparent_48%),linear-gradient(135deg,#111827,#020617)]" />
              )}
            </div>

            {/* Body */}
            <ArticleDetail article={article}>
              {Array.isArray(article.body) && article.body.length > 0 ? (
                <>
                  <PortableText
                    value={article.body.slice(0, 1) as TypedObject[]}
                    components={portableTextComponents}
                  />
                  <AdUnit slot="3126908163" format="in-article" />
                  {article.body.length > 1 && (
                    <PortableText
                      value={article.body.slice(1) as TypedObject[]}
                      components={portableTextComponents}
                    />
                  )}
                </>
              ) : null}
            </ArticleDetail>

            {article.sources && article.sources.length > 0 && (
              <section className="relative mt-10 overflow-hidden rounded-[26px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(6,10,18,0.98),rgba(2,5,10,0.98))]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_32%)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.45),transparent)]" />

                <div className="relative z-10 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/55">
                        Reference Desk
                      </p>
                      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white">
                        Sources & References
                      </h3>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-100/80">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
                      {article.sources.length} Linked
                    </div>
                  </div>

                  <ul className="mt-4 space-y-3">
                    {article.sources.map((source, i) => (
                      <li key={`${source.url}-${i}`}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 transition-all duration-200 hover:border-cyan-300/25 hover:bg-cyan-400/[0.06]"
                        >
                          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 font-mono text-xs text-cyan-200/80">
                            {(i + 1).toString().padStart(2, "0")}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium leading-6 text-white transition-colors duration-200 group-hover:text-cyan-100">
                              {source.label}
                            </span>
                            <span className="mt-1 block truncate text-[11px] uppercase tracking-[0.22em] text-white/40">
                              {getSourceDomain(source.url)}
                            </span>
                          </span>

                          <span className="mt-1 text-sm text-cyan-300/70 transition-transform duration-200 group-hover:translate-x-1">
                            ↗
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Ad Unit 2 */}
            {isLongForm && <AdUnit slot="4721189309" format="display" />}

            {/* Author Bio */}
            <section className="relative mt-10 overflow-hidden rounded-[26px] border border-amber-300/15 bg-[linear-gradient(180deg,rgba(20,14,8,0.98),rgba(8,6,4,0.98))]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.08),transparent_26%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)]" />

              <div className="relative z-10 p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex flex-col items-center sm:w-36 sm:flex-none">
                    

                    {article.author.slug ? (
                      <Link
                        href={`/author/${article.author.slug}`}
                        className="inline-flex rounded-[22px] border border-white/10 bg-black/25 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-0.5"
                      >
                        <AuthorAvatar
                          name={article.author.name}
                          src={article.author.avatar}
                          className="h-20 w-20 flex-shrink-0"
                          fallbackClassName="text-xl"
                        />
                      </Link>
                    ) : (
                      <div className="inline-flex rounded-[22px] border border-white/10 bg-black/25 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                        <AuthorAvatar
                          name={article.author.name}
                          src={article.author.avatar}
                          className="h-20 w-20 flex-shrink-0"
                          fallbackClassName="text-xl"
                        />
                      </div>
                    )}

                    {article.author.twitter && (
                      <a
                        href={article.author.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-4 inline-flex min-w-[120px] flex-col items-center justify-center gap-2 rounded-[22px] border border-amber-300/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-3 text-center text-white/78 shadow-[0_14px_32px_rgba(0,0,0,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/40 hover:bg-[linear-gradient(180deg,rgba(251,191,36,0.14),rgba(244,114,182,0.08))] hover:text-amber-50"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 transition-colors duration-200 group-hover:border-amber-200/25 group-hover:bg-black/40">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </span>
                        <span className="flex flex-col items-center gap-0.5">
                          <span className="text-[9px] uppercase tracking-[0.3em] text-white/42 group-hover:text-amber-100/60">
                            Social
                          </span>
                          <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
                            Follow on X
                          </span>
                        </span>
                      </a>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col items-center gap-4 border-b border-white/10 pb-4 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:text-center">
                      <div className="flex justify-center items-center">
                        {article.author.slug ? (
                          <Link
                            href={`/author/${article.author.slug}`}
                            className="text-2xl font-semibold tracking-[-0.03em] text-white transition-colors duration-200 hover:text-amber-100"
                          >
                            {article.author.name}
                          </Link>
                        ) : (
                          <p className="text-2xl font-semibold tracking-[-0.03em] text-white">
                            {article.author.name}
                          </p>
                        )}

                        <div className="sm:ml-5 ml-2 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-amber-100/80">
                          <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
                          {article.author.role}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-[#B8BEC8] sm:text-[15px]">
                      {article.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Articles */}
            <RelatedArticles articles={relatedArticles} />
          </article>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Sidebar trendingArticles={sidebarArticles} />
          </div>
        </div>
      </div>
    </>
  );
}
