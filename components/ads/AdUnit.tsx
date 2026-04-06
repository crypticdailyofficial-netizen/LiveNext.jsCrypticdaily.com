'use client';

import { useEffect, useRef } from "react";

export interface AdUnitProps {
  slot: string;
  format?: 'in-article' | 'display';
  className?: string;
}

export function AdUnit({ slot, format = 'display', className }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      // @ts-expect-error adsbygoogle not typed
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not available
    }
  }, []);

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  const containerClass =
    format === 'in-article'
      ? `min-h-[280px] my-8 ${className ?? ''}`
      : `h-[90px] overflow-hidden my-8 ${className ?? ''}`;

  if (!client) {
    return (
      <div className={`${containerClass} bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center`}>
        <p className="text-xs text-[#4B5563]">Ad Unit ({slot})</p>
      </div>
    );
  }

  if (format === 'in-article') {
    return (
      <div className={containerClass}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-layout="in-article"
          data-ad-format="fluid"
        />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
