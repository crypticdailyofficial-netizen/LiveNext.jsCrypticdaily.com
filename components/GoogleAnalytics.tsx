'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PLACEHOLDER_GA_ID = "G-XXXXXXXXXX";
const GA4_ID_PATTERN = /^G-[A-Z0-9]+$/;

export function GoogleAnalytics() {
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  if (!GA_ID || GA_ID === PLACEHOLDER_GA_ID || !GA4_ID_PATTERN.test(GA_ID)) {
    return null;
  }

  return <NextGoogleAnalytics gaId={GA_ID} />;
}
