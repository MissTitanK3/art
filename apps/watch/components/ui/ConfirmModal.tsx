'use client';

import { ReactNode, useEffect } from 'react';

type Props = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ open, title, description, confirmLabel = 'Continue', cancelLabel = 'Cancel', onConfirm, onCancel }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const stop = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    const anyEvent = e as any;
    if (anyEvent.nativeEvent?.stopImmediatePropagation) anyEvent.nativeEvent.stopImmediatePropagation();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-[61] w-[92vw] max-w-md rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-5 text-white"
        role="dialog"
        aria-modal="true"
        onClick={stop}
        onMouseDown={stop}
        onPointerDown={stop}
        onTouchStart={stop}
      >
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        {description && <div className="text-sm text-white/80 mb-4">{description}</div>}
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

