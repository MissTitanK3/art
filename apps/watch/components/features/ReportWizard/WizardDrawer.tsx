'use client';

import { useMemo, useState } from 'react';
import { distanceM, formatDistance } from '@/utils/distance';
import BottomDrawer from '@/components/ui/BottomDrawer';
import { AGENCY_OPTIONS } from '@/constants/agencies';
import { FrostedButton } from '@/components/ui/FrostedButton';
import type { ReportFormData } from '@/types/wizard';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { TranslationKey } from '@/lib/il8n/translations';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  draft: ReportFormData;
  onChange: (data: Partial<ReportFormData>) => void;
  onSubmit: () => Promise<void>;
  userPosition: { lat: number; lng: number } | null;
  radiusMeters: number;
  unit: 'km' | 'mi';
};

export default function WizardDrawer({ isOpen, onClose, onCancel, draft, onChange, onSubmit, userPosition, radiusMeters, unit }: Props) {
  const { t } = useTranslations();
  const [submitting, setSubmitting] = useState(false);
  const directionOptions = useMemo(
    () => ['NorthWest', 'North', 'NorthEast', 'West', null, 'East', 'SouthWest', 'South', 'SouthEast'] as const,
    [],
  );

  return (
    <BottomDrawer isOpen={isOpen} onClose={onClose} title={t('reportWizard')} heightClassName="h-[70vh] max-w-md mx-auto">
      <div className="space-y-4">
        <div className="text-sm text-white/80 space-y-1">
          <div>Report Location: {draft.location ? `${draft.location.lat.toFixed(5)}, ${draft.location.lng.toFixed(5)}` : 'Not set'}</div>
          {userPosition && (
            <div className="text-white/70">Your Location: {userPosition.lat.toFixed(5)}, {userPosition.lng.toFixed(5)}</div>
          )}
        </div>

        {userPosition && draft.location && (
          <RadiusGuard user={userPosition} target={draft.location} radius={radiusMeters} unit={unit} />
        )}

        <div>
          <label className="block text-white/80 mb-2">Agency Type</label>
          <div className="grid grid-cols-2 gap-2">
            {AGENCY_OPTIONS.map((agency) => {
              const active = draft.agency_type.includes(agency);
              return (
                <FrostedButton
                  key={agency}
                  variant={active ? 'primary' : 'secondary'}
                  onClick={() => {
                    if (active) onChange({ agency_type: draft.agency_type.filter((a) => a !== agency) });
                    else onChange({ agency_type: [...draft.agency_type, agency] });
                  }}>
                  {t(`agency.${agency}` as TranslationKey)}
                </FrostedButton>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-white/80 mb-2">Other Agency</label>
          <input
            className="w-full rounded bg-white/10 border border-white/20 px-3 py-2 text-white placeholder:text-white/60"
            placeholder="Optional"
            value={draft.agency_other}
            onChange={(e) => onChange({ agency_other: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-white/80">Movement</label>
          <div className="grid grid-cols-2 gap-2">
            <FrostedButton
              type="button"
              variant={draft.officer_moving === true ? 'primary' : 'secondary'}
              onClick={() => onChange({ officer_moving: true })}
            >
              {t('moving')}
            </FrostedButton>
            <FrostedButton
              type="button"
              variant={draft.officer_moving === false ? 'primary' : 'secondary'}
              onClick={() => onChange({ officer_moving: false, officer_direction: null })}
            >
              {t('stationary')}
            </FrostedButton>
          </div>

          <div>
            <label className="block text-white/80 mb-2">{t('directionOfTravel')}</label>
            <div className="grid grid-cols-3 gap-2 text-center">
              {directionOptions.map((dir) =>
                dir ? (
                  <FrostedButton
                    key={dir}
                    type="button"
                    onClick={() => onChange({ officer_direction: dir as any, officer_moving: true })}
                    variant={draft.officer_direction === dir ? 'primary' : 'secondary'}
                    size="altLg"
                    className="w-full justify-center text-sm"
                    disabled={draft.officer_moving === false}
                  >
                    {t(`direction.${dir}` as TranslationKey)}
                  </FrostedButton>
                ) : (
                  <div key="spacer" />
                ),
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!draft.lights_on}
              onChange={(e) => onChange({ lights_on: e.target.checked })}
            />
            <span>Lights On</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!draft.sirens_on}
              onChange={(e) => onChange({ sirens_on: e.target.checked })}
            />
            <span>Sirens On</span>
          </label>
        </div>

        <div>
          <label className="block text-white/80 mb-2">Photo or Video (optional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => onChange({ media_url: e.target.files && e.target.files[0] ? (e.target.files[0] as any) : null })}
            className="block w-full text-sm text-white file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30"
          />
        </div>

        <div className="flex gap-2">
          <FrostedButton
            variant="primary"
            className="flex-1"
            disabled={
              submitting ||
              !draft.location ||
              (userPosition && draft.location ? distanceM(userPosition, draft.location) > radiusMeters : false)
            }
            onClick={async () => {
              setSubmitting(true);
              try {
                await onSubmit();
              } finally {
                setSubmitting(false);
              }
            }}>
            {submitting ? 'Submitting…' : 'Submit'}
          </FrostedButton>
          <FrostedButton variant="secondary" className="flex-1" onClick={onCancel ?? onClose}>
            Cancel
          </FrostedButton>
        </div>
      </div>
    </BottomDrawer>
  );
}

function RadiusGuard({ user, target, radius, unit }: { user: { lat: number; lng: number }; target: { lat: number; lng: number }; radius: number; unit: 'km' | 'mi' }) {
  const d = Math.round(distanceM(user, target));
  const ok = d <= radius;
  return (
    <div className={`text-sm px-3 py-2 rounded border ${ok ? 'bg-emerald-600/20 border-emerald-500 text-emerald-100' : 'bg-red-600/20 border-red-500 text-red-100'}`}>
      {ok ? 'Within radius' : 'Outside radius'} • Distance: {formatDistance(d, unit)} • Max: {formatDistance(radius, unit)}
    </div>
  );
}
