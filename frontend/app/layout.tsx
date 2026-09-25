import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/lib/auth-context';
import type { Metadata } from 'next';
import { Noto_Sans, Noto_Serif } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-noto-sans',
  display: 'swap',
});

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'e-FIRChain | National Digital FIR Portal — Government of India',
  description:
    'File, track, and verify First Information Reports securely using blockchain technology. A Government of India initiative under the Ministry of Home Affairs.',
  keywords: 'FIR, e-FIR, online FIR, police, blockchain, MHA, Government of India',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className={notoSans.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}