# Newsletter & téléchargement PDF (événements)

## Fonctionnement

1. L’utilisateur clique sur le bloc PDF (Events 2025 / 2026).
2. Un modal demande l’e-mail (+ consentement optionnel RGPD + Turnstile si configuré).
3. `POST /api/subscribe` :
   - valide l’e-mail ;
   - limite le débit par IP (mémoire serveur) ;
   - enregistre ou met à jour l’entrée dans `newsletter_subscribers` (sans doublon d’e-mail) ;
   - envoie un e-mail via **Resend** avec le lien absolu vers le PDF.
4. Le PDF s’ouvre aussi dans un nouvel onglet après succès.

## Variables d’environnement

Voir `.env.example` :

- `DATABASE_URL` — SQLite local (`file:./dev.db`) ou **PostgreSQL** en production (Neon, Supabase, etc.).
- `RESEND_API_KEY` — obligatoire en production pour l’envoi des e-mails.
- `NEWSLETTER_FROM_EMAIL` — expéditeur autorisé dans Resend (ex. `Level Up in Germany <info@levelupingermany.de>`).
- `NEXT_PUBLIC_SITE_URL` — URL publique du site pour les liens dans l’e-mail (ex. `https://www.levelupingermany.de`).
- Turnstile : `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (recommandé en production).

## Base de données

### Développement (SQLite)

```bash
npx prisma migrate dev
```

### Production (PostgreSQL)

1. Créer une base Postgres et définir `DATABASE_URL`.
2. Dans `prisma/schema.prisma`, remplacer :

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. `npx prisma migrate deploy`

## Fichiers PDF par édition

Les chemins publics sont centralisés dans `src/lib/event-pdf-config.ts` (`EVENT_PDF_PATH`).  
Placez les fichiers dans `public/downloads/`.

## Extension

- Nouvelles éditions : ajouter une clé dans `EventEdition`, `EVENT_PDF_PATH` et `EVENT_SOURCE_LABEL`.
- Campagnes : utiliser le champ `tags` ou des sources dédiées dans `newsletter_subscribers`.

## Dépannage : « l’e-mail n’arrive pas »

1. **`RESEND_API_KEY`** — Oblatoire dans `.env.local` (local) ou variables d’environnement (hébergement). Sans clé, l’API renvoie une erreur explicite (plus de « faux » succès silencieux).

2. **Expéditeur `NEWSLETTER_FROM_EMAIL` / `FORMS_FROM_EMAIL`** — L’adresse **From** doit être **autorisée dans Resend** (domaine vérifié, ex. `Level Up in Germany <news@levelupingermany.de>`). Utiliser uniquement `onboarding@resend.dev` en test : Resend n’envoie alors qu’à **l’e-mail de votre compte Resend**.

3. **Destinataire en test** — Avec le domaine de test Resend, vous ne pouvez envoyer qu’à l’adresse enregistrée sur le compte. Pour tester vers n’importe quelle boîte, **vérifiez votre domaine** dans Resend et utilisez un `From` sur ce domaine.

4. **Erreur 502 côté site** — Le corps de la réponse Resend est loggé dans la console serveur (`[subscribe] Resend refusé:`). Causes fréquentes : domaine non vérifié, quota, ou clé API invalide.

5. **`DATABASE_URL`** — Si la base est inaccessible (fichier SQLite manquant, Postgres injoignable), l’inscription échoue avant l’envoi ; vérifier les logs serveur.

6. **Soumission trop rapide** — Protection anti-spam (~600 ms) : attendre un instant après ouverture du modal avant d’envoyer.

7. **Turnstile** — Si les clés site + secret sont configurées, le captcha doit être validé ; sinon erreur « vérification de sécurité ».
