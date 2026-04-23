import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');

  if (!token || token === 'preview-only') {
    return htmlResponse(
      'Lien invalide',
      'Ce lien de désabonnement n\'est pas valide ou a déjà expiré.',
      false,
    );
  }

  // Check by token first, then by id (fallback for subscribers without token)
  const subscriber =
    (await prisma.newsletterSubscriber.findFirst({ where: { unsubscribeToken: token } })) ??
    (await prisma.newsletterSubscriber.findFirst({ where: { id: token } }));

  if (!subscriber) {
    return htmlResponse('Introuvable', 'Aucun abonné trouvé pour ce lien de désabonnement.', false);
  }

  if (subscriber.status === 'unsubscribed') {
    return htmlResponse(
      'Déjà désabonné',
      'Votre adresse e-mail est déjà retirée de notre liste de diffusion.',
      true,
    );
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { status: 'unsubscribed' },
  });

  return htmlResponse(
    'Désabonnement confirmé',
    'Vous avez bien été désabonné(e). Vous ne recevrez plus nos newsletters. Merci pour votre intérêt.',
    true,
  );
}

function htmlResponse(title: string, message: string, success: boolean): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escHtml(title)} · Level Up in Germany</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0f0606;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#1a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:56px 48px;max-width:440px;width:100%;text-align:center}
    .icon{font-size:52px;margin-bottom:24px;display:block}
    h1{font-size:22px;font-weight:800;color:#fff;margin-bottom:14px;line-height:1.3}
    p{font-size:15px;color:rgba(255,255,255,0.55);line-height:1.75;margin-bottom:36px}
    a.btn{display:inline-block;background:#8C1A1A;color:#fff;font-weight:700;font-size:14px;padding:13px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.03em;transition:opacity .15s}
    a.btn:hover{opacity:0.85}
    .brand{font-size:10px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.2);margin-bottom:28px;display:block}
  </style>
</head>
<body>
  <div class="card">
    <span class="brand">Level Up in Germany</span>
    <span class="icon">${success ? '✅' : '⚠️'}</span>
    <h1>${escHtml(title)}</h1>
    <p>${escHtml(message)}</p>
    <a href="/" class="btn">Retour au site</a>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
