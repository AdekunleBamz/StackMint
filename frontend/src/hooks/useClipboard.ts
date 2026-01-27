'use client';

/**
 * useClipboard Hook
 * Copy to clipboard functionality
 * @module hooks/useClipboard
 * @version 1.0.0
 */

import { useState, useCallback, useRef } from 'react';

// Types
interface UseClipboardOptions {
  timeout?: number;
  onSuccess?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  error: Error | null;
  reset: () => void;
}

/**
 * Main useClipboard Hook
 */
export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const copy = useCallback(async (text: string): Promise<boolean> => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // Modern API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error('Copy command failed');
        }
      }

      setCopied(true);
      setError(null);
      onSuccess?.(text);

      // Reset after timeout
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, timeout);

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to copy');
      setError(error);
      setCopied(false);
      onError?.(error);
      return false;
    }
  }, [timeout, onSuccess, onError]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCopied(false);
    setError(null);
  }, []);

  return { copied, copy, error, reset };
}

/**
 * Hook for copying with toast notification
 */
export function useClipboardWithToast() {
  const clipboard = useClipboard({
    timeout: 2000,
  });

  const copyWithToast = useCallback(async (
    text: string,
    showToast: (message: string, type: 'success' | 'error') => void
  ) => {
    const success = await clipboard.copy(text);

    if (success) {
      showToast('Copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy', 'error');
    }

    return success;
  }, [clipboard]);

  return {
    ...clipboard,
    copyWithToast,
  };
}

/**
 * Hook for copying address with formatting
 */
export function useCopyAddress() {
  const { copied, copy, error, reset } = useClipboard({
    timeout: 2000,
  });

  const copyAddress = useCallback(async (address: string) => {
    return copy(address);
  }, [copy]);

  const truncateAddress = useCallback((address: string, chars = 6) => {
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }, []);

  return {
    copied,
    copyAddress,
    truncateAddress,
    error,
    reset,
  };
}

/**
 * Hook for copying transaction hash
 */
export function useCopyTxHash() {
  const { copied, copy, error, reset } = useClipboard({
    timeout: 2000,
  });

  const copyTxHash = useCallback(async (txHash: string) => {
    return copy(txHash);
  }, [copy]);

  const formatTxHash = useCallback((hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }, []);

  const getExplorerUrl = useCallback((
    txHash: string,
    network: 'mainnet' | 'testnet' = 'mainnet'
  ) => {
    const base = network === 'mainnet'
      ? 'https://explorer.stacks.co'
      : 'https://explorer.stacks.co/?chain=testnet';
    return `${base}/txid/${txHash}`;
  }, []);

  return {
    copied,
    copyTxHash,
    formatTxHash,
    getExplorerUrl,
    error,
    reset,
  };
}

/**
 * Hook for reading from clipboard
 */
export function useClipboardRead() {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isReading, setIsReading] = useState(false);

  const read = useCallback(async (): Promise<string | null> => {
    setIsReading(true);
    setError(null);

    try {
      if (navigator.clipboard && window.isSecureContext) {
        const clipboardText = await navigator.clipboard.readText();
        setText(clipboardText);
        return clipboardText;
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to read clipboard');
      setError(error);
      return null;
    } finally {
      setIsReading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setText(null);
    setError(null);
  }, []);

  return {
    text,
    error,
    isReading,
    read,
    clear,
  };
}

/**
 * Copy Button Component Helper
 */
interface CopyButtonState {
  label: string;
  icon: 'copy' | 'check' | 'error';
}

export function useCopyButtonState(
  initialLabel = 'Copy',
  copiedLabel = 'Copied!',
  errorLabel = 'Error'
) {
  const { copied, copy, error } = useClipboard();

  const state: CopyButtonState = {
    label: error ? errorLabel : copied ? copiedLabel : initialLabel,
    icon: error ? 'error' : copied ? 'check' : 'copy',
  };

  return {
    ...state,
    copy,
    copied,
    error,
  };
}

export default useClipboard;
