'use client';

import { ReactNode, useEffect, useRef } from 'react';

type BottomDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  heightClassName?: string;
};

export default function BottomDrawer({ isOpen, onClose, children, title, heightClassName }: BottomDrawerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[45] bg-black/30" onClick={onClose} aria-label="Close feed" />
      )}
      <div
        ref={ref}
        className={`fixed left-0 right-0 bottom-0 z-[46] bg-black/50 backdrop-blur-md border-t border-white/20 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'
          } ${heightClassName ?? 'h-[80vh]'} overflow-hidden`}>
        <div className="h-full flex flex-col">
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
            <div className="h-1.5 w-12 rounded bg-white/30 mx-auto" />
          </div>
          {title && <div className="px-4 py-2 text-white/90 font-semibold">{title}</div>}
          <div className="flex-1 overflow-y-auto px-4 py-3 text-white/90">{children}</div>
        </div>
      </div>
    </>
  );
}

