# Déploiement sur IONOS VPS / Cloud Server

Guide pas-à-pas pour mettre **Level Up in Germany** en production sur un serveur Linux IONOS (Ubuntu 22.04 LTS recommandé) avec Node.js + PM2 + Nginx + SQLite.

> Domaine cible : `levelupingermany.de` (et `www.levelupingermany.de`)
> Stack : Next.js 14 SSR · Prisma · SQLite · Resend · PM2 · Nginx · Let's Encrypt

---

## 0. Prérequis IONOS

- Un VPS / Cloud Server IONOS sous **Ubuntu 22.04 LTS**, accessible en SSH root.
- Le domaine `levelupingermany.de` géré dans IONOS DNS.
- Une clé API **Resend** vérifiée pour le domaine.
- (Optionnel) Clés **Cloudflare Turnstile**.

### Pointer le domaine sur le serveur (DNS)

Dans la console IONOS → *Domaines & SSL* → DNS de `levelupingermany.de` :

| Type | Hôte | Valeur |
|------|------|--------|
| A    | @    | `<IP_PUBLIQUE_DU_VPS>` |
| A    | www  | `<IP_PUBLIQUE_DU_VPS>` |

Attendre que la propagation soit faite (`dig +short levelupingermany.de` doit renvoyer l'IP).

---

## 1. Préparer le serveur (une seule fois)

Connectez-vous en SSH :

```bash
ssh root@<IP_PUBLIQUE_DU_VPS>
```

### 1.1 Mises à jour & utilitaires

```bash
apt update && apt upgrade -y
apt install -y curl git ufw build-essential ca-certificates
```

### 1.2 Pare-feu

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### 1.3 Utilisateur dédié (pas de root pour faire tourner l'app)

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

Désormais : `ssh deploy@<IP>` (et `sudo` quand nécessaire).

### 1.4 Node.js 20 LTS + PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v && npm -v && pm2 -v
```

### 1.5 Nginx + Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo systemctl enable --now nginx
```

### 1.6 Dossiers persistants

```bash
sudo mkdir -p /var/www/levelupingermany
sudo mkdir -p /var/lib/levelupingermany       # SQLite DB (hors déploiement)
sudo mkdir -p /var/log/levelupingermany       # Logs PM2
sudo chown -R deploy:deploy /var/www/levelupingermany /var/lib/levelupingermany /var/log/levelupingermany
```

---

## 2. Récupérer le code

En tant que `deploy` :

```bash
cd /var/www/levelupingermany
git clone <URL_DU_REPO_GIT> current
cd current
```

> Si le repo est privé : ajouter une clé déploiement SSH (`ssh-keygen -t ed25519`) et l'enregistrer dans GitHub → *Deploy keys*.

---

## 3. Configurer l'environnement

### 3.1 Fichier `.env`

```bash
cp deploy/.env.production.template .env
nano .env
```

Remplir tous les `<...>`. Au minimum :

- `NEXT_PUBLIC_SITE_URL=https://www.levelupingermany.de`
- `DATABASE_URL="file:/var/lib/levelupingermany/prod.db"`
- `RESEND_API_KEY=...`
- `FORMS_TO_EMAIL`, `FORMS_FROM_EMAIL`, `NEWSLETTER_FROM_EMAIL`
- `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (si captcha activé)

### 3.2 Build & DB

```bash
npm ci
npx prisma migrate deploy   # applique toutes les migrations Prisma
npx prisma generate
npm run build
```

### 3.3 (Optionnel) Seed initial

```bash
npm run db:seed
```

---

## 4. Lancer avec PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save

# Auto-restart au reboot du serveur
pm2 startup systemd
# La commande affichée doit être exécutée avec sudo, puis :
pm2 save
```

Vérifier :

```bash
pm2 status
curl -I http://127.0.0.1:3000
```

Doit renvoyer `HTTP/1.1 200 OK`.

---

## 5. Nginx (reverse proxy)

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/levelupingermany.de
sudo ln -s /etc/nginx/sites-available/levelupingermany.de /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

À ce stade, `http://levelupingermany.de` doit afficher le site (en HTTP).

---

## 6. HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d levelupingermany.de -d www.levelupingermany.de
```

Choisir l'option *redirect HTTP → HTTPS*. Certbot ajoute automatiquement les directives SSL au fichier Nginx et met en place le renouvellement automatique (`systemctl status certbot.timer`).

---

## 7. Vérifier le site

- ✅ `https://www.levelupingermany.de` charge
- ✅ Test de form de contact (vérifier réception via Resend)
- ✅ `/admin` accessible (login admin)
- ✅ Bandeau cookies visible
- ✅ `https://www.levelupingermany.de/api/admin/hero` répond JSON (auth requise)

---

## 8. Sauvegardes (SQLite)

> **Important** : SQLite stocke tout dans `/var/lib/levelupingermany/prod.db`. Un seul fichier = un seul backup.

### Cron quotidien (rétention 14 jours)

```bash
sudo nano /etc/cron.daily/backup-levelup-db
```

Contenu :

```bash
#!/usr/bin/env bash
set -e
DB=/var/lib/levelupingermany/prod.db
DEST=/var/backups/levelupingermany
mkdir -p "$DEST"
TS=$(date +%Y%m%d-%H%M%S)
sqlite3 "$DB" ".backup '$DEST/prod-$TS.db'"
find "$DEST" -name 'prod-*.db' -mtime +14 -delete
```

```bash
sudo chmod +x /etc/cron.daily/backup-levelup-db
sudo apt install -y sqlite3
```

> Pour rapatrier un backup : `scp deploy@<IP>:/var/backups/levelupingermany/prod-YYYYMMDD.db ./`

---

## 9. Mises à jour ultérieures

À chaque nouveau déploiement (depuis main) :

```bash
ssh deploy@<IP>
cd /var/www/levelupingermany/current
./deploy/update.sh
```

Le script fait : `git pull` → `npm ci` → `prisma migrate deploy` → `npm run build` → `pm2 reload`.

---

## 10. Logs & dépannage

| Quoi | Commande |
|------|----------|
| Logs app (live) | `pm2 logs levelupingermany` |
| Logs app (fichier) | `tail -f /var/log/levelupingermany/{out,err}.log` |
| Statut PM2 | `pm2 status` |
| Logs Nginx | `sudo tail -f /var/log/nginx/{access,error}.log` |
| Recharger Nginx | `sudo nginx -t && sudo systemctl reload nginx` |
| Redémarrer l'app | `pm2 restart levelupingermany` |
| Vérifier port 3000 | `ss -tlnp \| grep 3000` |
| Vérifier SSL | `sudo certbot certificates` |

### Erreurs fréquentes

- **502 Bad Gateway** → l'app n'écoute pas sur 3000. Vérifier `pm2 status` et `pm2 logs`.
- **Prisma "Engine not found"** → relancer `npx prisma generate` puis `pm2 restart`.
- **Permissions DB** → `sudo chown -R deploy:deploy /var/lib/levelupingermany`.
- **Resend 403** → domaine non vérifié dans Resend, ou `FORMS_FROM_EMAIL` ne correspond pas au domaine vérifié.

---

## Résumé des chemins sur le serveur

```
/var/www/levelupingermany/current/    ← code (git working dir)
/var/www/levelupingermany/current/.env
/var/lib/levelupingermany/prod.db     ← base SQLite (NE JAMAIS toucher manuellement)
/var/backups/levelupingermany/        ← backups quotidiens
/var/log/levelupingermany/            ← logs app PM2
/etc/nginx/sites-available/levelupingermany.de
```
