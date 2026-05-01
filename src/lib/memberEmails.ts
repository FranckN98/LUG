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

// ── Helpers for trilingual sections ────────────────────────────────────────────
function langTag(label: string): string {
  return `<div style="margin:24px 0 4px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#8C1A1A;text-transform:uppercase">${label}</div>`;
}
const LANG_DIVIDER = '<hr style="border:none;border-top:1px solid #eee;margin:18px 0" />';

// ── Welcome email ──────────────────────────────────────────────────────────────
export async function sendMemberWelcomeEmail(email: string, firstName: string) {
  const html = wrapHtml(`
    <div class="header">
      <h1>Bienvenue · Welcome · Willkommen</h1>
      <p>Level Up in Germany</p>
    </div>
    <div class="body">
      ${langTag('🇫🇷 Français')}
      <p>Bonjour ${firstName},</p>
      <p>Nous sommes heureux de t'annoncer que ta demande d'adhésion à <strong>Level Up in Germany</strong> a été acceptée.</p>
      <p>Bienvenue dans notre communauté. Nous reviendrons vers toi prochainement avec les prochaines étapes et les opportunités de participation.</p>
      <p>À très bientôt,<br/><strong>L'équipe Level Up in Germany</strong></p>

      ${LANG_DIVIDER}
      ${langTag('🇬🇧 English')}
      <p>Hello ${firstName},</p>
      <p>We are delighted to let you know that your membership application to <strong>Level Up in Germany</strong> has been accepted.</p>
      <p>Welcome to our community. We will get back to you soon with the next steps and ways to get involved.</p>
      <p>See you soon,<br/><strong>The Level Up in Germany team</strong></p>

      ${LANG_DIVIDER}
      ${langTag('🇩🇪 Deutsch')}
      <p>Hallo ${firstName},</p>
      <p>wir freuen uns, dir mitteilen zu können, dass dein Mitgliedsantrag bei <strong>Level Up in Germany</strong> angenommen wurde.</p>
      <p>Willkommen in unserer Community. Wir melden uns in Kürze mit den nächsten Schritten und Möglichkeiten zur Teilnahme.</p>
      <p>Bis bald,<br/><strong>Das Team von Level Up in Germany</strong></p>
      ${emailLinksFooterHtml()}
    </div>
  `);

  const text = `=== Français ===
Bonjour ${firstName},

Ta demande d'adhésion à Level Up in Germany a été acceptée. Bienvenue dans notre communauté. Nous reviendrons vers toi prochainement avec les prochaines étapes.

À très bientôt,
L'équipe Level Up in Germany

=== English ===
Hello ${firstName},

Your membership application to Level Up in Germany has been accepted. Welcome to our community. We will get back to you soon with the next steps.

See you soon,
The Level Up in Germany team

=== Deutsch ===
Hallo ${firstName},

dein Mitgliedsantrag bei Level Up in Germany wurde angenommen. Willkommen in unserer Community. Wir melden uns in Kürze mit den nächsten Schritten.

Bis bald,
Das Team von Level Up in Germany${emailLinksFooterText()}`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Bienvenue · Welcome · Willkommen — Level Up in Germany',
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
  const reasonBlockFr = reason ? `<div class="highlight"><strong>Raison :</strong> ${reason}</div>` : '';
  const reasonBlockEn = reason ? `<div class="highlight"><strong>Reason:</strong> ${reason}</div>` : '';
  const reasonBlockDe = reason ? `<div class="highlight"><strong>Begründung:</strong> ${reason}</div>` : '';

  const html = wrapHtml(`
    <div class="header">
      <h1>Concernant ta demande · About your application · Zu deinem Antrag</h1>
      <p>Level Up in Germany</p>
    </div>
    <div class="body">
      ${langTag('🇫🇷 Français')}
      <p>Bonjour ${firstName},</p>
      <p>Merci pour l'intérêt que tu portes à Level Up in Germany. Après analyse de ta demande, nous ne pouvons malheureusement pas l'accepter pour le moment.</p>
      ${reasonBlockFr}
      <p>Nous te remercions pour ta compréhension et te souhaitons beaucoup de succès.</p>
      <p>Bien cordialement,<br/><strong>L'équipe Level Up in Germany</strong></p>

      ${LANG_DIVIDER}
      ${langTag('🇬🇧 English')}
      <p>Hello ${firstName},</p>
      <p>Thank you for your interest in Level Up in Germany. After reviewing your application, we are unfortunately unable to accept it at this time.</p>
      ${reasonBlockEn}
      <p>We appreciate your understanding and wish you every success.</p>
      <p>Kind regards,<br/><strong>The Level Up in Germany team</strong></p>

      ${LANG_DIVIDER}
      ${langTag('🇩🇪 Deutsch')}
      <p>Hallo ${firstName},</p>
      <p>vielen Dank für dein Interesse an Level Up in Germany. Nach Prüfung deines Antrags können wir ihn leider derzeit nicht annehmen.</p>
      ${reasonBlockDe}
      <p>Wir danken dir für dein Verständnis und wünschen dir viel Erfolg.</p>
      <p>Mit freundlichen Grüßen,<br/><strong>Das Team von Level Up in Germany</strong></p>
      ${emailLinksFooterHtml()}
    </div>
  `);

  const text = `=== Français ===
Bonjour ${firstName},

Merci pour l'intérêt que tu portes à Level Up in Germany. Après analyse, nous ne pouvons malheureusement pas accepter ta demande pour le moment.${reason ? `

Raison : ${reason}` : ''}

Bien cordialement,
L'équipe Level Up in Germany

=== English ===
Hello ${firstName},

Thank you for your interest in Level Up in Germany. After review, we are unfortunately unable to accept your application at this time.${reason ? `

Reason: ${reason}` : ''}

Kind regards,
The Level Up in Germany team

=== Deutsch ===
Hallo ${firstName},

vielen Dank für dein Interesse an Level Up in Germany. Nach Prüfung können wir deinen Antrag leider derzeit nicht annehmen.${reason ? `

Begründung: ${reason}` : ''}

Mit freundlichen Grüßen,
Das Team von Level Up in Germany${emailLinksFooterText()}`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Concernant ta demande d'adhésion · About your application · Zu deinem Mitgliedsantrag",
    html,
    text,
  });
}

// ── Payment reminder email ─────────────────────────────────────────────────────
export async function sendMemberPaymentReminderEmail(email: string, firstName: string) {
  const html = wrapHtml(`
    <div class="header">
      <h1>Rappel cotisation · Membership reminder · Beitragserinnerung</h1>
      <p>Level Up in Germany</p>
    </div>
    <div class="body">
      ${langTag('🇫🇷 Français')}
      <p>Bonjour ${firstName},</p>
      <p>Nous te contactons concernant tes frais annuels de membre pour <strong>Level Up in Germany</strong>.</p>
      <div class="highlight">D'après nos informations, le paiement de tes frais de membre n'a pas encore été enregistré ou doit être renouvelé.</div>
      <p>Merci de régulariser ta situation dès que possible afin de conserver ton statut de membre actif. Pour toute question : <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;">info@levelupingermany.com</a>.</p>
      <p>Bien cordialement,<br/><strong>L'équipe Level Up in Germany</strong></p>

      ${LANG_DIVIDER}
      ${langTag('🇬🇧 English')}
      <p>Hello ${firstName},</p>
      <p>We are reaching out regarding your annual membership fee for <strong>Level Up in Germany</strong>.</p>
      <div class="highlight">According to our records, your membership payment has not yet been received or needs to be renewed.</div>
      <p>Please settle this as soon as possible to keep your active membership status. Any question: <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;">info@levelupingermany.com</a>.</p>
      <p>Kind regards,<br/><strong>The Level Up in Germany team</strong></p>

      ${LANG_DIVIDER}
      ${langTag('🇩🇪 Deutsch')}
      <p>Hallo ${firstName},</p>
      <p>wir kontaktieren dich bezüglich deines jährlichen Mitgliedsbeitrags für <strong>Level Up in Germany</strong>.</p>
      <div class="highlight">Laut unseren Unterlagen wurde der Beitrag noch nicht erfasst oder muss erneuert werden.</div>
      <p>Bitte begleiche ihn baldmöglichst, um deinen aktiven Mitgliedsstatus zu behalten. Bei Fragen: <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;">info@levelupingermany.com</a>.</p>
      <p>Mit freundlichen Grüßen,<br/><strong>Das Team von Level Up in Germany</strong></p>
      ${emailLinksFooterHtml()}
    </div>
  `);

  const text = `=== Français ===
Bonjour ${firstName},

Nous te contactons concernant tes frais annuels de membre Level Up in Germany. D'après nos informations, le paiement n'a pas encore été enregistré ou doit être renouvelé. Merci de régulariser dès que possible.

Contact : info@levelupingermany.com
L'équipe Level Up in Germany

=== English ===
Hello ${firstName},

We are reaching out regarding your annual Level Up in Germany membership fee. According to our records, the payment has not yet been received or needs to be renewed. Please settle it as soon as possible.

Contact: info@levelupingermany.com
The Level Up in Germany team

=== Deutsch ===
Hallo ${firstName},

wir kontaktieren dich bezüglich deines jährlichen Mitgliedsbeitrags für Level Up in Germany. Laut unseren Unterlagen wurde er noch nicht erfasst oder muss erneuert werden. Bitte begleiche ihn baldmöglichst.

Kontakt: info@levelupingermany.com
Das Team von Level Up in Germany${emailLinksFooterText()}`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Rappel cotisation · Membership reminder · Beitragserinnerung',
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
      <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;font-weight:600">info@levelupingermany.com</a>
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

    <hr style="border:none;border-top:1px solid #eee;margin:32px 0" />
    <div style="margin:8px 0 4px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#8C1A1A;text-transform:uppercase">🇬🇧 English summary</div>
    <p>Hello ${firstName}, welcome to <strong>Level Up in Germany e.V.</strong> 🎉 — the francophone &amp; international community in Germany helping the diaspora level up in their career, integration, entrepreneurship and studies.</p>
    <p>As a member you get: priority access to our annual <strong>Mega Conference</strong>, workshops &amp; mentoring programs, the private Ambassadors WhatsApp community, our monthly newsletter and partner discounts (coming soon).</p>
    <p><strong>💛 Membership fee — €30 / year.</strong> It funds venues, content, ambassadors and keeps the association independent. Members pay reduced prices on the Mega Conference, get early-bird access, voting rights at the AGM and visibility for their projects.</p>
    <p>💳 To pay your fee, write to <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;font-weight:600">info@levelupingermany.com</a>. Join our <a href="https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst" style="color:#8C1A1A">WhatsApp Ambassadors community</a> and follow us on <a href="https://www.linkedin.com/company/level-up-in-germany" style="color:#8C1A1A">LinkedIn</a> &amp; <a href="https://www.instagram.com/levelupingermany" style="color:#8C1A1A">Instagram</a>.</p>
    <p>See you soon,<br/><strong>The Level Up in Germany team</strong></p>

    <hr style="border:none;border-top:1px solid #eee;margin:32px 0" />
    <div style="margin:8px 0 4px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#8C1A1A;text-transform:uppercase">🇩🇪 Deutsche Zusammenfassung</div>
    <p>Hallo ${firstName}, willkommen bei <strong>Level Up in Germany e.V.</strong> 🎉 — der frankophonen &amp; internationalen Community in Deutschland, die die Diaspora bei Karriere, Integration, Unternehmertum und Studium unterst&uuml;tzt.</p>
    <p>Als Mitglied erh&auml;ltst du: priorit&auml;ren Zugang zur j&auml;hrlichen <strong>Mega Conference</strong>, Workshops &amp; Mentoring-Programme, die private Botschafter-WhatsApp-Community, unseren monatlichen Newsletter und Partner-Rabatte (in K&uuml;rze).</p>
    <p><strong>💛 Mitgliedsbeitrag — 30&nbsp;€ / Jahr.</strong> Er finanziert R&auml;ume, Inhalte und Botschafter und h&auml;lt den Verein unabh&auml;ngig. Mitglieder profitieren von verg&uuml;nstigten Preisen bei der Mega Conference, fr&uuml;hzeitigem Zugang, Stimmrecht in der Mitgliederversammlung und Sichtbarkeit f&uuml;r ihre Projekte.</p>
    <p>💳 F&uuml;r deinen Beitrag schreibe an <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;font-weight:600">info@levelupingermany.com</a>. Tritt unserer <a href="https://chat.whatsapp.com/Ip3P51uCMGu0TblrkVBSst" style="color:#8C1A1A">WhatsApp-Botschafter-Community</a> bei und folge uns auf <a href="https://www.linkedin.com/company/level-up-in-germany" style="color:#8C1A1A">LinkedIn</a> &amp; <a href="https://www.instagram.com/levelupingermany" style="color:#8C1A1A">Instagram</a>.</p>
    <p>Bis bald,<br/><strong>Das Team von Level Up in Germany</strong></p>

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

💳 Pour régler ta cotisation, écris-nous à info@levelupingermany.com — on te transmet les coordonnées bancaires et le reçu officiel.

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
      <a href="mailto:info@levelupingermany.com" style="color:#8C1A1A;font-weight:600">info@levelupingermany.com</a>
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

💳 Pour régler : écris-nous à info@levelupingermany.com — on te transmet les coordonnées bancaires et le reçu officiel.

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
