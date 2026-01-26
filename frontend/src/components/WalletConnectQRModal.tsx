'use client';

/**
 * WalletConnectQRModal Component
 * QR code modal for WalletConnect pairing
 * @module WalletConnectQRModal
 * @version 2.1.0
 */

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// QR code configuration
const QR_EXPIRATION_SECONDS = 60;
const COPY_FEEDBACK_DURATION_MS = 2000;

interface WalletConnectQRModalProps {
  uri: string;
  onClose: () => void;
}

const wallets = [
  { name: 'Xverse', icon: '🟠', url: 'https://www.xverse.app/', color: 'from-orange-500 to-red-500' },
  { name: 'Leather', icon: '🔵', url: 'https://leather.io/', color: 'from-blue-500 to-purple-500' },
];

export default function WalletConnectQRModal({ uri, onClose }: WalletConnectQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'mobile'>('qr');
  const [countdown, setCountdown] = useState(60);

  // Create a mobile-friendly link that can be opened in wallet apps
  const mobileLink = `https://walletconnect.com/wc?uri=${encodeURIComponent(uri)}`;
  
  // Countdown timer for QR expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 max-w-md w-full mx-4 border border-gray-700/50 shadow-2xl shadow-purple-500/10 animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
              <p className="text-gray-400 text-sm">WalletConnect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'qr'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'mobile'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mobile
          </button>
        </div>

        {activeTab === 'qr' ? (
          <>
            {/* QR Code */}
            <div className="relative bg-white p-6 rounded-2xl mb-4 mx-auto w-fit">
              <QRCodeSVG
                value={uri}
                size={220}
                level="M"
                className="w-full h-auto"
                imageSettings={{
                  src: '/favicon.ico',
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
              {countdown === 0 && (
                <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-800 font-medium mb-2">QR Expired</p>
                    <button
                      onClick={() => setCountdown(60)}
                      className="text-purple-600 font-medium hover:underline"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-4 text-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={countdown <= 10 ? 'text-red-400' : 'text-gray-400'}>
                Expires in {countdown}s
              </span>
            </div>

            <p className="text-gray-400 text-sm text-center mb-4">
              Scan with your Stacks wallet app
            </p>
          </>
        ) : (
          <>
            {/* Wallet Options */}
            <div className="space-y-3 mb-6">
              {wallets.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-all group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${wallet.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {wallet.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{wallet.name}</p>
                    <p className="text-gray-500 text-sm">Download wallet</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>

            {/* Deep Link */}
            <a
              href={mobileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-center py-3.5 rounded-xl font-medium transition-all"
            >
              Open in Wallet App
            </a>
          </>
        )}

        {/* Copy URI */}
        <button
          onClick={copyToClipboard}
          className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Connection URI
            </>
          )}
        </button>

        {/* Security Note */}
        <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <p className="text-purple-400 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Only connect to sites you trust. Never share your private keys.
          </p>
        </div>
      </div>
    </div>
  );
}
