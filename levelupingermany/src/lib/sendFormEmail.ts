import type { FormPayload } from '@/types/form-payload';

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
  const to = (process.env.FORMS_TO_EMAIL || 'info@levelupingermany.de').trim();
  const from =
    process.env.FORMS_FROM_EMAIL?.trim() || 'Level Up in Germany <onboarding@resend.dev>';

  const subject = `[Level Up] ${TYPE_LABEL[payload.type]}`;
  const rows = Object.entries(payload.values)
    .map(([k, v]) => `<tr><td style="padding:8px;border:1px solid #eee;font-weight:600">${esc(k)}</td><td style="padding:8px;border:1px solid #eee">${esc(String(v))}</td></tr>`)
    .join('');

  const html = `
    <!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5">
    <h2 style="color:#8C1A1A">${esc(TYPE_LABEL[payload.type])}</h2>
    <table style="border-collapse:collapse;max-width:560px">${rows}</table>
    <p style="margin-top:16px;font-size:12px;color:#666">Envoyé depuis le site levelupingermany.de · ${new Date().toISOString()}</p>
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
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`resend_failed: ${res.status} ${errText}`);
  }
}
