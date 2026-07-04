"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Props {
  fontVars: string;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const REGISTERED_LOCATION = "European Union (Remote-first editorial team)";
const EMAIL = "contact@crypticdaily.com";
const EDITORIAL_EMAIL = "editorial@crypticdaily.com";
const EDITORIAL_CONTACT = `Editorial: ${EDITORIAL_EMAIL}`;

const CONTACT_ITEMS = [
  {
    num: "01",
    icon: "✦",
    subject: "Tip / Correction",
    title: "Editorial Tips & Corrections",
    accentColor: "#00D4FF",
    desc: "Got a scoop, correction, or technical issue? Email us with the subject line Tip or Correction for priority handling. Please include verifiable information or documentation where possible.",
    tag: "NEWSROOM",
  },
  {
    num: "02",
    icon: "◈",
    subject: "Business Enquiry",
    title: "Business & Partnerships",
    accentColor: "#7C3AED",
    desc: "For advertising, sponsorships, or affiliate discussions, contact us with the subject line Business Enquiry. We do not guarantee editorial coverage in exchange for partnerships.",
    tag: "COMMERCIAL",
  },
  {
    num: "03",
    icon: "◉",
    subject: "Media",
    title: "Media Enquiries",
    accentColor: "#FFE600",
    desc: "Journalists or outlets seeking comment can reach the editorial desk directly. Include your publication, deadline, and the specific question or topic you'd like us to address.",
    tag: "PRESS",
  },
  {
    num: "04",
    icon: "⬡",
    subject: "Security",
    title: "Security & Responsible Disclosure",
    accentColor: "#10B981",
    desc: "If you discover a security vulnerability affecting Cryptic Daily or our readers, email us with Security in the subject line. Provide steps to reproduce so we can act promptly and responsibly.",
    tag: "INFOSEC",
  },
  {
    num: "05",
    icon: "◻",
    subject: "",
    title: "No Postal Mail",
    accentColor: "#EF4444",
    desc: "We operate remotely across the European Union and do not maintain a public mailing address. All correspondence is handled exclusively via email. We aim to respond within two working days.",
    tag: "REMOTE",
  },
];

/* ─── Hook: scroll reveal ────────────────────────────────────────────────── */
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
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── RevealSection ──────────────────────────────────────────────────────── */
function RevealSection({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  const { ref, visible } = useReveal();
  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ─── SectionTag ─────────────────────────────────────────────────────────── */
function SectionTag({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
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

/* ─── CopyButton ─────────────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 border border-[#1C2535] px-4 py-2
                 text-[#6B7280] text-[0.68rem] tracking-[0.18em] uppercase
                 hover:border-[#00D4FF] hover:text-[#00D4FF]
                 transition-all duration-200 cursor-pointer"
      style={{ fontFamily: "var(--font-jb-mono)" }}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
          copied ? "bg-[#10B981]" : "bg-[#6B7280]"
        }`}
      />
      {copied ? "Copied!" : "Copy address"}
    </button>
  );
}

/* ─── EmailMailtoCard ────────────────────────────────────────────────────── */
function EmailCard({ subject = "" }: { subject?: string }) {
  const href = `mailto:${EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <a
      href={href}
      className="group flex items-center gap-4 border border-[#1C2535] bg-[#0D1118]
                 px-5 py-3 transition-all duration-200
                 hover:border-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.12)]"
    >
      <span
        className="text-[0.68rem] tracking-[0.18em] uppercase text-[#6B7280]
                   group-hover:text-[#00D4FF] transition-colors duration-200"
        style={{ fontFamily: "var(--font-jb-mono)" }}
      >
        {subject ? `subject: "${subject}"` : "email directly"}
      </span>
      <span
        className="ml-auto text-[#6B7280] text-[0.75rem] tracking-[0.08em]
                   group-hover:text-[#00D4FF] transition-colors duration-200"
        style={{ fontFamily: "var(--font-jb-mono)" }}
      >
        ↗
      </span>
    </a>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function ContactContent({ fontVars }: Props) {
  const [navHidden, setNavHidden] = useState(false);
  const lastY = useRef(0);
  const [activeRow, setActiveRow] = useState<number | null>(null);

  /* nav hide-on-scroll-down */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavHidden(y > lastY.current && y > 100);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #06080F; }
        ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 0; }

        .contact-root { cursor: crosshair; }

        /* noise grain */
        .contact-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }
        /* scanlines */
        .contact-root::after {
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
          background-image: radial-gradient(circle, rgba(0,212,255,0.12) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
        }

        /* big email hover glow */
        .email-hero:hover {
          color: #00D4FF !important;
          text-shadow: 0 0 60px rgba(0,212,255,0.25);
        }

        /* contact row accent line on hover */
        .contact-row::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: var(--row-accent);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.3s ease;
        }
        .contact-row:hover::after { transform: scaleY(1); }
        .contact-row:hover .row-num { color: var(--row-accent) !important; }
        .contact-row:hover { background: rgba(0,212,255,0.02); }
        .contact-row:hover .row-tag {
          border-color: var(--row-accent) !important;
          color: var(--row-accent) !important;
        }

        /* keyframes */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: #1C2535; }
          50%       { border-color: #00D4FF; box-shadow: 0 0 18px rgba(0,212,255,0.2); }
        }
      `}</style>

      <main
        className={`contact-root max-w-7xl mx-auto relative bg-[#06080F] text-[#E8E4D9] overflow-x-clip ${fontVars}`}
        style={{ fontFamily: "var(--font-syne)" }}
      >
        {/* ══════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════ */}
        <section
          className="hero-dot-grid relative min-h-screen flex flex-col
                     justify-top px-6 md:px-12 pb-20 pt-36 overflow-hidden"
        >
          {/* Ghost bg headline */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       whitespace-nowrap select-none pointer-events-none z-0
                       text-transparent leading-none"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(100px, 18vw, 300px)",
              WebkitTextStroke: "1px rgba(0,212,255,0.07)",
              letterSpacing: "-0.02em",
            }}
            aria-hidden
          >
            CONTACT
          </div>

          {/* Vertical accent line */}
          <div
            className="absolute top-0 right-[25%] w-px h-full pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(124,58,237,0.2) 40%, rgba(0,212,255,0.15) 70%, transparent)",
            }}
            aria-hidden
          />

          <div
            className="relative z-10 max-w-5xl"
            style={{ animation: "fadeUp 1s ease both" }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-6">
              <span
                className="w-2 h-2 rounded-full bg-[#00D4FF]"
                style={{ animation: "dotBlink 1.2s ease infinite" }}
              />
              <span
                className="text-[#00D4FF] text-[0.72rem] tracking-[0.25em] uppercase"
                style={{ fontFamily: "var(--font-jb-mono)" }}
              >
                LAST UPDATED: 8 OCT 2025 &nbsp;·&nbsp; EU REMOTE TEAM
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="text-[#E8E4D9] leading-[0.9] tracking-tight mb-4"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(64px, 10vw, 148px)",
              }}
            >
              Contact
              <br />
              <span className="text-[#00D4FF]">Cryptic</span>{" "}
              <span
                className="text-[#FFE600]"
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontStyle: "italic",
                  fontSize: "0.88em",
                }}
              >
                Daily.
              </span>
            </h1>

            {/* Divider */}
            <div className="w-full h-px bg-[#1C2535] my-8" />

            {/* Email + copy row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <a
                href={`mailto:${EMAIL}`}
                className="email-hero text-[#E8E4D9] transition-all duration-300 leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "clamp(22px, 3.5vw, 48px)",
                  letterSpacing: "0.02em",
                }}
              >
                {EMAIL}
              </a>
              <CopyButton text={EMAIL} />
            </div>

            <p
              className="mt-4 text-[#E8E4D9] text-[0.74rem] tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-jb-mono)" }}
            >
              Registered: {REGISTERED_LOCATION}
            </p>

            <p
              className="mt-4 text-[#E8E4D9] text-[0.74rem] tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-jb-mono)" }}
            >
              Editorial team based in the European Union
            </p>

            <p
              className="mt-4 text-[#E8E4D9] text-[0.74rem] tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-jb-mono)" }}
            >
              General enquiries: {EMAIL}
            </p>

            <p
              className="mt-4 text-[#00D4FF] text-[0.74rem] tracking-[0.18em] uppercase"
              style={{ fontFamily: "var(--font-jb-mono)" }}
            >
              {EDITORIAL_CONTACT}
            </p>

            <p
              className="mt-5 text-[rgba(232,228,217,0.5)] text-[0.9rem] leading-[1.7]
                         border-l-2 border-[#1C2535] pl-4 max-w-lg"
            >
              We operate remotely across the European Union. We aim to respond
              within two working days.
            </p>
          </div>

        </section>

        {/* ══════════════════════════════════════════════════════
            QUICK CHANNELS — 3-col stat-style cards
        ══════════════════════════════════════════════════════ */}
        <RevealSection className="px-6 md:px-12 py-16 border-b border-[#1C2535]">
          <div className="flex items-center gap-4 mb-12">
            <span
              className="text-[#00D4FF] text-[0.68rem] tracking-[0.25em] uppercase"
              style={{ fontFamily: "var(--font-jb-mono)" }}
            >
              One address, five uses
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-[#1C2535] to-transparent" />
          </div>

          {/* 3 quick-stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { label: "Response time", value: "2", unit: "days" },
              { label: "Time zones covered", value: "4", unit: "EU" },
              { label: "Years in operation", value: "5+", unit: "since 2019" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`group relative py-8 pr-12
                  ${i < 2 ? "border-r border-[#1C2535]" : ""}
                  ${i > 0 ? "pl-12" : ""}`}
              >
                <span
                  className="absolute top-8 right-3 text-[#1C2535] text-[0.6rem] tracking-[0.1em]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  0{i + 1}
                </span>
                <div
                  className="text-[#E8E4D9] group-hover:text-[#00D4FF] transition-colors duration-300 leading-none"
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "clamp(52px, 6vw, 96px)",
                  }}
                >
                  {s.value}
                  <span
                    className="text-[#00D4FF] align-super"
                    style={{ fontSize: "0.38em" }}
                  >
                    {s.unit}
                  </span>
                </div>
                <div
                  className="text-[#6B7280] text-[0.7rem] tracking-[0.18em] uppercase mt-2"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ══════════════════════════════════════════════════════
            CONTACT CHANNELS LIST
        ══════════════════════════════════════════════════════ */}
        <RevealSection className="bg-[#0D1118] border-b border-[#1C2535]">
          <div className="px-6 md:px-12 py-20">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-4">
              <div>
                <SectionTag label="Channels" />
                <h2
                  className="text-[#E8E4D9] leading-none tracking-tight"
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "clamp(42px, 6vw, 80px)",
                  }}
                >
                  How to
                  <br />
                  Reach Us
                </h2>
              </div>
              <div className="text-right">
                <p
                  className="text-[#6B7280] text-[0.7rem] tracking-[0.1em] mb-1"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  05 CHANNELS
                </p>
                <p
                  className="text-[#6B7280] text-[0.65rem]"
                  style={{ fontFamily: "var(--font-jb-mono)" }}
                >
                  All via email
                </p>
              </div>
            </div>

            <ul className="list-none">
              {CONTACT_ITEMS.map((item, idx) => (
                <li
                  key={item.num}
                  className={`contact-row relative pl-5 grid
                    grid-cols-[60px_1fr] md:grid-cols-[80px_1fr_1fr]
                    gap-6 md:gap-10 items-start
                    py-10 border-t border-[#1C2535]
                    cursor-pointer transition-all duration-200`}
                  style={
                    { "--row-accent": item.accentColor } as React.CSSProperties
                  }
                  onMouseEnter={() => setActiveRow(idx)}
                  onMouseLeave={() => setActiveRow(null)}
                >
                  {/* index number */}
                  <div
                    className="row-num text-[#1C2535] leading-none pt-1 transition-colors duration-300"
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: "clamp(44px, 5vw, 68px)",
                    }}
                  >
                    {item.num}
                  </div>

                  {/* title + tag + icon */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="row-tag border border-[#1C2535] text-[#6B7280]
                                   text-[0.6rem] tracking-[0.18em] uppercase px-2 py-0.5
                                   transition-all duration-200"
                        style={{ fontFamily: "var(--font-jb-mono)" }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <div
                      className="text-[1.3rem] mb-3"
                      style={{ color: item.accentColor }}
                    >
                      {item.icon}
                    </div>
                    <div
                      className="text-[#E8E4D9] text-[1.15rem] font-bold"
                      style={{ fontFamily: "var(--font-syne)" }}
                    >
                      {item.title}
                    </div>
                  </div>

                  {/* description + mailto CTA */}
                  <div className="col-span-2 md:col-span-1 space-y-4">
                    <p className="text-[#6B7280] text-[0.9rem] leading-[1.75]">
                      {item.desc}
                    </p>
                    {item.subject && <EmailCard subject={item.subject} />}
                    {!item.subject && (
                      <div
                        className="flex items-center gap-3"
                        style={{ fontFamily: "var(--font-jb-mono)" }}
                      >
                        <span className="w-4 h-px bg-[#1C2535]" />
                        <span className="text-[#EF4444] text-[0.68rem] tracking-[0.15em] uppercase">
                          Email only — no exceptions
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </RevealSection>

        {/* ══════════════════════════════════════════════════════
            TERMINAL — email summary card
        ══════════════════════════════════════════════════════ */}
        <RevealSection className="px-6 md:px-12 py-20 border-b border-[#1C2535]">
          <div className="max-w-2xl">
            <SectionTag label="Quick Reference" />
            <h2
              className="text-[#E8E4D9] leading-none tracking-tight mb-10"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(38px, 5vw, 68px)",
              }}
            >
              Subject Lines
              <br />
              <em
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontStyle: "italic",
                  color: "#FFE600",
                  fontSize: "0.88em",
                }}
              >
                That get answers faster.
              </em>
            </h2>

            {/* Terminal card */}
            <div
              className="relative overflow-hidden border border-[#1C2535] bg-[#0D1118]"
              style={{ animation: "borderPulse 4s ease infinite" }}
            >
              {/* title bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-[#0D1118] border-b border-[#1C2535]" />
              <div className="absolute top-[10px] left-[14px] flex gap-[6px] z-10">
                <span className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#FFE600]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#10B981]" />
              </div>
              <span
                className="absolute top-2 left-1/2 -translate-x-1/2 text-[#6B7280]
                           text-[0.65rem] tracking-[0.1em] z-10"
                style={{ fontFamily: "var(--font-jb-mono)" }}
              >
                contact.ts
              </span>

              {/* body */}
              <div
                className="mt-6 p-7 text-[0.8rem] leading-[2]"
                style={{ fontFamily: "var(--font-jb-mono)" }}
              >
                <p className="text-[#6B7280]">
                  // send all mail to one address
                </p>
                <p>&nbsp;</p>
                <p>
                  <span className="text-[#7C3AED]">const</span>{" "}
                  <span className="text-[#00D4FF]">contact</span>
                  <span className="text-[#E8E4D9]"> = {"{"}</span>
                </p>
                <p className="pl-4">
                  <span className="text-[#6B7280]">email</span>
                  <span className="text-[#E8E4D9]">: </span>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-[#10B981] hover:text-[#00D4FF] transition-colors"
                  >
                    "{EMAIL}"
                  </a>
                  <span className="text-[#E8E4D9]">,</span>
                </p>
                <p className="pl-4">
                  <span className="text-[#6B7280]">editorial</span>
                  <span className="text-[#E8E4D9]">: </span>
                  <a
                    href={`mailto:${EDITORIAL_EMAIL}`}
                    className="text-[#10B981] hover:text-[#00D4FF] transition-colors"
                  >
                    "{EDITORIAL_EMAIL}"
                  </a>
                  <span className="text-[#E8E4D9]">,</span>
                </p>
                <p className="pl-4">
                  <span className="text-[#6B7280]">registered</span>
                  <span className="text-[#E8E4D9]">: </span>
                  <span className="text-[#FFE600]">
                    "{REGISTERED_LOCATION}"
                  </span>
                  <span className="text-[#E8E4D9]">,</span>
                </p>
                <p className="pl-4">
                  <span className="text-[#6B7280]">subjects</span>
                  <span className="text-[#E8E4D9]">: {"{"}</span>
                </p>
                {[
                  ["editorial", '"Tip"', "#00D4FF"],
                  ["correction", '"Correction"', "#00D4FF"],
                  ["business", '"Business Enquiry"', "#7C3AED"],
                  ["media", '"Media"', "#FFE600"],
                  ["security", '"Security"', "#10B981"],
                ].map(([key, val, color]) => (
                  <p key={key} className="pl-8">
                    <span className="text-[#6B7280]">{key}</span>
                    <span className="text-[#E8E4D9]">: </span>
                    <span style={{ color }}>{val}</span>
                    <span className="text-[#E8E4D9]">,</span>
                  </p>
                ))}
                <p className="pl-4">
                  <span className="text-[#E8E4D9]">{"}"}</span>
                  <span className="text-[#E8E4D9]">,</span>
                </p>
                <p className="pl-4">
                  <span className="text-[#6B7280]">response</span>
                  <span className="text-[#E8E4D9]">: </span>
                  <span className="text-[#FFE600]">"≤ 2 working days"</span>
                  <span className="text-[#E8E4D9]">,</span>
                </p>
                <p>
                  <span className="text-[#E8E4D9]">{"}"}</span>
                </p>
                <p>&nbsp;</p>
                <p>
                  <span className="text-[#7C3AED]">export default</span>{" "}
                  <span className="text-[#00D4FF]">contact</span>
                  <span className="text-[#E8E4D9]">;</span>
                  <span
                    className="inline-block w-2 bg-[#00D4FF] align-middle ml-0.5"
                    style={{
                      height: "1.1em",
                      animation: "dotBlink 1s step-end infinite",
                    }}
                  />
                </p>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ══════════════════════════════════════════════════════
            CTA / CLOSING
        ══════════════════════════════════════════════════════ */}
        <RevealSection className="relative overflow-hidden text-center">
          {/* radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 65%)",
            }}
            aria-hidden
          />
          {/* ghost bg text */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       whitespace-nowrap select-none pointer-events-none text-transparent"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(70px, 13vw, 190px)",
              WebkitTextStroke: "1px rgba(255,230,0,0.05)",
              letterSpacing: "-0.01em",
            }}
            aria-hidden
          >
            GET IN TOUCH
          </div>

          <div className="relative z-10 px-6 md:px-12 py-28">
            <h2
              className="text-[#E8E4D9] leading-[0.95] tracking-tight mb-6"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(48px, 7.5vw, 112px)",
              }}
            >
              We read
              <br />
              every <span className="text-[#00D4FF]">email.</span>
            </h2>
            <p
              className="text-[rgba(232,228,217,0.5)] text-[1.15rem] mb-12 mx-auto max-w-md"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontStyle: "italic",
              }}
            >
              No contact forms. No ticketing systems. Just a direct line to the
              people who run Cryptic Daily.
            </p>

            {/* big mailto button */}
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-3 text-[0.85rem] font-bold
                         tracking-[0.12em] uppercase
                         bg-[#00D4FF] text-[#06080F] px-10 py-4
                         hover:bg-[#FFE600] hover:translate-x-1
                         transition-all duration-200"
              style={{
                fontFamily: "var(--font-syne)",
                clipPath:
                  "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
              }}
            >
              <span>{EMAIL}</span>
              <span>↗</span>
            </a>

            <div className="mt-8 flex justify-center">
              <Link
                href="/about"
                className="text-[0.72rem] tracking-[0.12em] uppercase
                           text-[#6B7280] border border-[#1C2535] px-6 py-2.5
                           hover:border-[#00D4FF] hover:text-[#00D4FF]
                           transition-all duration-200"
                style={{ fontFamily: "var(--font-jb-mono)" }}
              >
                ← Back to About
              </Link>
            </div>
          </div>
        </RevealSection>
      </main>
    </>
  );
}
