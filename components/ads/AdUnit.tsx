'use client';

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export interface AdUnitProps {
  slot: string;
  format?: 'in-article' | 'display';
  className?: string;
}

let adsenseScriptPromise: Promise<void> | null = null;

function loadAdSenseScript(client: string) {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (adsenseScriptPromise) {
    return adsenseScriptPromise;
  }

  const scriptId = "cryptic-daily-adsense";
  const existingScript = document.getElementById(scriptId) as
    | HTMLScriptElement
    | null;

  adsenseScriptPromise = new Promise<void>((resolve, reject) => {
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject();
    document.head.appendChild(script);
  });

  return adsenseScriptPromise;
}

export function AdUnit({ slot, format = 'display', className }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const loaded = useRef(false);
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) return;
    if (loaded.current) return;
    loaded.current = true;

    loadAdSenseScript(client)
      .then(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // AdSense can be blocked by the browser or an extension.
        }
      })
      .catch(() => {
        // Keep the ad slot reserved if the network script is unavailable.
      });
  }, [client]);

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
