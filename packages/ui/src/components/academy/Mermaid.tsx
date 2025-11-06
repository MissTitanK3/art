'use client'

import { useEffect, useMemo, useState } from "react"
import mermaid from "mermaid"

type MermaidProps = {
  chart: string
  className?: string
  theme?: "auto" | "light" | "dark"
}

let initializedTheme: "light" | "dark" | null = null

function detectDark(theme: MermaidProps["theme"]): boolean {
  if (theme === "light") return false
  if (theme === "dark") return true
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) return true
  }
  if (typeof window !== "undefined" && "matchMedia" in window) {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (_) {
      // noop
    }
  }
  return false
}

function buildConfig(isDark: boolean) {
  const light = {
    primaryColor: "#f9fafb", // gray-50
    primaryBorderColor: "#374151", // gray-700
    primaryTextColor: "#111827", // gray-900
    lineColor: "#9ca3af", // gray-400
    clusterBkg: "#f3f4f6", // gray-100
    clusterBorderColor: "#9ca3af",
    edgeLabelBackground: "#ffffff",
  }
  const dark = {
    primaryColor: "#111827", // gray-900
    primaryBorderColor: "#e5e7eb", // gray-200
    primaryTextColor: "#e5e7eb", // gray-200
    lineColor: "#9ca3af", // gray-400
    clusterBkg: "#1f2937", // gray-800
    clusterBorderColor: "#9ca3af",
    edgeLabelBackground: "#111827",
  }

  const vars = isDark ? dark : light

  const themeCSS = `
    .label { font-weight: 600; }
    .node rect, .node polygon, .node circle, .node ellipse { rx: 10px; ry: 10px; stroke-width: 1.2px; }
    .node rect, .node polygon { filter: drop-shadow(0 4px 8px rgba(0,0,0,0.08)); }
    .cluster rect { rx: 12px; ry: 12px; }
    .edgePath .path { stroke-width: 2px; }
    .edgeLabel rect { fill: ${vars.edgeLabelBackground}; rx: 4px; ry: 4px; opacity: 0.9; }
  `

  return {
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    themeVariables: {
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"",
      primaryColor: vars.primaryColor,
      primaryBorderColor: vars.primaryBorderColor,
      primaryTextColor: vars.primaryTextColor,
      lineColor: vars.lineColor,
      clusterBkg: vars.clusterBkg,
      clusterBorderColor: vars.clusterBorderColor,
      edgeLabelBackground: vars.edgeLabelBackground,
    },
    themeCSS,
  } as const
}

// Auto-color Yes/No flowchart links by index (best-effort)
function enhanceFlowchart(chart: string, isDark: boolean) {
  // Only for flowchart-like syntax
  if (!/^\s*graph\s+/m.test(chart)) return chart
  // If author already provided linkStyle directives, don't auto-append
  if (/^\s*linkStyle\s+\d+/m.test(chart)) return chart

  const lines = chart.split(/\r?\n/)
  let linkIndex = 0
  const yes: number[] = []
  const no: number[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith("%%")) continue
    if (/^(classDef|class |style |linkStyle |click |subgraph|end)\b/.test(line)) continue
    // Count edges by searching patterns like --, -.-, ==, o-, -x- before '>'
    const edgeMatch = line.match(/[-.ox=]+>/)
    if (edgeMatch) {
      const match = /\|([^|]+)\|/.exec(line)
      const rawLabel = match?.[1] ?? ""
      const label = rawLabel.trim().toLowerCase()
      if (label === "yes") yes.push(linkIndex)
      if (label === "no") no.push(linkIndex)
      linkIndex += 1
    }
  }

  if (yes.length === 0 && no.length === 0) return chart

  const yesColor = "#22c55e" // green-500
  const noColor = "#ef4444" // red-500
  const edgeText = isDark ? "#e5e7eb" : "#111827" // light text on dark, dark text on light

  const appendix = [
    "",
    "%% Auto-applied link styling for Yes/No",
    ...yes.map((i) => `linkStyle ${i} stroke:${yesColor},stroke-width:2px,color:${edgeText},font-weight:bold;`),
    ...no.map((i) => `linkStyle ${i} stroke:${noColor},stroke-width:2px,color:${edgeText},font-weight:bold;`),
  ]

  return [...lines, ...appendix].join("\n")
}

export function Mermaid({ chart, className, theme = "auto" }: MermaidProps) {
  const [svg, setSvg] = useState<string>("")

  const isDark = useMemo(() => detectDark(theme), [theme])

  const preparedChart = useMemo(() => enhanceFlowchart(chart, isDark), [chart, isDark])

  useEffect(() => {
    let mounted = true

    async function render() {
      try {
        const targetTheme: "light" | "dark" = isDark ? "dark" : "light"
        if (initializedTheme !== targetTheme) {
          mermaid.initialize(buildConfig(isDark))
          initializedTheme = targetTheme
        }
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, preparedChart)
        if (mounted) setSvg(svg)
      } catch (error) {
        console.error("Mermaid render error:", error)
      }
    }

    render()

    return () => {
      mounted = false
    }
  }, [preparedChart, isDark])

  const base =
    "mermaid rounded-lg border p-4 bg-white/80 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/60 dark:border-zinc-700"

  return (
    <div
      className={className ? `${base} ${className}` : base}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
