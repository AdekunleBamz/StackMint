import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useCopyToClipboard Hook
 * Clipboard operations with feedback state
 * @module hooks/useCopyToClipboard
 * @version 1.0.0
 */

type CopyStatus = 'idle' | 'copied' | 'error';

interface UseCopyToClipboardOptions {
  /** Duration to show copied state in ms (default: 2000) */
  successDuration?: number;
  /** Callback on successful copy */
  onSuccess?: (text: string) => void;
  /** Callback on copy error */
  onError?: (error: Error) => void;
}

interface UseCopyToClipboardReturn {
  /** Copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Current status */
  status: CopyStatus;
  /** Whether text was recently copied */
  isCopied: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Reset status to idle */
  reset: () => void;
}

/**
 * Hook for clipboard operations with status feedback
 * @param options - Configuration options
 * @returns Object with copy function and status
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { successDuration = 2000, onSuccess, onError } = options;
  
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Check for clipboard API support
      if (!navigator?.clipboard) {
        const error = new Error('Clipboard API not available');
        setStatus('error');
        onError?.(error);
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
        onSuccess?.(text);

        // Reset to idle after duration
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, successDuration);

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Copy failed');
        setStatus('error');
        onError?.(error);

        // Reset to idle after duration
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, successDuration);

        return false;
      }
    },
    [successDuration, onSuccess, onError]
  );

  return {
    copy,
    status,
    isCopied: status === 'copied',
    isError: status === 'error',
    reset,
  };
}

/**
 * Hook for copying with a pre-defined value
 * @param valueToCopy - The value to copy
 * @param options - Configuration options
 * @returns Object with copy trigger and status
 */
export function useCopyValue(
  valueToCopy: string,
  options: UseCopyToClipboardOptions = {}
) {
  const { copy, status, isCopied, isError, reset } = useCopyToClipboard(options);

  const copyValue = useCallback(() => {
    return copy(valueToCopy);
  }, [copy, valueToCopy]);

  return {
    copy: copyValue,
    status,
    isCopied,
    isError,
    reset,
  };
}

/**
 * Hook for reading from clipboard
 * @returns Object with read function and value
 */
export function useReadClipboard() {
  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const read = useCallback(async (): Promise<string | null> => {
    if (!navigator?.clipboard) {
      setError(new Error('Clipboard API not available'));
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
      setError(null);
      return text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Read failed');
      setError(error);
      setValue(null);
      return null;
    }
  }, []);

  return {
    read,
    value,
    error,
    isAvailable: !!navigator?.clipboard,
  };
}

export default useCopyToClipboard;
