# ✅ LemFi Contest - Deployment Checklist

## 📋 Before Going Live

### 1. Configuration externes (À fournir)
- [ ] **Logo LemFi officiel**
  - Format: PNG, SVG ou WebP
  - Dimensions recommandées: 200×80px ou 400×160px
  - Placer à: `public/partners/lemfi-logo.png`
  - Importer dans: `/src/app/lemfi-contest/page.tsx`

- [ ] **Lien de téléchargement LemFi**
  - Chercher dans `/src/app/lemfi-contest/page.tsx`: `[LIEN_PARTENAIRE_LEMFI]`
  - Remplacer par le vrai lien de partenariat
  - Format: `https://lemfi.app/...` ou lien court personnalisé

- [ ] **Conditions cashback LemFi**
  - Montant minimum: 10 € (✅ déjà configuré)
  - Code promo: LEVELUP (✅ déjà configuré)
  - % cashback: 25% (⚠️ À confirmer avec LemFi, activer seulement si confirmé)
  - Voir ligne "Recevez 25 % de cashback" dans `/src/app/lemfi-contest/page.tsx`

- [ ] **Notice de confidentialité**
  - Chercher: `/privacy` dans `/src/app/lemfi-contest/page.tsx`
  - Remplacer par: Lien réel vers votre page de confidentialité (ex: `/fr/privacy`)

- [ ] **Email administrateur du concours**
  - Actuellement: `levelupdiaspo@gmail.com`
  - Localisation: `/src/lib/lemfiContestEmail.ts` (ligne ~74)
  - À adapter: Email qui recevra les alertes de nouvelles inscriptions

### 2. Configuration technique
- [ ] **Variables d'environnement**
  ```env
  # Ajouter à .env.local et .env.production
  RESEND_API_KEY=re_xxxxx
  NEXT_PUBLIC_SITE_URL=https://levelupingermany.com
  ```

- [ ] **Base de données**
  ```bash
  npx prisma generate
  npx prisma db push
  # En production, Vercel va exécuter automatiquement
  ```

- [ ] **Vérifier les services**
  - [ ] Resend: Email transactionnel (test d'envoi)
  - [ ] Vercel Blob: Stockage de fichiers (configuration automatique)
  - [ ] PostgreSQL: Base de données (neon.tech ou autre)

### 3. Sécurité & Droits d'accès
- [ ] **Auth admin**
  - Admin panel accessible à: `/admin/lemfi-contest`
  - Protégé par: Cookie signé (HMAC-SHA256)
  - Vérifier: `ADMIN_SESSION_SECRET` ou `ADMIN_PASSWORD` dans `.env`

- [ ] **Captures d'écran privées**
  - ✅ Stockées chez Vercel Blob (accès privé)
  - ✅ Hachées en SHA-256 (déduplication)
  - ✅ Accessibles seulement par l'admin et le participant (via token)

- [ ] **RGPD / Conformité**
  - [ ] Notice de confidentialité affichée
  - [ ] Consentement explicite demandé (checkbox)
  - [ ] Droit d'accès aux données (via lien personnel)
  - [ ] Plan de rétention des données documenté

### 4. Tests fonctionnels
- [ ] **Inscription en développement**
  ```bash
  npm run dev
  # Aller à http://localhost:3000/lemfi-contest
  ```
  - [ ] Formulaire affiche correctement
  - [ ] Upload image fonctionne
  - [ ] Validation côté client OK
  - [ ] Email de confirmation reçu
  - [ ] Participant reçoit son numéro LU

- [ ] **Suivi personnel**
  - [ ] Lien de suivi fonctionne
  - [ ] Participant voit son statut (pending/validated/rejected)
  - [ ] Pas d'accès aux autres participants

- [ ] **Admin dashboard**
  - [ ] `/admin/lemfi-contest` accessible
  - [ ] Lister les inscriptions
  - [ ] Filtrer par statut, rechercher
  - [ ] Visualiser les captures
  - [ ] Valider une entrée → Email envoyé
  - [ ] Refuser une entrée + motif → Email envoyé

- [ ] **Limites et protections**
  - [ ] Après 151 entrées: "Inscriptions complètes"
  - [ ] Même email = erreur "Déjà enregistré"
  - [ ] Même capture = erreur "Déjà soumise"
  - [ ] Max 5 MB par image
  - [ ] Formats acceptés: JPG, PNG, WebP

### 5. Avant mise en ligne
- [ ] **Verification script**
  ```bash
  node scripts/verify-lemfi-setup.js
  # Doit afficher: "All checks passed"
  ```

- [ ] **Tests en staging**
  - Créer 5-10 entrées test
  - Valider / Refuser certaines
  - Vérifier emails
  - Tester la limite (151 entrées)

- [ ] **Monitoring**
  - [ ] Logguer les erreurs (Sentry ou équivalent)
  - [ ] Alerter l'admin si email ne s'envoie pas
  - [ ] Monitorer la limite de quota Blob

- [ ] **Documentation utilisateur**
  - [ ] Instructions pour participant
  - [ ] Support email: ?
  - [ ] FAQ: ?

---

## 🚀 Déploiement

### Vercel
1. Push vers GitHub
```bash
git add .
git commit -m "feat: Add LemFi contest system"
git push origin main
```

2. Vercel détecte le changement
   - ✅ Installe dépendances
   - ✅ Exécute `prisma generate`
   - ✅ Exécute `prisma db push`
   - ✅ Build le projet
   - ✅ Configure Blob

3. Vérifier post-déploiement
   - [ ] Page accessible: `https://levelupingermany.com/lemfi-contest`
   - [ ] Admin accessible: `https://levelupingermany.com/admin/lemfi-contest`
   - [ ] Email transactionnel fonctionne
   - [ ] Blob upload OK

### Base de données (manuel)
Si déploiement sur DB différente:
```bash
# Depuis ta machine locale
export DATABASE_URL="postgresql://user:pass@prod-db.com/dbname"
npx prisma db push
```

---

## 📊 KPIs à tracker

Après lancement:
- [ ] Nombre d'inscriptions par jour
- [ ] Taux de validation (validées / total)
- [ ] Taux de refus (motifs communs)
- [ ] Temps moyen pour valider une entrée
- [ ] Taux de rebond (commencé mais pas complété)
- [ ] Erreurs d'upload (fichier trop gros, format invalide, etc.)

---

## 🆘 Troubleshooting

### Email ne s'envoie pas
1. Vérifier `RESEND_API_KEY` dans `.env.production`
2. Tester dans Resend dashboard
3. Vérifier les logs: `console.error()` dans `/src/lib/lemfiContestEmail.ts`

### Image ne s'upload pas
1. Vérifier `BLOB_READ_WRITE_TOKEN`
2. Vérifier taille fichier < 5 MB
3. Vérifier format: JPG, PNG, WebP seulement

### Numéro de participant pas attribué
1. Vérifier BD: `npx prisma studio`
2. Chercher l'entrée dans `lemfi_contest_entries`
3. Vérifier `sequential_number` != NULL

### Admin ne peut pas accéder
1. Vérifier cookie de session: `admin_session`
2. Vérifier `ADMIN_SESSION_SECRET` ou `ADMIN_PASSWORD`
3. Se reconnecter via `/admin/login`

---

## 📝 Documents à créer / adapter

- [ ] Email de confirmation personnalisé (français)
- [ ] Email de validation personnalisé (français)
- [ ] Email de rejet personnalisé (français)
- [ ] Page de conditions du concours (légal)
- [ ] FAQ participants
- [ ] Mode d'emploi admin

---

## 🎯 Objectifs du système

### Côté participant
✅ Inscription simple et rapide (< 2 min)
✅ Upload image sécurisé et privé
✅ Confirmation immédiate + numéro unique
✅ Email avec lien de suivi personnel
✅ Pas de compte/mot de passe requis

### Côté admin
✅ Dashboard centralisant les inscriptions
✅ Visualiser les captures d'écran
✅ Filtrer et chercher (nom, email, numéro)
✅ Valider/refuser avec motif
✅ Suivi complet de l'audit trail
✅ Stats en temps réel (total, en attente, validées, refusées)

### Sécurité & Conformité
✅ Capture d'écran stockée de manière privée
✅ Pas d'email exposé publiquement
✅ Consentement RGPD explicite
✅ Accès personnel via token unique
✅ Admin authentifié
✅ Détection de doublons (email, capture)

---

## ✨ Bon à savoir

### Limitation: 151 entrées (LU200 - LU350)
Si vous devez augmenter:
1. Modifier `CONTEST_TOTAL` dans `/src/lib/lemfiContest.ts`
2. Rebaser les numéros (ex: LU001 - LU300)
3. Migrer les données si nécessaire

### Pas de compteur public
Le nombre de places restantes n'est **jamais** affiché aux participants.
Seul l'admin voit le statut en temps réel.

### Préservation des données
Après le concours, les données sont conservées indéfiniment (sauf suppression manuelle).
Pour respecter la RGPD, implémenter un droit à l'oubli dans le backend si demandé.

---

**Checkpoint:** 2026-10-15  
**Statut:** 🟢 Prêt pour déploiement
