import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY?.trim();
if (!apiKey) {
  throw new Error('RESEND_API_KEY is not set');
}
const resend = new Resend(apiKey);

export async function sendContactMail({ name, email, message }: { name: string; email: string; message: string }) {
  return resend.emails.send({
    from: 'info@levelupingermany.com',
    to: 'levelupdiaspo@gmail.com',
    subject: 'Neue Kontaktanfrage',
    html: `<p><b>Name:</b> ${name}</p>
           <p><b>Email:</b> ${email}</p>
           <p><b>Nachricht:</b><br/>${message}</p>`,
  });
}
