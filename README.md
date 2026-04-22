# DevConnect 🚀

Mini réseau social pour développeurs — projet fil rouge du module **INF218 — Développement avancé Objet sécurisé** au CESI (4 jours).

## 🎯 Objectifs du module

Apprendre à construire une API web moderne en découvrant progressivement :

- **Express** et le routage HTTP
- Un **ORM** (Prisma) connecté à une base SQLite
- L'**authentification sécurisée** avec JWT
- L'**envoi d'e-mails** et l'intégration de bibliothèques externes

## 📅 Déroulé sur 4 jours

| Jour | Thème | Branches |
|------|-------|----------|
| **J1** | Express + premier CRUD (données en mémoire) | `j1/start` → `j1/solution` |
| **J2** | Prisma + SQLite + relations User ↔ Post | `j2/start` → `j2/solution` |
| **J3** | Relation N-N (likes) + Authentification JWT | `j3/start` → `j3/solution` |
| **J4** | Envoi d'e-mails (Nodemailer) + front minimal | `j4/start` → `j4/solution` |

## 🌳 Stratégie de branches

- `main` → l'**état final du projet** après les 4 jours.
- `jX/start` → point de départ du jour X (code à trous, à compléter).
- `jX/solution` → correction complète du jour X.

La progression est **linéaire** : chaque `jX/start` part de `jX-1/solution`. On construit le même projet qui s'enrichit de jour en jour.

## 🛠️ Prérequis

- **Node.js** (version LTS, voir le `.nvmrc` de chaque branche)
- **npm** (fourni avec Node)
- Un client HTTP pour tester les routes — on utilise **Thunder Client** (extension VS Code)

## 🚀 Démarrer

```bash
git clone git@github.com:mickaellambert/devconnect.git
cd devconnect
git checkout j1/start    # pour démarrer le jour 1
npm install
npm run dev
```

Le serveur tourne sur [http://localhost:3000](http://localhost:3000).

## 👤 Auteur

Mickaël Lambert — formateur CESI.
