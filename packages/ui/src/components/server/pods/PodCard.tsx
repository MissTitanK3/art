import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../../card.tsx'

type Props = {
  pod: any
}

export default function PodCard({ pod }: Props) {
  return (
    <Card
      className="rounded-2xl border py-2 grid gap-2 hover:shadow-md transition"
      aria-labelledby={`${pod.slug}-title`}
    >
      <CardHeader className="flex items-start justify-between">
        <div>
          <h2 id={`${pod.slug}-title`} className="font-semibold">
            {pod.name}
          </h2>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono">{pod.slug}</span>
          </p>
        </div>

        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
          {pod.channel}
        </span>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        Area: {pod.area}
      </CardContent>

      <CardFooter className="pt-1">
        {pod.channelLink ? (
          <span className="inline-flex items-center text-sm underline underline-offset-4 hover:opacity-90">
            Join / Public Vetting Link →
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Public link not published
          </span>
        )}
      </CardFooter>
    </Card>
  )
}