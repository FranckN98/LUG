# Level Up in Germany — site web

Site Next.js (App Router) + Tailwind, mobile-first, **allemand / anglais / français**.

Ce document décrit comment **installer et lancer le projet après clonage depuis GitHub**.

---

## Prérequis

| Outil | Version recommandée |
|--------|---------------------|
| **Node.js** | 18.x ou 20.x (LTS) |
| **npm** | 9+ (fourni avec Node) |
| **Git** | récent |

Vérifiez avec : `node -v` et `npm -v`.

---

## Installation depuis GitHub

### 1. Cloner le dépôt

```bash
git clone https://github.com/VOTRE_ORG/VOTRE_REPO.git
cd VOTRE_REPO
```

> Si le dépôt contient plusieurs dossiers, placez-vous dans le répertoire qui contient **`package.json`** (souvent `levelupingermany/`).

### 2. Installer les dépendances

```bash
npm install
```

`postinstall` exécute automatiquement **`prisma generate`** (client Prisma pour la newsletter / PDF événements).

### 3. Variables d’environnement

```bash
cp .env.example .env.local
```

Éditez **`.env.local`** selon votre environnement :

| Variable | Usage |
|----------|--------|
| `DATABASE_URL` | SQLite local : `file:./dev.db` (voir ci-dessous) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (liens dans les e-mails) |
| `RESEND_API_KEY`, `FORMS_TO_EMAIL`, `FORMS_FROM_EMAIL` | Envoi des formulaires (Resend) |
| `NEWSLETTER_FROM_EMAIL` | Expéditeur des e-mails « mini-livre » PDF (événements) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (formulaires) |
| `NEXT_PUBLIC_WHATSAPP_JOIN_URL` | Lien d’invitation WhatsApp (optionnel) |

Pour un **premier test en local**, vous pouvez laisser vide les clés Resend/Turnstile tant que vous ne testez pas les envois — la base SQLite et `NEXT_PUBLIC_SITE_URL=http://localhost:3000` suffisent souvent pour la navigation.

### 4. Base de données (Prisma)

Créer le fichier SQLite et appliquer le schéma :

```bash
npx prisma migrate dev
```

Ou, pour un schéma rapide sans historique de migrations nommé :

```bash
npx prisma db push
```

Détails newsletter / PDF : **`docs/NEWSLETTER.md`**.

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000), puis choisir une langue (**`/de`**, **`/en`**, **`/fr`**).

---

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement (hot reload) |
| `npm run build` | Build production (`prisma generate` + `next build`) |
| `npm run start` | Serveur production (après `build`) |
| `npm run lint` | ESLint |
| `npm run db:push` | Synchroniser le schéma Prisma avec la DB |
| `npm run db:migrate` | Migrations Prisma (dev) |
| `npm run db:studio` | Interface Prisma Studio |

---

## Build de production (local ou CI)

```bash
cp .env.example .env.local   # ou variables injectées par la plateforme
# Renseigner les secrets (Resend, Turnstile, DATABASE_URL prod, etc.)
npm run build
npm run start
```

En production, **`TURNSTILE_SECRET_KEY`** est attendu pour accepter les soumissions de formulaires.

---

## Intégration continue / déploiement (rappel)

- Définir les **mêmes variables** que dans `.env.example` sur votre hébergeur (Vercel, etc.).
- Pour PostgreSQL en prod, remplacer `DATABASE_URL` par l’URL fournie par l’hébergeur.
- Exécuter les migrations Prisma sur l’environnement cible (`prisma migrate deploy` en général).

---

## Structure des routes

- **`/`** — sélecteur de langue
- **`/[locale]`** — pages localisées (`de`, `en`, `fr`)

Exemples : `/{locale}/events`, `/{locale}/who-we-are`, `/{locale}/contact`, etc.  
Anciennes URL (ex. chemins légaux) : redirections 308 dans **`src/lib/legacyUrlRedirects.ts`**.

---

## Contenu & assets (résumé)

| Sujet | Emplacement |
|--------|-------------|
| SEO (titres, descriptions) | `src/content/seo-metadata.ts` |
| Événements | `src/content/events.ts`, `events-2025-detail.ts` |
| Galerie Events | `public/events/…` + chemins dans le contenu |
| Hero accueil | `src/data/gallery.ts` |
| Logo header | `src/assets/lug-mark-nobg.png` · favicon | `src/app/icon.png` |
| Logo footer | `public/footer-logo-light.png` |
| Réseaux sociaux | `src/data/social.ts` |
| Contact (téléphone, e-mail) | `src/config/siteContact.ts` |

---

## Technique

- **Next.js 14** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**
- **Prisma** + SQLite (dev) ou PostgreSQL (prod)
- i18n : segment `[locale]` et objets de contenu partagés
- Pas de CMS : contenu dans les fichiers du dépôt

---

## Documentation complémentaire

- **Newsletter & téléchargement PDF (événements)** : `docs/NEWSLETTER.md`
- **Formulaires** : `src/components/Form.tsx`, API `src/app/api/forms/route.ts`
- **SEO** : `src/lib/seo.ts`, sitemap `src/app/sitemap.ts`, `robots.txt` via `src/app/robots.ts`

---

## Checklist avant mise en ligne

- Renseigner les pages légales (imprint, confidentialité) avec les données réelles de l’association.
- Remplacer les contenus / médias de démonstration par la production.
- Configurer Resend, Turnstile et `NEXT_PUBLIC_SITE_URL` sur l’environnement de production.
