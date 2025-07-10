import { FathemRateLimitError } from '../errors';

export interface RetryOptions {
  attempts: number;
  delay: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, delay, maxDelay = 30000, factor = 2, onRetry } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === attempts) {
        throw error;
      }

      // Don't retry certain errors
      if (error instanceof FathemRateLimitError && error.retryAfter) {
        const waitTime = error.retryAfter * 1000;
        if (onRetry) onRetry(error, attempt);
        await sleep(Math.min(waitTime, maxDelay));
        continue;
      }

      // Calculate exponential backoff
      const waitTime = Math.min(delay * Math.pow(factor, attempt - 1), maxDelay);
      if (onRetry) onRetry(error as Error, attempt);
      await sleep(waitTime);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
