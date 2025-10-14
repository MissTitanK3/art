'use client'

import type { ReactNode } from "react"
import { useEffect, useState } from "react"

export function FadeOnScroll({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let lastScroll = window.scrollY

    const handleScroll = () => {
      const current = window.scrollY
      const nearTop = current < 100
      setVisible(nearTop || current < lastScroll)
      lastScroll = current
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-20"}`}>
      {children}
    </div>
  )
}
