'use client';

import { QRCodeSVG } from 'qrcode.react';

interface WalletConnectQRModalProps {
  uri: string;
  onClose: () => void;
}

export default function WalletConnectQRModal({ uri, onClose }: WalletConnectQRModalProps) {
  // Create a mobile-friendly link that can be opened in wallet apps
  const mobileLink = `https://walletconnect.com/wc?uri=${encodeURIComponent(uri)}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uri);
      alert('URI copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4 border border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Connect with WalletConnect</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-xl mb-4">
          <QRCodeSVG
            value={uri}
            size={256}
            level="M"
            className="w-full h-auto"
          />
        </div>
        
        <p className="text-gray-400 text-sm text-center mb-4">
          Scan this QR code with your Stacks wallet app (Xverse, Leather)
        </p>
        
        <div className="space-y-3">
          {/* Mobile-friendly link */}
          <a
            href={mobileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
          >
            Open in Wallet App
          </a>
          
          {/* Copy URI button */}
          <button
            onClick={copyToClipboard}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Copy Connection URI
          </button>
        </div>
        
        <p className="text-gray-500 text-xs text-center mt-4">
          Don&apos;t have a wallet? Download{' '}
          <a
            href="https://www.xverse.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            Xverse
          </a>{' '}
          or{' '}
          <a
            href="https://leather.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            Leather
          </a>
        </p>
      </div>
    </div>
  );
}
