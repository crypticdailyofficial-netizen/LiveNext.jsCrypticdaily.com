import { SITE_URL } from "@/lib/constants";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

function XIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3A1.97 1.97 0 003.28 5c0 1.09.88 1.97 1.97 1.97A1.97 1.97 0 007.22 5 1.97 1.97 0 005.25 3zM20.44 13.05c0-3.2-1.7-4.69-3.97-4.69-1.83 0-2.65 1-3.11 1.7V8.5H9.98c.04 1.03 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.13-.92.28-.68.93-1.38 2.01-1.38 1.42 0 1.99 1.08 1.99 2.66V20h3.38v-6.95z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.52 3.48A11.86 11.86 0 0012.07 0C5.5 0 .15 5.34.15 11.91c0 2.1.55 4.15 1.6 5.95L0 24l6.34-1.66a11.88 11.88 0 005.73 1.46h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.48-8.4zm-8.45 18.3h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.76.98 1-3.67-.24-.38a9.88 9.88 0 01-1.52-5.22C2.14 6.42 6.58 1.98 12.07 1.98c2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.5-4.48 9.91-9.88 9.91zm5.43-7.39c-.3-.15-1.78-.88-2.05-.98-.27-.1-.46-.15-.66.15-.2.3-.76.98-.94 1.18-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.46-.88-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.66-1.58-.9-2.17-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.53.08-.8.38-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.38.2 1.9.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.31.18-1.43-.08-.12-.28-.2-.58-.35z" />
    </svg>
  );
}

function LinkIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 11-5.656-5.656l1.172-1.172m2.828-2.828l2-2a4 4 0 115.656 5.656l-1.172 1.172m-8.484 1.656l6-6"
      />
    </svg>
  );
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const url = `${SITE_URL}/news/${slug}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  const btn =
    "min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 text-amber-100 transition hover:text-white";

  return (
    <div className="rounded-[18px] border border-amber-300/12 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(10,10,10,0.74)_32%,rgba(0,0,0,0.94)_100%)] px-4 py-4 shadow-[0_0_40px_rgba(252,211,77,0.07)]">
      <div className="flex flex-wrap items-center gap-3 text-sm text-amber-50/85">
        <span className="uppercase tracking-[0.22em] text-amber-100">
          Share
        </span>

        <span className="text-amber-300/35">•</span>

        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X/Twitter"
          className={btn}
        >
          <XIcon />
        </a>

        <span className="text-amber-300/35">•</span>

        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={btn}
        >
          <LinkedInIcon />
          LinkedIn
        </a>

        <span className="text-amber-300/35">•</span>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className={btn}
        >
          <WhatsAppIcon />
          WhatsApp
        </a>

        <span className="text-amber-300/35">•</span>

        <a href={url} aria-label="Open article link" className={btn}>
          <LinkIcon />
          Link
        </a>
      </div>
    </div>
  );
}
