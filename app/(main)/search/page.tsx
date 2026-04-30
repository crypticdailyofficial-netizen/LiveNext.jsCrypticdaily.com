import type { Metadata } from "next";
import { SearchClient } from "./SearchClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Search",
    description:
      "Search crypto news, market analysis, DeFi, NFTs, regulation and Web3 coverage on Cryptic Daily.",
    alternates: { canonical: "https://crypticdaily.com/search" },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title: "Search | Cryptic Daily",
      description: "Search crypto news on Cryptic Daily.",
      url: "https://crypticdaily.com/search",
      images: [{ url: "https://crypticdaily.com/og-default.png" }],
    },
  };
}

export default function SearchPage() {
  return <SearchClient />;
}
