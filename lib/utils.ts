import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistance, format, isSameDay, subDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

type PortableTextSpanLike = {
  _type?: string;
  text?: string;
};

type PortableTextTextSpanLike = PortableTextSpanLike & {
  _type: "span";
  text: string;
};

type PortableTextBlockLike = {
  _type?: string;
  children?: PortableTextSpanLike[];
};

export function countPortableTextWords(body: unknown): number {
  if (!Array.isArray(body)) return 0;
  return body
    .filter(
      (block): block is PortableTextBlockLike =>
        typeof block === "object" &&
        block !== null &&
        (block as PortableTextBlockLike)._type === "block" &&
        Array.isArray((block as PortableTextBlockLike).children),
    )
    .flatMap((block) => block.children)
    .filter(
      (span): span is PortableTextTextSpanLike =>
        typeof span === "object" &&
        span !== null &&
        span._type === "span" &&
        typeof span.text === "string",
    )
    .map((span) => span.text.trim().split(/\s+/).filter(Boolean).length)
    .reduce((sum, count) => sum + count, 0);
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  if (isSameDay(date, now)) {
    return formatDistance(date, now, { addSuffix: true });
  }
  if (isSameDay(date, subDays(now, 1))) {
    return "Yesterday";
  }
  return format(date, "MMM d, yyyy");
}

export function formatPrice(num: number): string {
  if (num >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(num);
}

export function formatMarketCap(num: number): string {
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString()}`;
}

export function formatVolume(num: number): string {
  return formatMarketCap(num);
}

export function formatPercentage(num: number): string {
  const sign = num >= 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
