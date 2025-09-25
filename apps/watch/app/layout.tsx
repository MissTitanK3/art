// app/layout.tsx
import { LanguageProvider } from '@/lib/il8n/provider';
import './globals.css';
import type { Metadata } from 'next';
import BottomNav from '@/components/BottomNav';
import { WizardProvider } from '@/components/wizard/WizardContext';
import { MapTileProvider } from '@/lib/MapTileContext';

export const metadata: Metadata = {
  title: 'ICE Tea Watch',
  description: 'Report and track ICE and law enforcement presence anonymously.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-white">
        <WizardProvider>
          <LanguageProvider>
            <MapTileProvider>
              {/* MAIN PAGE CONTENT */}
              <div className="max-w-4xl mx-auto p-4 min-h-screen pb-24">{children}</div>

              {/* FIXED BOTTOM NAVBAR - keep outside main */}
              <BottomNav />
            </MapTileProvider>
          </LanguageProvider>
        </WizardProvider>
      </body>
    </html>
  );
}
