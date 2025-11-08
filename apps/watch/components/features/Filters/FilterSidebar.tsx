'use client';

import { useEffect, useMemo, useState } from 'react';
import { AGENCY_OPTIONS } from '@/constants/agencies';
import TimeRangeSlider from '@/components/TimeRangeSlider';
import { FrostedButton } from '@/components/ui/FrostedButton';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { TranslationKey } from '@/lib/il8n/translations';

type Props = {
  onClose?: () => void;
  onApply?: (data: { agencies: string[]; timeRange: [number, number] }) => void;
  initialAgencies?: string[];
  initialTimeRange?: [number, number];
};

export default function FilterSidebar({ onClose, onApply, initialAgencies, initialTimeRange }: Props) {
  const { t } = useTranslations();
  const [selected, setSelected] = useState<string[]>(initialAgencies ?? []);
  const [timeRange, setTimeRange] = useState<[number, number]>(initialTimeRange ?? [0, 168]);

  const isAllActive = useMemo(() => selected.length === 0, [selected]);

  useEffect(() => {
    if (initialAgencies === undefined) {
      try {
        const stored = localStorage.getItem('agencyFilter');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setSelected(parsed);
        }
      } catch { }
    } else {
      setSelected(initialAgencies);
    }
  }, [initialAgencies]);

  useEffect(() => {
    if (initialTimeRange === undefined) {
      try {
        const storedTR = localStorage.getItem('timeRange');
        if (storedTR) {
          const parsed = JSON.parse(storedTR);
          if (Array.isArray(parsed) && parsed.length === 2) {
            const start = Math.min(Math.max(0, Number(parsed[0]) || 0), 168);
            const endCandidate = Math.min(Math.max(0, Number(parsed[1]) || 168), 168);
            setTimeRange([start, Math.max(start, endCandidate)]);
          }
        }
      } catch { }
    } else {
      setTimeRange(initialTimeRange);
    }
  }, [initialTimeRange]);

  useEffect(() => {
    try {
      localStorage.setItem('agencyFilter', JSON.stringify(selected));
    } catch { }
  }, [selected]);

  useEffect(() => {
    try {
      localStorage.setItem('timeRange', JSON.stringify(timeRange));
    } catch { }
  }, [timeRange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('filterAgencies')}</h3>
        {onClose && (
          <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Close filters">
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {AGENCY_OPTIONS.map((agency) => {
          const active = isAllActive || selected.includes(agency);
          return (
            <FrostedButton
              key={agency}
              variant={active ? 'primary' : 'secondary'}
              className="w-full flex items-center justify-between"
              onClick={() => {
                if (isAllActive) {
                  setSelected([agency]);
                } else if (selected.includes(agency)) {
                  setSelected(selected.filter((a) => a !== agency));
                } else {
                  setSelected([...selected, agency]);
                }
              }}>
              <span>{t(`agency.${agency}` as TranslationKey)}</span>
              {active ? '✓' : ''}
            </FrostedButton>
          );
        })}
        <FrostedButton onClick={() => setSelected([])} variant="red" className="w-full mt-1">
          {t('resetFilters') ?? 'Reset Filters'}
        </FrostedButton>
      </div>

      <div className="pt-2">
        <TimeRangeSlider value={timeRange} onChange={(range) => setTimeRange(range)} />
      </div>

      <div className="pt-2 flex gap-2">
        <FrostedButton
          variant="primary"
          className="flex-1"
          onClick={() => onApply?.({ agencies: selected, timeRange })}>
          {t('applyFilters' as TranslationKey)}
        </FrostedButton>
        {onClose && (
          <FrostedButton variant="secondary" className="flex-1" onClick={onClose}>
            {t('closeFilters' as TranslationKey)}
          </FrostedButton>
        )}
      </div>
    </div>
  );
}
