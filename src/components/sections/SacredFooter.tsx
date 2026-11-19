"use client";

import Image from "next/image";
import { WordmarkRevealFooter } from "@/components/ui/wordmark-reveal-footer";
import { brand, contact, heroEntry, nav } from "@/lib/brand";
import seo from "@/content/seo.json";

/**
 * The closing brand moment: SACRED INNOVATIONS rises letter by letter through
 * a hairline floor, lights a reflection, then the status band switches on with
 * the local time in Conroe.
 *
 * Replaces the Three.js liquid-glass wordmark, which read as a floating box
 * against the page's flat architectural surfaces — and took a 3D renderer,
 * a typeface payload and a WebGL context to draw one word. This does more,
 * on the Web Animations API, with no animation library at all.
 */

const COPYRIGHT_YEAR = 2026;
const CREDIT_HREF = "https://flashdigix.com/";

export default function SacredFooter() {
  return (
    <WordmarkRevealFooter
      wordmark="SACRED INNOVATIONS"
      reveal="inView"
      reflection
      className="border-t border-white/10"
      brand={{
        name: brand.name,
        mark: (
          <Image
            src="/logo.png"
            alt=""
            width={619}
            height={483}
            sizes="48px"
            className="h-9 w-auto"
          />
        ),
        blurb: (
          <>
            <p className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-white">
              {brand.signature}
            </p>
            <p className="mt-4 font-sans text-sm tracking-[0.22em] text-white/45 uppercase">
              {brand.pillars}
            </p>
            <a
              href={contact.phoneHref}
              className="group mt-8 inline-flex items-baseline gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-sacred focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
            >
              <span className="font-display text-[clamp(1.5rem,2.2vw,1.875rem)] text-white transition-colors duration-200 group-hover:text-sacred">
                {contact.phoneDisplay}
              </span>
              <span
                aria-hidden
                className="block h-px w-8 bg-sacred transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-12"
              />
            </a>
          </>
        ),
      }}
      columns={[
        {
          title: "Explore",
          links: nav.map((item) => ({ label: item.label, href: item.href })),
        },
        {
          title: "Service area",
          links: [
            ...seo.serviceArea.cities.map((city) => ({
              label: city,
              href: "#areas",
            })),
            { label: "North Houston", href: "#areas" },
          ],
        },
      ]}
      action={
        <div data-action>
          <p className="font-sans text-[0.6875rem] font-medium tracking-[0.22em] text-white/45 uppercase">
            Start a project
          </p>
          <a
            href="#contact"
            className="group mt-5 inline-flex h-12 cursor-pointer items-center gap-3 bg-sacred px-5 font-sans text-sm font-medium text-white outline-none transition-colors duration-200 hover:bg-ember focus-visible:ring-2 focus-visible:ring-sacred focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            {heroEntry.primaryCta}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              aria-hidden
              className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
            >
              <path d="M4 12h15" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </a>
          <p className="mt-5 max-w-[16rem] font-sans text-sm leading-relaxed text-white/45">
            Based in {brand.base}, serving {brand.region}.
          </p>
        </div>
      }
      status={{ label: "Taking projects across Conroe and North Houston", tone: "ok" }}
      offices={[{ city: "Conroe, TX", timeZone: "America/Chicago" }]}
      legal={
        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 font-sans text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {COPYRIGHT_YEAR} {brand.legalName} — designed and developed by{" "}
            <a
              href={CREDIT_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm text-white/60 underline decoration-white/25 underline-offset-4 outline-none transition-colors duration-200 hover:text-white hover:decoration-sacred focus-visible:ring-2 focus-visible:ring-sacred"
            >
              Flash Digital LLC
            </a>
          </p>
          <p>Brand Foundation v1 — statements shown as proposed pending adoption.</p>
        </div>
      }
    />
  );
}
