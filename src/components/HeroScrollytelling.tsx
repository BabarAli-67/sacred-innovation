"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "./Preloader";
import { brand, heroEntry, heroPhases } from "@/lib/brand";
import {
  BACKGROUND_CONCURRENCY,
  FRAME_COUNT,
  MAX_DPR,
  PRIORITY_COUNT,
  backgroundLoadOrder,
  framePath,
} from "@/lib/frames";

/** Timeline length in abstract units; phase ranges (0–1) map onto 0–UNITS. */
const UNITS = 10;

/** Single representative frame used when motion is reduced. */
const STATIC_FRAME = 150;

/** How far either side of a missing frame we will look for a decoded one. */
const NEAREST_RADIUS = 48;

/** Entry panel first, then the narrative phases. */
const PHASE_RANGES: readonly (readonly [number, number])[] = [
  heroEntry.range,
  ...heroPhases.map((p) => p.range),
];

export default function HeroScrollytelling() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** In-memory frame cache. Index === frame number. */
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array<HTMLImageElement | null>(FRAME_COUNT).fill(null),
  );
  const frameProxy = useRef({ frame: 0 });
  const lastDrawnRef = useRef<HTMLImageElement | null>(null);
  const forceRef = useRef(true);
  const rafRef = useRef(0);
  const abortedRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  /* ----------------------------------------------------------------- *
   * Loading
   * ----------------------------------------------------------------- */

  const loadFrame = useCallback((index: number) => {
    return new Promise<void>((resolve) => {
      if (imagesRef.current[index] || abortedRef.current) return resolve();

      const img = new window.Image();
      img.decoding = "async";
      img.src = framePath(index);

      const commit = () => {
        imagesRef.current[index] = img;
        resolve();
      };

      // Decode up front so drawImage never pays a synchronous decode mid-scroll.
      if (typeof img.decode === "function") {
        img
          .decode()
          .then(commit)
          .catch(() => {
            if (img.complete && img.naturalWidth > 0) commit();
            else {
              img.onload = commit;
              img.onerror = () => resolve();
            }
          });
      } else {
        img.onload = commit;
        img.onerror = () => resolve();
      }
    });
  }, []);

  /** Bounded-concurrency worker pool over an explicit load order. */
  const loadQueue = useCallback(
    async (order: number[], concurrency: number, onTick?: (done: number) => void) => {
      let cursor = 0;
      let done = 0;
      const workers = Array.from({ length: Math.min(concurrency, order.length) }, async () => {
        while (cursor < order.length && !abortedRef.current) {
          const index = order[cursor++];
          await loadFrame(index);
          done += 1;
          onTick?.(done);
        }
      });
      await Promise.all(workers);
    },
    [loadFrame],
  );

  /* ----------------------------------------------------------------- *
   * Painting
   * ----------------------------------------------------------------- */

  const nearestLoaded = useCallback((index: number): HTMLImageElement | null => {
    const imgs = imagesRef.current;
    if (imgs[index]) return imgs[index];
    for (let r = 1; r <= NEAREST_RADIUS; r += 1) {
      const lo = index - r;
      if (lo >= 0 && imgs[lo]) return imgs[lo];
      const hi = index + r;
      if (hi < FRAME_COUNT && imgs[hi]) return imgs[hi];
    }
    return null;
  }, []);

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const img = nearestLoaded(Math.round(frameProxy.current.frame));
    if (!img) return;
    if (img === lastDrawnRef.current && !forceRef.current) return;

    lastDrawnRef.current = img;
    forceRef.current = false;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    // object-fit: cover — scale to the larger ratio, never distort.
    const scale = Math.max(cw / iw, ch / ih);
    const w = iw * scale;
    const h = ih * scale;

    // Portrait viewports crop hard top/bottom; bias upward to keep the
    // walking subject and the ceiling detail in frame.
    const focalY = cw / ch < 0.9 ? 0.4 : 0.5;

    ctx.drawImage(img, (cw - w) * 0.5, (ch - h) * focalY, w, h);
  }, [nearestLoaded]);

  /** Coalesce many scroll ticks into at most one paint per animation frame. */
  const scheduleDraw = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      draw();
    });
  }, [draw]);

  /* ----------------------------------------------------------------- *
   * Canvas sizing
   * ----------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    ctxRef.current = canvas.getContext("2d", { alpha: false });

    let lastW = 0;
    let lastH = 0;
    let settle = 0;

    const size = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const nw = Math.round(w * dpr);
      const nh = Math.round(h * dpr);
      if (canvas.width === nw && canvas.height === nh) return;
      canvas.width = nw;
      canvas.height = nh;
      forceRef.current = true;
      draw();
    };

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);

      // Repaint immediately for real layout changes, but ignore the small
      // height deltas a mobile address bar produces mid-scroll.
      if (w !== lastW || Math.abs(h - lastH) > 48) {
        lastW = w;
        lastH = h;
        size(w, h);
      }

      // Always land on the exact size once resizing stops.
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        lastW = w;
        lastH = h;
        size(w, h);
      }, 240);
    });

    observer.observe(stage);
    return () => {
      observer.disconnect();
      window.clearTimeout(settle);
    };
  }, [draw]);

  /* ----------------------------------------------------------------- *
   * Load → paint → animate
   * ----------------------------------------------------------------- */

  useEffect(() => {
    abortedRef.current = false;
    gsap.registerPlugin(ScrollTrigger);
    // Stops ScrollTrigger re-measuring every time a mobile browser chrome
    // collapses, which is the usual source of scrub jitter on phones.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let mm: ReturnType<typeof gsap.matchMedia> | null = null;

    const run = async () => {
      if (reduced) {
        // Static hero: one representative frame, no sequence, no scrub.
        await loadQueue([STATIC_FRAME, STATIC_FRAME - 2, 0], 3, (done) =>
          setProgress(done / 3),
        );
        if (abortedRef.current) return;
        frameProxy.current.frame = STATIC_FRAME;
        forceRef.current = true;
        draw();
        setReady(true);

        const first = phaseRefs.current[0];
        if (first) gsap.set(first, { autoAlpha: 1, y: 0 });
        gsap.set(phaseRefs.current.slice(1).filter(Boolean), { autoAlpha: 0 });
        gsap.set(cueRef.current, { autoAlpha: 0 });
        gsap.set(railRef.current, { scaleX: 1 });
        return;
      }

      // 1. Priority frames — the page is held only for these.
      const priority = Array.from({ length: PRIORITY_COUNT }, (_, i) => i);
      await loadQueue(priority, 8, (done) => setProgress(done / PRIORITY_COUNT));
      if (abortedRef.current) return;

      forceRef.current = true;
      draw();
      setReady(true);

      // 2. Everything else, off the critical path, during idle time.
      const fill = () => {
        if (abortedRef.current) return;
        void loadQueue(backgroundLoadOrder(), BACKGROUND_CONCURRENCY);
      };
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(fill, { timeout: 1200 });
      } else {
        window.setTimeout(fill, 200);
      }

      // 3. Scroll choreography.
      mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        if (!section) return;

        const phases = phaseRefs.current.filter(Boolean) as HTMLDivElement[];
        phases.forEach((el, i) => {
          // Phase 1 is the headline at rest: it must be on screen before the
          // first scroll, so it only ever animates out.
          const first = i === 0;
          gsap.set(el, { autoAlpha: first ? 1 : 0 });
          gsap.set(el.querySelectorAll("[data-line]"), {
            autoAlpha: first ? 1 : 0,
            y: first ? 0 : 26,
          });
        });
        gsap.set(railRef.current, { scaleX: 0, transformOrigin: "left center" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        // Frame scrub — the whole sequence across the whole track.
        tl.to(
          frameProxy.current,
          {
            frame: FRAME_COUNT - 1,
            ease: "none",
            duration: UNITS,
            onUpdate: scheduleDraw,
          },
          0,
        );

        tl.to(railRef.current, { scaleX: 1, ease: "none", duration: UNITS }, 0);
        tl.to(cueRef.current, { autoAlpha: 0, duration: 0.5, ease: "none" }, 0.5);

        // Phase overlays, keyed to what the footage is actually doing.
        phases.forEach((el, i) => {
          const [a, b] = PHASE_RANGES[i];
          const start = a * UNITS;
          const end = b * UNITS;
          const lines = el.querySelectorAll("[data-line]");
          const isLast = i === PHASE_RANGES.length - 1;

          if (i > 0) {
            tl.set(el, { autoAlpha: 1 }, start);
            tl.to(
              lines,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                stagger: 0.16,
              },
              start + 0.2,
            );
          }

          if (!isLast) {
            tl.to(
              lines,
              { autoAlpha: 0, y: -18, duration: 0.5, ease: "power2.in", stagger: 0.06 },
              end - 0.75,
            );
            tl.set(el, { autoAlpha: 0 }, end - 0.05);
          }
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      // Re-measure once webfonts have settled so the pin math is right.
      if (document.fonts?.ready) {
        void document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
    };

    void run();

    return () => {
      abortedRef.current = true;
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      mm?.revert();
    };
  }, [draw, loadQueue, scheduleDraw]);

  /* ----------------------------------------------------------------- *
   * Markup
   * ----------------------------------------------------------------- */

  return (
    <>
      <Preloader progress={progress} done={ready} />

      <section
        ref={sectionRef}
        id="hero"
        aria-label={`${brand.name} — ${brand.signature}`}
        aria-busy={!ready}
        className="relative h-[340vh] bg-ink md:h-[400vh] motion-reduce:h-[100svh]"
      >
        <div
          ref={stageRef}
          className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink"
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="A Sacred Innovations project walkthrough: a gutted interior with exposed brick and framing becomes a finished home with custom built-ins, trim and a completed great room."
            className="absolute inset-0 h-full w-full"
          />

          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/poster.jpg"
              alt="Sacred Innovations renovation walkthrough"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </noscript>

          {/* Scrims. The sequence runs from dim demolition to a bright white
              great room, so the type needs a floor it can always sit on. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/88 via-ink/30 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/15 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent"
          />

          {/* Phase overlays */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-end">
            <div className="mx-auto w-full max-w-[90rem] px-5 pb-14 sm:px-10 sm:pb-20 lg:px-14 lg:pb-24">
              <div className="relative h-[clamp(11rem,26vh,16rem)] w-full max-w-[38rem]">
                {/* Entry — the offer. Client-supplied copy, verbatim. */}
                {/* Entry: the headline alone, over the scrims rather than in
                    a card, so the frame sequence stays visible behind it.
                    The paragraphs and the two buttons were removed from the
                    banner by request; the call and estimate actions now live
                    in the navbar, where they persist past the hero. */}
                <div
                  ref={(el) => {
                    phaseRefs.current[0] = el;
                  }}
                  className="absolute inset-x-0 bottom-0"
                >
                  <h1
                    data-line
                    className="hero-entry-h1 font-display max-w-[20ch] text-[clamp(2rem,5.4vw,4.25rem)] leading-[1.04] text-balance text-white"
                  >
                    {heroEntry.headline}
                  </h1>
                </div>

                {/* Narrative phases */}
                {heroPhases.map((phase, idx) => {
                  const i = idx + 1;
                  return (
                    <div
                      key={phase.id}
                      ref={(el) => {
                        phaseRefs.current[i] = el;
                      }}
                      className="absolute inset-x-0 bottom-0"
                    >
                      <p
                        data-line
                        className="mb-5 font-sans text-[0.6875rem] leading-none font-medium tracking-[0.26em] text-white/70 uppercase sm:text-xs"
                      >
                        <span className="mr-3 inline-block h-[0.4rem] w-[0.4rem] translate-y-[-0.1rem] bg-sacred" />
                        {phase.eyebrow}
                      </p>

                      <p
                        data-line
                        className="font-display text-[clamp(2rem,5.6vw,4rem)] leading-[0.98] whitespace-pre-line text-white"
                      >
                        {phase.headline}
                      </p>

                      {phase.sub ? (
                        <p
                          data-line
                          className="mt-6 max-w-[34rem] font-sans text-base leading-relaxed text-balance text-white/80 sm:text-lg"
                        >
                          {phase.sub}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scroll cue */}
          <div
            ref={cueRef}
            aria-hidden
            className="pointer-events-none absolute right-6 bottom-10 z-20 hidden items-center gap-3 sm:flex lg:right-14"
          >
            <span className="font-sans text-[0.625rem] tracking-[0.3em] text-white/55 uppercase">
              Scroll
            </span>
            <span className="relative block h-12 w-px overflow-hidden bg-white/25">
              <span className="absolute inset-x-0 top-0 block h-4 animate-[cue_1.8s_ease-in-out_infinite] bg-sacred" />
            </span>
          </div>

          {/* Progress rail */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 z-20 h-px bg-white/12"
          >
            <div
              ref={railRef}
              className="h-full w-full origin-left scale-x-0 bg-sacred"
            />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes cue {
          0%   { transform: translateY(-100%); }
          60%  { transform: translateY(300%); }
          100% { transform: translateY(300%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[cue_1\\.8s_ease-in-out_infinite\\] { animation: none; }
        }
      `}</style>
    </>
  );
}
