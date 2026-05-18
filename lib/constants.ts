const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.crypticdaily.com";

export const SITE_URL = configuredSiteUrl.replace(
  /^https:\/\/crypticdaily\.com$/,
  "https://www.crypticdaily.com",
);
export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "Cryptic Daily";
export const SITE_DESCRIPTION =
  "Your daily source for cryptocurrency news, market analysis, and blockchain insights.";

export const CATEGORY_COLORS: Record<string, string> = {
  "crypto-newswire": "#00D4FF",
  "web3-builder": "#7C3AED",
  "web3-fraud-files": "#F59E0B",
};
