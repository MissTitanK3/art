"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Back to top"
      className={[
        "fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full",
        "border border-input bg-background/80 backdrop-blur text-muted-foreground shadow",
        "transition-transform transition-opacity duration-200 ease-out",
        visible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90 pointer-events-none",
      ].join(" ")}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
