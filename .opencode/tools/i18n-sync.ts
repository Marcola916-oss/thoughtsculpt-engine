import { defineTool } from "@opencode/core/tool"
import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * i18n Sync Tool — Verifies translation key coverage
 * across all 5 MindReset locales (PT/EN/PL/RO/AR).
 *
 * Parses translations.ts, extracts all keys per locale,
 * and reports missing/extra keys.
 */

const LOCALES = ["pt", "en", "pl", "ro", "ar"] as const

function extractKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...extractKeys(v as Record<string, unknown>, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

export default defineTool({
  name: "i18n-sync",
  description:
    "Checks i18n translation key coverage across all 5 MindReset locales (PT/EN/PL/RO/AR). Reports missing and extra keys.",
  parameters: {},
  async execute() {
    const tsPath = resolve(process.cwd(), "src/lib/i18n/translations.ts")
    const content = readFileSync(tsPath, "utf-8")

    // Extract the translations object by evaluating the exports
    // We parse the file structure to find locale blocks
    const results: string[] = []
    const localeKeys: Record<string, string[]> = {}

    // Find all top-level locale exports
    // Pattern: export const pt: Dict = { ... }
    for (const locale of LOCALES) {
      const regex = new RegExp(`export const ${locale}: Dict = \\{([\\s\\S]*?)\\n\\}`, "m")
      const match = content.match(regex)
      if (match) {
        // Extract key paths from the matched block
        const block = match[1]
        const keys: string[] = []

        // Simple key extraction: find "key:" patterns at various depths
        const keyRegex = /^\s+(\w+):\s/gm
        let keyMatch: RegExpExecArray | null
        while ((keyMatch = keyRegex.exec(block)) !== null) {
          keys.push(keyMatch[1])
        }

        localeKeys[locale] = keys
      }
    }

    // Report
    results.push("=== i18n Sync Report ===\n")

    if (Object.keys(localeKeys).length === 0) {
      results.push("WARNING: Could not parse locale keys from translations.ts")
      results.push("Manual inspection required.")
      return results.join("\n")
    }

    const ptKeys = localeKeys["pt"] || []
    results.push(`PT keys: ${ptKeys.length}`)
    for (const loc of LOCALES) {
      const keys = localeKeys[loc] || []
      const missing = ptKeys.filter((k) => !keys.includes(k))
      const extra = keys.filter((k) => !ptKeys.includes(k))
      results.push(`${loc.toUpperCase()} keys: ${keys.length} | Missing: ${missing.length} | Extra: ${extra.length}`)
      if (missing.length > 0) results.push(`  Missing: ${missing.join(", ")}`)
      if (extra.length > 0) results.push(`  Extra: ${extra.join(", ")}`)
    }

    return results.join("\n")
  },
})
