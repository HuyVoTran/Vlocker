// app/layout.tsx
import './globals.css';
import { Montserrat } from 'next/font/google';
import Providers from '@/components/Providers';

const inter = Montserrat({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}