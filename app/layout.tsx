// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Providers from '@/components/Providers';
import { ToastProvider } from '@/components/ui/toast-context';

const montserrat = Montserrat({ subsets: ['latin'] });

// Sử dụng biến môi trường cho URL production, fallback về localhost cho development
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: '/', // Đường dẫn tương đối đến trang chủ
    siteName: 'VLocker',
    images: [
      {
        url: '/Logo-bg.png', // Đường dẫn tương đối, sẽ được kết hợp với metadataBase
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
    images: ['/Logo-bg.png'], // Đường dẫn tương đối
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
