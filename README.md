# DevConnect 🚀

Mini réseau social pour développeurs — projet fil rouge du module **INF218 — Développement avancé Objet sécurisé** au CESI (4 jours).

## 🎯 Objectifs du module

Apprendre à construire une **API web moderne** en découvrant progressivement :

- **Express** et le routage HTTP
- L'**intégration de bibliothèques externes** (config, validation, mail)
- Un **ORM** (Prisma) connecté à une base SQLite
- L'**authentification sécurisée** avec JWT

## 📅 Déroulé sur 4 jours

| Jour | Thème | Notions clés | Branches |
|------|-------|--------------|----------|
| **J1** | Express + premier CRUD (données en mémoire) | routes, méthodes HTTP, codes de statut, `req` / `res` | `j1/start` → `j1/solution` |
| **J2** | Intégrer des bibliothèques externes | `dotenv` (config), `zod` (validation), `nodemailer` (mail) | `j2/start` → `j2/solution` |
| **J3** | ORM avec Prisma + SQLite | schéma, migrations, relations 1-N et N-N, seed | `j3/start` → `j3/solution` |
| **J4** | Authentification sécurisée + restitution | bcrypt, JWT, middleware d'auth réel | `j4/start` → `j4/solution` |

> 💡 La fiche officielle du module mentionne aussi la génération de PDF — on a fait le choix pédagogique de la remplacer par l'envoi de mail (plus parlant en termes de cas d'usage et de démo finale).

## 🌳 Stratégie de branches

- `main` → l'**état final du projet** après les 4 jours.
- `jX/start` → point de départ du jour X (code à trous, à compléter en atelier).
- `jX/solution` → correction complète du jour X.

La progression est **linéaire** : chaque `jX/start` part de `jX-1/solution`. On construit le même projet qui s'enrichit de jour en jour, **sans jamais casser le contrat HTTP** (le front reste identique du J1 au J4).

## 🛠️ Prérequis

- **Node.js** version LTS (voir `.nvmrc` de chaque branche — 22 actuellement)
- **npm** (fourni avec Node)
- Un client HTTP pour tester l'API — on utilise **Thunder Client** (extension VS Code)
- Un éditeur — **VS Code** recommandé

## 🚀 Démarrer

```bash
git clone git@github.com:mickaellambert/devconnect.git
cd devconnect
git checkout j1/start    # pour démarrer le jour 1
npm install
npm run dev
```

Le serveur tourne sur [http://localhost:4000](http://localhost:4000) — ouvre cette URL dans ton navigateur, tu verras l'écran de connexion de DevConnect.

## 👤 Auteur

Mickaël Lambert — formateur CESI.
