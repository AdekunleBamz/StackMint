'use client';

/**
 * ReportModal Component
 * Modal for reporting inappropriate NFT content
 * @module components/ReportModal
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'nft' | 'collection' | 'user';
  itemId: string | number;
  itemName: string;
}

type ReportReason = 
  | 'copyright'
  | 'inappropriate'
  | 'fake'
  | 'spam'
  | 'scam'
  | 'other';

interface ReportOption {
  id: ReportReason;
  label: string;
  description: string;
  icon: string;
}

const reportReasons: ReportOption[] = [
  {
    id: 'copyright',
    label: 'Copyright Infringement',
    description: 'This content violates intellectual property rights',
    icon: '©️',
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Contains offensive, explicit, or harmful material',
    icon: '🚫',
  },
  {
    id: 'fake',
    label: 'Fake or Counterfeit',
    description: 'This is a copy or imitation of another work',
    icon: '🎭',
  },
  {
    id: 'spam',
    label: 'Spam or Misleading',
    description: 'Mass-produced or deceptive content',
    icon: '📧',
  },
  {
    id: 'scam',
    label: 'Suspected Scam',
    description: 'Fraudulent activity or suspicious behavior',
    icon: '⚠️',
  },
  {
    id: 'other',
    label: 'Other Issue',
    description: 'Something else not listed above',
    icon: '📝',
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemName,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason(null);
      setAdditionalInfo('');
      setSubmitted(false);
      setEmail('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    
    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, send report to backend
    console.log('Report submitted:', {
      itemType,
      itemId,
      itemName,
      reason: selectedReason,
      additionalInfo,
      email,
    });
    
    setSubmitting(false);
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden animate-scale-in shadow-2xl">
        {submitted ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Report Submitted</h2>
            <p className="text-gray-400 mb-6">
              Thank you for helping keep StacksMint safe. We&apos;ll review your report and take appropriate action.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // Report Form
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Report {itemType}</h2>
                <p className="text-sm text-gray-400">{itemName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Reason Selection */}
            <div className="p-4 border-b border-gray-800">
              <p className="text-sm text-gray-400 mb-3">Why are you reporting this?</p>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedReason === reason.id
                        ? 'bg-purple-500/20 border border-purple-500/50'
                        : 'bg-gray-800/50 border border-transparent hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-1 accent-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{reason.icon}</span>
                        <span className="font-medium text-white">{reason.label}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{reason.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Provide any additional context that might help us investigate..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Your email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For follow-up questions"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-800 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedReason || submitting}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
