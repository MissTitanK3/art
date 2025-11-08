// app/layout.tsx
import { LanguageProvider } from '@/lib/il8n/provider';
import type { Metadata, Viewport } from 'next';
import { WizardProvider } from '@/components/wizard/WizardContext';
import { MapTileProvider } from '@/lib/MapTileContext';
import './globals.css';
import ServiceWorkerRegister from '@/components/client/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'ART Watch',
  description: 'Report and track ART and law enforcement presence anonymously.',
  applicationName: 'ART Watch',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
  },
};

export const viewport: Viewport = {
  themeColor: 'oklch(0.38 0.02 260)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-white" style={{ backgroundColor: 'oklch(0.38 0.02 260)' }}>
        <WizardProvider>
          <LanguageProvider>
            <MapTileProvider>
              {/* MAIN PAGE CONTENT */}
              <div className="max-w-4xl mx-auto p-4 min-h-screen">{children}</div>
              {/* BottomNav removed per redesign */}
              <ServiceWorkerRegister />
            </MapTileProvider>
          </LanguageProvider>
        </WizardProvider>
      </body>
    </html>
  );
}
