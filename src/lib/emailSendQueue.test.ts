import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendInBatches, getBatchSize, getBatchDelayMs, getMaxRetries } from './emailSendQueue';

describe('env config getters', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('falls back to defaults when unset or invalid', () => {
    delete process.env.EMAIL_BATCH_SIZE;
    delete process.env.EMAIL_BATCH_DELAY_MS;
    delete process.env.EMAIL_MAX_RETRIES;
    expect(getBatchSize()).toBe(10);
    expect(getBatchDelayMs()).toBe(1000);
    expect(getMaxRetries()).toBe(2);

    process.env.EMAIL_BATCH_SIZE = 'not-a-number';
    expect(getBatchSize()).toBe(10);
  });

  it('reads valid values from env', () => {
    process.env.EMAIL_BATCH_SIZE = '5';
    process.env.EMAIL_BATCH_DELAY_MS = '250';
    process.env.EMAIL_MAX_RETRIES = '4';
    expect(getBatchSize()).toBe(5);
    expect(getBatchDelayMs()).toBe(250);
    expect(getMaxRetries()).toBe(4);
  });
});

describe('sendInBatches', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('processes all items and reports success via onResult', async () => {
    const items = [1, 2, 3];
    const sent: number[] = [];
    const results: Array<{ item: number; error: unknown }> = [];

    const promise = sendInBatches(
      items,
      async (item) => {
        sent.push(item);
      },
      (item, error) => results.push({ item, error }),
      { batchSize: 10, delayMs: 0, maxRetries: 0 },
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(sent.sort()).toEqual([1, 2, 3]);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.error === null)).toBe(true);
  });

  it('splits into multiple batches and waits delayMs between them', async () => {
    const items = [1, 2, 3, 4, 5];
    const batchesSeen: number[][] = [];
    let currentBatch: number[] = [];

    const promise = sendInBatches(
      items,
      async (item) => {
        currentBatch.push(item);
      },
      () => {
        // Snapshot batch membership once all items in flight are done.
      },
      { batchSize: 2, delayMs: 1000, maxRetries: 0 },
    );

    // Let the first batch (2 items) resolve.
    await vi.advanceTimersByTimeAsync(0);
    batchesSeen.push([...currentBatch]);
    currentBatch = [];

    // Advance past the inter-batch delay to unblock batch 2.
    await vi.advanceTimersByTimeAsync(1000);
    batchesSeen.push([...currentBatch]);
    currentBatch = [];

    await vi.advanceTimersByTimeAsync(1000);
    batchesSeen.push([...currentBatch]);

    await promise;

    expect(batchesSeen).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('retries retryable errors (429/5xx) up to maxRetries then succeeds', async () => {
    let attempts = 0;
    const results: Array<{ item: number; error: unknown }> = [];

    const promise = sendInBatches(
      [1],
      async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Resend 429: rate limited');
        }
      },
      (item, error) => results.push({ item, error }),
      { batchSize: 1, delayMs: 0, maxRetries: 2 },
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(attempts).toBe(3);
    expect(results).toEqual([{ item: 1, error: null }]);
  });

  it('does not retry permanent (non-retryable) errors', async () => {
    let attempts = 0;
    const results: Array<{ item: number; error: unknown }> = [];

    const promise = sendInBatches(
      [1],
      async () => {
        attempts++;
        throw new Error('Resend 422: invalid recipient');
      },
      (item, error) => results.push({ item, error }),
      { batchSize: 1, delayMs: 0, maxRetries: 2 },
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(attempts).toBe(1);
    expect(results).toHaveLength(1);
    expect(results[0].error).toBeInstanceOf(Error);
  });

  it('gives up after exhausting maxRetries on a persistently retryable error', async () => {
    let attempts = 0;
    const results: Array<{ item: number; error: unknown }> = [];

    const promise = sendInBatches(
      [1],
      async () => {
        attempts++;
        throw new Error('Resend 503: service unavailable');
      },
      (item, error) => results.push({ item, error }),
      { batchSize: 1, delayMs: 0, maxRetries: 2 },
    );
    await vi.runAllTimersAsync();
    await promise;

    expect(attempts).toBe(3); // initial attempt + 2 retries
    expect(results[0].error).toBeInstanceOf(Error);
  });
});
