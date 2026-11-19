"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";

type Props = {
  /** 0–1, priority-frame load progress. */
  progress: number;
  /** True once the hero can paint its first frame. */
  done: boolean;
};

/**
 * Minimal brand preloader. Covers the page only until the priority frames
 * are decoded, then fades and removes itself from the a11y tree and the
 * paint path entirely.
 */
export default function Preloader({ progress, done }: Props) {
  const [gone, setGone] = useState(false);
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  // Safety valve: never trap the page behind the loader on a slow network.
  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), 12000);
    return () => window.clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden={done}
      onTransitionEnd={() => done && setGone(true)}
      className={[
        "fixed inset-0 z-100 grid place-items-center bg-ink",
        "transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        done ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="flex w-[min(22rem,72vw)] flex-col items-center gap-8">
        <Image
          src="/logo.png"
          alt={brand.name}
          width={619}
          height={483}
          priority
          sizes="(max-width: 640px) 40vw, 160px"
          className="h-auto w-[clamp(7rem,22vw,10rem)]"
        />

        <div className="flex w-full flex-col gap-3">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Loading the Sacred Innovations experience"
            className="h-px w-full overflow-hidden bg-white/15"
          >
            <div
              className="h-full origin-left bg-sacred transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${Math.max(pct, 4) / 100})` }}
            />
          </div>

          <div className="flex items-baseline justify-between font-sans text-[0.6875rem] tracking-[0.22em] text-white/55 uppercase">
            <span>{brand.pillars}</span>
            <span className="tabular-nums text-white/80">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
