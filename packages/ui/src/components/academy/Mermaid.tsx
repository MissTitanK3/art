'use client'

import { useEffect, useState } from "react"
import mermaid from "mermaid"

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("")

  useEffect(() => {
    let mounted = true

    async function render() {
      try {
        mermaid.initialize({ startOnLoad: false, theme: "default" })
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart)
        if (mounted) {
          setSvg(svg)
        }
      } catch (error) {
        console.error("Mermaid render error:", error)
      }
    }

    render()

    return () => {
      mounted = false
    }
  }, [chart])

  return <div className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />
}
