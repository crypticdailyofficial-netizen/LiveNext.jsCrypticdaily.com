"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Props {
  fontVars: string;
}

/* ─── Table of contents ──────────────────────────────────────────────────── */
const TOC = [
  { num: "01", slug: "mission", label: "Our Editorial Mission" },
  { num: "02", slug: "sourcing", label: "How We Source & Report" },
  { num: "03", slug: "factcheck", label: "Fact-Checking Standards" },
  { num: "04", slug: "authors", label: "Author Qualifications" },
  { num: "05", slug: "independence", label: "Editorial Independence" },
  { num: "06", slug: "disclaimer", label: "Financial Content Disclaimer" },
  { num: "07", slug: "updates", label: "Updates & Review Policy" },
  { num: "08", slug: "corrections", label: "Corrections & Clarifications" },
  { num: "09", slug: "report", label: "Report an Error" },
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
      className="text-[#00D4FF] hover:text-[#FFE600] transition-colors duration-200
                 underline underline-offset-2"
    >
      {children}
    </a>
  );
}
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 mb-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span
            className="flex-shrink-0 mt-1 text-[#00D4FF] text-[0.7rem]"
            style={{ fontFamily: "var(--font-jb-mono)" }}
          >
            ✓
          </span>
          <span className="text-[#9CA3AF] text-[0.93rem] leading-[1.8]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
function DotList({
  items,
  color = "muted",
}: {
  items: string[];
  color?: "cyan" | "red" | "yellow" | "muted";
}) {
  const dot: Record<string, string> = {
    cyan: "bg-[#00D4FF]",
    red: "bg-[#EF4444]",
    yellow: "bg-[#FFE600]",
    muted: "bg-[#1C2535]",
  };
  return (
    <ul className="mt-3 mb-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span
            className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[0.47rem] ${dot[color]}`}
          />
          <span className="text-[#9CA3AF] text-[0.93rem] leading-[1.8]">
            {item}
          </span>
        </li>
      ))}
    </ul>
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

/* ─── Correction severity card ───────────────────────────────────────────── */
function CorrectionCard({
  level,
  color,
  title,
  desc,
}: {
  level: string;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="border border-[#1C2535] bg-[#0D1118] px-5 py-4 mb-3
                 hover:border-opacity-60 transition-all duration-200"
      style={{ borderLeftColor: color, borderLeftWidth: "2px" }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-[0.6rem] tracking-[0.18em] uppercase px-2 py-0.5"
          style={{
            fontFamily: "var(--font-jb-mono)",
            color,
            border: `1px solid ${color}44`,
          }}
        >
          {level}
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

/* ─── Principle row ──────────────────────────────────────────────────────── */
function PrincipleRow({ num, text }: { num: string; text: string }) {
  return (
    <div
      className="flex gap-5 py-4 border-t border-[#1C2535] group cursor-default
                    hover:bg-[rgba(0,212,255,0.02)] transition-colors duration-200"
    >
      <span
        className="flex-shrink-0 text-[#1C2535] leading-none pt-0.5
                   group-hover:text-[#00D4FF] transition-colors duration-300"
        style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem" }}
      >
        {num}
      </span>
      <p className="text-[#9CA3AF] text-[0.93rem] leading-[1.8] pt-0.5">
        {text}
      </p>
    </div>
  );
}

/* ─── Checklist verification item ───────────────────────────────────────── */
function VerifyItem({ text }: { text: string }) {
  return (
    <div
      className="flex gap-4 py-3.5 border-t border-[#1C2535] group cursor-default
                    hover:bg-[rgba(0,212,255,0.02)] transition-colors duration-200"
    >
      <span
        className="flex-shrink-0 text-[#1C2535] group-hover:text-[#00D4FF]
                   transition-colors duration-300 text-[0.72rem] tracking-[0.12em] pt-1"
        style={{ fontFamily: "var(--font-jb-mono)" }}
      >
        [✓]
      </span>
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
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.06 },
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
        className="ed-row relative pl-5 py-12 border-t border-[#1C2535] scroll-mt-28
                   transition-all duration-200"
        style={{ "--section-accent": accent } as React.CSSProperties}
      >
        {/* top meta row */}
        <div className="flex items-center gap-4 mb-5">
          <span
            className="ed-num text-[#1C2535] leading-none transition-colors duration-300"
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

        {/* section heading */}
        <h2
          className="text-[#E8E4D9] leading-tight tracking-tight mb-6"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(30px, 4vw, 52px)",
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
export function EditorialContent({ fontVars }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const headings = document.querySelectorAll("[data-section-id]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActiveSection(
              (e.target as HTMLElement).dataset.sectionId ?? null,
            );
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
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

        .ed-root { cursor: crosshair; }

        /* grain */
        .ed-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }
        /* scanlines */
        .ed-root::after {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px
          );
          pointer-events: none; z-index: 9998;
        }

        /* hero dot grid */
        .hero-dot-grid::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(0,212,255,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }

        /* section row hover accent line */
        .ed-row::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--section-accent);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.35s ease;
        }
        .ed-row:hover::before { transform: scaleY(1); }
        .ed-row:hover .ed-num { color: var(--section-accent) !important; }

        /* toc active */
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
        @keyframes borderPulse {
          0%,100% { border-color: #1C2535; }
          50%     { border-color: #00D4FF; box-shadow: 0 0 18px rgba(0,212,255,0.2); }
        }
      `}</style>

      <main
        className={`ed-root relative bg-[#06080F] text-[#E8E4D9] overflow-x-clip ${fontVars}`}
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {/* ══ HERO ══ */}
        <section
          className="hero-dot-grid relative min-h-[72vh] flex flex-col
                            justify-end px-6 md:px-12 pb-20 pt-36 overflow-hidden"
        >
          {/* ghost bg text */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       whitespace-nowrap select-none pointer-events-none z-0 text-transparent leading-none"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(80px, 14vw, 240px)",
              WebkitTextStroke: "1px rgba(0,212,255,0.06)",
              letterSpacing: "-0.02em",
            }}
            aria-hidden
          >
            EDITORIAL
          </div>

          {/* diagonal accent line */}
          <div
            className="absolute top-0 right-[22%] w-px h-full pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(124,58,237,0.15) 35%, rgba(0,212,255,0.12) 65%, transparent)",
            }}
            aria-hidden
          />

          <div
            className="relative z-10 max-w-4xl"
            style={{ animation: "fadeUp 1s ease both" }}
          >
            {/* eyebrow */}
            <div className="flex items-center gap-4 mb-6">
              <span
                className="w-2 h-2 rounded-full bg-[#00D4FF]"
                style={{ animation: "dotBlink 1.2s ease infinite" }}
              />
              <span
                className="text-[#00D4FF] text-[0.72rem] tracking-[0.25em] uppercase"
                style={{ fontFamily: "var(--font-jb-mono)" }}
              >
                LAST UPDATED: MARCH 2026 &nbsp;·&nbsp; CRYPTIC DAILY
              </span>
            </div>

            {/* headline */}
            <h1
              className="text-[#E8E4D9] leading-[0.9] tracking-tight mb-6"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(60px, 10vw, 144px)",
              }}
            >
              Editorial
              <br />
              <span className="text-[#00D4FF]">Policy</span>
              <br />
              <em
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontStyle: "italic",
                  color: "#FFE600",
                  fontSize: "0.72em",
                }}
              >
                How we do journalism.
              </em>
            </h1>

            <div className="w-full h-px bg-[#1C2535] mb-6" />

            <p
              className="text-[rgba(232,228,217,0.5)] text-[0.9rem] leading-[1.7]
                         border-l-2 border-[#1C2535] pl-4 max-w-xl"
            >
              Our commitment to accurate, clearly sourced, and genuinely useful
              content on crypto markets, blockchain technology, regulation, and
              Web3.
            </p>
          </div>

        </section>

        {/* ══ TWO-COLUMN: TOC sidebar + content ══ */}
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

              {/* meta block */}
              <div className="mt-8 pt-6 border-t border-[#1C2535] space-y-2">
                {[
                  ["Updated", "March 2026"],
                  ["Publisher", "Cryptic Daily"],
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

              {/* quick-report CTA */}
              <div className="mt-8">
                <a
                  href="mailto:editorial@crypticdaily.com?subject=Error Report"
                  className="block border border-[#1C2535] bg-[#0D1118] px-4 py-3
                             hover:border-[#00D4FF] transition-all duration-200 group"
                  style={{ animation: "borderPulse 5s ease infinite" }}
                >
                  <p
                    className="text-[#00D4FF] text-[0.65rem] tracking-[0.18em] uppercase mb-1
                                group-hover:text-[#FFE600] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-jb-mono)" }}
                  >
                    Report an error ↗
                  </p>
                  <p
                    className="text-[#6B7280] text-[0.7rem]"
                    style={{ fontFamily: "var(--font-jb-mono)" }}
                  >
                    editorial@crypticdaily.com
                  </p>
                </a>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 space-y-0">
            {/* ─ 01: Mission ─ */}
            <Section
              slug="mission"
              num="01"
              tag="MISSION"
              title="Our Editorial Mission"
              accent="#00D4FF"
            >
              <P>
                Cryptic Daily exists to make the cryptocurrency and Web3 space
                easier to understand for a broad audience — from curious
                newcomers to active participants in decentralised finance. Our
                goal is to publish accurate, clearly sourced, and genuinely
                useful content on crypto markets, blockchain technology,
                regulation, and the emerging Web3 ecosystem.
              </P>
              <P>
                We hold ourselves to the standards of responsible digital
                journalism. That means being honest about what we know,
                transparent about our sources, quick to correct mistakes, and
                clear about the line between news reporting and opinion.
              </P>
            </Section>

            {/* ─ 02: Sourcing ─ */}
            <Section
              slug="sourcing"
              num="02"
              tag="PROCESS"
              title="How We Source & Report Content"
              accent="#7C3AED"
            >
              <P>
                Every article published on Cryptic Daily is written to inform,
                not to promote. Our editorial process follows these principles:
              </P>
              <div className="mt-2">
                {[
                  "We rely on primary sources wherever possible — official announcements, on-chain data, regulatory filings, verified social media accounts of projects, and direct interviews.",
                  "We cross-reference market data from multiple aggregators (including CoinGecko and CoinMarketCap) before reporting price movements or market statistics.",
                  "We do not publish press releases verbatim. If we cover a project announcement, we verify its claims independently and note where information could not be confirmed.",
                  "We clearly label opinion and analysis pieces as distinct from straight news reporting. Opinion content reflects the views of the named author, not the editorial position of Cryptic Daily.",
                  "We do not accept payment to publish, positively frame, or suppress coverage of any project, token, exchange, or individual.",
                  "We disclose when coverage relates to a project that has an advertising or affiliate relationship with Cryptic Daily.",
                ].map((text, i) => (
                  <PrincipleRow key={i} num={`0${i + 1}`} text={text} />
                ))}
              </div>
            </Section>

            {/* ─ 03: Fact-checking ─ */}
            <Section
              slug="factcheck"
              num="03"
              tag="STANDARDS"
              title="Fact-Checking & Verification Standards"
              accent="#10B981"
            >
              <P>
                Before publishing, every article undergoes an editorial review
                that checks the following:
              </P>
              <div className="mt-2 mb-6">
                {[
                  "All named sources are identified and verifiable.",
                  "Price figures, market cap data, and statistics include a time reference and traceable source.",
                  "On-chain claims (wallet activity, transaction volumes, smart contract behaviour) are verified against block explorers or independent data providers.",
                  "Claims about regulatory status are checked against primary government or regulatory body sources, not third-party summaries alone.",
                  "Headlines accurately reflect the body of the article. We do not use misleading or exaggerated titles to drive clicks.",
                ].map((text, i) => (
                  <VerifyItem key={i} text={text} />
                ))}
              </div>
              <div className="border-l-2 border-[#FFE600] bg-[rgba(255,230,0,0.04)] px-5 py-4">
                <p
                  className="text-[#FFE600] text-[0.68rem] tracking-[0.18em] uppercase mb-2"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  ◈ Developing stories
                </p>
                <P>
                  In fast-moving news situations, we may publish developing
                  stories with clearly marked caveats — for example, "this is a
                  developing story and details may change." We update these
                  articles as confirmed information becomes available and note
                  the revision at the top of the piece.
                </P>
              </div>
            </Section>

            {/* ─ 04: Authors ─ */}
            <Section
              slug="authors"
              num="04"
              tag="ACCOUNTABILITY"
              title="Author Qualifications & Accountability"
              accent="#FFE600"
            >
              <P>
                All content published on Cryptic Daily is attributed to a named
                author. Each author page includes a brief biography describing
                their background and area of focus within the crypto and Web3
                space.
              </P>
              <DotList
                color="cyan"
                items={[
                  "Authors are responsible for the accuracy of their work and must disclose any personal holdings in assets they write about.",
                  "Authors may not write promotional content about projects in which they hold a direct financial interest without explicit disclosure at the top of the article.",
                  "Guest contributors are vetted before publication and held to the same standards as staff writers.",
                  "Anonymous or pseudonymous contributions are not accepted for news and analysis content.",
                ]}
              />
            </Section>

            {/* ─ 05: Independence ─ */}
            <Section
              slug="independence"
              num="05"
              tag="INDEPENDENCE"
              title="Editorial Independence from Advertising"
              accent="#00D4FF"
            >
              <P>
                Cryptic Daily is supported by display advertising, including
                Google AdSense. Advertising relationships have no influence over
                our editorial coverage. Specifically:
              </P>
              <DotList
                color="cyan"
                items={[
                  "Advertisers do not receive advance sight of articles before publication.",
                  "Advertisers cannot request positive coverage, the removal of critical coverage, or changes to editorial content.",
                  "Commercial content — sponsored posts, advertorials, or paid partnerships — is clearly labelled as 'Sponsored' or 'Paid Partnership' and is visually distinct from editorial content.",
                  "Our editorial team operates independently of our commercial team. Coverage decisions are made solely on editorial merit.",
                ]}
              />
              <div className="border-l-2 border-[#1C2535] bg-[#0D1118] px-5 py-4 mt-4">
                <p
                  className="text-[#6B7280] text-[0.68rem] tracking-[0.18em] uppercase mb-2"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  Advertising disclosure
                </p>
                <P>
                  Cryptic Daily displays third-party advertisements served by
                  Google AdSense. The presence of an ad on this site does not
                  constitute an endorsement of the advertiser or their products
                  by Cryptic Daily. For more information, see our{" "}
                  <A href="/privacy-policy">Privacy Policy</A>.
                </P>
              </div>
            </Section>

            {/* ─ 06: Disclaimer ─ */}
            <Section
              slug="disclaimer"
              num="06"
              tag="⚠ IMPORTANT"
              title="Financial Content Disclaimer"
              accent="#EF4444"
            >
              <div className="border-l-2 border-[#EF4444] bg-[rgba(239,68,68,0.04)] px-5 py-5 mb-4">
                <P>
                  Cryptocurrency markets are highly volatile and largely
                  unregulated in many jurisdictions. All content published on
                  Cryptic Daily — including market analysis, price commentary,
                  project coverage, and opinion pieces — is intended for{" "}
                  <strong className="text-[#E8E4D9]">
                    informational and educational purposes only
                  </strong>
                  .
                </P>
                <P>
                  Nothing on Cryptic Daily constitutes financial advice,
                  investment advice, trading advice, or any recommendation to
                  buy, sell, or hold any digital asset. Readers should conduct
                  their own research and, where appropriate, consult a licensed
                  financial adviser before making any investment decisions.
                </P>
                <P>
                  Past price performance cited in articles is not indicative of
                  future results. Cryptic Daily accepts no liability for
                  financial decisions made based on content published on this
                  site.
                </P>
              </div>
            </Section>

            {/* ─ 07: Updates ─ */}
            <Section
              slug="updates"
              num="07"
              tag="MAINTENANCE"
              title="Updates & Review Policy"
              accent="#7C3AED"
            >
              <P>
                The crypto and Web3 landscape moves quickly. We are committed to
                keeping our content accurate over time, not just at the moment
                of publication.
              </P>
              <DotList
                color="muted"
                items={[
                  "Articles about ongoing regulatory developments, active legal cases, or live market events are reviewed and updated as the situation evolves.",
                  "When an article is meaningfully updated after publication, we note the most recent update date at the top of the article alongside the original publish date.",
                  "Older evergreen content is periodically reviewed to ensure data, statistics, and regulatory references remain accurate.",
                  "We do not silently alter the meaning or substance of a published article without noting that a correction or update has been made.",
                ]}
              />
            </Section>

            {/* ─ 08: Corrections ─ */}
            <Section
              slug="corrections"
              num="08"
              tag="CORRECTIONS"
              title="Corrections & Clarifications"
              accent="#FFE600"
            >
              <P>
                We make mistakes. When we do, we fix them promptly, honestly,
                and visibly.
              </P>
              <div className="mt-5 space-y-0">
                <CorrectionCard
                  level="Minor"
                  color="#6B7280"
                  title="Spelling, Formatting, Minor Factual Errors"
                  desc="Corrected without a formal note where errors do not affect the substance of the article."
                />
                <CorrectionCard
                  level="Substantive"
                  color="#FFE600"
                  title="Errors Affecting Meaning or Reported Facts"
                  desc="Marked with a clearly dated correction notice at the top or bottom of the article explaining what was wrong and what has been changed."
                />
                <CorrectionCard
                  level="Serious"
                  color="#EF4444"
                  title="Significant Misrepresentation"
                  desc="May result in an article being unpublished pending review. If unpublished, a brief note is left at the original URL explaining why."
                />
              </div>
              <div className="mt-4 border border-[#1C2535] bg-[#0D1118] px-5 py-4">
                <p
                  className="text-[#6B7280] text-[0.68rem] tracking-[0.15em] uppercase mb-2"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  Content removal policy
                </p>
                <P>
                  We do not delete coverage of a project or individual simply
                  because they have requested it. Removal of accurate published
                  content requires a documented editorial reason.
                </P>
              </div>
            </Section>

            {/* ─ 09: Report ─ */}
            <Section
              slug="report"
              num="09"
              tag="CONTACT"
              title="How to Report an Error or Concern"
              accent="#10B981"
            >
              <P>
                If you believe something we have published is inaccurate,
                misleading, or in need of correction, please contact us. We take
                all such reports seriously and aim to respond within 5 business
                days.
              </P>

              {/* contact card */}
              <a
                href="mailto:editorial@crypticdaily.com?subject=Error Report"
                className="group flex items-center justify-between gap-4
                           border border-[#1C2535] bg-[#0D1118] px-6 py-5 mt-6
                           hover:border-[#10B981] transition-all duration-200"
              >
                <div>
                  <p
                    className="text-[#10B981] text-[0.65rem] tracking-[0.18em] uppercase mb-1"
                    style={{ fontFamily: "var(--font-jb-mono)" }}
                  >
                    Editorial contact
                  </p>
                  <p
                    className="text-[#E8E4D9] text-[1.05rem] font-bold group-hover:text-[#10B981]
                               transition-colors duration-200"
                    style={{ fontFamily: "var(--font-jb-mono)" }}
                  >
                    editorial@crypticdaily.com
                  </p>
                </div>
                <span
                  className="text-[#6B7280] text-2xl group-hover:text-[#10B981]
                             group-hover:translate-x-1 transition-all duration-200"
                >
                  ↗
                </span>
              </a>

              <div className="mt-4 border-l-2 border-[#1C2535] pl-4">
                <p className="text-[#6B7280] text-[0.82rem] leading-[1.7]">
                  Include the article URL, a description of the error, and any
                  supporting sources if available. We will investigate and
                  update you on our findings.
                </p>
              </div>

              <p className="mt-8 text-[#6B7280] text-[0.82rem] leading-[1.7]">
                Cryptic Daily is published and operated by Cryptic Daily. For
                general enquiries, visit our <A href="/contact">Contact page</A>
                .
              </p>
            </Section>
          </main>
        </div>
      </main>
    </>
  );
}
