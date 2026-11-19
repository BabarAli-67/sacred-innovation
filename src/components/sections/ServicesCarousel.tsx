"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import seo from "@/content/seo.json";
import { linkFor } from "@/content/links";

/**
 * Auto-playing services carousel.
 *
 * One image per service, matched to the service by subject (see
 * public/images/CREDITS.md) rather than reused frames from the hero video.
 *
 * Every service's description is rendered, always: the panels are stacked in
 * a single grid cell and cross-faded, so the complete verbatim copy stays in
 * the HTML for crawlers and the panel never changes height mid-rotation.
 * The images are likewise all mounted and cross-faded, so advancing never
 * waits on a network request.
 */

const AUTOPLAY_MS = 5200;

const photos = [
  { src: "/images/services/kitchen.jpg", alt: "A finished kitchen remodel with an island and fitted cabinetry." },
  { src: "/images/services/bathroom.jpg", alt: "A finished bathroom remodel with a freestanding tub and tiled wall." },
  { src: "/images/services/surfaces.jpg", alt: "A roller applying fresh paint to a prepared wall." },
  { src: "/images/services/cabinetry.jpg", alt: "Custom built-in shelving fitted into a living space." },
  { src: "/images/services/outdoor.jpg", alt: "The exterior of a home with landscaped outdoor living space." },
  { src: "/images/services/handyman.jpg", alt: "A tradesperson carrying out a repair to a fixture." },
];

export default function ServicesCarousel() {
  const items = seo.services.items;
  const count = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  const go = useCallback(
    (next: number) => setActive(((next % count) + count) % count),
    [count],
  );

  /* Only rotate while it is on screen. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => setInView(entries.some((e) => e.isIntersecting)),
      { rootMargin: "0px 0px -15%" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (paused || !inView || reduced) return;
    const id = window.setInterval(
      () => setActive((n) => (n + 1) % count),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(id);
  }, [paused, inView, reduced, count]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-roledescription="carousel"
      aria-label="Sacred Innovations services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12"
    >
      {/* Image stage */}
      <div className="relative lg:col-span-7">
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-ink-800 sm:aspect-[16/10]">
          {photos.map((photo, i) => (
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              fill
              priority={i === 0}
              loading={i === 0 ? undefined : "lazy"}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={[
                "object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                i === active
                  ? "scale-100 opacity-100"
                  : "scale-[1.04] opacity-0",
              ].join(" ")}
            />
          ))}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent"
          />

          <p className="absolute bottom-5 left-5 font-sans text-[0.625rem] tracking-[0.24em] text-white/85 uppercase">
            <span className="mr-3 inline-block h-[0.4rem] w-[0.4rem] translate-y-[-0.1rem] bg-sacred" />
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>

          {/* Autoplay progress — restarts with each slide. */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
            <span
              key={`${active}-${paused}-${inView}`}
              className="block h-full origin-left bg-sacred"
              style={{
                animation:
                  paused || !inView || reduced
                    ? "none"
                    : `svc-progress ${AUTOPLAY_MS}ms linear forwards`,
              }}
            />
          </span>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Show ${item.title}`}
                aria-current={i === active}
                onClick={() => go(i)}
                className="group cursor-pointer py-3"
              >
                <span
                  className={[
                    "block h-px transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    i === active
                      ? "w-10 bg-sacred"
                      : "w-5 bg-white/25 group-hover:bg-white/60",
                  ].join(" ")}
                />
              </button>
            ))}
            <span className="ml-3 font-sans text-xs text-white/40">
              {paused ? "Paused" : "Auto"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous service"
              onClick={() => go(active - 1)}
              className="inline-flex size-11 cursor-pointer items-center justify-center border border-white/20 text-white transition-colors duration-200 hover:border-sacred hover:text-sacred"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden className="size-4">
                <path d="M20 12H5" /><path d="M11 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next service"
              onClick={() => go(active + 1)}
              className="inline-flex size-11 cursor-pointer items-center justify-center border border-white/20 text-white transition-colors duration-200 hover:border-sacred hover:text-sacred"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden className="size-4">
                <path d="M4 12h15" /><path d="M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Copy — all six rendered, stacked, cross-faded. */}
      <div className="lg:col-span-5">
        <div className="relative grid h-full border-t-2 border-sacred bg-ink-800 p-7 sm:p-9">
          {items.map((item, i) => {
            const href = linkFor(item.link);
            const isActive = i === active;
            return (
              <article
                key={item.title}
                aria-hidden={!isActive}
                className={[
                  "col-start-1 row-start-1 transition-opacity duration-500",
                  isActive ? "opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
              >
                <p className="font-sans text-xs tracking-[0.22em] tabular-nums text-sacred">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display mt-4 text-[clamp(1.5rem,2.6vw,2.125rem)] leading-tight text-balance text-white">
                  {item.title}
                </h3>
                <p className="mt-5 font-sans text-[0.9375rem] leading-relaxed text-pretty text-white/70">
                  {item.body}
                </p>
                {href ? (
                  <a
                    href={href}
                    tabIndex={isActive ? 0 : -1}
                    className="mt-6 inline-flex font-sans text-sm text-sacred underline decoration-sacred/40 underline-offset-4 transition-colors duration-200 hover:decoration-sacred"
                  >
                    {item.link}
                  </a>
                ) : (
                  <p className="mt-6 font-sans text-sm leading-relaxed text-white/45">
                    {item.link}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes svc-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>
    </div>
  );
}
