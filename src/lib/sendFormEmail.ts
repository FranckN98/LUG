import type { FormPayload } from '@/types/form-payload';
import { emailHeaderLogoHtml } from './emailFooter';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const TYPE_LABEL: Record<FormPayload['type'], string> = {
  contact: 'Contact',
  join: 'Join / Membership',
  'workshop-registration': 'Workshop registration',
  'mentor-request': 'Mentor request',
  'sponsor-inquiry': 'Sponsor / Donation inquiry',
};

export async function sendFormSubmissionEmail(payload: FormPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = (process.env.FORMS_TO_EMAIL || 'levelupdiaspo@gmail.com').trim();
  const from =
    process.env.FORMS_FROM_EMAIL?.trim() || 'Level Up in Germany <onboarding@resend.dev>';
  const replyTo = payload.values.email?.trim();

  const subject = `[Level Up] ${TYPE_LABEL[payload.type]}`;
  const rows = Object.entries(payload.values)
    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #eee;font-weight:600">${esc(k)}</td><td style="padding:8px;border:1px solid #eee">${esc(String(v))}</td></tr>`)
    .join('');

  const html = `
    <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f6f4f4;font-family:system-ui,sans-serif;line-height:1.5;color:#1a1a1a">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden">
    ${emailHeaderLogoHtml()}
    <div style="padding:8px 32px 32px">
    <h2 style="color:#8C1A1A;margin:0 0 16px">${esc(TYPE_LABEL[payload.type])}</h2>
    <table style="border-collapse:collapse;max-width:560px;width:100%">${rows}</table>
    <p style="margin-top:16px;font-size:12px;color:#666">Envoyé depuis le site levelupingermany.com · ${new Date().toISOString()}</p>
    </div>
    </div>
    </body></html>`;

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[forms] RESEND_API_KEY manquant — e-mail non envoyé. Payload:', payload.type, payload.values);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('email_not_configured');
    }
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`resend_failed: ${res.status} ${errText}`);
  }
}
