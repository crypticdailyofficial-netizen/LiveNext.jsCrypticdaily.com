"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logoImage from "@/public/logo.png";
import { SearchBar } from "@/components/ui/SearchBar";

const NAV_LINKS = [
  { href: "/news", label: "News" },
  { href: "/categories/crypto-newswire", label: "Crypto Newswire" },
  { href: "/categories/web3-builder", label: "Web3 Builder" },
  { href: "/categories/web3-fraud-files", label: "Web3 Fraud Files" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-60 px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Main navigation"
          className={`relative flex h-[86px] items-center justify-between overflow-hidden rounded-[26px] border-4 px-4 sm:px-6 transition-all duration-300 ${
            scrolled
              ? "border-white/30 bg-[#060A10]/88 shadow-[0_20px_55px_rgba(0,0,0,0.38)] backdrop-blur-xl"
              : "border-white/20 bg-[#080C13]/74 shadow-[0_14px_36px_rgba(0,0,0,0.28)] backdrop-blur-md"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-y-0 left-[26%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12),transparent)] xl:block" />

          <Link
            href="/"
            prefetch={false}
            className="relative z-10 flex min-w-0 items-center gap-3"
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Image
                src={logoImage}
                alt="Cryptic Daily logo"
                fill
                className="object-cover"
                sizes="44px"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-[#D6AE69]">
                Cryptic Daily
              </p>
              <p className="truncate text-sm font-medium text-[#F5F7FB]">
                News for markets, builders, and policy
              </p>
            </div>
          </Link>

          <div className="relative z-10 hidden lg:flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="rounded-full px-4 py-2 text-[0.82rem] font-medium whitespace-nowrap text-[#A4ADB8] transition-all duration-200 hover:bg-white/[0.06] hover:text-[#F5F7FB]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <div className="hidden lg:block">
              {searchOpen ? (
                <SearchBar
                  onClose={() => setSearchOpen(false)}
                  className="w-72"
                />
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="inline-flex min-h-[46px] min-w-[46px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A4ADB8] transition-all duration-200 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              className="inline-flex min-h-[46px] min-w-[46px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#A4ADB8] transition-colors duration-200 hover:text-white lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="mt-3 overflow-hidden rounded-[24px] border border-white/10 bg-[#060A10]/94 shadow-[0_18px_45px_rgba(0,0,0,0.36)] backdrop-blur-xl lg:hidden">
            <div className="border-b border-white/8 px-4 py-4">
              <SearchBar />
            </div>
            <div className="space-y-1 px-3 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#A4ADB8] transition-all duration-200 hover:bg-white/[0.05] hover:text-[#F5F7FB]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
