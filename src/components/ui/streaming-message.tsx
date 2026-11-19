"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Streaming Message — a consultation panel whose answer arrives token by token.
 *
 * Built here rather than vendored, for one reason that matters on this page:
 * the usual implementation appends characters to the DOM over time, so the
 * server sends an empty box and a crawler sees nothing. This page's copy is
 * the whole point of it, so every word is rendered up front, in order, inside
 * real elements — the "streaming" is a progressive reveal of text that is
 * already there. Full text in the HTML, no layout shift as it arrives, and
 * with JavaScript off it is simply a paragraph.
 */

export type StreamStep = {
  id: string;
  title: string;
  body: string;
};

type Props = {
  steps: readonly StreamStep[];
  /** Milliseconds per token. */
  speed?: number;
  label: string;
  footnote?: string;
};

export default function StreamingMessage({
  steps,
  speed = 26,
  label,
  footnote,
}: Props) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));
  const [revealed, setRevealed] = useState(0);
  const [started, setStarted] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const tokens = useMemo(
    () => steps.map((s) => s.body.split(/(\s+)/)),
    [steps],
  );
  const current = tokens[active] ?? [];
  const total = current.length;

  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Only start once the panel is actually on screen. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20%" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    window.clearInterval(timer.current);
    if (!started) return;
    if (reduced) {
      setRevealed(total);
      setDone((d) => d.map((v, i) => (i === active ? true : v)));
      return;
    }
    setRevealed(0);
    timer.current = window.setInterval(() => {
      setRevealed((n) => {
        if (n >= total) {
          window.clearInterval(timer.current);
          setDone((d) => d.map((v, i) => (i === active ? true : v)));
          return n;
        }
        return n + 1;
      });
    }, speed);
    return () => window.clearInterval(timer.current);
  }, [active, total, speed, started, reduced]);

  const pick = useCallback((i: number) => setActive(i), []);

  const streaming = revealed < total && started;

  return (
    <div ref={rootRef} className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Steps with status lamps */}
      <ul className="lg:col-span-5" aria-label={label}>
        {steps.map((step, i) => {
          const isActive = i === active;
          const isDone = done[i];
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => pick(i)}
                aria-current={isActive ? "step" : undefined}
                className={[
                  "group flex w-full cursor-pointer items-start gap-4 border-t border-ink/12 py-5 text-left transition-colors duration-200",
                  i === steps.length - 1 ? "border-b" : "",
                  isActive ? "text-ink" : "text-ink/55 hover:text-ink/85",
                ].join(" ")}
              >
                <span
                  aria-hidden
                  className={[
                    "mt-1.5 grid size-4 shrink-0 place-items-center rounded-full border transition-all duration-300",
                    isActive
                      ? "border-sacred bg-sacred shadow-[0_0_0_4px_rgba(227,50,43,0.18)]"
                      : isDone
                        ? "border-sacred/60 bg-sacred/60"
                        : "border-ink/25 bg-transparent",
                  ].join(" ")}
                >
                  {isActive && streaming ? (
                    <span className="block size-1.5 animate-ping rounded-full bg-white/90" />
                  ) : null}
                </span>

                <span className="flex-1">
                  <span className="font-sans text-xs tracking-[0.2em] tabular-nums text-sacred">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display mt-1.5 block text-[clamp(1.0625rem,1.7vw,1.375rem)] leading-snug">
                    {step.title}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* The answer */}
      <div className="lg:col-span-7">
        <div className="relative h-full border border-ink/12 bg-paper p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4">
            <p className="font-sans text-[0.6875rem] tracking-[0.26em] text-ink/45 uppercase">
              {label}
            </p>
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={[
                  "block size-1.5 rounded-full transition-colors duration-300",
                  streaming ? "animate-pulse bg-sacred" : "bg-ink/25",
                ].join(" ")}
              />
              <span className="font-sans text-[0.625rem] tracking-[0.22em] text-ink/45 uppercase">
                {streaming ? "Responding" : "Ready"}
              </span>
            </span>
          </div>

          {/*
            Every step's body is rendered, always. Only one is visible at a
            time, but they are stacked in a single grid cell rather than
            swapped out, so the complete verbatim copy is in the HTML for
            crawlers and the panel never changes height between steps.
          */}
          <div className="mt-6 grid">
            {steps.map((step, s) => {
              const isActive = s === active;
              return (
                <p
                  key={step.id}
                  aria-hidden={!isActive}
                  aria-live={isActive ? "polite" : undefined}
                  className={[
                    "col-start-1 row-start-1 font-sans text-base leading-relaxed text-pretty text-ink/80 transition-opacity duration-300 sm:text-lg",
                    isActive
                      ? "opacity-100"
                      : "pointer-events-none opacity-0",
                  ].join(" ")}
                >
                  {tokens[s].map((tok, i) => (
                    <span
                      key={`${step.id}-${i}`}
                      className="stream-token"
                      data-on={
                        !started || reduced || !isActive || i < revealed
                          ? "true"
                          : "false"
                      }
                    >
                      {tok}
                    </span>
                  ))}
                  {isActive && streaming ? (
                    <span
                      aria-hidden
                      className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-pulse bg-sacred"
                    />
                  ) : null}
                </p>
              );
            })}
          </div>

          {footnote ? (
            <p className="mt-8 border-t border-ink/10 pt-5 font-sans text-sm leading-relaxed text-ink/55">
              {footnote}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
