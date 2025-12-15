// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Providers from '@/components/Providers';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'VLocker',
    template: '%s | VLocker',
  },
  description: 'Secure digital locker platform',
  icons: {
    icon: '/favicon.ico',
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
