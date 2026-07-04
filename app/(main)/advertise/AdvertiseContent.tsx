"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Props { fontVars: string; }

/* ─── Data ───────────────────────────────────────────────────────────────── */
const AUDIENCE = [
  { tag: "CRYPTO-NATIVE",   icon: "⚡", title: "Crypto & Web3 focused",         desc: "Primarily crypto & Web3 focused audience — not casual observers."          },
  { tag: "GLOBAL",          icon: "◎", title: "North America, Europe, Asia",    desc: "Readers across all major crypto-active regions and time zones."             },
  { tag: "ORGANIC GROWTH",  icon: "▲", title: "Search-first content strategy",  desc: "Traffic driven by evergreen SEO content, not paid acquisition."             },
  { tag: "INVESTORS",       icon: "◈", title: "Investors & traders",            desc: "Tracking price movements, market events, and macro crypto news daily."      },
  { tag: "BUILDERS",        icon: "◻", title: "Developers & builders",          desc: "Following Web3 infrastructure, DeFi protocols, and developer tooling."      },
  { tag: "DEFI",            icon: "⬡", title: "DeFi participants",              desc: "Yield farming, liquidity, governance, and protocol news."                    },
  { tag: "NEWCOMERS",       icon: "✦", title: "Crypto newcomers",               desc: "Learning through explainers, guides, and accessible market coverage."        },
];

const VERTICALS = ["Markets", "DeFi", "NFTs", "Regulation", "Web3"];

const AD_PACKAGES = [
  {
    slug: "display",
    label: "Display",
    tag: "BANNER",
    accent: "#00D4FF",
    popular: false,
    pricing: "Contact us for pricing",
    features: [
      "Banner placements (728×90, 300×250)",
      "Article page sidebar",
      "Run-of-site or category-targeted",
      "Min. 7-day campaign",
    ],
  },
  {
    slug: "sponsored",
    label: "Sponsored Content",
    tag: "EDITORIAL",
    accent: "#7C3AED",
    popular: true,
    pricing: "Contact us for pricing",
    features: [
      "Written by your team or ours",
      "Published as clearly labelled 'Sponsored'",
      "Clearly labeled sponsored content",
      "Promoted via our newsletter",
    ],
  },
  {
    slug: "newsletter",
    label: "Newsletter",
    tag: "EMAIL",
    accent: "#FFE600",
    popular: false,
    pricing: "Contact us for pricing",
    features: [
      "Dedicated mention in weekly digest",
      "Link to landing page of your choice",
      "Clearly marked as sponsored",
      "Single placement per issue",
    ],
  },
];

const AD_SPECS = [
  { format: "Leaderboard",        size: "728 × 90 px",   types: "JPG, PNG, GIF, HTML5", maxSize: "150 KB", anim: "15s max, 3 loops" },
  { format: "Medium Rectangle",  size: "300 × 250 px",   types: "JPG, PNG, GIF, HTML5", maxSize: "150 KB", anim: "15s max, 3 loops" },
  { format: "Wide Skyscraper",   size: "160 × 600 px",   types: "JPG, PNG, GIF, HTML5", maxSize: "150 KB", anim: "15s max, 3 loops" },
  { format: "Sponsored hero",    size: "1200 × 630 px",  types: "JPG, PNG",             maxSize: "500 KB", anim: "None"            },
];

const POLICY_RULES = [
  { ok: false, text: "Advertising does not influence editorial coverage — positive coverage is never part of any ad package." },
  { ok: false, text: "No unsubstantiated financial return claims or guaranteed profit promises." },
  { ok: false, text: "No unlicensed financial products, unregulated exchanges, or projects under active regulatory investigation." },
  { ok: false, text: "No adult content, gambling, or high-risk leveraged trading products without appropriate disclaimers." },
  { ok: false, text: "No native deception — ads designed to mimic editorial content are rejected." },
  { ok: true,  text: "All sponsored or paid content is clearly labelled 'Sponsored', 'Advertisement', or 'Paid Partnership' — no exceptions." },
  { ok: true,  text: "Advertisers are responsible for compliance with applicable laws in their target jurisdictions." },
  { ok: true,  text: "We reserve the right to remove any campaign at any time if it violates these policies." },
];

const FAQS = [
  {
    q: "Can I pay to have my project covered in an article?",
    a: "No. Editorial coverage and paid advertising are kept strictly separate. If you want written content about your project on Cryptic Daily, it must be submitted through our sponsored content option, clearly labelled as such.",
  },
  {
    q: "Do you accept token or crypto payment?",
    a: "We currently accept payment via bank transfer or major payment processors. Crypto payment arrangements can be discussed on a case-by-case basis for larger campaigns.",
  },
  {
    q: "Is there a minimum spend?",
    a: "For display advertising, we generally require a minimum 7-day campaign. For sponsored content, each piece is priced individually. Contact us to discuss your budget and goals.",
  },
  {
    q: "How are ads served on the site?",
    a: "Direct advertising placements are managed by our team. The site also serves contextual display ads through Google AdSense across general editorial pages.",
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[#9CA3AF] text-[0.93rem] leading-[1.88] mb-4 last:mb-0">{children}</p>;
}
function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="w-6 h-px bg-[#00D4FF]" />
      <span className="text-[#00D4FF] text-[0.68rem] tracking-[0.25em] uppercase"
        style={{ fontFamily: "var(--font-jb-mono)" }}>{label}</span>
    </div>
  );
}
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.06 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </section>
  );
}

/* ─── FAQ accordion item ─────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#1C2535]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left cursor-pointer group"
      >
        <span className="text-[#E8E4D9] text-[0.95rem] font-bold leading-[1.5] group-hover:text-[#00D4FF] transition-colors duration-200"
          style={{ fontFamily: "var(--font-syne)" }}>{q}</span>
        <span
          className="flex-shrink-0 text-[#6B7280] text-[1.1rem] leading-none mt-0.5 transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ease-out ${open ? "max-h-48 pb-5" : "max-h-0"}`}>
        <P>{a}</P>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export function AdvertiseContent({ fontVars }: Props) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #06080F; }
        ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 0; }
        .adv-root { cursor: crosshair; }
        .adv-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }
        .adv-root::after {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px);
          pointer-events: none; z-index: 9998;
        }
        .hero-dot-grid::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }
        /* audience card hover */
        .audience-card:hover { border-color: rgba(0,212,255,0.3) !important; background: rgba(0,212,255,0.02) !important; }
        .audience-card:hover .aud-icon { color: #00D4FF !important; }
        /* package card hover */
        .pkg-card:hover { transform: translateY(-4px); }
        /* spec row highlight */
        .spec-row:hover { background: rgba(0,212,255,0.03); }
        .spec-row:hover td { color: #E8E4D9 !important; }
        /* policy row */
        .policy-row:hover { background: rgba(0,212,255,0.02); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes borderPulse { 0%,100% { border-color: #1C2535; } 50% { border-color: #00D4FF; box-shadow: 0 0 18px rgba(0,212,255,0.2); } }
      `}</style>

      <main className={`adv-root relative bg-[#06080F] text-[#E8E4D9] overflow-x-clip ${fontVars}`}
        style={{ fontFamily: "var(--font-syne)" }}>
        {/* ══ HERO ══ */}
        <section className="hero-dot-grid relative min-h-screen flex flex-col
                            justify-end px-6 md:px-12 pb-20 pt-36 overflow-hidden">
          {/* ghost bg */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          whitespace-nowrap select-none pointer-events-none z-0 text-transparent leading-none"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(80px, 15vw, 260px)",
              WebkitTextStroke: "1px rgba(124,58,237,0.08)",
              letterSpacing: "-0.02em",
            }} aria-hidden>ADVERTISE</div>

          {/* vertical line */}
          <div className="absolute top-0 right-[24%] w-px h-full pointer-events-none z-0"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(124,58,237,0.2) 35%, rgba(0,212,255,0.12) 70%, transparent)" }}
            aria-hidden />

          <div className="relative z-10 max-w-5xl" style={{ animation: "fadeUp 1s ease both" }}>
            {/* eyebrow */}
            <div className="flex items-center gap-4 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]"
                style={{ animation: "dotBlink 1.2s ease infinite" }} />
              <span className="text-[#7C3AED] text-[0.72rem] tracking-[0.25em] uppercase"
                style={{ fontFamily: "var(--font-jb-mono)" }}>
                DIRECT PARTNERSHIPS &nbsp;·&nbsp; NO HIDDEN FEES &nbsp;·&nbsp; CRYPTICDAILY.COM
              </span>
            </div>

            {/* headline */}
            <h1 className="text-[#E8E4D9] leading-[0.9] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(58px, 10vw, 140px)" }}>
              Advertise
              <br />
              on <span className="text-[#7C3AED]">Cryptic</span>{" "}
              <em style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", color: "#FFE600", fontSize: "0.82em" }}>Daily.</em>
            </h1>

            <div className="w-full h-px bg-[#1C2535] mb-8" />

            {/* sub + editorial independence badge inline */}
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <p className="text-[rgba(232,228,217,0.6)] text-[1.05rem] leading-[1.75]
                             border-l-2 border-[#7C3AED] pl-5 max-w-lg">
                Reach an engaged, crypto-native audience across news, market analysis,
                and Web3 coverage. Transparent placements with full editorial independence.
              </p>
              {/* quick trust badge */}
              <div className="flex-shrink-0 border border-[#1C2535] bg-[#0D1118] px-5 py-4 max-w-xs">
                <p className="text-[#00D4FF] text-[0.62rem] tracking-[0.18em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>Editorial guarantee</p>
                {["No paid editorial coverage", "No CPM contracts", "All placements reviewed"].map(g => (
                  <div key={g} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[#10B981] text-[0.65rem]" style={{ fontFamily: "var(--font-jb-mono)" }}>✓</span>
                    <span className="text-[#6B7280] text-[0.78rem]">{g}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* primary CTA */}
            <div className="flex flex-wrap gap-4 mt-10">
              <a href="mailto:advertise@crypticdaily.com"
                className="text-[0.8rem] font-bold tracking-[0.12em] uppercase
                           bg-[#7C3AED] text-[#E8E4D9] px-8 py-[0.85rem]
                           hover:bg-[#FFE600] hover:text-[#06080F] hover:translate-x-1
                           transition-all duration-200"
                style={{
                  fontFamily: "var(--font-syne)",
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
                }}>
                advertise@crypticdaily.com →
              </a>
            </div>
          </div>

        </section>
        {/* ══ AUDIENCE ══ */}
        <Reveal className="px-6 md:px-12 py-20 border-b border-[#1C2535]">
          <div className="flex items-center gap-4 mb-14">
            <SectionTag label="Who reads Cryptic Daily" />
            <span className="hidden md:block flex-1 h-px bg-gradient-to-r from-[#1C2535] to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#1C2535]
                          border border-[#1C2535]">
            {AUDIENCE.map((a) => (
              <div key={a.tag}
                className="audience-card bg-[#06080F] px-5 py-6 cursor-default
                           border border-transparent transition-all duration-200">
                <div className="aud-icon text-[#1C2535] text-xl mb-3 transition-colors duration-200">
                  {a.icon}
                </div>
                <p className="text-[#00D4FF] text-[0.62rem] tracking-[0.18em] uppercase mb-2"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>{a.tag}</p>
                <p className="text-[#E8E4D9] text-[0.9rem] font-bold mb-2"
                  style={{ fontFamily: "var(--font-syne)" }}>{a.title}</p>
                <p className="text-[#6B7280] text-[0.8rem] leading-[1.6]">{a.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ WHAT WE COVER ══ */}
        <Reveal className="bg-[#0D1118] border-b border-[#1C2535]">
          <div className="px-6 md:px-12 py-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-lg">
                <SectionTag label="What we cover" />
                <h2 className="text-[#E8E4D9] leading-tight mb-4"
                  style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px, 5vw, 68px)", letterSpacing: "-0.01em" }}>
                  Five Editorial
                  <br /><em style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", color: "#7C3AED", fontSize: "0.9em" }}>Verticals.</em>
                </h2>
                <P>
                  Original crypto and Web3 news ranging from breaking market news to in-depth
                  investigative pieces on Web3 fraud and builder ecosystems.
                </P>
              </div>
              {/* Vertical pills */}
              <div className="flex flex-wrap gap-2">
                {VERTICALS.map((v, i) => {
                  const colors = ["#00D4FF", "#7C3AED", "#FFE600", "#10B981", "#EF4444"];
                  return (
                    <div key={v}
                      className="px-5 py-2.5 border border-[#1C2535] text-[#E8E4D9] text-[0.78rem] font-bold
                                 tracking-[0.08em] transition-all duration-200 hover:translate-y-[-2px]"
                      style={{
                        fontFamily: "var(--font-syne)",
                        borderColor: colors[i] + "55",
                        color: colors[i],
                        background: colors[i] + "0A",
                      }}>
                      {v}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-8 border-t border-[#1C2535] pt-5">
              <p className="text-[#6B7280] text-[0.78rem] tracking-[0.08em]"
                style={{ fontFamily: "var(--font-jb-mono)" }}>
                We do not publish paid editorial. Advertising placements are clearly labelled
                and kept strictly separate from our newsroom.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ══ AD PACKAGES ══ */}
        <Reveal className="px-6 md:px-12 py-20 border-b border-[#1C2535]">
          <SectionTag label="Advertising options" />
          <h2 className="text-[#E8E4D9] leading-none tracking-tight mb-4"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(40px, 6vw, 80px)" }}>
            Three Ways to Reach
            <br /><span className="text-[#7C3AED]">Our Audience.</span>
          </h2>
          <p className="text-[#6B7280] text-[0.85rem] mb-12 max-w-lg">
            Straightforward placements with no hidden fees or opaque networks. All direct
            advertising is reviewed and approved by our team before going live.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1C2535] border border-[#1C2535]">
            {AD_PACKAGES.map((pkg) => (
              <div key={pkg.slug}
                className={`pkg-card relative bg-[#06080F] px-7 py-8 transition-all duration-300 cursor-default
                             ${pkg.popular ? "bg-[#0D1118]" : ""}`}>
                {/* top colour bar */}
                <div className="h-[3px] w-full mb-6"
                  style={{ background: `linear-gradient(90deg, ${pkg.accent}, transparent)` }} />

                {pkg.popular && (
                  <div className="absolute top-5 right-5">
                    <span className="text-[0.58rem] tracking-[0.15em] uppercase px-2 py-0.5"
                      style={{ fontFamily: "var(--font-jb-mono)", color: pkg.accent, border: `1px solid ${pkg.accent}66` }}>
                      Most popular
                    </span>
                  </div>
                )}

                <span className="text-[0.62rem] tracking-[0.2em] uppercase mb-3 block"
                  style={{ fontFamily: "var(--font-jb-mono)", color: pkg.accent }}>{pkg.tag}</span>
                <h3 className="text-[#E8E4D9] leading-tight mb-2"
                  style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px, 3vw, 40px)" }}>
                  {pkg.label}
                </h3>
                <p className="text-[#6B7280] text-[0.75rem] tracking-[0.08em] mb-6"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>{pkg.pricing}</p>

                <ul className="space-y-2 mb-8">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="flex-shrink-0 mt-[0.42rem]" style={{ color: pkg.accent }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                          <rect x="0" y="3" width="8" height="2" />
                        </svg>
                      </span>
                      <span className="text-[#9CA3AF] text-[0.82rem] leading-[1.7]">{f}</span>
                    </li>
                  ))}
                </ul>

                <a href="mailto:advertise@crypticdaily.com"
                  className="block text-center text-[0.72rem] font-bold tracking-[0.12em] uppercase
                             py-2.5 px-5 border transition-all duration-200
                             hover:translate-x-0.5"
                  style={{
                    fontFamily: "var(--font-syne)",
                    color: pkg.accent,
                    borderColor: pkg.accent + "55",
                    background: pkg.accent + "0A",
                  }}>
                  Get in touch →
                </a>
              </div>
            ))}
          </div>

          <p className="mt-6 text-[#6B7280] text-[0.75rem] leading-[1.6]"
            style={{ fontFamily: "var(--font-jb-mono)" }}>
            We do not currently offer guaranteed CPM contracts. All placements are direct buys.
            Google-served ads via AdSense also appear across the site and are not available for
            direct purchase.
          </p>
        </Reveal>

        {/* ══ AD SPECS ══ */}
        <Reveal className="bg-[#0D1118] border-b border-[#1C2535]">
          <div className="px-6 md:px-12 py-20">
            <SectionTag label="Ad specifications" />
            <h2 className="text-[#E8E4D9] leading-none tracking-tight mb-10"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px, 5vw, 66px)" }}>
              Creative Requirements.
            </h2>

            {/* specs table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#1C2535]">
                    {["Format", "Size", "File types", "Max size", "Animation"].map(h => (
                      <th key={h} className="text-left pb-3 pr-8 text-[0.65rem] tracking-[0.18em] uppercase text-[#6B7280]"
                        style={{ fontFamily: "var(--font-jb-mono)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AD_SPECS.map((row, i) => (
                    <tr key={i} className="spec-row border-b border-[#1C2535] transition-colors duration-200">
                      <td className="py-4 pr-8 text-[#E8E4D9] text-[0.88rem] font-bold"
                        style={{ fontFamily: "var(--font-syne)" }}>{row.format}</td>
                      <td className="py-4 pr-8 text-[#00D4FF] text-[0.8rem]"
                        style={{ fontFamily: "var(--font-jb-mono)" }}>{row.size}</td>
                      <td className="py-4 pr-8 text-[#9CA3AF] text-[0.8rem]"
                        style={{ fontFamily: "var(--font-jb-mono)" }}>{row.types}</td>
                      <td className="py-4 pr-8 text-[#9CA3AF] text-[0.8rem]"
                        style={{ fontFamily: "var(--font-jb-mono)" }}>{row.maxSize}</td>
                      <td className="py-4 text-[#9CA3AF] text-[0.8rem]"
                        style={{ fontFamily: "var(--font-jb-mono)" }}>{row.anim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-l-2 border-[#FFE600] bg-[rgba(255,230,0,0.04)] px-5 py-3">
              <p className="text-[#9CA3AF] text-[0.82rem] leading-[1.7]">
                All creatives must be submitted at least{" "}
                <span className="text-[#FFE600]">48 hours before campaign start</span>.
                We reserve the right to reject creatives that do not meet our content policies.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ══ POLICY ══ */}
        <Reveal className="px-6 md:px-12 py-20 border-b border-[#1C2535]">
          <SectionTag label="Advertising policy" />
          <h2 className="text-[#E8E4D9] leading-none tracking-tight mb-10"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px, 5vw, 66px)" }}>
            What We Will &amp;
            <br /><span className="text-[#EF4444]">Won't</span> Accept.
          </h2>
          <div className="space-y-0">
            {POLICY_RULES.map((rule, i) => (
              <div key={i}
                className="policy-row flex gap-5 items-start py-4 border-t border-[#1C2535]
                           transition-colors duration-200 cursor-default">
                <span className="flex-shrink-0 mt-0.5 text-[0.72rem] tracking-[0.1em]"
                  style={{ fontFamily: "var(--font-jb-mono)", color: rule.ok ? "#10B981" : "#EF4444" }}>
                  {rule.ok ? "[✓]" : "[✕]"}
                </span>
                <p className="text-[#9CA3AF] text-[0.9rem] leading-[1.8]">{rule.text}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ══ FAQ ══ */}
        <Reveal className="bg-[#0D1118] border-b border-[#1C2535]">
          <div className="px-6 md:px-12 py-20">
            <SectionTag label="FAQ" />
            <h2 className="text-[#E8E4D9] leading-none tracking-tight mb-10"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(36px, 5vw, 66px)" }}>
              Frequently Asked
              <br /><em style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", color: "#FFE600", fontSize: "0.88em" }}>Questions.</em>
            </h2>
            <div className="max-w-2xl">
              {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
              <div className="border-t border-[#1C2535]" />
            </div>
          </div>
        </Reveal>

        {/* ══ CTA ══ */}
        <Reveal className="relative overflow-hidden text-center">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.09) 0%, transparent 65%)" }}
            aria-hidden />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          whitespace-nowrap select-none pointer-events-none text-transparent"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(70px, 13vw, 200px)",
              WebkitTextStroke: "1px rgba(124,58,237,0.06)",
              letterSpacing: "-0.01em",
            }} aria-hidden>GET IN TOUCH</div>

          <div className="relative z-10 px-6 md:px-12 py-28">
            <h2 className="text-[#E8E4D9] leading-[0.95] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(48px, 7.5vw, 112px)" }}>
              Ready to
              <br /><span className="text-[#7C3AED]">Reach Us?</span>
            </h2>
            <p className="text-[rgba(232,228,217,0.5)] text-[1.1rem] mb-4 mx-auto max-w-md"
              style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic" }}>
              To discuss a campaign, request our media kit, or ask about custom packages,
              email us directly. We typically respond within 1–2 business days.
            </p>
            <p className="text-[#6B7280] text-[0.75rem] mb-10 mx-auto max-w-md"
              style={{ fontFamily: "var(--font-jb-mono)" }}>
              Include: company name, placement type, target audience, approximate campaign timeline.
            </p>

            <a href="mailto:advertise@crypticdaily.com"
              className="inline-flex items-center gap-3 text-[0.85rem] font-bold
                         tracking-[0.12em] uppercase
                         bg-[#7C3AED] text-[#E8E4D9] px-10 py-4
                         hover:bg-[#FFE600] hover:text-[#06080F] hover:translate-x-1
                         transition-all duration-200"
              style={{
                fontFamily: "var(--font-syne)",
                clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
              }}>
              <span>advertise@crypticdaily.com</span>
              <span>↗</span>
            </a>

            <div className="mt-8 flex justify-center gap-6">
              <Link href="/editorial-policy"
                className="text-[0.7rem] tracking-[0.1em] uppercase text-[#6B7280]
                           hover:text-[#00D4FF] transition-colors duration-200"
                style={{ fontFamily: "var(--font-jb-mono)" }}>Editorial Policy</Link>
              <Link href="/disclaimer"
                className="text-[0.7rem] tracking-[0.1em] uppercase text-[#6B7280]
                           hover:text-[#00D4FF] transition-colors duration-200"
                style={{ fontFamily: "var(--font-jb-mono)" }}>Financial Disclaimer</Link>
            </div>
          </div>
        </Reveal>
      </main>
    </>
  );
}
