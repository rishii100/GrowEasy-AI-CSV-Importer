import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'GrowEasy AI CSV Importer',
  description:
    'Intelligently import any CSV into GrowEasy CRM format using AI-powered field mapping.',
  keywords: ['GrowEasy', 'CRM', 'CSV Importer', 'AI', 'Lead Management'],
  authors: [{ name: 'GrowEasy' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
