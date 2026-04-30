interface CommunityProps {
  twitterHref?: string;
  telegramHref?: string;
}

function TwitterIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.503 11.24H16.17l-4.714-6.231-5.4 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.714 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SendIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function ArrowUpRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export default function Community({
  twitterHref = "https://x.com/crypticdailyhq",
  telegramHref = "https://t.me/CrypticDaily",
}: CommunityProps) {
  return (
    <section
      className="relative isolate mx-auto mt-10 max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,#0C0E12_0%,#17131A_34%,#261C12_68%,#090909_100%)] text-white shadow-[0_28px_72px_rgba(0,0,0,0.36)]"
      style={{ contentVisibility: "auto", containIntrinsicSize: "360px" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(251,191,36,0.14),transparent_22%),radial-gradient(circle_at_84%_14%,rgba(255,255,255,0.05),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_34%,transparent_74%,rgba(255,255,255,0.02))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:60px_60px]" />
      <div className="pointer-events-none absolute inset-y-0 left-[14%] w-px bg-[linear-gradient(180deg,transparent,rgba(251,191,36,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[18%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.1),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,241,211,0.4),transparent)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-18 w-18 border-l border-t border-[#F59E0B]/30" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 border-b border-r border-[#F59E0B]/24" />

      <div className="relative z-10 p-6 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mt-4 text-3xl font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-4xl">
            Join our community.
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#E7D3BF] sm:text-[15px]">
            Follow the desk on X or jump into Telegram for live updates and
            conversation.
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-4xl gap-3 sm:grid-cols-2">
          <a
            href={twitterHref}
            target="_blank"
            rel="noreferrer"
            className="group relative block overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(18,18,22,0.98)_0%,rgba(7,7,10,0.98)_100%)] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.32)] transition-all duration-200 hover:-translate-y-1 hover:border-white/24"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_34%,transparent_78%,rgba(255,255,255,0.03))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.32),transparent)]" />

            <div className="relative z-10 flex items-start gap-4 text-left">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-white/14 bg-white/[0.06] text-white shadow-[0_0_18px_rgba(255,255,255,0.06)]">
                <TwitterIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/62">
                  X
                </span>

                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                  Join discussion on X
                </h3>
                <p className="mt-1 text-sm leading-6 text-white/68">
                  Headlines, reactions, and desk commentary.
                </p>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/72">
                    @crypticdailyhq
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-white transition-transform duration-200 group-hover:translate-x-1">
                    Open channel
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </a>

          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            className="group relative block overflow-hidden rounded-[24px] border border-[#7ED5FF]/26 bg-[linear-gradient(180deg,#11A2F0_0%,#0088CC_46%,#005E8D_100%)] p-4 shadow-[0_18px_36px_rgba(0,78,117,0.34)] transition-all duration-200 hover:-translate-y-1 hover:border-[#C2ECFF]/42"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(224,245,255,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_34%,transparent_78%,rgba(125,213,255,0.08))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(224,245,255,0.56),transparent)]" />

            <div className="relative z-10 flex items-start gap-4 text-left">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-cyan-100/28 bg-white/[0.12] text-white shadow-[0_0_18px_rgba(165,243,252,0.12)]">
                <SendIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cyan-50/80">
                  Telegram
                </span>

                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                  Join community on Telegram
                </h3>
                <p className="mt-1 text-sm leading-6 text-cyan-50/86">
                  Chat with readers and get faster alerts.
                </p>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-50/84">
                    t.me/CrypticDaily
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-white transition-transform duration-200 group-hover:translate-x-1">
                    Enter room
                    <ArrowUpRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
