'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
const PLACEHOLDER_GA_ID = "G-XXXXXXXXXX";

export function GoogleAnalytics() {
  if (process.env.NODE_ENV === "development") {
    return null;
  }

  if (!GA_ID || GA_ID === PLACEHOLDER_GA_ID) {
    return null;
  }

  return <NextGoogleAnalytics gaId={GA_ID} />;
}
