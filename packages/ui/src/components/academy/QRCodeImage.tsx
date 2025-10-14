'use client'

import { useEffect, useState } from "react"
import { generateQRDataURL } from "@workspace/ui/lib/qrcode"

export function QRCodeImage({ value }: { value: string }) {
  const [dataUrl, setDataUrl] = useState<string>("")

  useEffect(() => {
    let active = true

    async function load() {
      const url = await generateQRDataURL(value)
      if (!active) return
      setDataUrl(url)
    }

    load()

    return () => {
      active = false
    }
  }, [value])

  const linkLabel = value.replace(/^https?:\/\//, "")

  return (
    <div className="mx-auto flex w-72 max-w-sm flex-col items-center space-y-3 rounded-lg border bg-slate-600 px-4 py-4 text-center shadow-md">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="QR code linking to resource"
          width={200}
          height={200}
          className="h-auto w-full max-w-[200px] rounded bg-white"
        />
      ) : (
        <div className="flex h-[200px] w-[200px] items-center justify-center rounded bg-slate-500 text-xs text-slate-200">
          Generating QR…
        </div>
      )}
      <a href={value} className="w-full break-words text-xs text-gray-200" target="_blank" rel="noreferrer">
        {linkLabel}
      </a>
      {dataUrl ? (
        <a
          href={dataUrl}
          download="academy-qr.png"
          className="text-sm text-blue-200 underline transition hover:text-blue-100 focus:outline-none"
        >
          Download QR Code
        </a>
      ) : null}
    </div>
  )
}
