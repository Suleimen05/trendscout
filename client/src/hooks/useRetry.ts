import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  exponentialBackoff?: boolean;
}

interface RetryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  attempt: number;
}

/**
 * Hook for automatic retry logic with exponential backoff
 * Useful for network requests that may fail temporarily
 */
export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
) {
  const {
    maxAttempts = 3,
    delay = 1000,
    exponentialBackoff = true,
  } = options;

  const [state, setState] = useState<RetryState<T>>({
    data: null,
    loading: false,
    error: null,
    attempt: 0,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null, attempt: 0 });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const data = await asyncFunction();
        setState({ data, loading: false, error: null, attempt });
        return data;
      } catch (error) {
        const isLastAttempt = attempt === maxAttempts;

        if (isLastAttempt) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
            attempt,
          });
          throw error;
        }

        // Calculate delay with exponential backoff
        const currentDelay = exponentialBackoff
          ? delay * Math.pow(2, attempt - 1)
          : delay;

        console.log(
          `[useRetry] Attempt ${attempt} failed, retrying in ${currentDelay}ms...`
        );

        setState({
          data: null,
          loading: true,
          error: error instanceof Error ? error : new Error('Unknown error'),
          attempt,
        });

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }, [asyncFunction, maxAttempts, delay, exponentialBackoff]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, attempt: 0 });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
