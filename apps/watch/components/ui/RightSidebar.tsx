"use client";

import { ReactNode, useEffect } from "react";

type RightSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  widthClassName?: string; // allow width overrides
};

export default function RightSidebar({
  isOpen,
  onClose,
  title,
  children,
  widthClassName,
}: RightSidebarProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[41] bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close panel"
        />
      )}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[50] border-l border-white/20 bg-black/50 backdrop-blur-md shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${widthClassName ?? "w-80"}`}
        aria-hidden={!isOpen}
        aria-label={title ?? "Sidebar"}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white truncate">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 text-white/90">
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}
