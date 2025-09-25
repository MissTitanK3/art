'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, PlusCircle, ChevronLeft, SendHorizonal, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { useWizard } from './wizard/WizardContext';

export default function BottomNav() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const { step, back, next, canContinue, finish, testReportEnabled } = useWizard();

  const isWizard = pathname.startsWith('/report/wizard');

  const handleNextOrFinish = () => {
    if (step === 2) {
      finish();
    } else {
      next();
    }
  };

  const baseNavClass =
    'fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-blue-700/60 border-t border-blue-500/50 shadow-xl h-16 rounded-t-2xl grid grid-cols-3 place-items-center';

  const disabledStyle = 'text-white/40 cursor-not-allowed';
  const activeStyle = 'text-white';

  const navIconButton =
    'relative -top-6 p-3 rounded-full shadow-lg backdrop-blur-md bg-blue-600 border border-blue-700 text-white hover:bg-blue-700 transition';

  const wizardButtonBase = 'flex items-center gap-1 px-4 py-2 rounded-full shadow backdrop-blur-md transition border';

  const wizardButtonActive = 'bg-blue-500/50 text-white border-blue-300 hover:bg-blue-500/60';

  const wizardButtonDisabled = 'bg-white/20 text-white/40 border-white/30 cursor-not-allowed';

  if (isWizard) {
    return (
      <nav className={baseNavClass}>
        <button
          onClick={back}
          className={`flex items-center gap-1 text-sm ${step === 0 ? disabledStyle : activeStyle}`}
          disabled={step === 0}>
          <ChevronLeft className="h-6 w-6" />
          {t('back')}
        </button>

        <Link href="/" className={navIconButton}>
          <Home className="h-8 w-8" />
        </Link>

        <button
          onClick={handleNextOrFinish}
          disabled={!canContinue}
          className={`${wizardButtonBase} 
    ${canContinue ? wizardButtonActive : wizardButtonDisabled} 
    ${testReportEnabled ? 'border-red-500 shadow-red-500/40 border-2' : ''}`}>
          {step === 2 ? t('submit') : t('next')}
          {step === 2 ? <SendHorizonal className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </button>
      </nav>
    );
  }

  return (
    <nav className={baseNavClass}>
      <Link href="/" className="flex flex-col items-center text-sm text-white hover:text-blue-200 transition">
        <Home className="h-6 w-6" />
        <span>{t('home')}</span>
      </Link>

      <Link href="/report/wizard" className={navIconButton}>
        <PlusCircle className="h-12 w-12" />
      </Link>

      <Link href="/heatmap" className="flex flex-col items-center text-sm text-white hover:text-blue-200 transition">
        <Map className="h-6 w-6" />
        <span>{t('viewHeatmap')}</span>
      </Link>
    </nav>
  );
}
