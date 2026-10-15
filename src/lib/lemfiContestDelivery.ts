import { recordEmailAttempt, type RegisteredEntry } from './lemfiContest';
import { sendConfirmationEmail } from './lemfiContestEmail';

export type EmailStatus = 'sent' | 'failed' | 'not_configured';

/** Envoie l'e-mail de confirmation et enregistre le résultat. `sent` seulement si Resend a confirmé. */
export async function deliverConfirmation(entry: RegisteredEntry): Promise<EmailStatus> {
  const result = await sendConfirmationEmail({
    to: entry.email,
    firstName: entry.firstName,
    sequentialNumber: entry.sequentialNumber,
    accessToken: entry.accessToken,
    locale: entry.locale,
  });

  try {
    await recordEmailAttempt(entry.id, result.ok ? { ok: true } : { ok: false, error: result.error });
  } catch {
    console.error('[lemfi] could not record email attempt', entry.sequentialNumber);
  }

  if (result.ok) return 'sent';
  return result.error === 'not_configured' ? 'not_configured' : 'failed';
}
