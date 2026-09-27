# Bidule 64

Bidule 64 est un jeu de plateforme accompagné d'un univers narratif, de niveaux à explorer et d'un système de scores. Le projet propose une expérience complète : menu principal, aide, sélection de niveaux, jeu, sons et classement des parties.

Le projet est compose de deux applications :

- `plateformer/` : le jeu, développé avec React, TypeScript et Vite ;
- `API/` : l'API de scores et de statistiques, développée avec Express, TypeScript et SQLite.

## Equipe

- **Antoine** : lore, système et gameplay, API render, déployment du site et du pour lien du site https://bydehule64.vercel.app/ ;
- **Simon** : level design, sons et voix ;
- **Hugo** : architecture, boutons in-game et design des menus ;
- **Raphaël** : conception et développement des API.

## Fonctionnalites

- menu principal et navigation entre les différentes pages ;
- niveaux jouables avec systèmes de jeu et dialogues ;
- selection de niveaux ;
- effets sonores, musique et voix ;
- aide et présentation des règles ;
- enregistrement des scores ;
- classement par score, temps, pieces ou niveaux ;
- statistiques par joueur ;
- API de santé et gestion des erreurs.

## Prerequis

- Node.js 22.5 ou supérieur pour l'API ;
- npm.

## Installation

Depuis la racine du dépôt (`Projet-r-act`) :

```bash
cd plateformer
npm install

cd ../API
npm install
```

## Lancer le projet

Pour profiter du jeu et du classement, lancez le frontend et l'API dans deux terminaux séparés.

### Jeu

Dans un terminal :

```bash
cd plateformer
npm run dev
```

Le jeu est ensuite disponible à l'adresse `http://localhost:5173/`.

### API

Dans un autre terminal :

```bash
cd API
npm run dev
```

L'API démarre par défaut sur `http://localhost:3001/api`.

La variable `PORT` permet de modifier le port de l'API. En production, `ALLOWED_ORIGINS` permet de limiter les origines autorisées par CORS.

Le frontend utilise `http://localhost:3001/api` par défaut. Pour utiliser une autre adresse, définissez `VITE_API_URL` avant de lancer Vite :

```bash
VITE_API_URL=http://localhost:3001/api npm run dev
```

Sous PowerShell :

```powershell
$env:VITE_API_URL = "http://localhost:3001/api"
npm run dev
```

## Routes de l'application

| Route          | Description                    |
| -------------- | ------------------------------ |
| `/`            | Menu principal                 |
| `/game`        | Lancer une partie              |
| `/leaderboard` | Consulter le classement        |
| `/scores/:id`  | Consulter le détail d'un score |
| `/search`      | Rechercher un joueur           |
| `/players/:player` | Voir les statistiques d'un joueur |
| `/rules`       | Consulter l'aide et les règles |
| `/dev`         | Sélection des niveaux          |

## API

| Méthode | Route                  | Description                                       |
| ------- | ---------------------- | ------------------------------------------------- |
| `GET`   | `/api/health`          | Vérifier que l'API fonctionne                     |
| `GET`   | `/api/scores`          | Lister les scores avec filtres, tri et pagination |
| `GET`   | `/api/scores/:id`      | Consulter une partie                              |
| `POST`  | `/api/scores`          | Enregistrer une partie terminée                   |
| `GET`   | `/api/games`           | Lister les jeux répertoriés                       |
| `GET`   | `/api/leaderboard`     | Consulter le classement d'un jeu                  |
| `GET`   | `/api/players/:player` | Consulter les statistiques d'un joueur            |

Exemples : `GET /api/leaderboard?game=dungeon-of-bydhule&metric=score` et `GET /api/scores?sort=score&limit=20`.

La suppression d'un score (`DELETE /api/scores/:id`) est réservée à l'administration et nécessite la variable `ADMIN_TOKEN` ainsi que l'en-tête `x-admin-token`.

## Scripts disponibles

### Frontend

```bash
npm run dev       # serveur de developpement
npm run build     # verifier les types et construire l'application
npm run lint      # lancer ESLint
npm test          # lancer les tests Vitest et Testing Library
npm run preview   # previsualiser le build de production
```

### API

```bash
npm run dev       # serveur avec rechargement automatique
npm run build     # compiler l'API
npm run start     # lancer la version compilee
npm run typecheck # verifier les types
npm run reset     # reinitialiser les donnees de demonstration
```

## Structure du projet

```text
API/
  src/
    routes/       # scores et statistiques
    middleware/   # erreurs, limitation et simulation d'incidents
    db.ts         # connexion et accès SQLite

plateformer/
  src/
    components/   # layout et composants d'interface
    game/         # logique, types et niveaux du jeu
    hooks/        # audio et ressources API
    pages/        # écrans de l'application
    router/       # navigation
    services/     # communication avec l'API
```

## Technologies

- React 19 et React Router ;
- TypeScript ;
- Vite ;
- Express ;
- SQLite ;
- Zod pour la validation des donnees ;
- ESLint pour la qualite du code.
