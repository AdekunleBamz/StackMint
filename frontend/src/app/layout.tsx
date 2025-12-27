import './globals.css';
import type { Metadata } from 'next';
import { WalletProvider } from '@/context/WalletContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'StacksMint - NFT Minting Platform',
  description: 'Mint, collect, and trade NFTs on the Stacks blockchain',
  keywords: ['NFT', 'Stacks', 'Bitcoin', 'Blockchain', 'Mint'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
