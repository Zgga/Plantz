# Plantz

Application web de gestion de collection de plantes domestiques. Flat-file, auto-hébergée, PWA.

## Stack

- **Frontend / Backend** : SvelteKit 5 (runes mode) + TypeScript
- **Style** : Tailwind CSS v3 + Lucide-Svelte
- **Stockage** : 100% flat-file JSON/Markdown sur `/data` — pas de base de données
- **Déploiement** : Docker Swarm, volume NFS

## Fonctionnalités

- Grille/liste de plantes avec filtres et recherche
- Quick Snap — capture rapide via FAB caméra
- Fiches plantes : infos, journal Markdown, galerie photos
- Upload photos avec compression automatique (WebP 1920px + miniature 400px)
- Recadrage du point focal de la cover par drag & drop
- Date de prise de vue par photo (avec tri chronologique)
- Rappels (arrosage, rempotage, fertilisation) avec alertes si en retard
- Bibliothèque d'espèces botaniques avec CRUD complet et combobox de recherche
- Journal de bord rendu en Markdown
- PWA installable (manifest + icônes)
- Page paramètres avec export JSON

## Démarrage rapide

### Dev local

```bash
npm install
npm run dev
```

Accessible sur `http://localhost:5173`, exposé sur le réseau local.

### Seed de démonstration

```bash
node scripts/seed.mjs
# avec un répertoire data custom :
node scripts/seed.mjs --data-dir /chemin/vers/data
```

Crée 5 espèces botaniques et 5 plantes de démo avec journaux.

### Production (Docker)

```bash
docker build -t plantz .
docker run -p 3000:3000 -v plantz_data:/data plantz
```

### Docker Compose

```bash
docker compose up -d
```

### Docker Swarm (avec volume NFS)

```bash
docker stack deploy -c docker-compose.swarm.yml plantz
```

## Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `DATA_DIR` | `./data` | Répertoire des données |
| `PORT` | `3000` | Port d'écoute |
| `BODY_SIZE_LIMIT` | `52428800` | Taille max upload (50 Mo) |

## Architecture des données

```
data/
├── library/
│   └── monstera-deliciosa.json     # Espèce botanique (Species)
└── plants/
    └── plant-[uuid]/
        ├── data.json               # Métadonnées plante (Plant)
        ├── journal.md              # Journal append-only
        └── photos/
            ├── 2025-01-01T12-00-00.webp        # Photo compressée (max 1920px)
            └── 2025-01-01T12-00-00_thumb.webp  # Miniature auto (400px)
```

## API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Healthcheck (vérifie DATA_DIR en lecture/écriture) |
| GET | `/api/reminders` | Tous les rappels à venir (toutes plantes) |
| GET/POST | `/api/plants` | Liste / créer une plante |
| GET/PUT/DELETE | `/api/plants/[id]` | Détail / modifier / supprimer |
| POST/PUT | `/api/plants/[id]/journal` | Ajouter entrée / remplacer |
| GET/POST | `/api/plants/[id]/photos` | Lister / uploader (compression auto) |
| GET/PUT/PATCH/DELETE | `/api/plants/[id]/photos/[filename]` | Servir / cover / date prise de vue / supprimer |
| GET/POST/PATCH/DELETE | `/api/plants/[id]/reminders` | CRUD rappels |
| GET/POST | `/api/library` | Liste / créer espèce |
| GET/PUT/DELETE | `/api/library/[id]` | Détail / modifier / supprimer |

### Healthcheck Docker Swarm

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 5s
  retries: 3
```

## Notes d'architecture

- **`replicas: 1` obligatoire** — pas de verrou distribué sur les fichiers
- Écriture atomique via `.tmp` + `fs.rename` (implémenté dans `src/lib/server/fs-utils.ts`)
- `sharp` est en `dependencies` (pas `devDependencies`) car chargé dynamiquement à runtime
- Les miniatures `_thumb.webp` sont gérées automatiquement — ne pas les manipuler manuellement
- En production, placer un reverse proxy (Nginx/Caddy) devant SvelteKit pour le cache des photos statiques

## Régénérer les icônes PWA

```bash
node scripts/gen-icons.mjs
```

Génère `static/favicon.png`, `static/icon-192.png`, `static/icon-512.png`.
