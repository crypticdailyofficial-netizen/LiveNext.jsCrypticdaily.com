"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PriceTicker = dynamic(
  () =>
    import("@/components/layout/PriceTicker").then((m) => ({
      default: m.PriceTicker,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-11 w-full border-y border-white/8 bg-[#050505]" />
    ),
  },
);

export function PriceTickerClient() {
  const [desktopEnabled, setDesktopEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => {
      setDesktopEnabled(query.matches);
    };

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  if (!desktopEnabled) {
    return (
      <div
        aria-hidden="true"
        className="h-11 w-full border-y border-white/8 bg-[#050505] md:hidden"
      />
    );
  }

  return <PriceTicker />;
}
