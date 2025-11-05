"use client"

// Extremely lightweight Markdown renderer for headings + paragraphs
export function MarkdownView({ source }: { source: string }) {
  const lines = source.split(/\r?\n/)
  const blocks: { type: 'h2' | 'h3' | 'p'; text: string }[] = []
  let para: string[] = []
  function flushPara() {
    if (para.length > 0) {
      blocks.push({ type: 'p', text: para.join(' ') })
      para = []
    }
  }
  for (const line of lines) {
    if (/^\s*$/.test(line)) { flushPara(); continue }
    if (line.startsWith('### ')) { flushPara(); blocks.push({ type: 'h3', text: line.slice(4) }); continue }
    if (line.startsWith('## ')) { flushPara(); blocks.push({ type: 'h2', text: line.slice(3) }); continue }
    para.push(line.trim())
  }
  flushPara()
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((b, i) => b.type === 'h2' ? (
        <h2 key={i} className="mt-4 first:mt-0">{b.text}</h2>
      ) : b.type === 'h3' ? (
        <h3 key={i} className="mt-3">{b.text}</h3>
      ) : (
        <p key={i}>{b.text}</p>
      ))}
    </div>
  )
}

