import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { WalletProvider } from '@/context/WalletContext';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Root Layout
 * Application shell with providers and font configuration
 * @module RootLayout
 * @version 2.0.0
 */

// Application version
const APP_VERSION = '1.0.0';

/** Application name for metadata */
const APP_NAME = 'StacksMint';

/** Default locale for internationalization */
const DEFAULT_LOCALE = 'en-US';

/**
 * Theme mode options
 */
type ThemeMode = 'light' | 'dark' | 'system';

// Font configurations with optimal loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// Enhanced metadata with comprehensive SEO
export const metadata: Metadata = {
  title: {
    default: 'StacksMint - NFT Minting Platform on Bitcoin',
    template: '%s | StacksMint',
  },
  description: 'The premier NFT minting platform on Stacks blockchain. Create, collect, and trade unique digital assets secured by Bitcoin.',
  keywords: [
    'NFT',
    'Stacks',
    'Bitcoin',
    'Blockchain',
    'Mint',
    'Digital Art',
    'Collectibles',
    'Web3',
    'DeFi',
    'STX',
    'Smart Contracts',
    'Clarity',
  ],
  authors: [{ name: 'StacksMint Team' }],
  creator: 'StacksMint',
  publisher: 'StacksMint',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://stacksmint.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stacksmint.io',
    siteName: 'StacksMint',
    title: 'StacksMint - NFT Minting Platform on Bitcoin',
    description: 'The premier NFT minting platform on Stacks blockchain. Create, collect, and trade unique digital assets secured by Bitcoin.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StacksMint - NFT Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StacksMint - NFT Minting Platform on Bitcoin',
    description: 'The premier NFT minting platform on Stacks blockchain. Create, collect, and trade unique digital assets secured by Bitcoin.',
    images: ['/twitter-image.png'],
    creator: '@stacksmint',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  category: 'technology',
};

// Viewport configuration for responsive design
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark light',
};

// JSON-LD structured data for SEO
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'StacksMint',
    url: 'https://stacksmint.io',
    description: 'The premier NFT minting platform on Stacks blockchain',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'StacksMint',
      url: 'https://stacksmint.io',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Skip link component for accessibility
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      Skip to main content
    </a>
  );
}

// Network status indicator
function NetworkStatus() {
  return (
    <noscript>
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-2 text-sm font-medium">
        JavaScript is required for StacksMint to function properly.
      </div>
    </noscript>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd />
        <link rel="preconnect" href="https://api.hiro.so" />
        <link rel="preconnect" href="https://api.mainnet.hiro.so" />
        <link rel="dns-prefetch" href="https://api.hiro.so" />
        <link rel="dns-prefetch" href="https://api.mainnet.hiro.so" />
        <meta name="application-name" content="StacksMint" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StacksMint" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body 
        className={`${inter.className} antialiased bg-gray-900 text-white min-h-screen selection:bg-orange-500/30 selection:text-orange-100`}
        suppressHydrationWarning
      >
        <NetworkStatus />
        <SkipLink />
        <WalletProvider>
          <ToastProvider>
            <div id="main-content" className="flex flex-col min-h-screen">
              {children}
            </div>
            {/* Portal target for modals */}
            <div id="modal-root" />
            {/* Portal target for tooltips */}
            <div id="tooltip-root" />
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
