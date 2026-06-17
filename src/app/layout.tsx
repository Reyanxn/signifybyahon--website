import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthWrapper from '@/components/layout/AuthWrapper';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'SIGNIFY BY AHON – Premium Women\'s Fashion',
    template: '%s | SIGNIFY BY AHON',
  },
  description: 'Discover premium women\'s fashion at SIGNIFY BY AHON. Shop the latest trends in lawn suits, kameez, dupattas, and more.',
  keywords: ['women fashion', 'bangladeshi fashion', 'lawn suit', 'kameez', 'dupatta', 'SIGNIFY BY AHON'],
  openGraph: {
    title: 'SIGNIFY BY AHON – Premium Women\'s Fashion',
    description: 'Discover premium women\'s fashion at SIGNIFY BY AHON.',
    siteName: 'SIGNIFY BY AHON',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body text-[#1C1C1C] bg-white">
        <AuthWrapper>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthWrapper>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1C1C1C', color: '#fff', borderRadius: 0, fontSize: '0.8125rem', letterSpacing: '0.03em' },
          }}
        />
      </body>
    </html>
  );
}
