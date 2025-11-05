"use client"

import { useMemo } from 'react'

export function StatBar({ value, label }: { value: number; label: string }) {
  const color = useMemo(() => (value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'), [value])
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <span className="text-[10px] text-muted-foreground w-16">{label}</span>
      <div className="h-2 w-32 rounded bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="text-[10px] w-8 text-right">{value}%</span>
    </div>
  )
}
