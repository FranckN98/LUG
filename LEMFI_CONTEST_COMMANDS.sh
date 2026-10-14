#!/bin/bash

# 📋 COMMANDES UTILES - Système Concours LemFi
# Fichier de référence rapide des commandes importantes

# ================================================================
# 🗄️  BASE DE DONNÉES
# ================================================================

# Générer le client Prisma
npx prisma generate

# Pousser le schéma à la BD
npx prisma db push

# Forcer reset BD (ATTENTION: Supprime tout!)
npx prisma db push --force-reset

# Ouvrir Prisma Studio (visualiser/éditer data)
npx prisma studio
# Accès: http://localhost:5555

# Générer une migration
npx prisma migrate dev --name add_feature

# ================================================================
# 🚀  DÉVELOPPEMENT & TESTS
# ================================================================

# Démarrer serveur dev
npm run dev
# Accès: http://localhost:3000

# Builder le projet
npm run build

# Tester après build
npm start

# Linter (vérifie erreurs de syntaxe)
npm run lint

# Tests (vitest)
npm test

# ================================================================
# 🔍  VÉRIFICATION & DEBUG
# ================================================================

# Vérifier le setup complet
node scripts/verify-lemfi-setup.js

# Vérifier les imports Prisma
npm ls @prisma/client @prisma/prisma

# Vérifier Resend API
# (Goto: https://resend.com/emails - Vérifier clé API)

# Vérifier Vercel Blob
# (Goto: https://vercel.com/account/storage - Vérifier token)

# ================================================================
# 📊  DONNÉES & EXPORTS
# ================================================================

# Voir toutes les inscriptions en BD (Prisma Studio)
npx prisma studio
# Naviguer à: lemfi_contest_entries

# Compter les inscriptions
# Dans prisma studio, onglet "lemfi_contest_entries"

# ================================================================
# 🚀  DÉPLOIEMENT
# ================================================================

# Pousser le code
git add .
git commit -m "feat: LemFi contest system"
git push origin main

# Vérifier le statut de déploiement Vercel
# Goto: https://vercel.com/dashboard → Select project

# Voir les logs de déploiement
# Vercel Dashboard → Deployments → Click deployment → Logs

# ================================================================
# 🔒  SÉCURITÉ & ADMIN
# ================================================================

# Vérifier session admin (check cookies)
# Chrome DevTools → Application → Cookies → Chercher "admin_session"

# Tester le lien de suivi d'un participant
# Format: http://localhost:3000/lemfi-contest/track/[TOKEN]
# Remplacer [TOKEN] par un vrai token depuis la BD

# ================================================================
# 📧  EMAILS (RESEND)
# ================================================================

# Tester un email (utilise script custom)
node scripts/test-email.js  # À créer si needed

# Voir les emails envoyés
# Goto: https://resend.com/emails → Chercher tag "lemfi-contest"

# Vérifier la clé API
echo $RESEND_API_KEY

# ================================================================
# 🐛  TROUBLESHOOTING
# ================================================================

# Voir tous les logs en dev
npm run dev 2>&1 | grep -i "error\|warn\|lemfi"

# Vérifier les fichiers créés
ls -la src/app/lemfi-contest/
ls -la src/app/api/lemfi-contest/
ls -la src/lib/lemfi*

# Vérifier les imports manquants
grep -r "from '@/lib/lemfiContest'" src/

# Vérifier la syntaxe TypeScript
npx tsc --noEmit

# ================================================================
# 🧹  NETTOYAGE & MAINTENANCE
# ================================================================

# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install

# Nettoyer les dépendances inutilisées
npm prune

# Vérifier les versions des packages
npm outdated

# Mettre à jour les packages
npm update

# ================================================================
# 📚  RESSOURCES
# ================================================================

# Docs Prisma
# https://www.prisma.io/docs/

# Docs Next.js 14
# https://nextjs.org/docs/getting-started

# Docs Vercel Blob
# https://vercel.com/docs/storage/vercel-blob

# Docs Resend
# https://resend.com/docs

# ================================================================
# 📋  VARIABLES D'ENVIRONNEMENT
# ================================================================

# Afficher les variables chargées (dev)
cat .env.local

# Afficher une variable spécifique
echo $DATABASE_URL
echo $RESEND_API_KEY
echo $NEXT_PUBLIC_SITE_URL

# ================================================================
# 🔗  URLs IMPORTANTES
# ================================================================

# En développement
# Inscription:     http://localhost:3000/lemfi-contest
# Suivi:           http://localhost:3000/lemfi-contest/track/[TOKEN]
# Admin:           http://localhost:3000/admin/lemfi-contest
# Login:           http://localhost:3000/admin/login
# Prisma Studio:   http://localhost:5555

# En production
# Inscription:     https://levelupingermany.com/lemfi-contest
# Admin:           https://levelupingermany.com/admin/lemfi-contest
# Vercel Logs:     https://vercel.com/dashboard
# Resend Emails:   https://resend.com/emails
# Prisma Studio:   N/A (local only)

# ================================================================
# 💡 ASTUCES RAPIDES
# ================================================================

# Ouvrir Prisma Studio en arrière-plan
npm run db:studio &

# Compiler + push BD en une ligne
npx prisma generate && npx prisma db push

# Test en production simulée
npm run build && npm start

# Vérifier que tout fonctionne
npm run build && node scripts/verify-lemfi-setup.js

# Voir le dernier commit
git log -1 --oneline

# ================================================================
# 📞 EN CAS DE PROBLÈME
# ================================================================

# Erreur: "Cannot find module @prisma/client"
npm install @prisma/client && npx prisma generate

# Erreur: "Database connection failed"
# Vérifier DATABASE_URL dans .env.local

# Erreur: "Email not sent"
# Vérifier RESEND_API_KEY et logs: npx prisma studio

# Erreur: "Blob upload failed"
# Vérifier BLOB_READ_WRITE_TOKEN

# Erreur TypeScript
npx tsc --noEmit

# ================================================================
# 🎯 WORKFLOW QUOTIDIEN
# ================================================================

# Matin: Vérifier les nouvelles inscriptions
npx prisma studio
# Compter entries avec status="pending"

# Midi: Valider les inscriptions
# Aller à: http://localhost:3000/admin/lemfi-contest

# Soir: Vérifier les emails
# Aller à: https://resend.com/emails

# ================================================================
# 📝 NOTES
# ================================================================

# - Toujours faire `npm run build` avant de pusher
# - Vercel va auto-runner `npx prisma db push`
# - Pb BD? Utiliser Prisma Studio
# - Pb email? Vérifier Resend dashboard
# - Pb blob? Vérifier Vercel Storage
# - Pb admin? Vérifier cookies + isAdmin()

# ================================================================

# FIN DES COMMANDES UTILES
