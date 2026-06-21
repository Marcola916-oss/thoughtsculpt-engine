/**
 * Global cache for the 120 brain animation frames.
 *
 * Lets us start downloading + processing (black-matte removal) the frames
 * as soon as the quiz loader appears, so that when the reveal stage mounts
 * the canvas can draw frame 0 instantly and start the RAF loop with zero
 * network and zero blank flash.
 */

export const FRAME_COUNT = 120;
const BLACK_CUTOFF = 38;
const FULL_ALPHA_AT = 205;

const frameUrl = (i: number) =>
  `/brain-frames/0617_${String(i).padStart(3, "0")}.webp`;

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function removeBlackMatte(img: HTMLImageElement): HTMLCanvasElement {
  const frame = document.createElement("canvas");
  frame.width = img.naturalWidth;
  frame.height = img.naturalHeight;
  const ctx = frame.getContext("2d", { alpha: true, willReadFrequently: true });
  if (!ctx) return frame;
  ctx.clearRect(0, 0, frame.width, frame.height);
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    if (max <= BLACK_CUTOFF) {
      data[i + 3] = 0;
      continue;
    }
    const alpha = Math.pow(smoothstep(BLACK_CUTOFF, FULL_ALPHA_AT, max), 1.28);
    data[i + 3] = Math.round(alpha * 255);
    if (alpha > 0) {
      const recover = Math.min(3.5, 1 / alpha);
      data[i] = Math.min(255, Math.round(r * recover));
      data[i + 1] = Math.min(255, Math.round(g * recover));
      data[i + 2] = Math.min(255, Math.round(b * recover));
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return frame;
}

let framesPromise: Promise<HTMLCanvasElement[]> | null = null;
let framesReady: HTMLCanvasElement[] | null = null;

function loadOne(i: number): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.src = frameUrl(i);
    img.onload = () => {
      try {
        resolve(removeBlackMatte(img));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
}

/**
 * Start (or return existing) preload of all 120 frames. Idempotent.
 * Resolves to the processed frame array once every frame is in memory.
 */
export function startBrainFramesPreload(): Promise<HTMLCanvasElement[]> {
  if (typeof window === "undefined") {
    return Promise.resolve([]);
  }
  if (framesReady) return Promise.resolve(framesReady);
  if (framesPromise) return framesPromise;

  framesPromise = Promise.all(
    Array.from({ length: FRAME_COUNT }, (_, i) => loadOne(i)),
  ).then((results) => {
    const frames = results.filter((c): c is HTMLCanvasElement => c !== null);
    framesReady = frames;
    return frames;
  });
  return framesPromise;
}

/** Sync getter — returns null if not ready yet. */
export function getBrainFrames(): HTMLCanvasElement[] | null {
  return framesReady;
}

export function areBrainFramesReady(): boolean {
  return framesReady !== null && framesReady.length > 0;
}