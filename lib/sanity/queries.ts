import { unstable_cache } from "next/cache";
import { sanityClient } from "./client";

// ── Reusable field fragments ──────────────────────────────────

const authorFields = `
  name,
  "slug": slug.current,
  role,
  credentials,
  bio,
  twitter,
  avatar
`;

const categoryFields = `
  title,
  "slug": slug.current,
  color
`;

const homepageAuthorFields = `
  name,
  "slug": slug.current,
  avatar
`;

const homepageArticleCardFields = `
  title,
  "slug": slug.current,
  excerpt,
  "bodyText": pt::text(body),
  publishedAt,
  _updatedAt,
  featured,
  "coverImage": coverImage{
    asset,
    alt
  },
  "category": category->{ ${categoryFields} },
  "author": author->{ ${homepageAuthorFields} }
`;

export const articleCardFields = `
  title,
  "slug": slug.current,
  excerpt,
  "bodyText": pt::text(body),
  publishedAt,
  _updatedAt,
  featured,
  "coverImage": coverImage{
    ...,
    "lqip": asset->metadata.lqip
  },
  "category": category->{ ${categoryFields} },
  "author": author->{ ${authorFields} },
  "tags": tags[]->{ title, "slug": slug.current }
`;

// ── Queries ───────────────────────────────────────────────────

// Homepage hero — single featured article
export const featuredArticleQuery = `
  *[_type == "article" && featured == true] | order(publishedAt desc)[0] {
    ${articleCardFields}
  }
`;

// Homepage grid — latest N articles
export const latestArticlesQuery = `
  *[_type == "article"] | order(publishedAt desc)[0...$limit] {
    ${articleCardFields}
  }
`;

export const homepageFeaturedArticleQuery = `
  *[_type == "article" && featured == true] | order(publishedAt desc)[0] {
    ${homepageArticleCardFields}
  }
`;

export const homepageLatestArticlesQuery = `
  *[_type == "article"] | order(publishedAt desc)[0...$limit] {
    ${homepageArticleCardFields}
  }
`;

export const totalArticleCountQuery = `
  count(*[_type == "article" && defined(publishedAt)])
`;

// News listing page — all articles paginated
export const allArticlesQuery = `
  *[_type == "article"] | order(publishedAt desc) [$start...$end] {
    ${articleCardFields}
  }
`;

// Article detail page — full article by slug
export const articleBySlugQuery = `
  *[_type == "article" && slug.current == $slug][0] {
    ${articleCardFields},
    body,
    sources[] {
      label,
      url
    },
    seoTitle,
    seoDescription
  }
`;

// All slugs — for generateStaticParams
export const allArticleSlugsQuery = `
  *[_type == "article"]{ "slug": slug.current }
`;

export const ALL_ARTICLE_SLUGS_QUERY = `
  *[_type == "article" && defined(slug.current)] {
    "slug": slug.current,
    publishedAt
  }
`;

export const ALL_CATEGORY_SLUGS_QUERY = `
  *[_type == "category" && defined(slug.current)] {
    "slug": slug.current
  }
`;

export const CATEGORY_BY_SLUG_QUERY = `
  *[_type == "category" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    description,
    color
  }
`;

export const CATEGORY_ARTICLE_COUNT_QUERY = `
  count(*[_type == "article" && category->slug.current == $slug])
`;

// Articles by category
export const articlesByCategoryQuery = `
  *[_type == "article" && category->slug.current == $category]
  | order(publishedAt desc) {
    ${articleCardFields}
  }
`;

// Related articles — same category, exclude current
export const relatedArticlesQuery = `
  *[
    _type == "article" &&
    category->slug.current == $category &&
    slug.current != $currentSlug
  ] | order(publishedAt desc)[0...3] {
    ${articleCardFields}
  }
`;

// All categories
export const allCategoriesQuery = `
  *[_type == "category"] | order(title asc) {
    title,
    "slug": slug.current,
    description,
    color,
    "articleCount": count(*[
      _type == "article" &&
      defined(publishedAt) &&
      category._ref == ^._id
    ])
  }
`;

// Search articles
export const searchArticlesQuery = `
  *[
    _type == "article" &&
    defined(publishedAt) &&
    (
      title match $search ||
      excerpt match $search ||
      pt::text(body) match $search ||
      category->title match $search ||
      count((tags[]->title)[@ match $search]) > 0
    )
  ] | order(publishedAt desc)[0...24] {
    _id,
    ${articleCardFields}
  }
`;

export const rssFeedQuery = `
  *[
    _type == "article" &&
    defined(publishedAt)
  ] | order(publishedAt desc)[0...20] {
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "author": author->{ name },
    "category": category->{ title }
  }
`;

export const ALL_AUTHOR_SLUGS_QUERY = `
  *[_type == "author"]{ "slug": slug.current }
`;

export const allAuthorsQuery = `
  *[_type == "author" && defined(slug.current)] | order(name asc) {
    ${authorFields}
  }
`;

export const AUTHOR_BY_SLUG_QUERY = `
  *[_type == "author" && slug.current == $slug][0]{
    name,
    "slug": slug.current,
    avatar,
    bio,
    role,
    twitter
  }
`;

export const ARTICLES_BY_AUTHOR_QUERY = `
  *[_type == "article" && author->slug.current == $slug] | order(publishedAt desc){
    title,
    "slug": slug.current,
    coverImage,
    excerpt,
    "bodyText": pt::text(body),
    publishedAt,
    "category": category->{ title, "slug": slug.current, color },
    "author": author->{ name, "slug": slug.current, avatar }
  }
`;

// ── Fetcher helpers ───────────────────────────────────────────

export const getFeaturedArticle = unstable_cache(
  async () => {
    try {
      return await sanityClient.fetch(featuredArticleQuery);
    } catch {
      return null;
    }
  },
  ["featured-article"],
  { revalidate: 300, tags: ["articles"] },
);

export const getLatestArticles = unstable_cache(
  async (limit = 9) => {
    try {
      return (await sanityClient.fetch(latestArticlesQuery, { limit })) ?? [];
    } catch {
      return [];
    }
  },
  ["latest-articles"],
  { revalidate: 300, tags: ["articles"] },
);

export const getHomepageFeaturedArticle = unstable_cache(
  async () => {
    try {
      return await sanityClient.fetch(homepageFeaturedArticleQuery);
    } catch {
      return null;
    }
  },
  ["homepage-featured-article"],
  { revalidate: 300, tags: ["articles"] },
);

export const getHomepageLatestArticles = unstable_cache(
  async (limit = 12) => {
    try {
      return (
        (await sanityClient.fetch(homepageLatestArticlesQuery, { limit })) ?? []
      );
    } catch {
      return [];
    }
  },
  ["homepage-latest-articles"],
  { revalidate: 300, tags: ["articles"] },
);

export const getTotalArticleCount = unstable_cache(
  async () => {
    try {
      return (await sanityClient.fetch<number>(totalArticleCountQuery)) ?? 0;
    } catch {
      return 0;
    }
  },
  ["total-article-count"],
  { revalidate: 300, tags: ["articles"] },
);

export async function getAllArticles(start = 0, end = 12) {
  try {
    return (await sanityClient.fetch(allArticlesQuery, { start, end })) ?? [];
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    return await sanityClient.fetch(articleBySlugQuery, { slug });
  } catch {
    return null;
  }
}

export async function getAllArticleSlugs() {
  try {
    return (await sanityClient.fetch(allArticleSlugsQuery)) ?? [];
  } catch {
    return [];
  }
}

export async function getArticlesByCategory(category: string) {
  try {
    return (
      (await sanityClient.fetch(articlesByCategoryQuery, { category })) ?? []
    );
  } catch {
    return [];
  }
}

export async function getRelatedArticles(
  category: string,
  currentSlug: string,
) {
  try {
    return (
      (await sanityClient.fetch(relatedArticlesQuery, {
        category,
        currentSlug,
      })) ?? []
    );
  } catch {
    return [];
  }
}

export async function getAllCategories() {
  try {
    return (await sanityClient.fetch(allCategoriesQuery)) ?? [];
  } catch {
    return [];
  }
}

export async function searchArticles(search: string) {
  try {
    return (await sanityClient.fetch(searchArticlesQuery, { search })) ?? [];
  } catch {
    return [];
  }
}

export async function getRssFeedArticles() {
  try {
    return (await sanityClient.fetch(rssFeedQuery)) ?? [];
  } catch {
    return [];
  }
}

export async function getAllAuthors() {
  try {
    return (await sanityClient.fetch(allAuthorsQuery)) ?? [];
  } catch {
    return [];
  }
}
