import { withRetry } from '../src/utils/retry';
import { FathemRateLimitError } from '../src/errors';

describe('Retry Utils', () => {
  describe('withRetry', () => {
    it('should return successful result without retry', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(mockFn, { attempts: 3, delay: 100 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await withRetry(mockFn, { attempts: 3, delay: 1 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max attempts', async () => {
      const error = new Error('Persistent failure');
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(
        withRetry(mockFn, { attempts: 3, delay: 1 })
      ).rejects.toThrow('Persistent failure');
      
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should use exponential backoff', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      const delays: number[] = [];
      
      // Mock setTimeout to capture delays
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((callback: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      }) as any;

      try {
        await withRetry(mockFn, {
          attempts: 4,
          delay: 100,
          factor: 2,
        });
      } catch {
        // Expected to fail
      }

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;

      // Check exponential backoff: 100, 200, 400
      expect(delays).toEqual([100, 200, 400]);
    });

    it('should respect maxDelay', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      const delays: number[] = [];
      
      // Mock setTimeout to capture delays
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((callback: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      }) as any;

      try {
        await withRetry(mockFn, {
          attempts: 3,
          delay: 1000,
          factor: 10,
          maxDelay: 2000,
        });
      } catch {
        // Expected to fail
      }

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;

      // Second delay should be capped at 2000ms instead of 10000ms
      expect(delays).toEqual([1000, 2000]);
    });

    it('should handle rate limit errors with retryAfter', async () => {
      const rateLimitError = new FathemRateLimitError('Rate limited', 5);
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');

      const delays: number[] = [];
      
      // Mock setTimeout to capture delays
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((callback: any, delay: number) => {
        delays.push(delay);
        return originalSetTimeout(callback, 0);
      }) as any;

      const result = await withRetry(mockFn, { attempts: 2, delay: 100 });

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
      // Should wait 5000ms as specified by retryAfter
      expect(delays[0]).toBe(5000);
    });

    it('should call onRetry callback', async () => {
      const error = new Error('Test error');
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');
      const onRetry = jest.fn();

      const result = await withRetry(mockFn, {
        attempts: 2,
        delay: 1,
        onRetry,
      });

      expect(result).toBe('success');
      expect(onRetry).toHaveBeenCalledWith(error, 1);
    });
  });
});