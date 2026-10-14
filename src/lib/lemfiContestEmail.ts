import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY?.trim();
if (!apiKey) {
  throw new Error('RESEND_API_KEY is not set');
}
const resend = new Resend(apiKey);

export type ContestEmailType = 'confirmation' | 'validation_required' | 'validated' | 'rejected';

/**
 * Send LemFi contest confirmation email to participant.
 */
export async function sendContestConfirmationEmail({
  email,
  firstName,
  displayNumber,
  accessToken,
}: {
  email: string;
  firstName: string;
  displayNumber: string;
  accessToken: string;
}) {
  const trackingLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://levelupingermany.com'}/lemfi-contest/track/${accessToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .number { font-size: 32px; font-weight: bold; color: #ff6b35; margin: 20px 0; }
          .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Participation reçue !</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${firstName}</strong>,</p>
            <p>Merci de votre participation au concours <strong>Level Up in Germany × LemFi</strong> !</p>
            <p>Votre numéro de participation est:</p>
            <div class="number">${displayNumber}</div>
            <p>Votre éligibilité au tirage sera confirmée après vérification de votre preuve de transfert.</p>
            <p>Suivez votre participation:</p>
            <a href="${trackingLink}" class="button">Consulter mon statut</a>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Lien sécurisé: <a href="${trackingLink}">${trackingLink}</a>
            </p>
          </div>
          <div class="footer">
            <p>À vous de jouer ! Level Up in Germany</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'contest@levelupingermany.com',
      to: email,
      subject: `Participation reçue - Concours Level Up × LemFi - ${displayNumber}`,
      html,
      tags: ['lemfi-contest', 'confirmation'],
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Failed to send contest confirmation email:', error);
    return { success: false, error };
  }
}

/**
 * Send validation reminder to admin (when new entry added).
 */
export async function sendAdminValidationAlert({
  displayNumber,
  email,
  firstName,
  lastName,
}: {
  displayNumber: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  const adminDashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://levelupingermany.com'}/admin/lemfi-contest`;

  try {
    await resend.emails.send({
      from: 'contest@levelupingermany.com',
      to: 'levelupdiaspo@gmail.com',
      subject: `[Concours] Nouvelle inscription à valider - ${displayNumber}`,
      html: `
        <p>Nouvelle inscription au concours LemFi:</p>
        <p>
          <strong>Numéro:</strong> ${displayNumber}<br>
          <strong>Nom:</strong> ${firstName} ${lastName}<br>
          <strong>Email:</strong> ${email}
        </p>
        <p><a href="${adminDashboardUrl}">Accéder au tableau de bord admin</a></p>
      `,
      tags: ['lemfi-contest', 'admin-alert'],
    });
  } catch (error) {
    console.error('Failed to send admin alert:', error);
  }
}

/**
 * Send validation confirmation to participant.
 */
export async function sendValidationConfirmationEmail({
  email,
  firstName,
  displayNumber,
}: {
  email: string;
  firstName: string;
  displayNumber: string;
}) {
  try {
    await resend.emails.send({
      from: 'contest@levelupingermany.com',
      to: email,
      subject: `Participation validée - Concours Level Up × LemFi - ${displayNumber}`,
      html: `
        <p>Bonjour <strong>${firstName}</strong>,</p>
        <p>Bonne nouvelle ! Votre participation au concours <strong>Level Up in Germany × LemFi</strong> a été validée.</p>
        <p>Votre numéro <strong>${displayNumber}</strong> est maintenant éligible au tirage au sort.</p>
        <p>À bientôt ! 🎉</p>
      `,
      tags: ['lemfi-contest', 'validated'],
    });
  } catch (error) {
    console.error('Failed to send validation email:', error);
  }
}

/**
 * Send rejection reason to participant.
 */
export async function sendRejectionEmail({
  email,
  firstName,
  displayNumber,
  reason,
}: {
  email: string;
  firstName: string;
  displayNumber: string;
  reason: string;
}) {
  try {
    await resend.emails.send({
      from: 'contest@levelupingermany.com',
      to: email,
      subject: `Participation refusée - Concours Level Up × LemFi - ${displayNumber}`,
      html: `
        <p>Bonjour <strong>${firstName}</strong>,</p>
        <p>Merci de votre participation au concours <strong>Level Up in Germany × LemFi</strong>.</p>
        <p>Malheureusement, votre participation n'a pas pu être validée pour la raison suivante:</p>
        <p><strong>${reason}</strong></p>
        <p>Nous vous invitons à vérifier les conditions du concours et de réessayer si applicable.</p>
      `,
      tags: ['lemfi-contest', 'rejected'],
    });
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }
}
