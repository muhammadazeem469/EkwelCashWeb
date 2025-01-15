import { useState, useCallback } from "react";

interface PollingOptions {
  interval?: number;
  maxAttempts?: number;
  shouldContinue?: (data: any) => boolean;
}

export const usePolling = <T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions = {}
) => {
  const {
    interval = 5000,
    maxAttempts = 12,
    shouldContinue = (data: any) => data?.result?.status === "PENDING",
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const startPolling = useCallback(async () => {
    setIsPolling(true);
    setAttempts(0);
    setError(null);

    const poll = async () => {
      try {
        const response = await fetchFn();
        setData(response);

        if (shouldContinue(response) && attempts < maxAttempts) {
          setAttempts((prev) => prev + 1);
          setTimeout(poll, interval);
        } else {
          setIsPolling(false);
        }
      } catch (err) {
        setError(err as Error);
        setIsPolling(false);
      }
    };

    poll();
  }, [fetchFn, interval, maxAttempts, shouldContinue]);

  const stopPolling = () => setIsPolling(false);

  return { data, isPolling, error, startPolling, stopPolling, attempts };
};
