// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Providers from '@/components/Providers';
import { ToastProvider } from '@/components/ui/toast-context';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'VLocker',
    template: '%s | VLocker',
  },
  description: 'Tủ chung cư kỹ thuật số an toàn và bảo mật tốt nhất.',

  icons: {
    icon: '/favicon.ico',
  },

  openGraph: {
    title: 'VLocker',
    description: 'Tủ chung cư kỹ thuật số an toàn và bảo mật tốt nhất.',
    url: 'vlocker.vercel.app/',
    siteName: 'VLocker',
    images: [
      {
        url: 'vlocker.vercel.app/Logo.png',
        width: 1200,
        height: 630,
        alt: 'VLocker Logo',
      },
    ],
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'VLocker',
    description: 'Tủ chung cư kỹ thuật số an toàn và bảo mật tốt nhất.',
    images: ['vlocker.vercel.app/Logo.png'],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.className}>
      <body>
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
