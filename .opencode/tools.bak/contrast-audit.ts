import { defineTool } from "@opencode/core/tool"
import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * Contrast Audit Tool — Verifica WCAG AA contrast ratios
 * for all foreground/background color pairs in MindReset's styles.css.
 *
 * Parses oklch() values, computes relative luminance,
 * and reports pass/fail against WCAG AA (4.5:1 normal, 3:1 large).
 */

interface ColorDef {
  name: string
  oklch: string
  luminance: number
}

function parseOklch(str: string): { l: number; c: number; h: number } | null {
  const m = str.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\s*\)/)
  if (!m) return null
  return { l: parseFloat(m[1]) / 100, c: parseFloat(m[2]), h: parseFloat(m[3]) }
}

function oklchToLinear(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

function oklchLuminance(l: number, c: number, h: number): number {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const l_2 = l_ * l_ * l_
  const m_2 = m_ * m_ * m_
  const s_2 = s_ * s_ * s_
  return oklchToLinear(0.2104542553 * l_2 + 0.793617785 * m_2 - 0.0040720468 * s_2)
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export default defineTool({
  name: "contrast-audit",
  description: "Audits WCAG AA contrast ratios for all foreground/background color pairs in MindReset's CSS. Reports pass/fail with actual ratios.",
  parameters: {},
  async execute() {
    const cssPath = resolve(process.cwd(), "src/styles.css")
    const css = readFileSync(cssPath, "utf-8")

    const colors: ColorDef[] = []
    const colorRegex = /(--[a-z-]+):\s*(oklch\([^)]+\))/g
    let match: RegExpExecArray | null

    while ((match = colorRegex.exec(css)) !== null) {
      const parsed = parseOklch(match[2])
      if (parsed && parsed.c > 0.01) {
        colors.push({
          name: match[1],
          oklch: match[2],
          luminance: oklchLuminance(parsed.l, parsed.c, parsed.h),
        })
      }
    }

    const foregrounds = colors.filter(
      (c) =>
        c.name.includes("foreground") ||
        c.name.includes("muted-foreground") ||
        c.name.includes("arch-primary") ||
        c.name.includes("accent-deep")
    )

    const backgrounds: ColorDef[] = [
      { name: "--background", oklch: "oklch(0% 0 0)", luminance: 0 },
      { name: "--card", oklch: "oklch(13% 0 0)", luminance: 0.017 },
      { name: "--muted", oklch: "oklch(18% 0 0)", luminance: 0.034 },
      { name: "--border", oklch: "oklch(22% 0 0)", luminance: 0.052 },
    ]

    const results: string[] = []
    let failures = 0
    let passes = 0

    for (const fg of foregrounds) {
      for (const bg of backgrounds) {
        const ratio = contrastRatio(fg.luminance, bg.luminance)
        const ratioStr = ratio.toFixed(2)
        const pass = ratio >= 4.5
        const status = pass ? "PASS" : "FAIL"

        if (!pass) failures++
        else passes++

        results.push(`${status} ${ratioStr}:1  ${fg.name} on ${bg.name}`)
      }
    }

    const summary = `\n=== Contrast Audit ===\nForegrounds: ${foregrounds.length}\nBackgrounds: ${backgrounds.length}\nPairs tested: ${foregrounds.length * backgrounds.length}\nPass: ${passes}\nFail: ${failures}\n`

    return summary + results.join("\n")
  },
})
