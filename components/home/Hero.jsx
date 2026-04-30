import Link from "next/link";
import Image from "next/image";
import { AuthorAvatar } from "@/components/article/AuthorAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRelativeDate } from "@/lib/utils";

export function Hero({ article }) {
  if (!article) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "#03030A",
      }}
    >
      <div className="relative h-[420px] w-full overflow-hidden">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.coverImageAlt || article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            className="object-cover"
            priority
            fetchPriority="high"
            placeholder={article.coverImageBlurDataURL ? "blur" : "empty"}
            blurDataURL={article.coverImageBlurDataURL ?? undefined}
            style={{ filter: "brightness(0.22) saturate(0.45)" }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at bottom left, rgba(245,158,11,0.18) 0%, rgba(180,83,9,0.1) 32%, transparent 65%), linear-gradient(135deg, #03030A 0%, #0B1120 100%)",
            }}
          />
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "180px 180px",
            opacity: 0.07,
            mixBlendMode: "overlay",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "42px 42px",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 20%, black 62%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 20%, black 62%, transparent 100%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(251,191,36,0.18) 1.2px, transparent 1.2px)",
            backgroundSize: "42px 42px",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 65% at 20% 90%, black 0%, transparent 70%)",
            maskImage:
              "radial-gradient(ellipse 75% 65% at 20% 90%, black 0%, transparent 70%)",
          }}
        />

        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-90px",
            left: "-70px",
            width: "560px",
            height: "440px",
            background:
              "radial-gradient(ellipse at bottom left, rgba(245,158,11,0.24) 0%, rgba(180,83,9,0.11) 38%, transparent 65%)",
          }}
        />

        <div
          className="absolute pointer-events-none"
          style={{
            top: "-20px",
            right: "8%",
            width: "280px",
            height: "200px",
            background:
              "radial-gradient(ellipse, rgba(251,191,36,0.06) 0%, transparent 70%)",
          }}
        />

        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "152px",
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.0) 4%, rgba(245,158,11,0.45) 22%, rgba(251,191,36,0.65) 48%, rgba(245,158,11,0.22) 76%, transparent 100%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, #03030A 0%, rgba(3,3,10,0.85) 35%, rgba(3,3,10,0.06) 100%)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(3,3,10,0.72) 0%, transparent 58%)",
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
          <div className="max-w-2xl">
            <Link
              href={`/categories/${article.category.slug}`}
              prefetch={false}
              className="inline-flex"
            >
              <Badge
                label={article.category.title}
                category={article.category.slug}
                color={article.category.color}
                className="mb-5 w-fit"
              />
            </Link>
            <h2
              className="mb-4 font-heading font-bold leading-tight"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                color: "#F5EDD6",
                textShadow: "0 2px 28px rgba(0,0,0,0.95)",
              }}
            >
              {article.title}
            </h2>
            <p
              className="mb-6 line-clamp-2 text-sm leading-relaxed"
              style={{ color: "#7A8294" }}
            >
              {article.excerpt}
            </p>
            <div className="mb-7 flex items-center gap-4">
              <Link href={`/author/${article.author.slug}`} prefetch={false}>
                <div
                  className="rounded-full"
                  style={{ border: "2px solid rgba(245,158,11,0.4)" }}
                >
                  <AuthorAvatar
                    name={article.author.name}
                    src={article.author.avatar}
                    className="h-9 w-9 flex-shrink-0"
                    fallbackClassName="text-xs"
                  />
                </div>
              </Link>
              <div>
                <Link
                  href={`/author/${article.author.slug}`}
                  prefetch={false}
                  className="text-sm font-semibold"
                  style={{ color: "#F5EDD6" }}
                >
                  {article.author.name}
                </Link>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  {formatRelativeDate(article.publishedAt)} ·{" "}
                  {article.readingTime ?? 5} min read
                </p>
              </div>
            </div>
            <Link href={`/news/${article.slug}`} prefetch={false}>
              <Button variant="primary" size="md">
                READ MORE →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
