"use client";

import { useState, useCallback } from "react";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(options: UseApiOptions<T> = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      url: string,
      fetchOptions?: RequestInit
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, fetchOptions);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Request failed");
        }

        setData(json);
        options.onSuccess?.(json);
        return json;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
