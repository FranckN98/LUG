# Galeries événements

- **`2025/`** — photos de l’édition 2025 (JPG, PNG, WebP, GIF, AVIF, BMP).  
- **`2026/`** — idem pour 2026.

Le site **liste automatiquement** les fichiers de ces dossiers sur la page **Events** (plus besoin de les déclarer dans le code).

**Important :** les fichiers doivent être **versionnés / déployés** avec le projet (commit Git), sinon le serveur ne les verra pas en production.

Chemins servis : `/events/2025/nom-du-fichier.jpg`, `/events/2026/...` (à la racine du site, **sans** `/de/` devant — le middleware laisse ces URLs passer telles quelles).
