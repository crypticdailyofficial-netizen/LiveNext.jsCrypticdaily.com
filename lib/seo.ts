import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./constants";

export function generatePageMetadata(
  title: string,
  description?: string,
  path?: string
): Metadata {
  const pageTitle = `${title} | ${SITE_NAME}`;
  const pageDescription = description || SITE_DESCRIPTION;
  const canonicalUrl = path ? `${SITE_URL}${path}` : SITE_URL;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

export function generateArticleMetadata(article: {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  publishedAt: string;
  author: { name: string };
}): Metadata {
  const pageTitle = article.title;
  const openGraphTitle = `${article.title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}/news/${article.slug}`;
  const description = article.excerpt?.slice(0, 155) ?? "";

  return {
    title: { absolute: pageTitle },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: openGraphTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: openGraphTitle,
      description,
      images: [article.coverImage],
    },
  };
}
