'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function renderMermaid() {
      try {
        // Initialize Mermaid only once
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, chart);
        if (mounted) setSvg(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    }

    renderMermaid();
    return () => {
      mounted = false;
    };
  }, [chart]);

  return <div ref={ref} className="mermaid" dangerouslySetInnerHTML={{ __html: svg }} />;
}
