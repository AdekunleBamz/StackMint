'use client';

/**
 * CreateCollection Component
 * Multi-step form for creating NFT collections with validation
 * @module CreateCollection
 * @version 2.2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';

// Form configuration
const DEFAULT_ROYALTY_PERCENT = '5';
const MIN_NAME_LENGTH = 1;
const MIN_SYMBOL_LENGTH = 1;

/** Maximum collection name length */
const MAX_NAME_LENGTH = 50;

/** Maximum symbol length */
const MAX_SYMBOL_LENGTH = 10;

/** Maximum royalty percentage */
const MAX_ROYALTY_PERCENT = 25;

/**
 * Form step identifiers
 */
type FormStep = 'details' | 'settings' | 'review';

/**
 * Form validation state
 */
interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

const steps = ['Details', 'Settings', 'Review'];

export default function CreateCollection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [maxSupply, setMaxSupply] = useState('');
  const [royalty, setRoyalty] = useState('5');
  const [baseUri, setBaseUri] = useState('');
  const { isConnected, connect } = useWallet();
  const { create, loading, error } = useContract();

  const handleCreate = async () => {
    if (!name || !maxSupply) return;
    await create(name, parseInt(maxSupply));
    setName('');
    setSymbol('');
    setDescription('');
    setMaxSupply('');
    setRoyalty('5');
    setBaseUri('');
    setCurrentStep(0);
  };

  const canProceed = () => {
    if (currentStep === 0) return name.length > 0 && symbol.length > 0;
    if (currentStep === 1) return maxSupply.length > 0;
    return true;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Create Collection</h3>
            <p className="text-gray-400 text-sm">Launch your NFT collection on Stacks</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 ${index <= currentStep ? 'text-purple-400' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep ? 'bg-purple-600 text-white' :
                  index === currentStep ? 'bg-purple-600/20 border-2 border-purple-600 text-purple-400' :
                  'bg-gray-700 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 ${index < currentStep ? 'bg-purple-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {currentStep === 0 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Collection Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., My Awesome NFTs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Symbol <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., MNFT"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white uppercase focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
              <p className="text-gray-500 text-xs mt-1">Max 6 characters, will be uppercase</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                placeholder="Describe your collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Supply <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g., 10000"
                value={maxSupply}
                onChange={(e) => setMaxSupply(e.target.value)}
                min="1"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Royalty Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={royalty}
                  onChange={(e) => setRoyalty(e.target.value)}
                  min="0"
                  max="25"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">Earn royalties on secondary sales (0-25%)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Base URI (Optional)</label>
              <input
                type="url"
                placeholder="https://api.example.com/metadata/"
                value={baseUri}
                onChange={(e) => setBaseUri(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
              />
              <p className="text-gray-500 text-xs mt-1">URL for your NFT metadata (IPFS recommended)</p>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gray-900/50 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-white mb-4">Collection Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-white font-medium">{name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Symbol</p>
                  <p className="text-white font-medium">{symbol || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Max Supply</p>
                  <p className="text-white font-medium">{maxSupply || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Royalty</p>
                  <p className="text-white font-medium">{royalty}%</p>
                </div>
              </div>
              {description && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-white text-sm mt-1">{description}</p>
                </div>
              )}
            </div>

            {/* Fee Breakdown */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Creation Fee</span>
                <span className="text-white font-medium">0.01 STX</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Network Fee (est.)</span>
                <span className="text-white font-medium">~0.001 STX</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-purple-500/20">
                <span className="text-purple-400 font-medium">Total</span>
                <span className="text-purple-400 font-bold">~0.011 STX</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-8 py-4 border-t border-gray-700/50 bg-gray-900/30 flex justify-between">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="px-6 py-2.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : isConnected ? (
          <button
            onClick={handleCreate}
            disabled={loading || !name || !maxSupply}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Collection
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => connect()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
