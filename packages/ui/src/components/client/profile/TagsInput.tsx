"use client"
import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Badge } from "../../badge.tsx"
import { Input } from "../../input.tsx"

export function TagsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  className,
  description,
  max = 10,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
  description?: string
  max?: number
}) {
  const [draft, setDraft] = React.useState("")

  const handleAdd = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-")
    if (!tag) return
    if (value.includes(tag)) return
    if (value.length >= max) return
    onChange([...value, tag])
    setDraft("")
  }

  return (
    <div className="space-y-1">
      <div className={cn("rounded-xl border p-2 flex flex-wrap gap-2", className)}>
        {value.map((tag, idx) => (
          <Badge key={tag + idx} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              className="ml-1 opacity-80 hover:opacity-100"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd(draft)
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          placeholder={placeholder}
          className="border-0 shadow-none focus-visible:ring-0 w-auto flex-grow min-w-[6rem]"
          inputMode="text"
        />
      </div>
      {description && <p className="text-xs text-muted-foreground px-1">{description}</p>}
    </div>
  )
}
