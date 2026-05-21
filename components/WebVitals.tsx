'use client';

import { sendGAEvent } from "@next/third-parties/google";
import { useReportWebVitals } from "next/web-vitals";

import { isAnalyticsEnabled } from "@/lib/analytics";

const REPORTED_METRICS = new Set(["CLS", "LCP", "FCP", "INP", "TTFB"]);

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (!isAnalyticsEnabled()) {
      return;
    }

    if (!REPORTED_METRICS.has(metric.name)) {
      return;
    }

    const value = metric.name === "CLS" ? metric.value * 1000 : metric.value;

    sendGAEvent("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(value),
      metric_id: metric.id,
      metric_name: metric.name,
      metric_value: value,
      metric_rating: metric.rating,
    });
  });

  return null;
}
