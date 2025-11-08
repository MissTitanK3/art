'use client';

import { Report } from '@/types/wizard';
import { formatAge } from '@/utils/general';
import { FrostedButton } from '@/components/ui/FrostedButton';
import { agencyColors } from '@/constants/agencies';
import { useTranslations } from '@/lib/il8n/useTranslations';

export default function FeedItem({ report, onZoomTo }: { report: Report; onZoomTo?: (pos: { lat: number; lng: number }) => void }) {
  const { t } = useTranslations();
  const agencies = [...(report.agency_type || []), report.agency_other].filter(Boolean).join(', ');
  const primary = report.agency_type?.[0] || (report.agency_other ? t('unknownAgency') : t('unknownAgency'));
  const colorClass = agencyColors[primary] || 'bg-slate-600';
  const verified = !!report.submitted_by;
  return (
    <li className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-md text-white overflow-hidden">
      <div className={`px-3 py-2 ${colorClass} border-b border-white/10 flex items-center justify-between`}>
        <div className="font-semibold truncate mr-2">{agencies || t('unknownAgency')}</div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${verified ? 'bg-green-600' : 'bg-white text-black'}`}>
          {verified ? t('verified') : t('anonymous')}
        </span>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div className="text-xs text-white/70">{t('reportedPrefix')} {formatAge(report.timestamp)} {t('timeAgo')}</div>
          <div className="text-xs text-white/60">{new Date(report.timestamp).toLocaleString()}</div>
        </div>

        {/* {report.media_url && (
          <div className="mt-2">
            <img src={report.media_url} alt={t('reportMediaAlt')} className="w-full max-h-40 object-cover rounded-md border border-white/15" />
          </div>
        )} */}

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-white/70">{t('officerMovement')}:</span>{' '}
            {report.officer_moving === true ? (report.officer_direction || t('moving')) : report.officer_moving === false ? t('stationary') : t('movementUnknown')}
          </div>
          <div>
            <span className="text-white/70">{t('lights')}:</span> {report.lights_on ? t('lightsOn') : t('lightsOff')}
          </div>
          <div>
            <span className="text-white/70">{t('sirens')}:</span> {report.sirens_on ? t('sirensOn') : t('sirensOff')}
          </div>
          {report.test && <div className="text-red-300">TEST</div>}
        </div>
        <div className='mt-2 text-sm border-t border-white/10 pt-2'>
          <span className="text-white/70">{t('otherAgencyLabel')}:</span>
          <div>
            {report.agency_other || 'N/A'}
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <FrostedButton size="sm" onClick={() => onZoomTo?.(report.location)}>{t('zoomTo')}</FrostedButton>
        </div>
      </div>
    </li>
  );
}
