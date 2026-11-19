"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Burn Away — a scroll-driven ember dissolve from one image into another.
 *
 * Built here rather than vendored: the 21st.dev component of this name is a
 * full page transition that burns one HTML document into another using
 * Chrome's HTML-in-Canvas. That is the wrong shape for an in-page before/after
 * reveal, and it degrades to a crossfade everywhere but one browser. This does
 * the same thing visually, as a section-level reveal, in every browser.
 *
 * How it works: a fractal value-noise field is generated once, biased left to
 * right so the burn sweeps across rather than blooming randomly. Each frame a
 * low-resolution alpha mask is thresholded out of that field — cheap, roughly
 * 35k pixels — and used with `destination-in` to erase the "before" image.
 * A second pass paints a narrow ember band where the threshold is crossing and
 * composites it with `lighter`, so the burning edge glows. Scaling the small
 * mask up to the canvas softens the edge for free.
 */

type Props = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
  className?: string;
  /**
   * ScrollTrigger start/end. These are measured against the nearest
   * `[data-burn-track]` ancestor rather than the canvas itself — the canvas is
   * sticky, so its own rect stops moving once it pins and the burn would never
   * finish. The track is the column in normal flow, so the burn can be timed
   * against the section the reader is actually moving through.
   */
  start?: string;
  end?: string;
};

const MASK_W = 256;

/** Smooth value noise, a few octaves, in [0,1]. */
function buildNoise(w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  const octave = (cells: number, amp: number) => {
    const gw = cells + 1;
    const grid = new Float32Array(gw * gw);
    for (let i = 0; i < grid.length; i++) grid[i] = Math.random();
    const fade = (t: number) => t * t * (3 - 2 * t);
    for (let y = 0; y < h; y++) {
      const gy = (y / h) * cells;
      const y0 = Math.floor(gy);
      const fy = fade(gy - y0);
      for (let x = 0; x < w; x++) {
        const gx = (x / w) * cells;
        const x0 = Math.floor(gx);
        const fx = fade(gx - x0);
        const a = grid[y0 * gw + x0];
        const b = grid[y0 * gw + x0 + 1];
        const c = grid[(y0 + 1) * gw + x0];
        const d = grid[(y0 + 1) * gw + x0 + 1];
        const top = a + (b - a) * fx;
        const bottom = c + (d - c) * fx;
        out[y * w + x] += (top + (bottom - top) * fy) * amp;
      }
    }
  };
  octave(4, 0.5);
  octave(9, 0.3);
  octave(19, 0.2);
  // Bias so the burn travels left to right instead of blooming at random.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out[i] = out[i] * 0.62 + (1 - x / w) * 0.38;
    }
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of out) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const span = hi - lo || 1;
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - lo) / span;
  return out;
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
    const done = () => resolve(img);
    if (typeof img.decode === "function") {
      img.decode().then(done).catch(() => {
        img.onload = done;
        img.onerror = reject;
      });
    } else {
      img.onload = done;
      img.onerror = reject;
    }
  });
}

export default function BurnAway({
  beforeSrc,
  afterSrc,
  beforeLabel,
  afterLabel,
  alt,
  className,
  start = "top 75%",
  end = "center 40%",
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beforeTagRef = useRef<HTMLSpanElement | null>(null);
  const afterTagRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let raf = 0;
    let progress = 0;
    let before: HTMLImageElement | null = null;
    let after: HTMLImageElement | null = null;
    let maskH = Math.round(MASK_W * 0.66);
    let noise: Float32Array | null = null;

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");
    const emberCanvas = document.createElement("canvas");
    const emberCtx = emberCanvas.getContext("2d");
    const scratch = document.createElement("canvas");
    const scratchCtx = scratch.getContext("2d");
    let maskData: ImageData | null = null;
    let emberData: ImageData | null = null;

    const cover = (
      c: CanvasRenderingContext2D,
      img: HTMLImageElement,
      w: number,
      h: number,
    ) => {
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      c.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const draw = () => {
      raf = 0;
      if (
        disposed || !before || !after || !noise ||
        !maskCtx || !emberCtx || !scratchCtx || !maskData || !emberData
      ) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;
      if (!w || !h) return;

      // Pad the sweep so it fully clears at both ends.
      const p = progress * 1.22 - 0.11;
      const band = 0.085;
      const m = maskData.data;
      const e = emberData.data;

      for (let i = 0; i < noise.length; i++) {
        const d = noise[i] - p;
        // "Before" survives ahead of the burn line, with a soft edge.
        m[i * 4 + 3] = d <= 0 ? 0 : d >= band ? 255 : (d / band) * 255;
        // Ember glows where the line is crossing right now.
        const glow = 1 - Math.min(1, Math.abs(d) / band);
        const g = glow * glow;
        e[i * 4] = 255 * g;
        e[i * 4 + 1] = 120 * g * g;
        e[i * 4 + 2] = 40 * g * g * g;
        e[i * 4 + 3] = 235 * g;
      }
      maskCtx.putImageData(maskData, 0, 0);
      emberCtx.putImageData(emberData, 0, 0);

      // After image underneath.
      ctx.clearRect(0, 0, w, h);
      cover(ctx, after, w, h);

      // Before image, erased by the mask.
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.clearRect(0, 0, w, h);
      cover(scratchCtx, before, w, h);
      scratchCtx.globalCompositeOperation = "destination-in";
      scratchCtx.drawImage(maskCanvas, 0, 0, w, h);
      scratchCtx.globalCompositeOperation = "source-over";
      ctx.drawImage(scratch, 0, 0);

      // Burning edge.
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(emberCanvas, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      // BEFORE hands over to AFTER around the midpoint of the burn, so the
      // two badges cross rather than both sitting blank in between.
      if (beforeTagRef.current) {
        const o = Math.min(1, Math.max(0, 1 - (progress - 0.1) / 0.35));
        beforeTagRef.current.style.opacity = String(o);
        beforeTagRef.current.style.transform = `translateY(${(1 - o) * -6}px)`;
      }
      if (afterTagRef.current) {
        const o = Math.min(1, Math.max(0, (progress - 0.45) / 0.3));
        afterTagRef.current.style.opacity = String(o);
        afterTagRef.current.style.transform = `translateY(${(1 - o) * 6}px)`;
      }
    };

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(draw);
    };

    const size = () => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      scratch.width = canvas.width;
      scratch.height = canvas.height;
      maskH = Math.max(
        32,
        Math.round(MASK_W * (canvas.height / Math.max(1, canvas.width))),
      );
      maskCanvas.width = MASK_W;
      maskCanvas.height = maskH;
      emberCanvas.width = MASK_W;
      emberCanvas.height = maskH;
      maskData = maskCtx?.createImageData(MASK_W, maskH) ?? null;
      emberData = emberCtx?.createImageData(MASK_W, maskH) ?? null;
      if (maskData) {
        // White throughout; only alpha is written each frame.
        const d = maskData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255;
          d[i + 1] = 255;
          d[i + 2] = 255;
        }
      }
      noise = buildNoise(MASK_W, maskH);
      draw();
    };

    let trigger: ScrollTrigger | null = null;

    void Promise.all([load(beforeSrc), load(afterSrc)])
      .then(([b, a]) => {
        if (disposed) return;
        before = b;
        after = a;
        size();

        if (reduced) {
          progress = 1;
          draw();
          return;
        }

        // Time the burn against the column in normal flow, not the sticky
        // canvas: once the canvas pins, its own rect stops advancing and the
        // reveal would stall until the reader had scrolled past the section.
        const track =
          (wrap.closest("[data-burn-track]") as HTMLElement | null) ?? wrap;

        trigger = ScrollTrigger.create({
          trigger: track,
          start,
          end,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress = self.progress;
            schedule();
          },
        });
      })
      .catch(() => {
        /* A missing frame leaves the <noscript>/alt image in place. */
      });

    const ro = new ResizeObserver(() => size());
    ro.observe(wrap);

    return () => {
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
      ro.disconnect();
      trigger?.kill();
    };
  }, [beforeSrc, afterSrc, start, end]);

  return (
    <div
      ref={wrapRef}
      /* Sizing is the caller's: it has to fill its column, and a fixed aspect
         here would fight whatever height that column needs. */
      className={["relative w-full overflow-hidden bg-ink", className]
        .filter(Boolean)
        .join(" ")}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="absolute inset-0 h-full w-full"
      />

      <noscript>
        <img
          src={afterSrc}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </noscript>

      {/* Crisp pills, top-left to top-right, crossing as the burn passes. */}
      <span
        ref={beforeTagRef}
        className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink/80 px-3.5 py-1.5 font-sans text-[0.625rem] font-medium tracking-[0.24em] text-white uppercase backdrop-blur-sm"
      >
        <span aria-hidden className="block size-1.5 rounded-full bg-white/60" />
        {beforeLabel}
      </span>
      <span
        ref={afterTagRef}
        style={{ opacity: 0 }}
        className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-sacred/40 bg-sacred px-3.5 py-1.5 font-sans text-[0.625rem] font-medium tracking-[0.24em] text-white uppercase shadow-[0_0_24px_-6px_rgba(227,50,43,0.9)]"
      >
        <span aria-hidden className="block size-1.5 rounded-full bg-white" />
        {afterLabel}
      </span>
    </div>
  );
}
