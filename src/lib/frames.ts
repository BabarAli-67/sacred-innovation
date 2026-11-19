/**
 * Image-sequence configuration for the pinned hero.
 *
 * Files live at /public/frames/frame_0001.webp … frame_0198.webp
 * (1280×720, ~57 KB each, ~11.3 MB total).
 */

export const FRAME_COUNT = 198;

/** Frames fetched before the preloader releases the page. */
export const PRIORITY_COUNT = 28;

/** Parallel requests used for the background (non-priority) fill. */
export const BACKGROUND_CONCURRENCY = 6;

/** Intrinsic size of every frame — used for cover math before decode. */
export const FRAME_WIDTH = 1280;
export const FRAME_HEIGHT = 720;

/** Retina sharpness without the GPU cost of 3x buffers. */
export const MAX_DPR = 2;

/** 1-indexed on disk; this takes a 0-indexed frame number. */
export function framePath(index: number): string {
  const n = Math.min(Math.max(index, 0), FRAME_COUNT - 1) + 1;
  return `/frames/frame_${String(n).padStart(4, "0")}.webp`;
}

/**
 * Draw order for the background fill: spread across the timeline first
 * (every 8th frame), then fill the gaps. A viewer who scrubs fast lands
 * near a decoded frame almost immediately instead of hitting a wall of
 * undecoded images at 15%.
 */
export function backgroundLoadOrder(): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (const step of [8, 4, 2, 1]) {
    for (let i = PRIORITY_COUNT; i < FRAME_COUNT; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}
