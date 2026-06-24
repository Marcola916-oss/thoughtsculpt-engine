/**
 * Procedural archetype sigils — SVG path strings unique to each archetype.
 * Used by ScrollSculpture's inner-core layer. No external assets, no icon
 * fonts; everything is generated from primitives so every line scales
 * crisply and inherits color from `currentColor`.
 *
 * Each generator returns an array of `<path|circle|polygon>` JSX-ready
 * SVG element descriptors. Render in a fixed `0 0 200 200` viewBox.
 */
import type { Archetype } from "@/lib/quiz/scoring";

export type SigilElement =
  | { kind: "path"; d: string; strokeWidth?: number; fill?: string }
  | { kind: "circle"; cx: number; cy: number; r: number; strokeWidth?: number; fill?: string }
  | { kind: "polygon"; points: string; strokeWidth?: number; fill?: string };

const C = 100; // center of 200x200 viewBox

function polygon(sides: number, radius: number, rotation = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides + rotation;
    pts.push(`${(C + Math.cos(a) * radius).toFixed(2)},${(C + Math.sin(a) * radius).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** AO — Cofre: 12 raios + hexágono interno + círculo de fechamento. */
function aoSigil(): SigilElement[] {
  const out: SigilElement[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12;
    const x1 = C + Math.cos(a) * 28;
    const y1 = C + Math.sin(a) * 28;
    const x2 = C + Math.cos(a) * 78;
    const y2 = C + Math.sin(a) * 78;
    out.push({ kind: "path", d: `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)}`, strokeWidth: 1.2 });
  }
  out.push({ kind: "polygon", points: polygon(6, 26, Math.PI / 6), strokeWidth: 1.6 });
  out.push({ kind: "circle", cx: C, cy: C, r: 84, strokeWidth: 0.8 });
  out.push({ kind: "circle", cx: C, cy: C, r: 8, fill: "currentColor", strokeWidth: 0 });
  return out;
}

/** SS — Coroa: 8 pontas triangulares + dodecágono. */
function ssSigil(): SigilElement[] {
  const out: SigilElement[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    const tipX = C + Math.cos(a) * 86;
    const tipY = C + Math.sin(a) * 86;
    const b1 = a - 0.16;
    const b2 = a + 0.16;
    const baseX1 = C + Math.cos(b1) * 50;
    const baseY1 = C + Math.sin(b1) * 50;
    const baseX2 = C + Math.cos(b2) * 50;
    const baseY2 = C + Math.sin(b2) * 50;
    out.push({
      kind: "path",
      d: `M${baseX1.toFixed(2)},${baseY1.toFixed(2)} L${tipX.toFixed(2)},${tipY.toFixed(2)} L${baseX2.toFixed(2)},${baseY2.toFixed(2)} Z`,
      strokeWidth: 1.2,
    });
  }
  out.push({ kind: "polygon", points: polygon(12, 44), strokeWidth: 1.4 });
  out.push({ kind: "polygon", points: polygon(12, 30, Math.PI / 12), strokeWidth: 0.8 });
  return out;
}

/** EA — Neblina: anéis concêntricos com opacidade decrescente + linha horizontal. */
function eaSigil(): SigilElement[] {
  const out: SigilElement[] = [];
  for (let r = 20; r <= 84; r += 8) {
    out.push({ kind: "circle", cx: C, cy: C, r, strokeWidth: 0.6 });
  }
  out.push({ kind: "path", d: `M20,${C} L80,${C} M120,${C} L180,${C}`, strokeWidth: 1.4 });
  out.push({ kind: "circle", cx: C, cy: C, r: 4, fill: "currentColor", strokeWidth: 0 });
  return out;
}

/** HI — Chama: 6 pétalas Bezier ascendentes + octógono. */
function hiSigil(): SigilElement[] {
  const out: SigilElement[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
    const tipX = C + Math.cos(a) * 82;
    const tipY = C + Math.sin(a) * 82;
    const c1x = C + Math.cos(a - 0.5) * 36;
    const c1y = C + Math.sin(a - 0.5) * 36;
    const c2x = C + Math.cos(a + 0.5) * 36;
    const c2y = C + Math.sin(a + 0.5) * 36;
    out.push({
      kind: "path",
      d: `M${C},${C} Q${c1x.toFixed(2)},${c1y.toFixed(2)} ${tipX.toFixed(2)},${tipY.toFixed(2)} Q${c2x.toFixed(2)},${c2y.toFixed(2)} ${C},${C} Z`,
      strokeWidth: 1.2,
    });
  }
  out.push({ kind: "polygon", points: polygon(8, 22, Math.PI / 8), strokeWidth: 1.4 });
  return out;
}

const GENERATORS: Record<Archetype, () => SigilElement[]> = {
  AO: aoSigil,
  SS: ssSigil,
  EA: eaSigil,
  HI: hiSigil,
};

export function getSigil(arch: Archetype): SigilElement[] {
  return GENERATORS[arch]();
}

/** Numeric price utilities for OfferMonolith dynamic total. */
export function parseMoney(s: string): number {
  // Keep digits, comma, dot; normalize comma decimal → dot.
  const cleaned = s.replace(/[^\d.,]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "");
  const normalized = cleaned.replace(/,(\d{1,2})$/, ".$1").replace(/,/g, "");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoneyLike(template: string, value: number): string {
  // Detect symbol/code by stripping digits + decimals from the template.
  const usesComma = /,\d{2}\b/.test(template);
  const formatted = usesComma ? value.toFixed(2).replace(".", ",") : value.toFixed(2);
  // Re-attach the non-digit prefix/suffix from the template.
  const m = template.match(/^([^\d]*)[\d.,]+([^\d]*)$/);
  if (m) return `${m[1]}${formatted}${m[2]}`;
  return formatted;
}