import { defineTool } from "@opencode/core/tool"
import { execSync } from "child_process"

/**
 * Build Check Tool — Runs build + typecheck + lint
 * in a single command for MindReset.
 *
 * Reports pass/fail for each step with timing.
 */

export default defineTool({
  name: "build-check",
  description:
    "Runs npm run build + npx tsc --noEmit + npx eslint for MindReset. Reports pass/fail with timing for each step.",
  parameters: {},
  async execute() {
    const results: string[] = []
    results.push("=== MindReset Build Check ===\n")

    const steps = [
      { name: "Build", cmd: "npm run build" },
      { name: "TypeCheck", cmd: "npx tsc --noEmit" },
      { name: "Lint (landing)", cmd: "npx eslint src/components/landing/" },
      { name: "Lint (routes)", cmd: "npx eslint src/routes/index.tsx" },
    ]

    for (const step of steps) {
      const start = Date.now()
      try {
        execSync(step.cmd, { encoding: "utf-8", timeout: 60000 })
        const elapsed = ((Date.now() - start) / 1000).toFixed(1)
        results.push(`PASS  ${step.name} (${elapsed}s)`)
      } catch (err: unknown) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(1)
        const e = err as { stderr?: string; message?: string }
        const output = e.stderr || e.message || "Unknown error"
        const lines = output.split("\n").slice(0, 10).join("\n")
        results.push(`FAIL  ${step.name} (${elapsed}s)\n${lines}`)
      }
    }

    return results.join("\n")
  },
})
