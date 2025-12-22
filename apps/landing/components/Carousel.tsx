"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

interface CarouselProps {
  children: React.ReactNode | React.ReactNode[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms
  showDots?: boolean;
  showArrows?: boolean;
  ariaLabel?: string;
}

export default function Carousel({
  children,
  className,
  autoPlay = false,
  autoPlayInterval = 7000,
  showDots = true,
  showArrows = true,
  ariaLabel = "Carousel",
}: CarouselProps) {
  const slides = useMemo(() => React.Children.toArray(children), [children]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const [dragDelta, setDragDelta] = useState(0);

  const goTo = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, autoPlayInterval);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoPlay, autoPlayInterval, slides.length]);

  useEffect(() => {
    const measure = () => {
      const w = viewportRef.current?.clientWidth ?? 0;
      setViewportWidth(w);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    setDragDelta(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    setDragDelta(delta);
  };

  const settleDrag = () => {
    if (!isDragging) return;
    const threshold = Math.max(60, viewportWidth * 0.15);
    if (dragDelta > threshold) {
      setIndex((i) => (i - 1 + slides.length) % slides.length);
    } else if (dragDelta < -threshold) {
      setIndex((i) => (i + 1) % slides.length);
    }
    setIsDragging(false);
    setDragDelta(0);
    if (autoPlay && slides.length > 1) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % slides.length);
      }, autoPlayInterval);
    }
  };

  return (
    <div className={cn("relative w-full", className)} aria-roledescription="carousel" aria-label={ariaLabel}>
      {/* Track */}
      <div
        ref={viewportRef}
        className="overflow-hidden rounded-2xl border border-input bg-card touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={settleDrag}
        onPointerCancel={settleDrag}
        onPointerLeave={settleDrag}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: viewportWidth
              ? `translate3d(${-(index * viewportWidth) + dragDelta}px, 0, 0)`
              : `translate3d(0, 0, 0)`,
            width: viewportWidth ? `${viewportWidth * slides.length}px` : undefined,
            willChange: "transform",
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="shrink-0 grow-0 flex h-full w-full items-center justify-center "
              style={{ width: viewportWidth ? `${viewportWidth}px` : undefined }}
            >
              <div className="w-full sm:w-[95%] md:w-[85%] lg:w-[70%] xl:w-[60%] 2xl:w-[55%] max-w-5xl mx-auto">
                {slide}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {showArrows && slides.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background/80 backdrop-blur text-muted-foreground shadow hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-background/80 backdrop-blur text-muted-foreground shadow hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {/* Dots */}
      {showDots && slides.length > 1 ? (
        <div className="mt-3 flex w-full items-center justify-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2.5 w-3.5 rounded-full border border-input transition",
                i === index ? "bg-foreground" : "bg-muted hover:bg-accent"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
