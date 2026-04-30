"use client";

import { memo, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const ASSET_IDS = [
  "bitcoin",
  "ethereum",
  "binance-coin",
  "solana",
  "cardano",
  "xrp",
  "dogecoin",
  "polkadot",
  "chainlink",
  "avalanche",
] as const;

const DISPLAY_SYMBOLS: Record<(typeof ASSET_IDS)[number], string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  "binance-coin": "BNB",
  solana: "SOL",
  cardano: "ADA",
  xrp: "XRP",
  dogecoin: "DOGE",
  polkadot: "DOT",
  chainlink: "LINK",
  avalanche: "AVAX",
};

const COINGECKO_IDS: Record<AssetId, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  "binance-coin": "binancecoin",
  solana: "solana",
  cardano: "cardano",
  xrp: "ripple",
  dogecoin: "dogecoin",
  polkadot: "polkadot",
  chainlink: "chainlink",
  avalanche: "avalanche-2",
};

const PRICE_URL = "/api/prices";

type AssetId = (typeof ASSET_IDS)[number];

type CoinTickerData = {
  id: AssetId;
  symbol: string;
  price: number | null;
  change24h: number | null;
};

const INITIAL_COINS: Record<AssetId, CoinTickerData> = ASSET_IDS.reduce(
  (acc, id) => {
    acc[id] = {
      id,
      symbol: DISPLAY_SYMBOLS[id],
      price: null,
      change24h: null,
    };
    return acc;
  },
  {} as Record<AssetId, CoinTickerData>,
);

function formatTickerChange(value: number | null) {
  if (value == null || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.abs(value).toFixed(1)}%`;
}

const TickerItem = memo(function TickerItem({
  coin,
}: {
  coin: CoinTickerData;
}) {
  const isPositive = (coin.change24h ?? 0) >= 0;
  const changeColor =
    coin.change24h == null
      ? "text-[#9CA3AF]"
      : isPositive
        ? "text-[#10B981]"
        : "text-[#EF4444]";
  const arrow = coin.change24h == null ? "•" : isPositive ? "▲" : "▼";

  return (
    <span className="inline-flex items-center gap-2 border-r border-white/8 px-5 text-sm last:border-r-0">
      <span className="font-semibold tracking-[0.08em] text-[#F9FAFB]">
        {coin.symbol}
      </span>
      <span className="text-[#B0B6C2]">
        {coin.price == null ? "$--" : formatPrice(coin.price)}
      </span>
      <span className={`font-medium ${changeColor}`}>
        {arrow}
        {formatTickerChange(coin.change24h)}
      </span>
    </span>
  );
});

export function PriceTicker() {
  const pathname = usePathname();
  const [coinsById, setCoinsById] =
    useState<Record<AssetId, CoinTickerData>>(INITIAL_COINS);
  const refreshIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let idleCallbackId: number | null = null;
    let fallbackTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchTickerData = async () => {
      try {
        const res = await fetch(PRICE_URL);
        if (!res.ok) {
          return;
        }

        const payload = (await res.json()) as Record<
          string,
          { usd?: number; usd_24h_change?: number }
        >;

        if (cancelled) {
          return;
        }

        setCoinsById((prev) => {
          let changed = false;
          const next = { ...prev };

          for (const assetId of ASSET_IDS) {
            const marketId = COINGECKO_IDS[assetId];
            const marketData = payload[marketId];

            if (!marketData) {
              continue;
            }

            const price =
              typeof marketData.usd === "number" && !Number.isNaN(marketData.usd)
                ? marketData.usd
                : prev[assetId].price;
            const change24h =
              typeof marketData.usd_24h_change === "number" &&
              !Number.isNaN(marketData.usd_24h_change)
                ? marketData.usd_24h_change
                : prev[assetId].change24h;

            if (
              prev[assetId].price === price &&
              prev[assetId].change24h === change24h
            ) {
              continue;
            }

            changed = true;
            next[assetId] = {
              ...prev[assetId],
              price,
              change24h,
            };
          }

          return changed ? next : prev;
        });
      } catch {
        // Keep placeholder or last known values silently.
      }
    };

    const startTicker = () => {
      if (cancelled) {
        return;
      }

      void fetchTickerData();
      refreshIntervalRef.current = window.setInterval(() => {
        void fetchTickerData();
      }, 30000);
    };

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(startTicker, {
        timeout: 3000,
      });
    } else {
      fallbackTimeoutId = globalThis.setTimeout(startTicker, 2000);
    }

    return () => {
      cancelled = true;

      if (idleCallbackId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }

      if (fallbackTimeoutId != null) {
        window.clearTimeout(fallbackTimeoutId);
      }

      if (refreshIntervalRef.current != null) {
        window.clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  if (pathname === "/terms") {
    return null;
  }

  const orderedCoins = ASSET_IDS.map((id) => coinsById[id]);
  const tickerItems = [...orderedCoins, ...orderedCoins];

  return (
    <div
      className="relative flex h-11 w-full items-center overflow-hidden border-y border-white/8 bg-[#050505]"
      aria-label="Live crypto price ticker"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent_12%,transparent_88%,rgba(255,255,255,0.04))]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-[linear-gradient(90deg,#050505,rgba(5,5,5,0))]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-[linear-gradient(270deg,#050505,rgba(5,5,5,0))]" />

      <div
        className="relative flex animate-ticker whitespace-nowrap"
        style={{ width: "max-content" }}
      >
        {tickerItems.map((coin, index) => (
          <TickerItem key={`${coin.id}-${index}`} coin={coin} />
        ))}
      </div>
    </div>
  );
}
