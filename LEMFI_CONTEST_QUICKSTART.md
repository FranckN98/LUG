# ⚡ QUICK START - Système Concours LemFi

**Vous êtes pressé ? Lisez ceci en 2 minutes.**

---

## 🎯 Ce que vous avez

✅ **Système complet d'inscription au concours**
- Page publique `/lemfi-contest`
- Suivi personnel `/lemfi-contest/track/[token]`
- Admin protégé `/admin/lemfi-contest`
- Emails automatiques
- BD + Stockage sécurisé

---

## ⚡ Déploiement rapide (4 commandes)

```bash
# 1. Générer client Prisma
npx prisma generate

# 2. Migrer BD
npx prisma db push

# 3. Tester localement
npm run dev
# Visiter: http://localhost:3000/lemfi-contest

# 4. Pousser en production
git add . && git commit -m "feat: LemFi contest" && git push
```

**C'est tout.** Vercel va déployer auto en ~2 min.

---

## 📌 À ne pas oublier

1. **Logo LemFi** → Placer dans `public/partners/lemfi-logo.png`
2. **Lien LemFi** → Remplacer `[LIEN_PARTENAIRE_LEMFI]` dans le code
3. **.env.local** → Ajouter `RESEND_API_KEY=re_xxxxx`
4. **Lien privacy** → Adapter `/privacy` vers votre URL

---

## 📖 Pour en savoir plus

| Besoin | Lire |
|--------|------|
| Vue d'ensemble | `LEMFI_CONTEST_README.md` |
| Configuration détaillée | `LEMFI_CONTEST_CONFIG.md` |
| Checklist pré-prod | `LEMFI_CONTEST_DEPLOYMENT.md` |
| Problèmes / Troubleshooting | `LEMFI_CONTEST_ACTIONS.md` |
| Toutes les urls | `LEMFI_CONTEST_INDEX.md` |

---

## 🚀 Urls une fois en ligne

```
📝 Formulaire:    /lemfi-contest
👤 Suivi perso:   /lemfi-contest/track/[token]
🔐 Admin:         /admin/lemfi-contest
```

---

**Prêt ? Go ! 🚀**

Besoin d'aide? → `LEMFI_CONTEST_ACTIONS.md` section troubleshooting
