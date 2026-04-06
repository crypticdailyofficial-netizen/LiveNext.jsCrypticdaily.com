'use client';

import dynamic from "next/dynamic";
import type { AdUnitProps } from "@/components/ads/AdUnit";

const DisplayAdUnit = dynamic(
  () => import("@/components/ads/AdUnit").then((mod) => mod.AdUnit),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 h-[90px] overflow-hidden rounded-xl border border-dashed border-white/10 bg-white/5" />
    ),
  },
);

const InArticleAdUnit = dynamic(
  () => import("@/components/ads/AdUnit").then((mod) => mod.AdUnit),
  {
    ssr: false,
    loading: () => (
      <div className="my-8 min-h-[280px] rounded-xl border border-dashed border-white/10 bg-white/5" />
    ),
  },
);

export function LazyAdUnit(props: AdUnitProps) {
  if (props.format === "in-article") {
    return <InArticleAdUnit {...props} />;
  }

  return <DisplayAdUnit {...props} />;
}
