# 📋 FICHES D'ACTION FINALE - Intégration Concours LemFi

## ⚠️ Corrections critiques requises

### 1. Admin login protection
**Fichier:** `/src/app/lemfi-contest/page.tsx` (ligne 1-50)

Vérifier que la route admin `/admin/login` existe et protège bien l'accès à `/admin/lemfi-contest`.

Si besoin, créer la page login:
```tsx
// /src/app/admin/login/page.tsx
// Déjà existe dans le projet, vérifier juste qu'elle utilise isAdmin()
```

### 2. Import manquant dans lemfiContest.ts

**Fichier:** `/src/lib/lemfiContest.ts` (ligne 1)

Vérifier que tous les imports Prisma sont corrects:
```typescript
import { prisma } from './prisma';  // ✅ À confirmer
```

Si l'erreur `prisma not found`, créer `/src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 3. Vérifier les imports Next.js

**Fichiers affectés:**
- `/src/app/api/lemfi-contest/register/route.ts`
- `/src/app/lemfi-contest/page.tsx`

Corriger si besoin (Vercel Blob):
```typescript
// ✅ Correct:
import { put } from '@vercel/blob';

// ❌ À éviter:
// import Blob from '@vercel/blob' (incorrect syntax)
```

---

## 🔧 Configuration à finaliser

### 1. Remplacer les placeholders

| Placeholder | Localisation | Remplacer par |
|------------|--------------|---------------|
| `[LIEN_PARTENAIRE_LEMFI]` | `/src/app/lemfi-contest/page.tsx` ligne ~160 | URL officielle LemFi |
| `/privacy` | `/src/app/lemfi-contest/page.tsx` ligne ~318 | `/fr/privacy` ou votre URL |
| `levelupdiaspo@gmail.com` | `/src/lib/lemfiContestEmail.ts` ligne ~74 | Email de gestion |
| `/partners/lemfi-logo.png` | À ajouter dans `/src/app/lemfi-contest/page.tsx` | Importer et afficher |

### 2. Optionnel : Personnaliser les emails

**Fichier:** `/src/lib/lemfiContestEmail.ts`

Les emails HTML sont basiques mais fonctionnels. Pour personnaliser:
- Couleurs: Adapter les héxa (#ff6b35, #f7931e, etc.)
- Texte: Adapter "Level Up in Germany" aux noms réels
- Logo: Ajouter logo organisateur dans HTML
- Footer: Adapter adresse, liens réseaux

Exemple template personnalisé:
```typescript
const html = `
  <div style="background: #f7f7f7; font-family: Arial, sans-serif;">
    <img src="${process.env.NEXT_PUBLIC_SITE_URL}/logo.png" alt="Logo" width="200">
    <h1>Votre participation a été reçue !</h1>
    ...
  </div>
`;
```

---

## 🧪 Tests à exécuter

### Test 1: Inscription simple
```bash
npm run dev
# Naviguer: http://localhost:3000/lemfi-contest
# Remplir formulaire
# Upload image
# ✅ Vérifier: Numéro généré + email reçu
```

### Test 2: Protections
```bash
# Email déjà enregistré
# ✅ Erreur: "Email déjà enregistré"

# Fichier trop gros (>5MB)
# ✅ Erreur: "Fichier doit être < 5 MB"

# Format invalide (gif, bmp)
# ✅ Erreur: "Format JPG, PNG, WebP seulement"

# Même capture 2x
# ✅ Erreur: "Capture déjà soumise"
```

### Test 3: Admin
```bash
# Accéder: http://localhost:3000/admin/lemfi-contest
# Si pas authent:
# ✅ Redirection vers /admin/login

# Après login:
# ✅ Voir liste des inscriptions
# ✅ Filtrer par statut
# ✅ Rechercher
# ✅ Visualiser capture
# ✅ Valider/Refuser
```

### Test 4: Participant tracking
```bash
# Après inscription, copier lien d'email
# Aller sur: http://localhost:3000/lemfi-contest/track/[token]
# ✅ Voir statut "En attente de vérification"

# Admin valide:
# ✅ Participant recharge → "Participation validée"
```

---

## 📦 Package.json - Dépendances

**Vérifier que les packages suivants sont installés:**

```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",  // ORM
    "@vercel/blob": "^0.27.0",    // Upload files
    "next": "^14.2.0",             // Framework
    "resend": "^6.12.0",           // Email
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "prisma": "^5.22.0"
  }
}
```

Si manquant:
```bash
npm install @vercel/blob resend prisma @prisma/client
```

---

## 🌍 Variables d'environnement finales

**À ajouter à `.env.local` (dev) et Vercel (prod):**

```env
# Database
DATABASE_URL="postgresql://user:pass@db.com/dbname"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Blob Storage (auto sur Vercel, manuel en local)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx"

# Site
NEXT_PUBLIC_SITE_URL="https://levelupingermany.com"  # ou http://localhost:3000 en dev

# Admin (optionnel, selon votre setup)
ADMIN_SESSION_SECRET="your-secret-key-here"
ADMIN_PASSWORD="admin-password-here"
```

**Pour Vercel:**
1. Aller dans Project Settings → Environment Variables
2. Ajouter les variables ci-dessus
3. Redéployer

---

## 🚨 Erreurs courantes & solutions

### Erreur 1: "prisma is not defined"
```
Solution:
1. Vérifier /src/lib/prisma.ts existe
2. Vérifier import correct: import { prisma } from './prisma'
3. Relancer: npx prisma generate
```

### Erreur 2: "Blob upload failed"
```
Solution:
1. Vérifier BLOB_READ_WRITE_TOKEN défini
2. Vérifier permissions Vercel Blob
3. Vérifier taille fichier < 5MB
```

### Erreur 3: "Email not sent"
```
Solution:
1. Vérifier RESEND_API_KEY valide
2. Vérifier email expéditeur: contest@levelupingermany.com
3. Vérifier réseau/pare-feu
4. Lire logs: console.error() dans sendContestConfirmationEmail()
```

### Erreur 4: "Unauthorized" sur admin
```
Solution:
1. Vérifier ADMIN_SESSION_SECRET ou ADMIN_PASSWORD
2. Vérifier cookie: Devtools → Application → Cookies
3. Se reconnecter: /admin/login
```

### Erreur 5: "Sequential number conflict"
```
Solution:
✅ Gestion auto par la fonction createContestEntry()
   - Retry automatique en cas de collision
   - Pas d'action requise
```

---

## 📈 Monitoring & Logs

### Logs Resend (emails)
```
https://resend.com/emails
```
Chercher tag: `lemfi-contest`

### Logs Vercel Blob (uploads)
```
Vercel Dashboard → Storage → Blob → lemfi-contest/
```

### Logs applicatifs
```bash
# Développement
npm run dev
# Regarder terminal

# Production
# Vercel Deployments → Logs
```

### Database inspection
```bash
npx prisma studio
# Naviguer à http://localhost:5555
```

---

## ✅ Checklist avant mise en ligne

- [ ] Prisma schema migré: `npx prisma db push`
- [ ] Tous les imports corrects (prisma, @vercel/blob, etc.)
- [ ] .env.local avec RESEND_API_KEY
- [ ] Logo LemFi intégré
- [ ] Liens remplacés (LemFi, privacy, etc.)
- [ ] Tests fonctionnels passés (voir section Tests)
- [ ] Script vérification: `node scripts/verify-lemfi-setup.js`
- [ ] Secrets Vercel configurés
- [ ] Domaine CNAME pointant vers Vercel
- [ ] SSL/HTTPS actif

---

## 📞 Support rapide

**Besoin d'aide ?**

1. Vérifier les logs
2. Consulter LEMFI_CONTEST_CONFIG.md
3. Vérifier LEMFI_CONTEST_DEPLOYMENT.md
4. Tester en local d'abord

**Fichiers clés à consulter:**

- Fonctionnalité: `/src/lib/lemfiContest.ts`
- Email: `/src/lib/lemfiContestEmail.ts`
- API: `/src/app/api/lemfi-contest/`
- Frontend: `/src/app/lemfi-contest/`
- Admin: `/src/app/admin/lemfi-contest/`

---

## 🎯 Résumé des actions

| Action | Urgence | Fichier | Détails |
|--------|---------|---------|---------|
| Remplacer logo LemFi | 🔴 | `/src/app/lemfi-contest/page.tsx` | Import + affichage |
| Remplacer lien LemFi | 🔴 | `/src/app/lemfi-contest/page.tsx` | URL de téléchargement |
| Adapter email admin | 🟡 | `/src/lib/lemfiContestEmail.ts` | Changement simple |
| Vérifier imports | 🟡 | Plusieurs | Valider Prisma, Blob, Resend |
| Tester en local | 🟡 | Terminal | npm run dev + tests |
| Vérifier .env | 🟡 | `.env.local` | RESEND_API_KEY, etc. |
| Configurer Vercel | 🟡 | Dashboard Vercel | Secrets + BD |
| Tests finaux | 🟡 | Navigateur | Inscription, Admin, Email |

**Temps estimé:** 30-45 minutes pour tout configurer et tester.

---

**Document créé:** 2026-10-15  
**Statut:** ✅ Prêt pour finalisation et déploiement
