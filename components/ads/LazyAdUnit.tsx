'use client';

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { AdUnitProps } from "@/components/ads/AdUnit";

function AdPlaceholder({
  format = "display",
  className,
}: Pick<AdUnitProps, "format" | "className">) {
  const containerClass =
    format === "in-article"
      ? `my-8 min-h-[280px] ${className ?? ""}`
      : `my-8 h-[90px] overflow-hidden ${className ?? ""}`;

  return (
    <div
      aria-hidden="true"
      className={`${containerClass} rounded-xl border border-dashed border-white/10 bg-white/5`}
    />
  );
}

const DisplayAdUnit = dynamic(
  () => import("@/components/ads/AdUnit").then((mod) => mod.AdUnit),
  {
    ssr: false,
    loading: () => <AdPlaceholder format="display" />,
  },
);

const InArticleAdUnit = dynamic(
  () => import("@/components/ads/AdUnit").then((mod) => mod.AdUnit),
  {
    ssr: false,
    loading: () => <AdPlaceholder format="in-article" />,
  },
);

export function LazyAdUnit(props: AdUnitProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldRenderAd, setShouldRenderAd] = useState(false);

  useEffect(() => {
    if (shouldRenderAd) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setShouldRenderAd(true);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    // Renders the ad once the browser is idle, whichever comes first:
    // scrolled into view, or the idle/timeout deadline. This guarantees the
    // ad slot fires even for visitors (or crawlers) that never scroll down.
    const revealAd = () => {
      setShouldRenderAd(true);
      observer?.disconnect();
    };

    const startObserving = () => {
      const currentNode = rootRef.current;

      if (!currentNode) {
        revealAd();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            revealAd();
          }
        },
        {
          rootMargin: "200px 0px",
          threshold: 0.01,
        },
      );

      observer.observe(currentNode);

      // Hard fallback: render regardless of visibility shortly after the
      // idle/timeout deadline so the ad isn't gated on scrolling at all.
      timeoutId = setTimeout(revealAd, 1500);
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(startObserving, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(startObserving, 2000);
    }

    return () => {
      observer?.disconnect();

      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldRenderAd]);

  if (!shouldRenderAd) {
    return (
      <div ref={rootRef}>
        <AdPlaceholder format={props.format} className={props.className} />
      </div>
    );
  }

  if (props.format === "in-article") {
    return <InArticleAdUnit {...props} />;
  }

  return <DisplayAdUnit {...props} />;
}
