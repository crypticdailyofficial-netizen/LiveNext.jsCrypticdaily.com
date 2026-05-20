"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Props { fontVars: string; }

/* ─── TOC ────────────────────────────────────────────────────────────────── */
const TOC = [
  { num: "01", slug: "not-advice",    label: "Not Financial Advice"          },
  { num: "02", slug: "no-recs",       label: "No Investment Recommendations" },
  { num: "03", slug: "dyor",          label: "Do Your Own Research"          },
  { num: "04", slug: "market-data",   label: "Market Data Accuracy"          },
  { num: "05", slug: "independence",  label: "Editorial Independence"        },
  { num: "06", slug: "affiliate",     label: "Affiliate & Advertising"       },
  { num: "07", slug: "liability",     label: "No Liability"                  },
  { num: "08", slug: "regulatory",    label: "Regulatory Notice"             },
  { num: "09", slug: "changes",       label: "Changes to This Disclaimer"    },
  { num: "10", slug: "contact",       label: "Contact"                       },
];

/* ─── Prose helpers ──────────────────────────────────────────────────────── */
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[#9CA3AF] text-[0.93rem] leading-[1.9] mb-4 last:mb-0">{children}</p>;
}
function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-[#00D4FF] hover:text-[#FFE600] transition-colors duration-200 underline underline-offset-2">
      {children}
    </a>
  );
}
function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#6B7280] text-[0.72rem] tracking-[0.15em] uppercase mt-5 mb-2"
      style={{ fontFamily: "var(--font-jb-mono)" }}>{children}</p>
  );
}
function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-px bg-[#00D4FF]" />
      <span className="text-[#00D4FF] text-[0.68rem] tracking-[0.25em] uppercase"
        style={{ fontFamily: "var(--font-jb-mono)" }}>{label}</span>
    </div>
  );
}

/* ─── DotList ────────────────────────────────────────────────────────────── */
function DotList({ items, color = "muted" }: {
  items: string[];
  color?: "cyan" | "red" | "yellow" | "green" | "muted";
}) {
  const dot: Record<string, string> = {
    cyan: "bg-[#00D4FF]", red: "bg-[#EF4444]",
    yellow: "bg-[#FFE600]", green: "bg-[#10B981]", muted: "bg-[#1C2535]",
  };
  return (
    <ul className="mt-3 mb-4 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[0.47rem] ${dot[color]}`} />
          <span className="text-[#9CA3AF] text-[0.93rem] leading-[1.8]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Liability item row ─────────────────────────────────────────────────── */
function LiabilityRow({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex gap-5 py-4 border-t border-[#1C2535] group cursor-default
                    hover:bg-[rgba(239,68,68,0.02)] transition-colors duration-200">
      <span className="flex-shrink-0 text-[#1C2535] leading-none pt-0.5 transition-colors duration-300
                       group-hover:text-[#EF4444]"
        style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem" }}>{num}</span>
      <p className="text-[#9CA3AF] text-[0.93rem] leading-[1.8] pt-0.5">{text}</p>
    </div>
  );
}

/* ─── DYOR checklist row ─────────────────────────────────────────────────── */
function DyorRow({ text }: { text: string }) {
  return (
    <div className="flex gap-4 py-3.5 border-t border-[#1C2535] group cursor-default
                    hover:bg-[rgba(0,212,255,0.02)] transition-colors duration-200">
      <span className="flex-shrink-0 text-[#1C2535] group-hover:text-[#00D4FF]
                       transition-colors duration-300 text-[0.72rem] tracking-[0.12em] pt-[3px]"
        style={{ fontFamily: "var(--font-jb-mono)" }}>[✓]</span>
      <p className="text-[#9CA3AF] text-[0.93rem] leading-[1.8]">{text}</p>
    </div>
  );
}

/* ─── Reveal hook ────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </section>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */
function Section({ slug, num, tag, title, accent, children }: {
  slug: string; num: string; tag: string; title: string; accent: string; children: React.ReactNode;
}) {
  return (
    <RevealSection>
      <div id={`section-${slug}`} data-section-id={slug}
        className="fd-row relative pl-5 py-12 border-t border-[#1C2535] scroll-mt-28 transition-all duration-200"
        style={{ "--section-accent": accent } as React.CSSProperties}>
        {/* num + tag */}
        <div className="flex items-center gap-4 mb-5">
          <span className="fd-num text-[#1C2535] leading-none transition-colors duration-300"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(34px, 4vw, 54px)" }}>
            {num}
          </span>
          <span className="text-[0.6rem] tracking-[0.18em] uppercase px-2 py-0.5"
            style={{ fontFamily: "var(--font-jb-mono)", color: accent, border: `1px solid ${accent}44` }}>
            {tag}
          </span>
        </div>
        {/* heading */}
        <h2 className="text-[#E8E4D9] leading-tight tracking-tight mb-6"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(28px, 4vw, 50px)", letterSpacing: "-0.01em" }}>
          {title}
        </h2>
        {children}
      </div>
    </RevealSection>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export function FinancialDisclaimerContent({ fontVars }: Props) {
  const [navHidden, setNavHidden] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavHidden(y > lastY.current && y > 100);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const headings = document.querySelectorAll("[data-section-id]");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) setActiveSection((e.target as HTMLElement).dataset.sectionId ?? null);
      }
    }, { rootMargin: "-30% 0px -60% 0px" });
    headings.forEach(h => io.observe(h));
    return () => io.disconnect();
  }, []);

  const scrollTo = (slug: string) => {
    document.getElementById(`section-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #06080F; }
        ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 0; }
        .fd-root { cursor: crosshair; }

        /* grain */
        .fd-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }
        /* scanlines */
        .fd-root::after {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px);
          pointer-events: none; z-index: 9998;
        }

        /* hero dot grid — red tinted for danger tone */
        .hero-dot-grid::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(239,68,68,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }

        /* section hover accent line */
        .fd-row::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--section-accent);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.35s ease;
        }
        .fd-row:hover::before { transform: scaleY(1); }
        .fd-row:hover .fd-num { color: var(--section-accent) !important; }

        .toc-item.toc-active { color: #00D4FF !important; border-left-color: #00D4FF !important; }

        /* warning banner breathe */
        @keyframes warnBreathe {
          0%,100% { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.25); }
          50%      { background: rgba(239,68,68,0.10); border-color: rgba(239,68,68,0.45); }
        }
        .warn-breathe { animation: warnBreathe 3.5s ease infinite; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dotBlink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        @keyframes floatY { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        @keyframes tickerMove { from{transform:translateX(0);} to{transform:translateX(-50%);} }
        @keyframes borderPulse {
          0%,100% { border-color: #1C2535; }
          50%      { border-color: #EF4444; box-shadow: 0 0 16px rgba(239,68,68,0.2); }
        }
      `}</style>

      <main className={`fd-root relative bg-[#06080F] text-[#E8E4D9] overflow-x-clip ${fontVars}`}
        style={{ fontFamily: "var(--font-syne)" }}>

        {/* ══ NAV ══ */}
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                         px-6 md:px-12 py-5 bg-[#06080F]/85 backdrop-blur-xl
                         border-b border-[#1C2535] transition-transform duration-300
                         ${navHidden ? "-translate-y-full" : "translate-y-0"}`}>
          <Link href="/" className="text-[#00D4FF] hover:text-[#E8E4D9] transition-colors text-[1.7rem] tracking-[0.05em]"
            style={{ fontFamily: "var(--font-bebas)" }}>
            ⚡ <span className="text-[#E8E4D9]">Cryptic</span> Daily
          </Link>
          <Link href="/contact"
            className="text-[0.7rem] tracking-[0.15em] uppercase border border-[#1C2535] px-4 py-2
                       text-[#6B7280] hover:border-[#EF4444] hover:text-[#EF4444] transition-all duration-200"
            style={{ fontFamily: "var(--font-jb-mono)" }}>
            Contact Us →
          </Link>
        </nav>

        {/* ══ HERO ══ */}
        <section className="hero-dot-grid relative min-h-[72vh] flex flex-col
                            justify-end px-6 md:px-12 pb-20 pt-36 overflow-hidden">
          {/* ghost bg */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          whitespace-nowrap select-none pointer-events-none z-0 text-transparent leading-none"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(72px, 12vw, 210px)",
              WebkitTextStroke: "1px rgba(239,68,68,0.08)",
              letterSpacing: "-0.02em",
            }} aria-hidden>DISCLAIMER</div>

          {/* diagonal line — red / yellow */}
          <div className="absolute top-0 right-[26%] w-px h-full pointer-events-none z-0"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(239,68,68,0.18) 35%, rgba(255,230,0,0.1) 70%, transparent)" }}
            aria-hidden />

          <div className="relative z-10 max-w-4xl" style={{ animation: "fadeUp 1s ease both" }}>
            {/* eyebrow */}
            <div className="flex items-center gap-4 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"
                style={{ animation: "dotBlink 1.2s ease infinite" }} />
              <span className="text-[#EF4444] text-[0.72rem] tracking-[0.25em] uppercase"
                style={{ fontFamily: "var(--font-jb-mono)" }}>
                LAST UPDATED: MARCH 25, 2026 &nbsp;·&nbsp; CRYPTICDAILY.COM
              </span>
            </div>

            {/* headline */}
            <h1 className="text-[#E8E4D9] leading-[0.9] tracking-tight mb-6"
              style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(58px, 10vw, 140px)" }}>
              Financial
              <br />
              <span className="text-[#EF4444]">Disclaimer</span>
              <br />
              <em style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic", color: "#FFE600", fontSize: "0.72em" }}>
                Not financial advice.
              </em>
            </h1>

            <div className="w-full h-px bg-[#1C2535] mb-7" />

            {/* hero warning banner */}
            <div className="warn-breathe border px-5 py-5 max-w-2xl mb-8">
              <p className="text-[#EF4444] text-[0.68rem] tracking-[0.22em] uppercase mb-2 flex items-center gap-2"
                style={{ fontFamily: "var(--font-jb-mono)" }}>
                <span style={{ animation: "dotBlink 1s ease infinite" }}>●</span> Important notice
              </p>
              <p className="text-[rgba(232,228,217,0.75)] text-[0.95rem] leading-[1.75]"
                style={{ fontFamily: "var(--font-dm-serif)" }}>
                All content on Cryptic Daily is for informational and educational purposes only.
                Nothing here constitutes financial advice, investment advice, or any form of
                professional financial guidance.
              </p>
            </div>

            <p className="text-[rgba(232,228,217,0.45)] text-[0.85rem] leading-[1.7]
                          border-l-2 border-[#1C2535] pl-4 max-w-lg">
              Cryptic Daily is a news and media publication, not a licensed financial
              advisor, broker, dealer, or investment firm.
            </p>
          </div>

        </section>

        {/* ══ TICKER ══ */}
        <div className="overflow-hidden whitespace-nowrap bg-[#0D1118] border-y border-[#1C2535] py-2.5">
          <div className="inline-block" style={{ animation: "tickerMove 28s linear infinite" }}>
            {[
              { sym:"BTC",price:"$67,234",change:"▲ 2.4%",up:true  },
              { sym:"ETH",price:"$3,812", change:"▲ 1.8%",up:true  },
              { sym:"SOL",price:"$178.40",change:"▼ 0.9%",up:false },
              { sym:"BNB",price:"$412.00",change:"▲ 0.5%",up:true  },
              { sym:"ADA",price:"$0.61",  change:"▼ 1.2%",up:false },
              { sym:"XRP",price:"$0.88",  change:"▲ 3.1%",up:true  },
              { sym:"BTC",price:"$67,234",change:"▲ 2.4%",up:true  },
              { sym:"ETH",price:"$3,812", change:"▲ 1.8%",up:true  },
              { sym:"SOL",price:"$178.40",change:"▼ 0.9%",up:false },
              { sym:"BNB",price:"$412.00",change:"▲ 0.5%",up:true  },
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mr-12">
                <span className="text-[#00D4FF] font-medium text-[0.75rem] tracking-[0.04em]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>{item.sym}</span>
                <span className="text-[#E8E4D9] text-[0.75rem]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>{item.price}</span>
                <span className={`text-[0.75rem] ${item.up ? "text-[#10B981]" : "text-[#EF4444]"}`}
                  style={{ fontFamily: "var(--font-jb-mono)" }}>{item.change}</span>
                <span className="text-[#1C2535] mx-6">|</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══ TWO-COLUMN LAYOUT ══ */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16
                        flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* ── STICKY TOC SIDEBAR ── */}
          <aside className="lg:w-[280px] flex-shrink-0">
            <div className="lg:sticky lg:top-28">
              <SectionTag label="Contents" />
              <nav className="space-y-0">
                {TOC.map((item) => (
                  <button key={item.slug} onClick={() => scrollTo(item.slug)}
                    className={`toc-item w-full text-left flex items-center gap-3
                                border-l-2 pl-3 py-2.5 cursor-pointer transition-all duration-200
                                ${activeSection === item.slug
                                  ? "toc-active border-[#00D4FF] text-[#00D4FF]"
                                  : "border-[#1C2535] text-[#6B7280] hover:text-[#E8E4D9]"}`}>
                    <span className="text-[0.58rem] tracking-[0.12em] flex-shrink-0 w-6"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{item.num}</span>
                    <span className="text-[0.78rem] leading-[1.4]"
                      style={{ fontFamily: "var(--font-syne)" }}>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* meta block */}
              <div className="mt-8 pt-6 border-t border-[#1C2535] space-y-2">
                {[
                  ["Updated",   "March 25, 2026"],
                  ["Applies to","crypticdaily.com"],
                  ["Publisher", "Cryptic Daily"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-[#6B7280] text-[0.65rem] tracking-[0.1em] uppercase"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{k}</span>
                    <span className="text-[#E8E4D9] text-[0.65rem] text-right"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* pulsing warning pill */}
              <div className="mt-8 border border-[#EF4444]/30 px-4 py-3"
                style={{ animation: "borderPulse 4s ease infinite" }}>
                <p className="text-[#EF4444] text-[0.62rem] tracking-[0.15em] uppercase mb-1"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>Not financial advice</p>
                <p className="text-[#6B7280] text-[0.72rem] leading-[1.5]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>
                  All content is for informational purposes only.
                </p>
              </div>

              {/* contact CTA */}
              <div className="mt-4">
                <a href="mailto:editor@crypticdaily.com?subject=Disclaimer Query"
                  className="block border border-[#1C2535] bg-[#0D1118] px-4 py-3
                             hover:border-[#00D4FF] transition-all duration-200 group">
                  <p className="text-[#00D4FF] text-[0.65rem] tracking-[0.18em] uppercase mb-1
                                group-hover:text-[#FFE600] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-jb-mono)" }}>Questions? ↗</p>
                  <p className="text-[#6B7280] text-[0.7rem]"
                    style={{ fontFamily: "var(--font-jb-mono)" }}>editor@crypticdaily.com</p>
                </a>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 space-y-0">

            {/* ─ 01 Not Financial Advice ─ */}
            <Section slug="not-advice" num="01" tag="DISCLAIMER" title="Not Financial Advice" accent="#EF4444">
              <div className="border-l-2 border-[#EF4444] bg-[rgba(239,68,68,0.04)] px-5 py-5 mb-5">
                <P>
                  All content published on Cryptic Daily — including articles, market data,
                  price analysis, coin information, commentary, newsletters, and any other
                  material — is provided for{" "}
                  <strong className="text-[#E8E4D9]">informational and educational purposes only</strong>.
                </P>
              </div>
              <P>
                Nothing on this website constitutes, or should be interpreted as, financial
                advice, investment advice, trading advice, or any other kind of professional
                financial guidance. Cryptic Daily is a news and media publication, not a
                licensed financial advisor, broker, dealer, or investment firm.
              </P>
            </Section>

            {/* ─ 02 No Investment Recommendations ─ */}
            <Section slug="no-recs" num="02" tag="INVESTMENTS" title="No Investment Recommendations" accent="#FFE600">
              <P>
                We do not recommend, endorse, or suggest that any person buy, sell, hold, or
                trade any cryptocurrency, token, digital asset, security, or financial
                instrument. Any reference to a specific cryptocurrency or project is purely
                journalistic and editorial in nature.
              </P>
              <div className="border-l-2 border-[#FFE600] bg-[rgba(255,230,0,0.04)] px-5 py-4 mt-4">
                <P>
                  The cryptocurrency market is highly volatile and speculative.{" "}
                  <strong className="text-[#E8E4D9]">
                    Past performance of any asset covered on this site is not indicative of
                    future results.
                  </strong>{" "}
                  You may lose some or all of your invested capital.
                </P>
              </div>
            </Section>

            {/* ─ 03 DYOR ─ */}
            <Section slug="dyor" num="03" tag="RESEARCH" title="Do Your Own Research" accent="#00D4FF">
              <P>
                Before making any financial or investment decision, you should:
              </P>
              <div className="mt-2 mb-6">
                {[
                  "Conduct your own independent research.",
                  "Consult a qualified and licensed financial advisor in your jurisdiction.",
                  "Understand the risks involved, including the risk of total loss.",
                  "Never invest more than you can afford to lose.",
                ].map((text, i) => (
                  <DyorRow key={i} text={text} />
                ))}
                <div className="border-t border-[#1C2535]" />
              </div>

              {/* DYOR terminal */}
              <div className="relative overflow-hidden border border-[#1C2535] bg-[#0D1118]">
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#0D1118] border-b border-[#1C2535]" />
                <div className="absolute top-[10px] left-[14px] flex gap-[6px] z-10">
                  <span className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />
                  <span className="w-[10px] h-[10px] rounded-full bg-[#FFE600]" />
                  <span className="w-[10px] h-[10px] rounded-full bg-[#10B981]" />
                </div>
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[#6B7280] text-[0.65rem] tracking-[0.1em] z-10"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>dyor_checklist.ts</span>
                <div className="mt-6 p-7 text-[0.8rem] leading-[2]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>
                  <p className="text-[#6B7280]">// Before any investment decision</p>
                  <p>&nbsp;</p>
                  <p><span className="text-[#7C3AED]">const</span> <span className="text-[#00D4FF]">checklist</span><span className="text-[#E8E4D9]"> = {"{"}</span></p>
                  {[
                    ["research",      '"Do your own independent research"',        "#10B981"],
                    ["getAdvice",     '"Consult a licensed financial advisor"',    "#10B981"],
                    ["understandRisk",'"Know the risk of total loss"',             "#FFE600"],
                    ["capital",       '"Never risk what you cannot afford to lose"',"#EF4444"],
                    ["readingThis",   '"Not a substitute for due diligence"',      "#6B7280"],
                  ].map(([key, val, color]) => (
                    <p key={key} className="pl-4">
                      <span className="text-[#6B7280]">{key}</span>
                      <span className="text-[#E8E4D9]">: </span>
                      <span style={{ color }}>{val}</span>
                      <span className="text-[#E8E4D9]">,</span>
                    </p>
                  ))}
                  <p><span className="text-[#E8E4D9]">{"}"}</span></p>
                  <p>&nbsp;</p>
                  <p>
                    <span className="text-[#7C3AED]">export default</span>{" "}
                    <span className="text-[#00D4FF]">checklist</span>
                    <span className="text-[#E8E4D9]">;</span>
                    <span className="inline-block w-2 bg-[#00D4FF] align-middle ml-0.5"
                      style={{ height: "1.1em", animation: "dotBlink 1s step-end infinite" }} />
                  </p>
                </div>
              </div>

              <p className="mt-5 text-[#6B7280] text-[0.85rem] leading-[1.75] border-l-2 border-[#1C2535] pl-4">
                Cryptic Daily strongly encourages all readers to exercise their own judgment
                and due diligence before acting on any information found on this site.
              </p>
            </Section>

            {/* ─ 04 Market Data ─ */}
            <Section slug="market-data" num="04" tag="DATA" title="Market Data Accuracy" accent="#7C3AED">
              <P>
                Cryptocurrency prices, market capitalisation figures, trading volumes, and
                other market data displayed on this site are sourced from third-party
                providers including{" "}
                <A href="https://coingecko.com">CoinGecko</A>. This data is provided on an
                "as is" basis and may be delayed, inaccurate, or incomplete.
              </P>

              {/* data source cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1C2535] border border-[#1C2535] my-6">
                {[
                  { label: "Source",   value: "CoinGecko",     sub: "Third-party API",        accent: "#10B981" },
                  { label: "Basis",    value: "As-Is",         sub: "No warranties",           accent: "#FFE600" },
                  { label: "Latency",  value: "May Delay",     sub: "Not real-time",           accent: "#EF4444" },
                ].map((s, i) => (
                  <div key={i} className="bg-[#06080F] px-5 py-5 group hover:bg-[#0D1118] transition-colors duration-200">
                    <p className="text-[#6B7280] text-[0.62rem] tracking-[0.15em] uppercase mb-2"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{s.label}</p>
                    <p className="leading-none group-hover:opacity-80 transition-opacity duration-300"
                      style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem", color: s.accent }}>{s.value}</p>
                    <p className="text-[#6B7280] text-[0.65rem] tracking-[0.08em] mt-1.5"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              <P>
                Cryptic Daily makes no warranties, express or implied, regarding the
                accuracy, completeness, timeliness, or reliability of any market data
                displayed on this site. We are not liable for any errors or omissions in this
                data, or for any decisions made in reliance on it.
              </P>
            </Section>

            {/* ─ 05 Editorial Independence ─ */}
            <Section slug="independence" num="05" tag="EDITORIAL" title="Editorial Independence" accent="#10B981">
              <P>
                Cryptic Daily maintains full editorial independence. Our editorial team
                selects and writes content based on journalistic merit and reader interest.
                Coverage of a project, token, or company does not constitute an endorsement
                or recommendation.
              </P>
              <div className="border-l-2 border-[#10B981] bg-[rgba(16,185,129,0.04)] px-5 py-4 mt-4">
                <P>
                  Where sponsored content, paid partnerships, or affiliate arrangements exist,
                  they will be{" "}
                  <strong className="text-[#E8E4D9]">clearly labelled as such</strong>.
                  Sponsored content does not influence our independent editorial coverage.
                </P>
              </div>
            </Section>

            {/* ─ 06 Affiliate ─ */}
            <Section slug="affiliate" num="06" tag="DISCLOSURE" title="Affiliate & Advertising Disclosure" accent="#FFE600">
              <P>
                Cryptic Daily may display third-party advertisements through Google AdSense
                and other advertising networks. We may also participate in affiliate
                programmes where we earn a commission if you click a link and make a purchase
                or sign up for a service.
              </P>
              <DotList
                color="muted"
                items={[
                  "Affiliate relationships do not affect our editorial content.",
                  "We only link to products or services we believe may be of genuine interest to our readers.",
                  "Advertiser relationships are managed separately from our newsroom.",
                ]}
              />
            </Section>

            {/* ─ 07 No Liability ─ */}
            <Section slug="liability" num="07" tag="LEGAL" title="No Liability" accent="#EF4444">
              <P>
                To the fullest extent permitted by applicable law, Cryptic Daily, its owners,
                editors, writers, contributors, and affiliates shall not be liable for any
                direct, indirect, incidental, consequential, or punitive damages arising from:
              </P>
              <div className="mt-2 mb-5">
                {[
                  "Your use of or reliance on any content published on this site.",
                  "Any investment or financial decision made based on information found here.",
                  "Any inaccuracies in market data or third-party information.",
                  "Any interruption, suspension, or termination of the site or its services.",
                ].map((text, i) => (
                  <LiabilityRow key={i} num={`0${i + 1}`} text={text} />
                ))}
                <div className="border-t border-[#1C2535]" />
              </div>
              <div className="border border-[#EF4444]/25 bg-[rgba(239,68,68,0.04)] px-5 py-5">
                <p className="text-[#EF4444] text-[0.68rem] tracking-[0.2em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>By using this website you acknowledge:</p>
                <p className="text-[#E8E4D9] text-[1rem] leading-[1.75]"
                  style={{ fontFamily: "var(--font-dm-serif)", fontStyle: "italic" }}>
                  You use this website and rely on its content entirely at your own risk.
                </p>
              </div>
            </Section>

            {/* ─ 08 Regulatory ─ */}
            <Section slug="regulatory" num="08" tag="REGULATION" title="Regulatory Notice" accent="#7C3AED">
              <P>
                Cryptocurrency regulation varies significantly by country and jurisdiction. It
                is your responsibility to understand and comply with the laws and regulations
                applicable to you before engaging in any cryptocurrency-related activity.
                Nothing on this site should be construed as legal advice.
              </P>

              {/* jurisdiction stat row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1C2535] border border-[#1C2535] mt-6">
                {[
                  { flag: "🌍", label: "EU / EEA",      note: "MiCA regulation" },
                  { flag: "🇬🇧", label: "United Kingdom", note: "FCA jurisdiction" },
                  { flag: "🇺🇸", label: "United States",  note: "SEC / CFTC" },
                  { flag: "🌏", label: "All others",     note: "Your laws apply" },
                ].map((j, i) => (
                  <div key={i} className="bg-[#06080F] px-4 py-4 group hover:bg-[#0D1118] transition-colors duration-200">
                    <p className="text-xl mb-2">{j.flag}</p>
                    <p className="text-[#E8E4D9] text-[0.82rem] font-bold mb-1 group-hover:text-[#7C3AED] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-syne)" }}>{j.label}</p>
                    <p className="text-[#6B7280] text-[0.65rem] tracking-[0.06em]"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{j.note}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ─ 09 Changes ─ */}
            <Section slug="changes" num="09" tag="UPDATES" title="Changes to This Disclaimer" accent="#00D4FF">
              <P>
                We reserve the right to update this disclaimer at any time. Changes will be
                reflected by updating the "Last updated" date at the top of this page.
                Continued use of the site after any changes constitutes your acceptance of the
                updated disclaimer.
              </P>

              {/* version history */}
              <div className="mt-5 border border-[#1C2535] bg-[#0D1118] px-5 py-4">
                <p className="text-[#6B7280] text-[0.65rem] tracking-[0.15em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>Version history</p>
                {[
                  ["March 25, 2026", "Current version. Added editorial independence, affiliate disclosure, and regulatory notice sections. Updated contact email."],
                  ["April 1, 2025",  "Initial disclaimer published."],
                ].map(([date, note]) => (
                  <div key={date} className="flex flex-col sm:flex-row gap-2 sm:gap-6 py-3 border-t border-[#1C2535]">
                    <span className="text-[#00D4FF] text-[0.68rem] tracking-[0.08em] flex-shrink-0 sm:w-32"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{date}</span>
                    <span className="text-[#6B7280] text-[0.82rem] leading-[1.6]">{note}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* ─ 10 Contact ─ */}
            <Section slug="contact" num="10" tag="CONTACT" title="Contact" accent="#10B981">
              <P>
                If you have questions about this disclaimer or our editorial practices,
                please contact us:
              </P>
              <div className="mt-5 space-y-2">
                {[
                  ["Disclaimer queries", "editor@crypticdaily.com", "Disclaimer Query"],
                  ["Editorial practices","editor@crypticdaily.com", "Editorial Query"],
                ].map(([label, email, subject]) => (
                  <div key={label}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6
                               border border-[#1C2535] bg-[#0D1118] px-5 py-3
                               hover:border-[#10B981] group transition-all duration-200">
                    <span className="text-[#6B7280] text-[0.68rem] tracking-[0.18em] uppercase sm:w-48 flex-shrink-0"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{label}</span>
                    <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
                      className="text-[#00D4FF] text-[0.82rem] tracking-[0.05em]
                                 group-hover:text-[#10B981] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{email}</a>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-l-2 border-[#1C2535] pl-4">
                <P>
                  Or visit our <A href="/contact">Contact page</A> for the full list of
                  enquiry channels.
                </P>
              </div>
            </Section>

            {/* end spacer */}
            <div className="py-12 border-t border-[#1C2535]">
              <p className="text-[#6B7280] text-[0.72rem] tracking-[0.12em]"
                style={{ fontFamily: "var(--font-jb-mono)" }}>
                END OF FINANCIAL DISCLAIMER &nbsp;·&nbsp; CRYPTICDAILY.COM &nbsp;·&nbsp; LAST UPDATED MARCH 25, 2026
              </p>
            </div>
          </main>
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="border-t border-[#1C2535] px-6 md:px-12 py-6
                           flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[#6B7280] text-[0.68rem] tracking-[0.1em]"
            style={{ fontFamily: "var(--font-jb-mono)" }}>
            © 2026 CRYPTIC DAILY &nbsp;·&nbsp; ALL RIGHTS RESERVED &nbsp;·&nbsp; CRYPTICDAILY.COM
          </span>
          <div className="flex items-center gap-6">
            {[
              ["About",            "/about"],
              ["Contact",          "/contact"],
              ["Terms",            "/terms"],
              ["Privacy",          "/privacy-policy"],
              ["Editorial Policy", "/editorial-policy"],
            ].map(([label, href]) => (
              <Link key={label} href={href}
                className="text-[#6B7280] hover:text-[#00D4FF] text-[0.65rem] tracking-[0.12em] uppercase transition-colors duration-200"
                style={{ fontFamily: "var(--font-jb-mono)" }}>{label}</Link>
            ))}
            <span className="text-[#1C2535] text-[1rem] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-bebas)" }}>⚡ CRYPTIC DAILY</span>
          </div>
        </footer>
      </main>
    </>
  );
}
