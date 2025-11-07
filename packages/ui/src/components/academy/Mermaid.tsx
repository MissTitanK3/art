'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import mermaid from "mermaid"

type MermaidProps = {
  chart: string
  className?: string
  theme?: "auto" | "light" | "dark"
}

let initializedKey: string | null = null

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
    flowchart: {
      htmlLabels: false, // use SVG text+rect so we can reliably style/measure labels
    },
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
  const containerRef = useRef<HTMLDivElement | null>(null)

  const isDark = useMemo(() => detectDark(theme), [theme])

  const preparedChart = useMemo(() => enhanceFlowchart(chart, isDark), [chart, isDark])

  useEffect(() => {
    let mounted = true

    async function render() {
      try {
        const targetTheme: "light" | "dark" = isDark ? "dark" : "light"
        const key = JSON.stringify({ theme: targetTheme, htmlLabels: false })
        if (initializedKey !== key) {
          mermaid.initialize(buildConfig(isDark))
          initializedKey = key
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

  // Post-process rendered SVG to enhance Yes/No edge labels with padding and rounded corners
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const svgEl = root.querySelector('svg')
    if (!svgEl) return

    const padX = 6 // horizontal padding in px
    const padY = 3 // vertical padding in px
    const radius = 8 // border radius in px
    const yesColor = '#22c55e' // green-500
    const noColor = '#ef4444' // red-500

    const labels = svgEl.querySelectorAll<SVGGElement>('g.edgeLabel')
    labels.forEach((g) => {
      // Avoid double-processing
      if ((g as any).dataset && (g as any).dataset.padded === '1') return

      // Try SVG text-based labels first
      const textEl = g.querySelector('text')
      const rectEl = g.querySelector('rect')
      if (textEl && rectEl) {
        const raw = (textEl.textContent || '').trim().toLowerCase()
        if (raw !== 'yes' && raw !== 'no') return

        // Increase background rect size to simulate padding
        const w = parseFloat(rectEl.getAttribute('width') || '0')
        const h = parseFloat(rectEl.getAttribute('height') || '0')
        const x = parseFloat(rectEl.getAttribute('x') || '0')
        const y = parseFloat(rectEl.getAttribute('y') || '0')

        if (!Number.isNaN(w) && !Number.isNaN(h)) {
          rectEl.setAttribute('width', String(w + padX * 2))
          rectEl.setAttribute('height', String(h + padY * 2))
          rectEl.setAttribute('x', String(x - padX))
          rectEl.setAttribute('y', String(y - padY))
        }

        // Rounded corners and a subtle border
        rectEl.setAttribute('rx', String(radius))
        rectEl.setAttribute('ry', String(radius))
        rectEl.setAttribute('stroke-width', '1.5')
        rectEl.setAttribute('stroke', raw === 'yes' ? yesColor : noColor)

        try { (g as any).dataset.padded = '1' } catch (_) { void 0 }
        return
      }

      // Fallback: HTML labels via foreignObject
      const foreign = g.querySelector('foreignObject') as unknown as (SVGForeignObjectElement | null)
      if (foreign) {
        const div = foreign.querySelector('div') as HTMLDivElement | null
        if (!div) return
        const raw = (div.textContent || '').trim().toLowerCase()
        if (raw !== 'yes' && raw !== 'no') return
        div.style.padding = `${padY}px ${padX}px`
        div.style.borderRadius = `${radius}px`
        div.style.border = `1.5px solid ${raw === 'yes' ? yesColor : noColor}`
        div.style.display = 'inline-block'
        try { (g as any).dataset.padded = '1' } catch (_) { void 0 }
      }
    })
  }, [svg])

  const base =
    "mermaid rounded-lg border p-4 bg-white/80 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900/60 dark:border-zinc-700"

  return (
    <div
      ref={containerRef}
      className={className ? `${base} ${className}` : base}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
