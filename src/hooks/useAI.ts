// ============================================================
// useAI — ADO
// React hook for Claude API calls with loading/error state.
// Used by all modules that need AI — one hook, consistent UX.
// ============================================================

import { useState, useCallback } from 'react';
import { callAI }                from '../services/aiService';
import type { AICallOptions }    from '../config/types';

interface UseAIResult {
  response:  string;
  loading:   boolean;
  error:     string | null;
  call:      (options: AICallOptions) => Promise<string>;
  reset:     () => void;
}

export function useAI(): UseAIResult {
  const [response, setResponse] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const call = useCallback(async (options: AICallOptions): Promise<string> => {
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const text = await callAI(options);
      setResponse(text);
      return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse('');
    setError(null);
    setLoading(false);
  }, []);

  return { response, loading, error, call, reset };
}
