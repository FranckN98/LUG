import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM =
  process.env.NEWSLETTER_FROM_EMAIL ??
  'Level Up in Germany <info@levelupingermany.com>';

// ── Shared HTML shell ──────────────────────────────────────────────────────────
function wrapHtml(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  body { margin:0; padding:0; background:#f6f4f4; font-family:'Helvetica Neue',Arial,sans-serif; color:#1a0a0a; }
  .wrap { max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#8C1A1A,#c0392b); padding:32px 36px; }
  .header h1 { margin:0; color:#fff; font-size:22px; font-weight:700; letter-spacing:-0.3px; }
  .header p { margin:6px 0 0; color:rgba(255,255,255,0.75); font-size:13px; }
  .body { padding:32px 36px; }
  .body p { margin:0 0 16px; font-size:15px; line-height:1.7; color:#2d1414; }
  .body .highlight { background:#fdf3f3; border-left:3px solid #8C1A1A; padding:12px 16px; border-radius:4px; margin:20px 0; }
  .footer { padding:20px 36px; background:#fdf8f8; border-top:1px solid #f0e0e0; }
  .footer p { margin:0; font-size:12px; color:#9e7878; line-height:1.6; }
</style>
</head>
<body>
<div style="padding:24px 16px;">
  <div class="wrap">
    ${bodyHtml}
    <div class="footer">
      <p>Level Up in Germany · levelupingermany.com<br/>
      Cet email a été envoyé suite à votre interaction avec notre association.</p>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ── Welcome email ──────────────────────────────────────────────────────────────
export async function sendMemberWelcomeEmail(email: string, firstName: string) {
  const html = wrapHtml(`
    <div class="header">
      <h1>Bienvenue dans Level Up in Germany</h1>
      <p>Ta demande d'adhésion a été acceptée</p>
    </div>
    <div class="body">
      <p>Bonjour ${firstName},</p>
      <p>Nous sommes heureux de t'annoncer que ta demande d'adhésion à <strong>Level Up in Germany</strong> a été acceptée.</p>
      <p>Bienvenue dans notre communauté.</p>
      <p>Ton engagement et ton envie de contribuer à l'association sont précieux pour nous. Nous reviendrons vers toi prochainement avec les prochaines étapes, les informations importantes et les opportunités de participation.</p>
      <p>À très bientôt,<br/><strong>L'équipe Level Up in Germany</strong></p>
    </div>
  `);

  const text = `Bonjour ${firstName},\n\nNous sommes heureux de t'annoncer que ta demande d'adhésion à Level Up in Germany a été acceptée.\n\nBienvenue dans notre communauté.\n\nTon engagement et ton envie de contribuer à l'association sont précieux pour nous. Nous reviendrons vers toi prochainement avec les prochaines étapes, les informations importantes et les opportunités de participation.\n\nÀ très bientôt,\nL'équipe Level Up in Germany`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Bienvenue dans Level Up in Germany',
    html,
    text,
  });
}

// ── Rejection email ────────────────────────────────────────────────────────────
export async function sendMemberRejectionEmail(
  email: string,
  firstName: string,
  reason: string,
) {
  const html = wrapHtml(`
    <div class="header">
      <h1>Retour concernant ta demande d'adhésion</h1>
      <p>Level Up in Germany</p>
    </div>
    <div class="body">
      <p>Bonjour ${firstName},</p>
      <p>Merci beaucoup pour l'intérêt que tu portes à Level Up in Germany.</p>
      <p>Après analyse de ta demande, nous ne pouvons malheureusement pas l'accepter pour le moment.</p>
      ${reason ? `<div class="highlight"><strong>Raison :</strong> ${reason}</div>` : ''}
      <p>Nous te remercions pour ta compréhension et te souhaitons beaucoup de succès dans tes projets.</p>
      <p>Bien cordialement,<br/><strong>L'équipe Level Up in Germany</strong></p>
    </div>
  `);

  const text = `Bonjour ${firstName},\n\nMerci beaucoup pour l'intérêt que tu portes à Level Up in Germany.\n\nAprès analyse de ta demande, nous ne pouvons malheureusement pas l'accepter pour le moment.\n${reason ? `\nRaison : ${reason}\n` : ''}\nNous te remercions pour ta compréhension et te souhaitons beaucoup de succès dans tes projets.\n\nBien cordialement,\nL'équipe Level Up in Germany`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Retour concernant ta demande d'adhésion",
    html,
    text,
  });
}

// ── Payment reminder email ─────────────────────────────────────────────────────
export async function sendMemberPaymentReminderEmail(email: string, firstName: string) {
  const html = wrapHtml(`
    <div class="header">
      <h1>Rappel concernant tes frais de membre</h1>
      <p>Level Up in Germany</p>
    </div>
    <div class="body">
      <p>Bonjour ${firstName},</p>
      <p>Nous te contactons concernant tes frais annuels de membre pour <strong>Level Up in Germany</strong>.</p>
      <div class="highlight">D'après nos informations, le paiement de tes frais de membre n'a pas encore été enregistré ou doit être renouvelé.</div>
      <p>Merci de régulariser ta situation dès que possible afin de conserver ton statut de membre actif.</p>
      <p>Pour toute question, n'hésite pas à nous contacter directement à <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;">info@levelupingermany.com</a>.</p>
      <p>Bien cordialement,<br/><strong>L'équipe Level Up in Germany</strong></p>
    </div>
  `);

  const text = `Bonjour ${firstName},\n\nNous te contactons concernant tes frais annuels de membre pour Level Up in Germany.\n\nD'après nos informations, le paiement de tes frais de membre n'a pas encore été enregistré ou doit être renouvelé.\n\nMerci de régulariser ta situation dès que possible afin de conserver ton statut de membre actif.\n\nBien cordialement,\nL'équipe Level Up in Germany`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Rappel concernant tes frais de membre',
    html,
    text,
  });
}
