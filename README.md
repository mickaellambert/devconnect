# DevConnect — Jour 2 (Point de départ)

Bienvenue sur le **jour 2** de DevConnect ! Aujourd'hui, on apprend à **intégrer des bibliothèques externes** dans une API Node existante.

---

## 🎯 Ce que tu vas apprendre

- Évaluer et intégrer une **bibliothèque externe** dans un projet
- Lire une **doc technique** (et apprendre à le faire en autonomie)
- Séparer **configuration** et **code** avec des variables d'environnement
- Valider proprement les inputs d'une API avec un **schéma déclaratif**
- Connecter ton API à un **service externe** (un serveur SMTP)

> 💡 **Format aujourd'hui** : autonomie. Pas de cours frontal. Le contenu théorique de chaque atelier est sur **Notion**. Tu lis, tu codes, tu testes. Le formateur passe entre les postes pour répondre aux questions.

---

## ✅ Prérequis (à vérifier avant de commencer)

```bash
node --version    # v22.x ou plus
npm --version     # 10.x ou plus
git --version     # 2.x
```

Si tu reviens sur ton ordi après le J1, tu es déjà prêt.

---

## 🚀 Installation

### Si tu reprends ton repo du J1

```bash
cd devconnect
git fetch origin
git checkout j2/start
npm install     # ← important, on a 3 nouvelles dépendances aujourd'hui
```

### Si tu pars d'un repo neuf

```bash
git clone git@github.com:mickaellambert/devconnect.git
cd devconnect
git checkout j2/start
npm install
```

### Crée ton `.env` à partir du modèle

```bash
cp .env.example .env
```

Tu verras au cours de l'atelier 1 et 3 comment le compléter.

### Lance le serveur

```bash
npm run dev
```

Le serveur démarre sur [http://localhost:4000](http://localhost:4000). Tu peux te connecter avec `alice@devconnect.io` / n'importe quel password (cf. J1).

---

## 🧭 Par où commencer ?

L'ordre recommandé. **Ne saute pas un atelier**.

### 📨 Atelier 1 — `dotenv` (~30 min)

1. Lis la page Notion **"Atelier 1 — Variables d'environnement"**
2. Ouvre `index.js`
3. Cherche `🔧 ATELIER 1` (Ctrl+F)
4. Suis les étapes dans les commentaires

### 🛡️ Atelier 2 — `zod` (~1h15)

1. Lis la page Notion **"Atelier 2 — Validation avec zod"**
2. Ouvre `routes/posts.js`, cherche `🔧 ATELIER 2`. Traite la route.
3. Puis ouvre `routes/auth.js`, cherche `🔧 ATELIER 2`. Traite `/register`.
4. 🎁 Bonus : pareil pour `/login` (commentaire `🎁 BONUS — ATELIER 2`)

### 📧 Atelier 3 — `nodemailer` (~2h)

> ⚠️ **AVANT de coder**, crée ton compte Ethereal :
> 1. [https://ethereal.email/create](https://ethereal.email/create) → Create Ethereal Account
> 2. Recopie tes 4 valeurs (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) dans ton `.env`

1. Lis la page Notion **"Atelier 3 — Envoi de mails"**
2. Ouvre `services/email.js`, cherche `🔧 ATELIER 3`. Traite les étapes 1 et 2.
3. Puis ouvre `routes/auth.js`, cherche `🔧 ATELIER 3`. Traite l'étape 3 (le branchement).

---

## 🗂️ Structure du projet (rappel + nouveautés)

```
devconnect/
├── .env                        🆕 tes credentials locaux (jamais commité)
├── .env.example                🆕 modèle pour l'équipe (commité)
├── index.js                    ✏️ à modifier (Atelier 1)
├── data/                       🔒 inchangé
├── middleware/                 🔒 inchangé
├── public/                     🔒 inchangé (front toujours figé)
├── routes/
│   ├── auth.js                 ✏️ à modifier (Ateliers 2 + 3)
│   ├── users.js                🔒 inchangé
│   └── posts.js                ✏️ à modifier (Atelier 2)
└── services/
    └── email.js                🆕 à compléter (Atelier 3)
```

---

## 📋 Récap des 3 ateliers

| # | Atelier | Lib | Difficulté | Trous |
|---|---------|-----|-----------|-------|
| 1 | Variables d'environnement | `dotenv` | Facile | 1 (modif `index.js`) |
| 2 | Validation des inputs | `zod` | Moyen | 2 (+1 bonus) |
| 3 | Envoi de mails | `nodemailer` | Difficile | 3 (+2 bonus) |

---

## 🧪 Tester tes routes

### Avec Thunder Client

Comme au J1. N'oublie pas le header `Authorization: Bearer user-1` sur les routes protégées.

### Dans le navigateur

Le front fourni au J1 fonctionne **toujours pareil** : il ne sait pas qu'on a refait certaines validations en interne. C'est la magie d'un **contrat HTTP stable**.

→ Si une route que tu modifies casse le front (timeline qui ne charge plus, login qui plante), c'est que tu as cassé le contrat. Vérifie tes réponses.

---

## ⚠️ "J'ai un bug, j'ai pas le mail, ma route répond pas…"

Pour chaque atelier, la page Notion a une section **"Pièges classiques"** et **"Coincé ?"** — c'est ton premier réflexe.

Si tu es vraiment bloqué, tu peux comparer ton fichier avec celui de la branche `j2/solution` :

```bash
# Dans un autre terminal, depuis la racine du projet :
git diff j2/solution -- <le fichier qui te pose problème>
```

---

## 💪 Go !

Commence par l'**Atelier 1**. C'est le plus court et le plus simple — il te met dans le rythme et il pose les bases pour les ateliers 2 et 3. Bon code ! 🚀
