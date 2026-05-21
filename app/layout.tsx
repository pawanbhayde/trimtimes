import type {Metadata} from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css'; // Global styles
import Providers from './providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TrimTimes | Premium Multi-Tenant Barber Scheduling Platform',
  description: 'A sophisticated multi-tenant appointment scheduling and shop management engine for modern barbershops.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="bg-[#fafaf9] text-[#1a1a1a] antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
