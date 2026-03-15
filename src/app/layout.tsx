import { Geist, Geist_Mono } from 'next/font/google';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { AuthInitializer } from '@/components/auth/auth-initializer';
import { QueryProvider } from '@/lib/query-provider';

import type { Metadata, Viewport } from 'next';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Your App Name',
    template: '%s | Your App Name',
  },
  description: 'A modern web application built with Next.js and React',
  keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'Your Team' }],
  creator: 'Your Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourapp.com',
    title: 'Your App Name',
    description: 'A modern web application built with Next.js and React',
    siteName: 'Your App Name',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your App Name',
    description: 'A modern web application built with Next.js and React',
    creator: '@yourhandle',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthInitializer />
            {children}
            <Toaster richColors position='top-right' />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
