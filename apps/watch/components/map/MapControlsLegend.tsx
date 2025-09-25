'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useTranslations } from '@/lib/il8n/useTranslations';

export function MapControlsLegend() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslations();

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      {open ? (
        <div
          className="w-60 bg-white/10 text-white backdrop-blur-md text-sm rounded-lg p-4 shadow-xl space-y-2"
          role="region"
          aria-label={t('mapControlsTitle')}>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">🕹️ {t('mapControlsTitle')}</span>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('mapControlsClose')}
              className="hover:text-red-600 focus:outline-none">
              <X size={18} />
            </button>
          </div>
          <ul className="space-y-1 w-full flex flex-col">
            <li className="flex w-full justify-between">
              <Key>+</Key> {t('mapControlsZoomIn')}
            </li>
            <hr />
            <li className="flex w-full justify-between">
              <Key>−</Key> {t('mapControlsZoomOut')}
            </li>
            <hr />
            <li className="flex w-full justify-between">
              <Key>1</Key> {t('mapControlsRegion')}
            </li>
            <hr />
            <li className="flex w-full justify-between">
              <Key>2</Key> {t('mapControlsCity')}
            </li>
            <hr />
            <li className="flex w-full justify-between">
              <Key>3</Key> {t('mapControlsNeighborhood')}
            </li>
            <hr />
            <li className="flex w-full justify-between">
              <Key>4</Key> {t('mapControlsStreet')}
            </li>
            <hr />
            <li className="flex w-full justify-between">
              <Key>0</Key> {t('mapControlsReset')}
            </li>
          </ul>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label={t('mapControlsOpen')}
          className="p-2 bg-white/20 backdrop-blur-md rounded-full shadow hover:bg-white/40 focus:outline-none">
          <HelpCircle size={20} />
        </button>
      )}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return <kbd className="inline-block px-1.5 py-0.5 bg-white/30 rounded text-xs font-mono">{children}</kbd>;
}
