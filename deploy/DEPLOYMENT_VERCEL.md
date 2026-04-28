# Déploiement sur Vercel + Neon (sans VPS)

Ce guide remplace la version VPS IONOS. Architecture finale :

```
   Visiteur ──► levelupingermany.com (DNS chez IONOS)
                     │  A 76.76.21.21
                     ▼
                  Vercel (Next.js, edge + serverless, région fra1)
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Neon Postgres        Vercel Blob
   (eu-central-1)       (uploads admin / community)
```

Coût : **0 €/mois** dans les quotas free de Vercel + Neon.

---

## 0. Pré-requis

- Un compte GitHub (pour héberger le code) → https://github.com
- Un compte Vercel relié à GitHub → https://vercel.com/signup
- Un compte Neon → https://console.neon.tech
- Accès au panneau **DNS** du domaine `levelupingermany.com` chez IONOS
- Accès **admin** au repo de code (s'il appartient au coéquipier, demander un fork ou un transfert)

---

## 1. Pousser le code sur GitHub

Si le repo n'est pas encore sur ton GitHub :

```powershell
cd C:\Users\Franck Ngami\LevelUpSite\Level-Up-in-Germany
git init
git add .
git commit -m "chore: prepare for Vercel deployment"
git branch -M main
git remote add origin https://github.com/<ton-user>/level-up-in-germany.git
git push -u origin main
```

> ⚠️ Vérifier que `.env*` est bien ignoré (`.gitignore` contient déjà `.env*.local` et `.env`).

---

## 2. Créer la base Neon

1. Aller sur https://console.neon.tech → **New Project**
2. Nom : `level-up-in-germany`
3. Région : **Europe (Frankfurt) – aws-eu-central-1**
4. Postgres version : 16 (par défaut)
5. **Create project**
6. Dans **Connection Details** :
   - Sélectionner la branche `main`, role `neondb_owner`, database `neondb`
   - Activer **Pooled connection** (toggle en haut à droite)
   - Copier la chaîne `postgresql://...-pooler....neon.tech/neondb?sslmode=require`
   - Garder cette URL : c'est `DATABASE_URL` pour Vercel.

---

## 3. Importer le projet dans Vercel

1. https://vercel.com/new
2. **Import** ton repo GitHub
3. Vercel détecte **Next.js** automatiquement
4. **Framework preset** : Next.js
5. **Build Command** : laisse l'auto-détection (notre `vercel.json` impose `npm run vercel-build`)
6. **Root Directory** : laisser vide (le projet est à la racine du repo)
7. **Environment Variables** : voir section suivante avant de cliquer Deploy

---

## 4. Variables d'environnement Vercel

Avant le premier déploiement, ajouter dans **Settings → Environment Variables**
(ou directement dans l'écran d'import) toutes les variables listées dans
[deploy/.env.vercel.template](.env.vercel.template).

Variables **obligatoires** pour que le build passe :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL pooled Neon copiée à l'étape 2 |
| `NEXT_PUBLIC_SITE_URL` | `https://www.levelupingermany.com` |

Variables **fonctionnelles** (à ajouter avant la mise en prod) :

| Variable | Source |
|---|---|
| `RESEND_API_KEY` | https://resend.com/api-keys |
| `FORMS_TO_EMAIL` | ex. `info@levelupingermany.com` |
| `FORMS_FROM_EMAIL` | ex. `Level Up <info@levelupingermany.com>` (domaine vérifié dans Resend) |
| `NEWSLETTER_FROM_EMAIL` | idem |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | https://dash.cloudflare.com/?to=/:account/turnstile |
| `NEXT_PUBLIC_WHATSAPP_JOIN_URL` | lien d'invitation WhatsApp |

---

## 5. Créer le store Vercel Blob (uploads)

1. Dans le projet Vercel → **Storage** → **Create Database** → **Blob**
2. Nom : `level-up-blob`
3. **Connect to project** → cocher le projet
4. Vercel ajoute automatiquement `BLOB_READ_WRITE_TOKEN` dans les env vars
5. Redéployer pour prendre en compte le nouveau token (Settings → Deployments → ⋯ → Redeploy)

> Sans ce token, les uploads admin tombent sur le système de fichiers (read-only sur Vercel) et échouent. Le code détecte la présence du token et bascule automatiquement.

---

## 6. Premier déploiement

Cliquer **Deploy**. Le pipeline exécute :

1. `npm install` (installe `@vercel/blob` et le reste)
2. `npm run vercel-build` :
   - `node scripts/use-postgres.js` → bascule `schema.prisma` sur `provider = "postgresql"`
   - `prisma generate`
   - `prisma migrate deploy` → applique toutes les migrations sur Neon
   - `next build`
3. Déploiement sur l'URL `https://<projet>.vercel.app`

Vérifier que la home charge, que `/de`, `/en`, `/fr` répondent, que `/admin` (cookie `admin_session=authenticated`) est joignable.

---

## 7. (Optionnel) Seed initial

Une fois la base migrée, peupler les données de démo :

```powershell
# en local, en pointant temporairement vers Neon :
$env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
npx prisma db seed
```

---

## 8. Brancher le domaine `levelupingermany.com`

### 8.1 Côté Vercel

1. **Project → Settings → Domains**
2. Ajouter `levelupingermany.com` → Vercel suggère les enregistrements DNS
3. Ajouter `www.levelupingermany.com`
4. Choisir lequel est canonique (recommandé : `www` redirige vers apex, ou l'inverse — au choix)

### 8.2 Côté IONOS (DNS)

> Le serveur actuel `85.215.59.147` ne sera plus utilisé : on remplace les enregistrements.

Console IONOS → **Domaines & SSL** → `levelupingermany.com` → **DNS** :

| Type | Hôte | Valeur actuelle | Valeur cible |
|---|---|---|---|
| **A** | `@` | `85.215.59.147` | `76.76.21.21` |
| **CNAME** | `www` | (selon configuration actuelle) | `cname.vercel-dns.com` |

Astuce : avant la bascule, **réduire le TTL à 300 s** (5 min) pour pouvoir revenir en arrière vite.

⚠️ Ne pas toucher aux enregistrements **MX**, **TXT (SPF/DKIM)** liés à IONOS Mail — sinon les boîtes mails tombent.

Propagation : 5 min à 24 h. Vérifier avec :

```powershell
nslookup levelupingermany.com
nslookup www.levelupingermany.com
```

### 8.3 HTTPS

Vercel provisionne automatiquement un certificat Let's Encrypt dès que le DNS pointe correctement. Aucune action manuelle.

---

## 9. Validation prod

- [ ] `https://www.levelupingermany.com` charge en HTTPS
- [ ] Locales `/de`, `/en`, `/fr` OK
- [ ] Formulaire de contact → email reçu via Resend
- [ ] Inscription newsletter → email de confirmation
- [ ] `/admin` accessible, login OK
- [ ] Upload média admin → fichier visible (URL `*.public.blob.vercel-storage.com`)
- [ ] Galerie communauté affiche les nouvelles images

---

## 10. Procédure de rollback DNS

Si la bascule pose problème, revenir au serveur précédent :

| Type | Hôte | Valeur |
|---|---|---|
| A | `@` | `85.215.59.147` |
| CNAME | `www` | (ancienne valeur) |

Le déploiement Vercel reste en ligne sur `https://<projet>.vercel.app` pour debug.

---

## 11. Mises à jour ultérieures

`git push` sur `main` → Vercel rebuild & redeploy automatiquement. Les Pull Requests obtiennent une URL de **preview** isolée.

---

## Annexes

### Pourquoi `provider = "sqlite"` reste dans le repo

Le dev local utilise SQLite (`prisma/dev.db`). Le script
[scripts/use-postgres.js](../scripts/use-postgres.js) bascule `schema.prisma`
sur `postgresql` **uniquement pendant le build Vercel**. Ne pas committer
le fichier modifié ; Vercel travaille sur une copie.

### Fichiers VPS (obsolètes mais conservés)

- `ecosystem.config.js`, `deploy/nginx.conf.example`, `deploy/.env.production.template`,
  `deploy/update.sh`, `deploy/DEPLOYMENT_IONOS.md` — ne sont pas utilisés par Vercel.
  Peuvent être supprimés si on ne prévoit plus jamais de retour VPS.
