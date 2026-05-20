"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Props {
  fontVars: string;
}

/* ─── Table of contents ──────────────────────────────────────────────────── */
const TOC = [
  { num: "01", slug: "overview",     label: "Overview"                          },
  { num: "02", slug: "collect",      label: "What Data We Collect"              },
  { num: "03", slug: "services",     label: "Third-Party Services We Use"       },
  { num: "04", slug: "analytics",    label: "Analytics (Google Analytics 4)"    },
  { num: "05", slug: "advertising",  label: "Advertising (Google AdSense)"      },
  { num: "06", slug: "cookies",      label: "Cookies"                           },
  { num: "07", slug: "newsletter",   label: "Newsletter Subscriptions"          },
  { num: "08", slug: "views",        label: "Article View Counts"               },
  { num: "09", slug: "rights",       label: "Your Rights"                       },
  { num: "10", slug: "retention",    label: "Data Retention"                    },
  { num: "11", slug: "children",     label: "Children's Privacy"                },
  { num: "12", slug: "changes",      label: "Changes to This Policy"            },
  { num: "13", slug: "contact",      label: "Contact & Data Requests"           },
];

/* ─── Prose helpers ──────────────────────────────────────────────────────── */
function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[#9CA3AF] text-[0.93rem] leading-[1.88] mb-4 last:mb-0">
      {children}
    </p>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-[#00D4FF] hover:text-[#FFE600] transition-colors duration-200 underline underline-offset-2"
    >
      {children}
    </a>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[#6B7280] text-[0.72rem] tracking-[0.15em] uppercase mt-5 mb-2"
      style={{ fontFamily: "var(--font-jb-mono)" }}
    >
      {children}
    </p>
  );
}

function DotList({
  items,
  color = "muted",
}: {
  items: string[];
  color?: "cyan" | "red" | "yellow" | "green" | "muted";
}) {
  const dot: Record<string, string> = {
    cyan:   "bg-[#00D4FF]",
    red:    "bg-[#EF4444]",
    yellow: "bg-[#FFE600]",
    green:  "bg-[#10B981]",
    muted:  "bg-[#1C2535]",
  };
  return (
    <ul className="mt-3 mb-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[0.47rem] ${dot[color]}`} />
          <span className="text-[#9CA3AF] text-[0.93rem] leading-[1.8]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Service card ───────────────────────────────────────────────────────── */
function ServiceCard({
  name,
  role,
  link,
  privacy,
  accent,
}: {
  name: string;
  role: string;
  link: string;
  privacy: string;
  accent: string;
}) {
  return (
    <div
      className="border border-[#1C2535] bg-[#0D1118] px-5 py-4 mb-3
                 hover:border-opacity-60 transition-all duration-200"
      style={{ borderLeftColor: accent, borderLeftWidth: "2px" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
        <span
          className="text-[#E8E4D9] text-[0.88rem] font-bold"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {name}
        </span>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.6rem] tracking-[0.12em] uppercase px-2 py-0.5 border
                       transition-colors duration-200 hover:text-[#00D4FF]"
            style={{
              fontFamily: "var(--font-jb-mono)",
              color: accent,
              borderColor: accent + "44",
            }}
          >
            Website ↗
          </a>
          <a
            href={privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.6rem] tracking-[0.12em] uppercase px-2 py-0.5 border
                       border-[#1C2535] text-[#6B7280] transition-colors duration-200
                       hover:text-[#00D4FF] hover:border-[#00D4FF]"
            style={{ fontFamily: "var(--font-jb-mono)" }}
          >
            Privacy ↗
          </a>
        </div>
      </div>
      <p className="text-[#6B7280] text-[0.82rem] leading-[1.6]">{role}</p>
    </div>
  );
}

/* ─── Rights card ────────────────────────────────────────────────────────── */
function RightCard({
  label,
  title,
  desc,
  accent,
}: {
  label: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div className="border border-[#1C2535] bg-[#0D1118] px-5 py-4 mb-3
                    hover:border-opacity-60 transition-all duration-200">
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-[0.6rem] tracking-[0.18em] uppercase px-2 py-0.5"
          style={{
            fontFamily: "var(--font-jb-mono)",
            color: accent,
            border: `1px solid ${accent}44`,
          }}
        >
          {label}
        </span>
        <span
          className="text-[#E8E4D9] text-[0.88rem] font-bold"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {title}
        </span>
      </div>
      <p className="text-[#6B7280] text-[0.84rem] leading-[1.7]">{desc}</p>
    </div>
  );
}

/* ─── Cookie row ─────────────────────────────────────────────────────────── */
function CookieRow({
  name,
  type,
  purpose,
  duration,
  accent,
}: {
  name: string;
  type: string;
  purpose: string;
  duration: string;
  accent: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 sm:gap-6
                    py-4 border-t border-[#1C2535] items-start
                    hover:bg-[rgba(0,212,255,0.02)] transition-colors duration-200">
      <div>
        <p
          className="text-[0.62rem] tracking-[0.15em] uppercase mb-1"
          style={{ fontFamily: "var(--font-jb-mono)", color: accent }}
        >
          {name}
        </p>
        <p className="text-[#9CA3AF] text-[0.82rem] leading-[1.6]">{purpose}</p>
      </div>
      <div className="hidden sm:block w-px self-stretch bg-[#1C2535]" />
      <div>
        <p
          className="text-[0.62rem] tracking-[0.15em] uppercase text-[#6B7280] mb-1"
          style={{ fontFamily: "var(--font-jb-mono)" }}
        >
          Type
        </p>
        <p className="text-[#9CA3AF] text-[0.82rem]">{type}</p>
      </div>
      <div>
        <p
          className="text-[0.62rem] tracking-[0.15em] uppercase text-[#6B7280] mb-1"
          style={{ fontFamily: "var(--font-jb-mono)" }}
        >
          Duration
        </p>
        <p className="text-[#9CA3AF] text-[0.82rem]">{duration}</p>
      </div>
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
      ([e]) => {
        if (e.isIntersecting) { setVisible(true); io.disconnect(); }
      },
      { threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── SectionTag ─────────────────────────────────────────────────────────── */
function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-6 h-px bg-[#00D4FF]" />
      <span
        className="text-[#00D4FF] text-[0.68rem] tracking-[0.25em] uppercase"
        style={{ fontFamily: "var(--font-jb-mono)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Section wrapper ────────────────────────────────────────────────────── */
function Section({
  slug,
  num,
  tag,
  title,
  accent,
  children,
}: {
  slug: string;
  num: string;
  tag: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <RevealSection>
      <div
        id={`section-${slug}`}
        data-section-id={slug}
        className="priv-row relative pl-5 py-12 border-t border-[#1C2535]
                   scroll-mt-28 transition-all duration-200"
        style={{ "--section-accent": accent } as React.CSSProperties}
      >
        <div className="flex items-center gap-4 mb-5">
          <span
            className="priv-num text-[#1C2535] leading-none transition-colors duration-300"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(34px, 4vw, 54px)",
            }}
          >
            {num}
          </span>
          <span
            className="text-[0.6rem] tracking-[0.18em] uppercase px-2 py-0.5"
            style={{
              fontFamily: "var(--font-jb-mono)",
              color: accent,
              border: `1px solid ${accent}44`,
            }}
          >
            {tag}
          </span>
        </div>
        <h2
          className="text-[#E8E4D9] leading-tight tracking-tight mb-6"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(28px, 4vw, 50px)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </RevealSection>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export function PrivacyContent({ fontVars }: Props) {
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
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSection(
              (e.target as HTMLElement).dataset.sectionId ?? null
            );
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, []);

  const scrollTo = (slug: string) => {
    document
      .getElementById(`section-${slug}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #06080F; }
        ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 0; }

        .priv-root { cursor: crosshair; }

        .priv-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }
        .priv-root::after {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px
          );
          pointer-events: none; z-index: 9998;
        }

        .hero-dot-grid::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(0,212,255,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }

        .priv-row::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--section-accent);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.35s ease;
        }
        .priv-row:hover::before { transform: scaleY(1); }
        .priv-row:hover .priv-num { color: var(--section-accent) !important; }

        .toc-item.toc-active {
          color: #00D4FF !important;
          border-left-color: #00D4FF !important;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBlink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes tickerMove {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes borderPulse {
          0%,100% { border-color: #1C2535; }
          50%     { border-color: #00D4FF; box-shadow: 0 0 18px rgba(0,212,255,0.2); }
        }
      `}</style>

      <main
        className={`priv-root relative bg-[#06080F] text-[#E8E4D9] overflow-x-clip ${fontVars}`}
        style={{ fontFamily: "var(--font-syne)" }}
      >

        {/* ══ NAV ══ */}
        <nav
          className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between
                      px-6 md:px-12 py-5 bg-[#06080F]/85 backdrop-blur-xl
                      border-b border-[#1C2535] transition-transform duration-300
                      ${navHidden ? "-translate-y-full" : "translate-y-0"}`}
        >
          <Link
            href="/"
            className="text-[#00D4FF] hover:text-[#E8E4D9] transition-colors text-[1.7rem] tracking-[0.05em]"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            ⚡ <span className="text-[#E8E4D9]">Cryptic</span> Daily
          </Link>
          <Link
            href="/contact"
            className="text-[0.7rem] tracking-[0.15em] uppercase border border-[#1C2535]
                       px-4 py-2 text-[#6B7280]
                       hover:border-[#00D4FF] hover:text-[#00D4FF] transition-all duration-200"
            style={{ fontFamily: "var(--font-jb-mono)" }}
          >
            Contact Us →
          </Link>
        </nav>

        {/* ══ HERO ══ */}
        <section
          className="hero-dot-grid relative min-h-[70vh] flex flex-col
                     justify-end px-6 md:px-12 pb-20 pt-36 overflow-hidden"
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       whitespace-nowrap select-none pointer-events-none z-0
                       text-transparent leading-none"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(80px, 14vw, 240px)",
              WebkitTextStroke: "1px rgba(0,212,255,0.06)",
              letterSpacing: "-0.02em",
            }}
            aria-hidden
          >
            PRIVACY
          </div>

          <div
            className="absolute top-0 right-[28%] w-px h-full pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(124,58,237,0.15) 40%, rgba(0,212,255,0.12) 70%, transparent)",
            }}
            aria-hidden
          />

          <div
            className="relative z-10 max-w-4xl"
            style={{ animation: "fadeUp 1s ease both" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span
                className="w-2 h-2 rounded-full bg-[#00D4FF]"
                style={{ animation: "dotBlink 1.2s ease infinite" }}
              />
              <span
                className="text-[#00D4FF] text-[0.72rem] tracking-[0.25em] uppercase"
                style={{ fontFamily: "var(--font-jb-mono)" }}
              >
                EFFECTIVE: 1 APR 2025 &nbsp;·&nbsp; UPDATED: MARCH 2026 &nbsp;·&nbsp; CRYPTICDAILY.COM
              </span>
            </div>

            <h1
              className="text-[#E8E4D9] leading-[0.9] tracking-tight mb-6"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(60px, 9.5vw, 136px)",
              }}
            >
              Privacy
              <br />
              <span className="text-[#00D4FF]">Policy</span>
              <br />
              <em
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontStyle: "italic",
                  color: "#FFE600",
                  fontSize: "0.78em",
                }}
              >
                crypticdaily.com
              </em>
            </h1>

            <div className="w-full h-px bg-[#1C2535] mb-6" />

            <p
              className="text-[rgba(232,228,217,0.5)] text-[0.9rem] leading-[1.7]
                         border-l-2 border-[#1C2535] pl-4 max-w-xl"
            >
              This Privacy Policy explains what data Cryptic Daily collects, why
              we collect it, how it is used, and your rights in relation to it.
              We do not sell your personal data.
            </p>
          </div>

        </section>

        {/* ══ TICKER ══ */}
        <div className="overflow-hidden whitespace-nowrap bg-[#0D1118] border-y border-[#1C2535] py-2.5">
          <div
            className="inline-block"
            style={{ animation: "tickerMove 28s linear infinite" }}
          >
            {[
              { sym: "BTC", price: "$67,234", change: "▲ 2.4%", up: true  },
              { sym: "ETH", price: "$3,812",  change: "▲ 1.8%", up: true  },
              { sym: "SOL", price: "$178.40", change: "▼ 0.9%", up: false },
              { sym: "BNB", price: "$412.00", change: "▲ 0.5%", up: true  },
              { sym: "ADA", price: "$0.61",   change: "▼ 1.2%", up: false },
              { sym: "XRP", price: "$0.88",   change: "▲ 3.1%", up: true  },
              { sym: "BTC", price: "$67,234", change: "▲ 2.4%", up: true  },
              { sym: "ETH", price: "$3,812",  change: "▲ 1.8%", up: true  },
              { sym: "SOL", price: "$178.40", change: "▼ 0.9%", up: false },
              { sym: "BNB", price: "$412.00", change: "▲ 0.5%", up: true  },
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mr-12">
                <span
                  className="text-[#00D4FF] font-medium text-[0.75rem] tracking-[0.04em]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  {item.sym}
                </span>
                <span
                  className="text-[#E8E4D9] text-[0.75rem]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  {item.price}
                </span>
                <span
                  className={`text-[0.75rem] ${item.up ? "text-[#10B981]" : "text-[#EF4444]"}`}
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  {item.change}
                </span>
                <span className="text-[#1C2535] mx-6">|</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══ TWO-COLUMN LAYOUT ══ */}
        <div
          className="max-w-[1400px] mx-auto px-6 md:px-12 py-16
                     flex flex-col lg:flex-row gap-12 lg:gap-20"
        >

          {/* ── STICKY TOC SIDEBAR ── */}
          <aside className="lg:w-[280px] flex-shrink-0">
            <div className="lg:sticky lg:top-28">
              <SectionTag label="Contents" />
              <nav className="space-y-0">
                {TOC.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => scrollTo(item.slug)}
                    className={`toc-item w-full text-left flex items-center gap-3
                                border-l-2 pl-3 py-2.5 cursor-pointer
                                transition-all duration-200
                                ${
                                  activeSection === item.slug
                                    ? "toc-active border-[#00D4FF] text-[#00D4FF]"
                                    : "border-[#1C2535] text-[#6B7280] hover:text-[#E8E4D9]"
                                }`}
                  >
                    <span
                      className="text-[0.58rem] tracking-[0.12em] flex-shrink-0 w-6"
                      style={{ fontFamily: "var(--font-jb-mono)" }}
                    >
                      {item.num}
                    </span>
                    <span
                      className="text-[0.78rem] leading-[1.4]"
                      style={{ fontFamily: "var(--font-syne)" }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-[#1C2535] space-y-2">
                {[
                  ["Effective",  "1 Apr 2025"],
                  ["Updated",    "March 2026"],
                  ["Controller", "Cryptic Daily"],
                  ["Applies to", "crypticdaily.com"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span
                      className="text-[#6B7280] text-[0.65rem] tracking-[0.1em] uppercase"
                      style={{ fontFamily: "var(--font-jb-mono)" }}
                    >
                      {k}
                    </span>
                    <span
                      className="text-[#E8E4D9] text-[0.65rem] tracking-[0.05em] text-right"
                      style={{ fontFamily: "var(--font-jb-mono)" }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              {/* data request CTA */}
              <div className="mt-8">
                <a
                  href="mailto:hello@crypticdaily.com?subject=Data Request"
                  className="block border border-[#1C2535] bg-[#0D1118] px-4 py-3
                             hover:border-[#00D4FF] transition-all duration-200 group"
                  style={{ animation: "borderPulse 5s ease infinite" }}
                >
                  <p
                    className="text-[#00D4FF] text-[0.65rem] tracking-[0.18em] uppercase mb-1
                               group-hover:text-[#FFE600] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-jb-mono)" }}
                  >
                    Submit data request ↗
                  </p>
                  <p
                    className="text-[#6B7280] text-[0.7rem]"
                    style={{ fontFamily: "var(--font-jb-mono)" }}
                  >
                    hello@crypticdaily.com
                  </p>
                </a>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 space-y-0">

            {/* 01 — Overview */}
            <Section slug="overview" num="01" tag="OVERVIEW" title="Overview" accent="#00D4FF">
              <P>
                Cryptic Daily ("we", "us", "our") is an independent digital media
                publication covering cryptocurrency markets, blockchain technology,
                decentralised finance, Web3, NFTs, and related topics. The website
                is operated by Cryptic Daily and is available at{" "}
                <A href="https://crypticdaily.com">crypticdaily.com</A>.
              </P>
              <P>
                This Privacy Policy applies to all visitors of crypticdaily.com. It
                describes the personal data we collect, the legal basis for
                processing it, who we share it with, and the rights available to you
                under applicable data protection law — including the EU General Data
                Protection Regulation (GDPR) and UK GDPR.
              </P>
              <div
                className="border-l-2 border-[#00D4FF] bg-[rgba(0,212,255,0.04)]
                           px-5 py-4 mt-4"
              >
                <P>
                  <strong className="text-[#E8E4D9]">We do not sell your personal data.</strong>{" "}
                  We do not share your personal data with third parties for their own
                  marketing purposes. Data collected by third-party services used on
                  this site (listed in Section 03) is governed by their own privacy
                  policies.
                </P>
              </div>
            </Section>

            {/* 02 — What We Collect */}
            <Section slug="collect" num="02" tag="DATA COLLECTION" title="What Data We Collect" accent="#7C3AED">
              <P>
                Cryptic Daily collects minimal data. Below is a precise and complete
                account of what is collected and why.
              </P>

              <SubLabel>Data you provide directly</SubLabel>
              <DotList
                color="cyan"
                items={[
                  "Email address — if you subscribe to our newsletter via the subscription form. This is stored in our Supabase database.",
                  "Name and message — if you contact us via email. These are processed only for the purpose of responding to your enquiry and are not stored in any database.",
                ]}
              />

              <SubLabel>Data collected automatically when you visit</SubLabel>
              <DotList
                color="muted"
                items={[
                  "IP address — collected by Vercel (our hosting provider) for server-side request routing and security purposes. Vercel does not provide us with access to raw IP logs.",
                  "Browser type, device type, operating system, and screen resolution — collected by Google Analytics 4 in anonymised form.",
                  "Pages visited, time on page, scroll depth, and referral source — collected by Google Analytics 4 to help us understand which content is useful.",
                  "General geographic location (country and city level only, not precise location) — derived from your IP address by Google Analytics 4.",
                  "Article slugs viewed — stored anonymously in our Supabase database as an integer view count per article. We do not store which user viewed which article.",
                ]}
              />

              <SubLabel>Data we do NOT collect</SubLabel>
              <DotList
                color="red"
                items={[
                  "We do not collect names, account credentials, or authentication data. There is currently no user login on Cryptic Daily.",
                  "We do not collect payment information of any kind.",
                  "We do not collect precise geolocation data.",
                  "We do not build individual user profiles or track users across other websites.",
                  "We do not collect data from children. See Section 11.",
                ]}
              />
            </Section>

            {/* 03 — Third-Party Services */}
            <Section slug="services" num="03" tag="VENDORS" title="Third-Party Services We Use" accent="#10B981">
              <P>
                Cryptic Daily uses the following third-party services to operate. Each
                service processes data according to its own privacy policy. We have
                linked to each for your reference.
              </P>
              <div className="mt-5">
                <ServiceCard
                  name="Sanity.io"
                  role="Headless CMS — stores and delivers all editorial content (articles, authors, categories, images). Sanity does not process visitor data."
                  link="https://sanity.io"
                  privacy="https://www.sanity.io/legal/privacy"
                  accent="#00D4FF"
                />
                <ServiceCard
                  name="CoinGecko API"
                  role="Provides live and historical cryptocurrency market data (prices, market cap, volume). API requests are made server-side from Vercel. CoinGecko does not receive your IP address or browser data."
                  link="https://coingecko.com"
                  privacy="https://www.coingecko.com/en/privacy"
                  accent="#10B981"
                />
                <ServiceCard
                  name="Supabase"
                  role="PostgreSQL database used to store newsletter subscriber email addresses and anonymous article view counts. Hosted on AWS infrastructure. Subject to GDPR-compliant data processing agreements."
                  link="https://supabase.com"
                  privacy="https://supabase.com/privacy"
                  accent="#3ECF8E"
                />
                <ServiceCard
                  name="Vercel"
                  role="Hosting and content delivery platform. Serves all pages of crypticdaily.com via a global edge network. Processes server request logs including IP addresses for routing and security. Data is retained for a limited period per Vercel's policy."
                  link="https://vercel.com"
                  privacy="https://vercel.com/legal/privacy-policy"
                  accent="#E8E4D9"
                />
                <ServiceCard
                  name="Google Analytics 4"
                  role="Web analytics service. Collects anonymised usage data including pages visited, device type, and approximate location. We have enabled IP anonymisation. Data is processed in the EU where possible. See Section 04 for full detail and opt-out instructions."
                  link="https://analytics.google.com"
                  privacy="https://policies.google.com/privacy"
                  accent="#EA4335"
                />
                <ServiceCard
                  name="Google AdSense"
                  role="Third-party advertising service. Displays contextual ads on editorial pages. May use cookies and device identifiers to serve relevant ads. You can manage ad personalisation preferences via Google's ad settings. See Section 05 for full detail."
                  link="https://adsense.google.com"
                  privacy="https://policies.google.com/privacy"
                  accent="#FBBC04"
                />
              </div>
            </Section>

            {/* 04 — Analytics */}
            <Section slug="analytics" num="04" tag="ANALYTICS" title="Analytics (Google Analytics 4)" accent="#EA4335">
              <P>
                We use Google Analytics 4 (GA4) to understand how visitors use
                Cryptic Daily. This helps us improve our content and identify
                technical issues.
              </P>
              <SubLabel>What GA4 collects on our behalf</SubLabel>
              <DotList
                color="muted"
                items={[
                  "Pages visited and navigation paths through the site.",
                  "Time spent on each page and scroll depth.",
                  "Device type, operating system, and browser.",
                  "Country and city of visit (derived from anonymised IP address).",
                  "Traffic source — whether you arrived via search, social media, direct URL, or a link.",
                ]}
              />
              <SubLabel>How we have configured GA4</SubLabel>
              <DotList
                color="green"
                items={[
                  "IP anonymisation is enabled. Your full IP address is not stored by Google Analytics.",
                  "We do not use GA4 for advertising or remarketing purposes.",
                  "We do not share GA4 data with other Google products.",
                  "Data retention in GA4 is set to 14 months.",
                ]}
              />
              <SubLabel>Legal basis</SubLabel>
              <P>
                We rely on <strong className="text-[#E8E4D9]">legitimate interests</strong> (Article 6(1)(f) GDPR) for analytics
                processing — specifically our interest in understanding how our
                content performs in order to improve it. This interest does not
                override your rights, as the data is anonymised and not used for
                profiling or advertising.
              </P>
              <SubLabel>How to opt out</SubLabel>
              <P>
                You can opt out of Google Analytics tracking across all websites by
                installing the{" "}
                <A href="https://tools.google.com/dlpage/gaoptout">
                  Google Analytics Opt-out Browser Add-on
                </A>
                . You can also block GA4 by using a browser extension such as uBlock
                Origin, or by enabling the Do Not Track header in your browser
                settings.
              </P>
            </Section>

            {/* 05 — Advertising */}
            <Section slug="advertising" num="05" tag="ADVERTISING" title="Advertising (Google AdSense)" accent="#FBBC04">
              <P>
                Cryptic Daily displays advertisements served by Google AdSense.
                AdSense uses cookies and similar technologies to serve ads that are
                relevant to your interests based on your browsing activity.
              </P>
              <SubLabel>How AdSense works</SubLabel>
              <DotList
                color="muted"
                items={[
                  "Google AdSense places cookies on your device when you visit pages of crypticdaily.com that display ads.",
                  "These cookies may track your browsing activity across other websites to build an interest profile used for ad targeting.",
                  "This is processed by Google, not by Cryptic Daily directly. We do not have access to the individual-level data that Google collects for ad targeting.",
                  "Ads displayed on this site are not an endorsement of the advertised product or service by Cryptic Daily.",
                ]}
              />
              <SubLabel>Legal basis</SubLabel>
              <P>
                Where ad personalisation is enabled, the legal basis is your{" "}
                <strong className="text-[#E8E4D9]">consent</strong> (Article 6(1)(a) GDPR). You can
                withdraw consent at any time using the options below. Non-personalised
                ads may still be shown based on page content rather than user data.
              </P>
              <SubLabel>How to manage or opt out of ad personalisation</SubLabel>
              <DotList
                color="cyan"
                items={[
                  "Visit Google's Ad Settings at adssettings.google.com to review and manage your ad personalisation preferences.",
                  "Visit the Network Advertising Initiative opt-out page at optout.networkadvertising.org.",
                  "Visit the Digital Advertising Alliance opt-out page at optout.aboutads.info.",
                  "Use a browser extension such as uBlock Origin to block third-party ad trackers entirely.",
                ]}
              />
            </Section>

            {/* 06 — Cookies */}
            <Section slug="cookies" num="06" tag="COOKIES" title="Cookies" accent="#7C3AED">
              <P>
                Cookies are small text files stored on your device by your browser.
                Cryptic Daily uses the following categories of cookies. We do not use
                cookies for purposes beyond those listed here.
              </P>
              <div className="mt-4">
                <CookieRow
                  name="GA4 Analytics"
                  type="Third-party / Analytics"
                  purpose="Google Analytics 4 uses cookies (_ga, _ga_XXXXXX) to distinguish users and track session data in anonymised form."
                  duration="Up to 2 years"
                  accent="#EA4335"
                />
                <CookieRow
                  name="AdSense"
                  type="Third-party / Advertising"
                  purpose="Google AdSense uses cookies (IDE, DSID, and others) to serve personalised ads based on your browsing activity."
                  duration="Up to 1 year"
                  accent="#FBBC04"
                />
                <CookieRow
                  name="Vercel"
                  type="Functional / Security"
                  purpose="Vercel may set session-level cookies for edge routing, caching, and DDoS protection. These do not contain personal data."
                  duration="Session"
                  accent="#E8E4D9"
                />
              </div>
              <SubLabel>How to manage cookies</SubLabel>
              <P>
                You can control and delete cookies through your browser settings. The
                following links provide instructions for the most common browsers:{" "}
                <A href="https://support.google.com/chrome/answer/95647">Chrome</A>,{" "}
                <A href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop">Firefox</A>,{" "}
                <A href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac">Safari</A>,{" "}
                <A href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">Edge</A>.
                Disabling all cookies may affect the functionality of some website
                features.
              </P>
            </Section>

            {/* 07 — Newsletter */}
            <Section slug="newsletter" num="07" tag="EMAIL" title="Newsletter Subscriptions" accent="#00D4FF">
              <P>
                If you subscribe to the Cryptic Daily newsletter, we collect and
                store your email address.
              </P>
              <SubLabel>What we store</SubLabel>
              <DotList
                color="cyan"
                items={[
                  "Your email address.",
                  "The timestamp of your subscription.",
                ]}
              />
              <SubLabel>Where it is stored</SubLabel>
              <P>
                Email addresses are stored in a Supabase PostgreSQL database hosted
                on AWS infrastructure. Supabase is contractually bound to process
                this data in accordance with GDPR under a Data Processing Agreement.
              </P>
              <SubLabel>Legal basis</SubLabel>
              <P>
                Your{" "}
                <strong className="text-[#E8E4D9]">consent</strong> (Article 6(1)(a) GDPR) — by
                submitting the subscription form you consent to receiving our
                newsletter. You can withdraw consent at any time.
              </P>
              <SubLabel>How to unsubscribe</SubLabel>
              <P>
                Click the unsubscribe link in any newsletter email, or contact us at{" "}
                <A href="mailto:hello@crypticdaily.com">hello@crypticdaily.com</A>{" "}
                with the subject line "Unsubscribe" and we will remove your address
                within 5 business days. Once removed, your email address is
                permanently deleted from our database.
              </P>
            </Section>

            {/* 08 — View Counts */}
            <Section slug="views" num="08" tag="ANONYMOUS DATA" title="Article View Counts" accent="#10B981">
              <P>
                When you visit an article page, a fire-and-forget request increments
                an anonymous integer counter for that article stored in our Supabase
                database. This counter is used to surface trending articles in the
                sidebar.
              </P>
              <P>
                This request records only the article slug (the URL identifier) and
                increments the count by one. It does not record your IP address,
                browser data, session ID, or any information that could identify you.
                There is no way to connect a view count increment to an individual
                visitor.
              </P>
              <P>
                This processing does not require a legal basis under GDPR as it does
                not constitute processing of personal data.
              </P>
            </Section>

            {/* 09 — Your Rights */}
            <Section slug="rights" num="09" tag="YOUR RIGHTS" title="Your Rights" accent="#FFE600">
              <P>
                If you are located in the European Union, United Kingdom, or another
                jurisdiction with comprehensive data protection law, you have the
                following rights in relation to personal data we hold about you.
              </P>
              <div className="mt-5">
                <RightCard label="Art. 15" title="Right of Access" accent="#00D4FF"
                  desc="You have the right to request a copy of the personal data we hold about you and information about how we process it." />
                <RightCard label="Art. 16" title="Right to Rectification" accent="#7C3AED"
                  desc="You have the right to request that we correct any inaccurate personal data we hold about you." />
                <RightCard label="Art. 17" title="Right to Erasure" accent="#10B981"
                  desc="You have the right to request deletion of your personal data. For newsletter subscribers, this means deletion of your email address from our database." />
                <RightCard label="Art. 18" title="Right to Restriction" accent="#FFE600"
                  desc="You have the right to request that we restrict processing of your data while a complaint is being investigated." />
                <RightCard label="Art. 20" title="Right to Data Portability" accent="#00D4FF"
                  desc="Where processing is based on consent and carried out by automated means, you have the right to receive your data in a structured, machine-readable format." />
                <RightCard label="Art. 21" title="Right to Object" accent="#EF4444"
                  desc="You have the right to object to processing based on legitimate interests (such as analytics). Where you object, we will cease processing unless we have compelling legitimate grounds." />
                <RightCard label="Art. 7(3)" title="Right to Withdraw Consent" accent="#10B981"
                  desc="Where processing is based on your consent (newsletter, ad personalisation), you can withdraw that consent at any time without affecting the lawfulness of prior processing." />
              </div>
              <P>
                To exercise any of these rights, contact us at{" "}
                <A href="mailto:hello@crypticdaily.com?subject=Data Request">
                  hello@crypticdaily.com
                </A>{" "}
                with the subject line "Data Request". We will respond within 30
                days. If you are unsatisfied with our response, you have the right to
                lodge a complaint with your local data protection authority.
              </P>
            </Section>

            {/* 10 — Retention */}
            <Section slug="retention" num="10" tag="RETENTION" title="Data Retention" accent="#00D4FF">
              <P>
                We retain personal data only for as long as necessary for the purpose
                it was collected.
              </P>
              <div className="mt-4 space-y-0">
                {[
                  { label: "Newsletter email addresses", detail: "Until you unsubscribe. Deleted permanently on unsubscription.", accent: "#00D4FF" },
                  { label: "Google Analytics 4 data", detail: "14 months, as configured in our GA4 property settings.", accent: "#EA4335" },
                  { label: "Vercel server request logs", detail: "Retained per Vercel's standard policy (typically up to 30 days for edge logs). We do not control this retention.", accent: "#E8E4D9" },
                  { label: "Article view counts", detail: "Stored indefinitely as anonymous integers. Not personal data.", accent: "#10B981" },
                  { label: "Contact enquiries sent by email", detail: "Retained in our email inbox for as long as operationally necessary, then deleted. Not stored in any database.", accent: "#7C3AED" },
                ].map((row) => (
                  <div key={row.label}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-6 py-4
                               border-t border-[#1C2535]
                               hover:bg-[rgba(0,212,255,0.02)] transition-colors duration-200">
                    <span className="text-[0.7rem] tracking-[0.1em] uppercase flex-shrink-0 sm:w-56 pt-0.5"
                      style={{ fontFamily: "var(--font-jb-mono)", color: row.accent }}>
                      {row.label}
                    </span>
                    <span className="text-[#9CA3AF] text-[0.88rem] leading-[1.7]">{row.detail}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* 11 — Children */}
            <Section slug="children" num="11" tag="CHILDREN" title="Children's Privacy" accent="#EF4444">
              <P>
                Cryptic Daily is not directed at children under the age of 16 and we
                do not knowingly collect personal data from anyone under 16.
              </P>
              <P>
                If you are a parent or guardian and believe your child has provided
                us with personal data — for example by subscribing to our newsletter
                — please contact us at{" "}
                <A href="mailto:hello@crypticdaily.com">hello@crypticdaily.com</A>{" "}
                and we will delete that data promptly.
              </P>
            </Section>

            {/* 12 — Changes */}
            <Section slug="changes" num="12" tag="UPDATES" title="Changes to This Policy" accent="#7C3AED">
              <P>
                We may update this Privacy Policy from time to time to reflect
                changes in our services, the technology we use, or applicable law.
                When we make material changes, we will update the "last updated" date
                at the top of this page.
              </P>
              <P>
                We will not reduce your rights under this Privacy Policy without
                obtaining your consent where required. Your continued use of Cryptic
                Daily after any update constitutes acceptance of the revised policy.
                We encourage you to review this page periodically.
              </P>
              <div className="border border-[#1C2535] bg-[#0D1118] px-5 py-4 mt-4">
                <p className="text-[#6B7280] text-[0.65rem] tracking-[0.15em] uppercase mb-2"
                  style={{ fontFamily: "var(--font-jb-mono)" }}>Version history</p>
                {[
                  ["March 2026", "Updated third-party service list to reflect actual stack (Sanity, CoinGecko, Supabase, Vercel, GA4, AdSense). Added cookie table and GDPR rights detail."],
                  ["1 Apr 2025", "Initial policy published."],
                ].map(([date, note]) => (
                  <div key={date} className="flex gap-6 py-2.5 border-t border-[#1C2535]">
                    <span className="text-[#00D4FF] text-[0.68rem] tracking-[0.08em] flex-shrink-0 w-28"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{date}</span>
                    <span className="text-[#6B7280] text-[0.82rem] leading-[1.6]">{note}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* 13 — Contact */}
            <Section slug="contact" num="13" tag="CONTACT" title="Contact & Data Requests" accent="#10B981">
              <P>
                If you have any questions about this Privacy Policy, wish to exercise
                your data rights, or want to report a concern about how we handle
                data, please contact us:
              </P>
              <div className="mt-5 space-y-2">
                {[
                  ["General privacy questions", "hello@crypticdaily.com",     "Privacy Query"],
                  ["Data access / deletion",    "hello@crypticdaily.com",     "Data Request"],
                  ["Editorial corrections",     "editorial@crypticdaily.com", "Error Report"],
                ].map(([label, email, subject]) => (
                  <div key={label}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6
                               border border-[#1C2535] bg-[#0D1118] px-5 py-3
                               hover:border-[#00D4FF] group transition-all duration-200">
                    <span className="text-[#6B7280] text-[0.68rem] tracking-[0.18em] uppercase sm:w-52 flex-shrink-0"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{label}</span>
                    <a href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
                      className="text-[#00D4FF] text-[0.82rem] tracking-[0.05em]
                                 group-hover:text-[#FFE600] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-jb-mono)" }}>{email}</a>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-l-2 border-[#1C2535] pl-4">
                <P>
                  We aim to respond to all data-related requests within 30 days. For
                  complex requests we may extend this period by a further 60 days, in
                  which case we will notify you within the initial 30-day window. If
                  you are not satisfied with our response, you have the right to
                  complain to your local supervisory authority. In the EU, you can
                  find your national data protection authority at{" "}
                  <A href="https://edpb.europa.eu/about-edpb/about-edpb/members_en">edpb.europa.eu</A>.
                </P>
              </div>
            </Section>

            {/* end spacer */}
            <div className="py-12 border-t border-[#1C2535]">
              <p className="text-[#6B7280] text-[0.72rem] tracking-[0.12em]"
                style={{ fontFamily: "var(--font-jb-mono)" }}>
                END OF PRIVACY POLICY &nbsp;·&nbsp; CRYPTICDAILY.COM &nbsp;·&nbsp;
                © 2026 CRYPTIC DAILY &nbsp;·&nbsp; LAST UPDATED MARCH 2026
              </p>
            </div>
          </main>
        </div>

        {/* ══ FOOTER STRIP ══ */}
        <footer
          className="border-t border-[#1C2535] px-6 md:px-12 py-6
                     flex flex-col md:flex-row justify-between items-center gap-3"
        >
          <span className="text-[#6B7280] text-[0.68rem] tracking-[0.1em]"
            style={{ fontFamily: "var(--font-jb-mono)" }}>
            © 2026 CRYPTIC DAILY &nbsp;·&nbsp; ALL RIGHTS RESERVED &nbsp;·&nbsp; CRYPTICDAILY.COM
          </span>
          <div className="flex items-center gap-6">
            {["About", "Contact", "Terms", "Editorial Policy"].map((label) => (
              <Link key={label}
                href={`/${label.toLowerCase().replace(" ", "-")}`}
                className="text-[#6B7280] hover:text-[#00D4FF] text-[0.65rem]
                           tracking-[0.12em] uppercase transition-colors duration-200"
                style={{ fontFamily: "var(--font-jb-mono)" }}>
                {label}
              </Link>
            ))}
            <span className="text-[#1C2535] text-[1rem] tracking-[0.15em]"
              style={{ fontFamily: "var(--font-bebas)" }}>
              ⚡ CRYPTIC DAILY
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
