/**
 * Minimal in-process batching/throttling helper for bulk campaign sends.
 *
 * Why this exists: the previous implementation sent to every subscriber in a
 * tight sequential loop with no concurrency control, no delay between
 * requests, and no retry for transient errors (Resend rate limits / 5xx).
 * For a list of any real size this both risks hitting Resend's rate limit
 * (causing avoidable failures) and, on serverless hosts, can exceed the
 * platform's function execution timeout mid-send.
 *
 * Configurable via env vars (all optional, sane defaults applied):
 *   EMAIL_BATCH_SIZE      — how many emails to send concurrently per batch (default 10)
 *   EMAIL_BATCH_DELAY_MS  — pause between batches, in ms (default 1000)
 *   EMAIL_MAX_RETRIES     — retries for transient errors only (default 2)
 */

export interface BatchSendResult {
  sent: number;
  failed: number;
  errors: string[];
}

function getEnvInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getBatchSize(): number {
  return getEnvInt('EMAIL_BATCH_SIZE', 10);
}

export function getBatchDelayMs(): number {
  return getEnvInt('EMAIL_BATCH_DELAY_MS', 1000);
}

export function getMaxRetries(): number {
  return getEnvInt('EMAIL_MAX_RETRIES', 2);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns true for errors that are worth retrying (rate limiting / transient
 * server errors). 4xx errors other than 429 (invalid recipient, bad request,
 * unauthorized, validation errors, etc.) are permanent — retrying them would
 * just waste time and could look like abuse to the provider.
 */
function isRetryableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  const statusMatch = message.match(/Resend (\d{3}):/);
  if (!statusMatch) return false;
  const status = Number(statusMatch[1]);
  return status === 429 || status >= 500;
}

/**
 * Run `sendOne` for every item in `items`, processing `batchSize` items
 * concurrently at a time, pausing `delayMs` between batches, and retrying
 * transient failures up to `maxRetries` times with exponential backoff.
 */
export async function sendInBatches<T>(
  items: readonly T[],
  sendOne: (item: T) => Promise<void>,
  onResult: (item: T, error: unknown | null) => void,
  options?: { batchSize?: number; delayMs?: number; maxRetries?: number },
): Promise<void> {
  const batchSize = options?.batchSize ?? getBatchSize();
  const delayMs = options?.delayMs ?? getBatchDelayMs();
  const maxRetries = options?.maxRetries ?? getMaxRetries();

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (item) => {
        let lastError: unknown = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            await sendOne(item);
            onResult(item, null);
            return;
          } catch (err) {
            lastError = err;
            if (attempt < maxRetries && isRetryableError(err)) {
              // Exponential backoff: 500ms, 1000ms, 2000ms, ...
              await sleep(500 * 2 ** attempt);
              continue;
            }
            break;
          }
        }
        onResult(item, lastError);
      }),
    );

    if (i + batchSize < items.length && delayMs > 0) {
      await sleep(delayMs);
    }
  }
}
