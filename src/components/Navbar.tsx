"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { brand, contact, heroEntry, nav } from "@/lib/brand";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" />
    </svg>
  );
}

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Swap to the solid bar once the pinned hero is behind us.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setSolid(window.scrollY > window.innerHeight * 0.75);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Mobile panel: lock the page, close on Escape, move focus in.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-60 transition-colors duration-500",
        solid
          ? "border-b border-white/10 bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <a
        href="#story"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:bg-paper focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-18 max-w-[90rem] items-center justify-between gap-6 px-6 sm:px-10 lg:px-14">
        <a
          href="#hero"
          aria-label={`${brand.name} home`}
          className="flex shrink-0 items-center gap-3"
        >
          <Image
            src="/logo.png"
            alt=""
            width={619}
            height={483}
            priority
            sizes="56px"
            className="h-9 w-auto sm:h-10"
          />
          <span className="hidden font-sans text-[0.6875rem] leading-tight tracking-[0.2em] text-white/70 uppercase sm:block">
            Innovations
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative py-2 font-sans text-sm text-white/75 transition-colors duration-200 hover:text-white"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-sacred transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Both actions live here now that the hero banner carries only the
              headline — so they stay reachable the whole way down the page.
              Below lg the label is the number alone to keep the bar short. */}
          <a
            href={contact.phoneHref}
            aria-label={heroEntry.phoneCta}
            className="hidden h-11 cursor-pointer items-center gap-2 border border-white/20 px-4 font-sans text-sm font-medium text-white transition-colors duration-200 hover:border-sacred hover:text-white sm:inline-flex"
          >
            <PhoneIcon className="size-4 text-sacred" />
            <span className="lg:hidden">{contact.phoneDisplay}</span>
            <span className="hidden lg:inline">{heroEntry.phoneCta}</span>
          </a>

          <a
            href="#contact"
            className="hidden h-11 cursor-pointer items-center bg-sacred px-5 font-sans text-sm font-medium text-white transition-colors duration-200 hover:bg-ember lg:inline-flex"
          >
            {heroEntry.primaryCta}
          </a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 cursor-pointer items-center justify-center text-white md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              aria-hidden
              className="size-6"
            >
              {open ? (
                <>
                  <path d="M5 5l14 14" />
                  <path d="M19 5L5 19" />
                </>
              ) : (
                <>
                  <path d="M3 7h18" />
                  <path d="M3 16h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        ref={panelRef}
        hidden={!open}
        className="border-t border-white/10 bg-ink md:hidden"
      >
        <nav aria-label="Primary mobile" className="flex flex-col px-6 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/8 py-4 font-display text-2xl text-white"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex h-12 items-center justify-center bg-sacred px-5 text-center font-sans text-sm font-medium text-white"
          >
            {heroEntry.primaryCta}
          </a>
          <a
            href={contact.phoneHref}
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex h-12 items-center justify-center gap-2.5 border border-white/20 px-5 font-sans text-sm font-medium text-white"
          >
            <PhoneIcon className="size-4 text-sacred" />
            {heroEntry.phoneCta}
          </a>
        </nav>
      </div>
    </header>
  );
}
