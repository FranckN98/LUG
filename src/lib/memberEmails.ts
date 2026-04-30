import { Resend } from 'resend';
import { emailLinksFooterHtml, emailLinksFooterText, emailHeaderLogoHtml } from './emailFooter';

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
    ${emailHeaderLogoHtml()}
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
      ${emailLinksFooterHtml()}
    </div>
  `);

  const text = `Bonjour ${firstName},\n\nNous sommes heureux de t'annoncer que ta demande d'adhésion à Level Up in Germany a été acceptée.\n\nBienvenue dans notre communauté.\n\nTon engagement et ton envie de contribuer à l'association sont précieux pour nous. Nous reviendrons vers toi prochainement avec les prochaines étapes, les informations importantes et les opportunités de participation.\n\nÀ très bientôt,\nL'équipe Level Up in Germany${emailLinksFooterText()}`;

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
      ${emailLinksFooterHtml()}
    </div>
  `);

  const text = `Bonjour ${firstName},\n\nMerci beaucoup pour l'intérêt que tu portes à Level Up in Germany.\n\nAprès analyse de ta demande, nous ne pouvons malheureusement pas l'accepter pour le moment.\n${reason ? `\nRaison : ${reason}\n` : ''}\nNous te remercions pour ta compréhension et te souhaitons beaucoup de succès dans tes projets.\n\nBien cordialement,\nL'équipe Level Up in Germany${emailLinksFooterText()}`;

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
      ${emailLinksFooterHtml()}
    </div>
  `);

  const text = `Bonjour ${firstName},\n\nNous te contactons concernant tes frais annuels de membre pour Level Up in Germany.\n\nD'après nos informations, le paiement de tes frais de membre n'a pas encore été enregistré ou doit être renouvelé.\n\nMerci de régulariser ta situation dès que possible afin de conserver ton statut de membre actif.\n\nBien cordialement,\nL'équipe Level Up in Germany${emailLinksFooterText()}`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Rappel concernant tes frais de membre',
    html,
    text,
  });
}

// ── Custom / preset email (manual send from admin) ────────────────────────────
type CustomEmailParams = {
  email: string;
  firstName: string;
  subject: string;
  message: string;
  preset?: 'welcome-full' | 'info-pack';
};

const FULL_WELCOME_HTML = (firstName: string) => `
  <div class="header">
    <h1>Bienvenue dans la famille Level Up in Germany</h1>
    <p>Ton parcours commence ici</p>
  </div>
  <div class="body">
    <p>Bonjour ${firstName},</p>
    <p>Nous sommes vraiment heureux de t'accueillir officiellement parmi les membres de
      <strong>Level Up in Germany e.V.</strong> 🎉</p>

    <p>Notre association est née d'une conviction simple : la diaspora francophone
      en Allemagne possède un potentiel énorme — d'idées, de talents et d'envie d'avancer.
      Notre mission est de te donner les outils, les contacts et la communauté pour
      <strong>passer à la vitesse supérieure</strong>, que ce soit dans ton projet pro,
      ton intégration, ton entrepreneuriat ou tes études.</p>

    <div class="highlight">
      <strong>Concrètement, en tant que membre tu profites de :</strong>
      <ul style="margin:8px 0 0 0;padding-left:20px;line-height:1.8">
        <li>Accès prioritaire à la <strong>Mega Conference</strong> annuelle</li>
        <li>Workshops, mentorat et programmes thématiques (carrière, entrepreneuriat, intégration)</li>
        <li>Communauté WhatsApp privée des Ambassadeurs &amp; échanges directs avec l'équipe</li>
        <li>Newsletter mensuelle avec opportunités, témoignages et événements partenaires</li>
        <li>Réductions chez nos partenaires (à venir)</li>
      </ul>
    </div>

    <p><strong>💛 Une petite contribution, une grande communauté</strong></p>
    <p>Pour faire vivre l'association, organiser nos événements et continuer à offrir un
      accompagnement de qualité, nous comptons sur une cotisation symbolique de
      <strong>30&nbsp;€ par an</strong>. C'est ce qui nous permet de louer les salles, produire
      le contenu, soutenir les ambassadeurs dans leurs villes et garder l'association
      indépendante &amp; au service de ses membres.</p>
    <p>En tant que membre cotisant, tu bénéficies en plus :</p>
    <ul style="line-height:1.8;padding-left:20px">
      <li>D'un <strong>tarif préférentiel</strong> sur la Mega Conference et les workshops payants</li>
      <li>D'un <strong>accès en avant-première</strong> aux inscriptions (places limitées)</li>
      <li>Du <strong>droit de vote</strong> en assemblée générale et de participation aux décisions</li>
      <li>D'une <strong>visibilité dédiée</strong> pour tes projets dans la communauté</li>
    </ul>
    <p style="font-size:14px;color:#5a3030">
      💳 Pour régler ta cotisation, écris simplement à
      <a href="mailto:info@levelupingermany.de" style="color:#8C1A1A;font-weight:600">info@levelupingermany.de</a>
      — on te transmet les coordonnées bancaires et le reçu officiel.
    </p>

    <p><strong>Tes 3 prochains pas recommandés :</strong></p>
    <ol style="line-height:1.8;padding-left:20px">
      <li>Rejoins notre <a href="https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst" style="color:#8C1A1A;font-weight:600">communauté WhatsApp des Ambassadeurs</a> pour rencontrer les autres membres.</li>
      <li>Suis-nous sur <a href="https://www.linkedin.com/company/level-up-in-germany" style="color:#8C1A1A">LinkedIn</a> et <a href="https://www.instagram.com/levelupingermany" style="color:#8C1A1A">Instagram</a> pour ne rien rater.</li>
      <li>Réserve la date de notre prochaine <a href="https://www.levelupingermany.com/events" style="color:#8C1A1A;font-weight:600">Mega Conference</a>.</li>
    </ol>

    <p><strong>Une question, une idée, une envie de contribuer ?</strong><br/>
      Réponds simplement à ce mail ou contacte-nous à
      <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;font-weight:600">info@levelupingermany.com</a>.
      L'équipe te répond personnellement.</p>

    <p>Encore une fois : bienvenue. On a hâte de bâtir avec toi.</p>

    <p>À très vite,<br/>
      <strong>L'équipe Level Up in Germany</strong><br/>
      <span style="color:#8C1A1A;font-style:italic">— Ensemble, on monte d'un cran.</span></p>

    ${emailLinksFooterHtml()}
  </div>
`;

const FULL_WELCOME_TEXT = (firstName: string) => `Bonjour ${firstName},

Nous sommes vraiment heureux de t'accueillir officiellement parmi les membres de Level Up in Germany e.V. 🎉

Notre association est née d'une conviction simple : la diaspora francophone en Allemagne possède un potentiel énorme — d'idées, de talents et d'envie d'avancer. Notre mission est de te donner les outils, les contacts et la communauté pour passer à la vitesse supérieure, que ce soit dans ton projet pro, ton intégration, ton entrepreneuriat ou tes études.

En tant que membre, tu profites de :
  • Accès prioritaire à la Mega Conference annuelle
  • Workshops, mentorat et programmes thématiques
  • Communauté WhatsApp privée des Ambassadeurs
  • Newsletter mensuelle avec opportunités et événements
  • Réductions chez nos partenaires (à venir)

💛 UNE PETITE CONTRIBUTION, UNE GRANDE COMMUNAUTÉ
Pour faire vivre l'association et continuer à organiser nos événements, nous comptons sur une cotisation symbolique de 30 € par an. C'est ce qui nous permet de louer les salles, produire le contenu et soutenir les ambassadeurs dans leurs villes.

En tant que membre cotisant, tu profites en plus :
  • D'un tarif préférentiel sur la Mega Conference et les workshops payants
  • D'un accès en avant-première aux inscriptions (places limitées)
  • Du droit de vote en assemblée générale
  • D'une visibilité dédiée pour tes projets dans la communauté

💳 Pour régler ta cotisation, écris-nous à info@levelupingermany.de — on te transmet les coordonnées bancaires et le reçu officiel.

Tes 3 prochains pas :
  1. Rejoins notre communauté WhatsApp : https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst
  2. Suis-nous sur LinkedIn et Instagram (@levelupingermany)
  3. Réserve la date de notre prochaine Mega Conference : https://www.levelupingermany.com/events

Une question ? Réponds simplement à ce mail ou écris-nous à info@levelupingermany.com.

Bienvenue. On a hâte de bâtir avec toi.

À très vite,
L'équipe Level Up in Germany
— Ensemble, on monte d'un cran.${emailLinksFooterText()}`;

const INFO_PACK_HTML = (firstName: string) => `
  <div class="header">
    <h1>Toutes les infos pour bien démarrer</h1>
    <p>Ton kit Level Up in Germany</p>
  </div>
  <div class="body">
    <p>Bonjour ${firstName},</p>
    <p>Voici un résumé pratique de tout ce qu'il faut savoir sur l'association et de la
      façon dont tu peux profiter au maximum de ton statut de membre.</p>

    <div class="highlight">
      <strong>📍 Qui sommes-nous ?</strong><br/>
      <strong>Level Up in Germany e.V.</strong> est une association francophone basée en Allemagne
      qui accompagne la diaspora dans sa montée en compétences, son intégration et son
      entrepreneuriat. Site officiel :
      <a href="https://www.levelupingermany.com" style="color:#8C1A1A;font-weight:600">levelupingermany.com</a>
    </div>

    <p><strong>📅 Nos événements phares</strong></p>
    <ul style="line-height:1.8;padding-left:20px">
      <li><strong>Mega Conference annuelle</strong> — la grande rencontre de la communauté</li>
      <li><strong>Workshops thématiques</strong> — carrière, leadership, entrepreneuriat</li>
      <li><strong>Sessions de mentorat</strong> — accompagnement individualisé</li>
      <li><strong>Programmes spécifiques</strong> — étudiants, jeunes pros, entrepreneurs</li>
    </ul>
    <p>👉 Calendrier complet :
      <a href="https://www.levelupingermany.com/events" style="color:#8C1A1A;font-weight:600">levelupingermany.com/events</a>
    </p>

    <p><strong>📬 Comment nous contacter</strong></p>
    <ul style="line-height:1.8;padding-left:20px">
      <li>Email général :
        <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A">info@levelupingermany.com</a></li>
      <li>WhatsApp Ambassadeurs :
        <a href="https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst" style="color:#25D366;font-weight:600">rejoindre la communauté</a></li>
      <li>LinkedIn :
        <a href="https://www.linkedin.com/company/level-up-in-germany" style="color:#8C1A1A">@level-up-in-germany</a></li>
      <li>Instagram :
        <a href="https://www.instagram.com/levelupingermany" style="color:#8C1A1A">@levelupingermany</a></li>
      <li>TikTok :
        <a href="https://www.tiktok.com/@levelupingermany" style="color:#8C1A1A">@levelupingermany</a></li>
    </ul>

    <p><strong>🤝 Comment t'impliquer ?</strong></p>
    <ul style="line-height:1.8;padding-left:20px">
      <li>Participer aux événements et workshops</li>
      <li>Devenir <strong>Ambassadeur·rice</strong> dans ta ville (écris-nous !)</li>
      <li>Proposer un sujet, animer un atelier, partager ton expertise</li>
      <li>Parrainer un nouveau membre</li>
    </ul>

    <div class="highlight">
      <strong>💛 Cotisation membre — 30&nbsp;€ / an</strong><br/>
      Une petite contribution qui fait une grande différence : elle nous permet de louer
      les salles, produire les contenus, soutenir les ambassadeurs dans leurs villes et
      garder l'association libre &amp; indépendante.
      <br/><br/>
      <strong>Ce que ça t'apporte en plus :</strong> tarif préférentiel sur la Mega Conference,
      accès anticipé aux inscriptions, droit de vote en AG et visibilité pour tes projets.
      <br/><br/>
      💳 Pour régler ta cotisation, écris-nous à
      <a href="mailto:info@levelupingermany.de" style="color:#8C1A1A;font-weight:600">info@levelupingermany.de</a>
      — on te transmet les coordonnées bancaires et le reçu officiel.
    </div>

    <p>Tu peux toujours nous écrire pour toute question :
      <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;font-weight:600">info@levelupingermany.com</a></p>

    <p>À très vite,<br/>
      <strong>L'équipe Level Up in Germany</strong></p>

    ${emailLinksFooterHtml()}
  </div>
`;

const INFO_PACK_TEXT = (firstName: string) => `Bonjour ${firstName},

Voici un résumé pratique de tout ce qu'il faut savoir sur Level Up in Germany.

📍 QUI SOMMES-NOUS
Level Up in Germany e.V. est une association francophone basée en Allemagne qui accompagne la diaspora dans sa montée en compétences, son intégration et son entrepreneuriat.
Site : https://www.levelupingermany.com

📅 NOS ÉVÉNEMENTS
  • Mega Conference annuelle
  • Workshops thématiques (carrière, leadership, entrepreneuriat)
  • Sessions de mentorat
  • Programmes spécifiques (étudiants, jeunes pros, entrepreneurs)
Calendrier : https://www.levelupingermany.com/events

📬 NOUS CONTACTER
  • Email : info@levelupingermany.com
  • WhatsApp Ambassadeurs : https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst
  • LinkedIn : https://www.linkedin.com/company/level-up-in-germany
  • Instagram : @levelupingermany
  • TikTok : @levelupingermany

🤝 COMMENT T'IMPLIQUER
  • Participer aux événements et workshops
  • Devenir Ambassadeur·rice dans ta ville
  • Proposer un sujet, animer un atelier
  • Parrainer un nouveau membre

💛 COTISATION MEMBRE — 30 € / AN
Une petite contribution qui fait une grande différence : elle nous permet de louer les salles, produire les contenus, soutenir les ambassadeurs et garder l'association libre & indépendante.

En tant que cotisant, tu profites en plus : tarif préférentiel sur la Mega Conference, accès anticipé aux inscriptions, droit de vote en AG et visibilité pour tes projets.

💳 Pour régler : écris-nous à info@levelupingermany.de — on te transmet les coordonnées bancaires et le reçu officiel.

Toute question ? info@levelupingermany.com

À très vite,
L'équipe Level Up in Germany${emailLinksFooterText()}`;

/**
 * Send a custom OR preset email to a member.
 * - preset='welcome-full'  → full warm welcome with all info & next steps
 * - preset='info-pack'     → contacts & resources kit
 * - otherwise              → use provided subject + message (plain message becomes paragraphs)
 */
export async function sendMemberCustomEmail(params: CustomEmailParams) {
  const { email, firstName, subject, message, preset } = params;

  let html: string;
  let text: string;
  let finalSubject: string;

  if (preset === 'welcome-full') {
    html = wrapHtml(FULL_WELCOME_HTML(firstName));
    text = FULL_WELCOME_TEXT(firstName);
    finalSubject = `Bienvenue dans Level Up in Germany, ${firstName} 🎉`;
  } else if (preset === 'info-pack') {
    html = wrapHtml(INFO_PACK_HTML(firstName));
    text = INFO_PACK_TEXT(firstName);
    finalSubject = 'Toutes les infos Level Up in Germany';
  } else {
    // Custom message: turn line breaks into paragraphs, escape HTML.
    const escaped = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const paragraphs = escaped
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    html = wrapHtml(`
      <div class="header">
        <h1>Level Up in Germany</h1>
        <p>${subject}</p>
      </div>
      <div class="body">
        <p>Bonjour ${firstName},</p>
        ${paragraphs}
        <p>À très vite,<br/><strong>L'équipe Level Up in Germany</strong></p>
        ${emailLinksFooterHtml()}
      </div>
    `);
    text = `Bonjour ${firstName},\n\n${message}\n\nÀ très vite,\nL'équipe Level Up in Germany${emailLinksFooterText()}`;
    finalSubject = subject;
  }

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: finalSubject,
    html,
    text,
  });
}
