'use client';

import { sendGAEvent } from "@next/third-parties/google";

const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
const PLACEHOLDER_GA_ID = "G-XXXXXXXXXX";

export function isAnalyticsEnabled() {
  return process.env.NODE_ENV !== "development" && Boolean(GA_ID) && GA_ID !== PLACEHOLDER_GA_ID;
}

export function trackEvent(
  action: string,
  category?: string,
  label?: string,
  value?: number,
) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  sendGAEvent("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

export function trackPageView(url: string, title?: string) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  sendGAEvent("event", "page_view", {
    page_location: url,
    page_title: title,
  });
}
