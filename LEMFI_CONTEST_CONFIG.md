# 🎮 Système d'inscription - Concours Level Up × LemFi

## 🎯 Configuration à effectuer

Le système est **100% fonctionnel**, mais quelques éléments externes doivent être fournis ou configurés :

### 1️⃣ Logo LemFi officiel
- **Emplacement à ajouter:** `public/partners/lemfi-logo.png` (ou `.svg`)
- **Format recommandé:** PNG ou SVG
- **Utilisation:** Importer dans `/src/app/lemfi-contest/page.tsx` ligne 1 pour afficher le logo en haut de page

```tsx
import Image from 'next/image';
<Image src="/partners/lemfi-logo.png" alt="LemFi" width={200} height={80} />
```

### 2️⃣ Lien partenaire LemFi
- **Chercher dans le code:** `[LIEN_PARTENAIRE_LEMFI]`
- **Remplacer par:** URL du lien d'affiliation/partenariat LemFi
- **Localisation:** `/src/app/lemfi-contest/page.tsx` (ligne ~160)

Exemple:
```tsx
href="https://lemfi.app/download?ref=levelup"
```

### 3️⃣ Service d'email (Resend)
**✅ Déjà configuré !**
- API clé: `RESEND_API_KEY` (variable d'environnement)
- Email expéditeur: `contest@levelupingermany.com`
- Webhooks: À configurer dans le dashboard Resend (optionnel)

**À faire:**
1. Vérifier que `RESEND_API_KEY` est défini dans `.env.local`
2. Tester l'envoi d'email (voir "Tests" plus bas)

### 4️⃣ Stockage de fichiers (Vercel Blob)
**✅ Intégré automatiquement !**
- Les captures d'écran sont uploadées en privé dans Vercel Blob
- Chemin: `lemfi-contest/*`
- Accès: Sécurisé par token (URL signée)

### 5️⃣ Base de données (Prisma)
**✅ Schéma ajouté !**

Étapes:
```bash
# 1. Push le schéma à la base
npx prisma db push

# 2. Générer le client
npx prisma generate

# 3. (Optionnel) Ouvrir Prisma Studio
npx prisma studio
```

### 6️⃣ Notice de confidentialité
- **Chercher:** `/privacy` dans `/src/app/lemfi-contest/page.tsx`
- **Remplacer par:** Vrai lien vers votre page de confidentialité
- Exemple: `href="/fr/privacy"` ou `href="/pages/privacy-policy"`

### 7️⃣ Email administrateur
- **Actuellement:** `levelupdiaspo@gmail.com`
- **Localisation:** `/src/lib/lemfiContestEmail.ts` ligne ~74
- **À adapter:** Remplacer par l'email de gestion du concours

---

## 🔗 URLs publiques

Une fois déployé:

| Page | URL |
|------|-----|
| **Formulaire d'inscription** | `/lemfi-contest` |
| **Suivi personnel** | `/lemfi-contest/track/[token]` |
| **Admin** | `/admin/lemfi-contest` |

### Exemple de lien de suivi pour un participant
```
https://levelupingermany.com/lemfi-contest/track/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Envoyé automatiquement par email après inscription.

---

## 📋 Variables d'environnement requises

Ajouter à `.env.local` :

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Stockage (Vercel Blob) - Auto-configuré sur Vercel
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Site
NEXT_PUBLIC_SITE_URL=https://levelupingermany.com
```

---

## ✅ Vérifications complètes

### 1. Installation & Migration BD
```bash
npm install
npx prisma generate
npx prisma db push
```

### 2. Test d'inscription (développement)
```bash
npm run dev
# Aller à: http://localhost:3000/lemfi-contest
# Remplir le formulaire + uploader une image
# Vérifier:
# ✅ Entrée créée en BD
# ✅ Email de confirmation reçu
# ✅ Numéro séquentiel attribué (LU200, LU201, ...)
# ✅ Lien de suivi fonctionne
```

### 3. Test du dashboard admin
```bash
# Accéder à: http://localhost:3000/admin/lemfi-contest
# Vérifier:
# ✅ Liste des inscriptions
# ✅ Filtres par statut
# ✅ Recherche par nom/email/numéro
# ✅ Visualiser captures d'écran
# ✅ Valider/Refuser une entrée
# ✅ Email de validation envoyé
```

### 4. Test des limites
```bash
# Créer 151 entrées
# ✅ 152e inscription: message "Inscriptions complètes"
# ✅ Numéro max = LU350

# Tenter de réinscrire avec même email
# ✅ Erreur: "Email déjà enregistré"

# Uploader même capture d'écran 2x
# ✅ Erreur: "Capture déjà soumise"
```

---

## 🛡️ Sécurité

### ✅ Points de sécurité couverts:

1. **Tokens d'accès personnalisés**
   - 256-bit random tokens générés côté serveur
   - Participants accèdent UNIQUEMENT à leur propre statut

2. **Protection admin**
   - Auth via `isAdmin()` sur chaque route API `/api/admin/**`
   - Session signée avec HMAC-SHA256

3. **Validation fichiers**
   - Accepte seulement JPG/PNG/WebP
   - Max 5 MB
   - Hachage SHA-256 pour détecter doublons
   - Stockage privé (Vercel Blob)

4. **Prévention des attaques**
   - Vérifications côté serveur (pas de confiance au client)
   - Pas d'exposure de numéros séquentiels
   - Rate limiting disponible via `subscribe-rate-limit.ts`

5. **Données privées**
   - Captures d'écran: Privées, accessibles via token signé
   - E-mails: Jamais affichés publiquement
   - Admin: Liste complète seulement accessible aux admins

---

## 📞 Support et contact

### Pour les participants
- Email: Peut être configuré dans les emails transactionnels
- Page de suivi personnalisée: Chaque participant reçoit un lien unique

### Pour les admins
- Dashboard: `/admin/lemfi-contest`
- Actions: Valider, refuser, consulter les captures, historique complet

---

## 🚀 Déploiement

### Sur Vercel (recommandé)
```bash
git add .
git commit -m "Add LemFi contest system"
git push origin main
```

Vercel va automatiquement:
1. ✅ Déployer le code
2. ✅ Configurer les variables d'environnement
3. ✅ Synchroniser la base de données
4. ✅ Activer Vercel Blob

### Post-déploiement
1. Vérifier la page: `https://votredomaine.com/lemfi-contest`
2. Tester l'inscription complète
3. Vérifier les emails
4. Activer l'admin dashboard

---

## 📝 Notes importantes

### Limitation actuelle: 151 inscriptions maximum (LU200 - LU350)
Raison: Taille de prix attendue pour le tirage au sort.

Pour augmenter:
1. Modifier `CONTEST_TOTAL` dans `/src/lib/lemfiContest.ts`
2. Rebaser les numéros (ex: LU100 - LU400 = 301 entrées)
3. Migrer la BD si nécessaire

### Pas de compteur public
Le nombre d'inscriptions n'est **jamais** affiché aux participants.
Seul l'admin voit les stats en temps réel.

### Conservation des données
Par défaut: **Illimitée**

Pour ajouter un TTL (ex: 1 an après validation):
```typescript
// Dans /src/lib/lemfiContest.ts
where: {
  validatedAt: { lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
}
```

---

## 📚 Fichiers modifiés/créés

```
✅ prisma/schema.prisma
   └─ Modèles: LemFiContestEntry, LemFiContestValidation

✅ src/lib/lemfiContest.ts
   └─ Service de gestion (numéros séquentiels, validations)

✅ src/lib/lemfiContestEmail.ts
   └─ Service d'emails (confirmation, validation, rejet)

✅ src/app/api/lemfi-contest/register/route.ts
   └─ Endpoint d'inscription (POST)

✅ src/app/api/lemfi-contest/track/[token]/route.ts
   └─ Endpoint de suivi public (GET)

✅ src/app/api/admin/lemfi-contest/route.ts
   └─ Endpoint admin - Liste (GET)

✅ src/app/api/admin/lemfi-contest/[entryId]/route.ts
   └─ Endpoint admin - Validation (POST)

✅ src/app/lemfi-contest/page.tsx
   └─ Page d'inscription (formulaire + étapes)

✅ src/app/lemfi-contest/track/[token]/page.tsx
   └─ Page de suivi personnel

✅ src/app/admin/lemfi-contest/page.tsx
   └─ Dashboard admin (tableau de bord)
```

---

## ❓ FAQ

**Q: Puis-je augmenter la limite de 5 MB pour les images ?**
R: Oui, modifier `MAX_FILE_SIZE` dans `src/app/api/lemfi-contest/register/route.ts`

**Q: Comment réinitialiser les données de test ?**
R: 
```bash
npx prisma db push --force-reset
# Attention: Supprime toutes les données !
```

**Q: Puis-je ajouter plus de champs au formulaire ?**
R: Oui, ajouter au modèle Prisma, mettre à jour les forms, et les endpoints API.

**Q: Comment archiver les données après le tirage ?**
R: Exporter depuis Prisma Studio, puis optionnellement purger (respect RGPD).

---

## ✨ Améliorations futures

- [ ] Tirage au sort automatisé
- [ ] Notifications SMS
- [ ] Dashboard pour participants (plus que suivi)
- [ ] Export CSV des validées
- [ ] Webhooks internes
- [ ] Rate limiting par IP
- [ ] Captcha anti-bot

---

**Système créé:** 2026-10-15  
**Version:** 1.0.0
