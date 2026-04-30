"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AnimatedHero = dynamic(() => import("@/components/home/AnimatedHero"), {
  ssr: false,
});

export function DesktopAnimatedHero() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setEnabled(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  if (!enabled) {
    return null;
  }

  return <AnimatedHero />;
}
