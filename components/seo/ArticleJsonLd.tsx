import { SITE_NAME, SITE_URL } from "@/lib/constants";

interface ArticleJsonLdProps {
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string | null;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
}

export function ArticleJsonLd({
  title,
  excerpt,
  slug,
  coverImage,
  publishedAt,
  updatedAt,
  authorName,
}: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": excerpt,
    ...(coverImage ? { image: [coverImage] } : {}),
    "datePublished": publishedAt,
    "dateModified": updatedAt ?? publishedAt,
    "author": {
      "@type": "Person",
      "name": authorName,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`,
      },
    },
    "url": `${SITE_URL}/news/${slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/news/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
