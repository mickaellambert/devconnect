# DevConnect — Jour 2 (Correction)

Cette branche contient la **correction complète** du jour 2 : les 3 ateliers (`dotenv`, `zod`, `nodemailer`) sont implémentés.

## 🚀 Lancer

```bash
npm install                # installe toutes les deps (express + nodemon + dotenv + zod + nodemailer)
cp .env.example .env       # si pas déjà fait
# Renseigne tes credentials Ethereal dans .env (cf. atelier 3 du J2)
npm run dev
```

Le serveur démarre sur le port défini dans `.env` (par défaut `4000`).

## 📜 Historique git de cette branche

Trois commits, un par atelier — chaque atelier ajoute sa lib via `npm install <lib>` (cohérent avec ce qu'ils ont vu hier au J1 avec `chalk`) :

```bash
git log --oneline j2/solution
# (sha) feat(j2): solve nodemailer exercise
# (sha) feat(j2): solve zod exercise
# (sha) feat(j2): solve dotenv exercise
# (sha) feat(j2): scaffold ateliers dotenv + zod + nodemailer  ← j2/start
```

Tu peux faire `git diff <commit_précédent>..<commit>` pour voir **exactement** ce qui a changé à chaque atelier (incluant le `package.json` qui s'enrichit progressivement).

## 💡 Points pédagogiques clés

### `.env` : la séparation config / code

`PORT`, et désormais les credentials SMTP, vivent dans le fichier `.env` qui n'est **jamais commité** (cf. `.gitignore`). Pour passer en production, on change le `.env` — le code ne bouge pas. C'est l'**abstraction config-driven**.

> 📌 **À noter** : `process.env.X` est **toujours une string**. Si tu attends un nombre (port, durée…), convertis avec `Number()`. C'est le cas pour `PORT` ici et pour `SMTP_PORT` dans `services/email.js`.

### `zod` vs validation manuelle

```js
// Avant J1 : verbeux, fragile
if (!username || !email || !password) return res.status(400)…

// Après J2 : déclaratif, robuste
const result = RegisterSchema.safeParse(req.body);
if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });
```

`safeParse` est préféré à `parse` (pas d'exception, pas de try/catch).

### Nodemailer : un service externe via SMTP

Le `transporter` encapsule la config SMTP. La fonction `sendWelcomeEmail` est asynchrone : la route `/register` est devenue `async` et `await`-e l'envoi. En passant de Ethereal (test) à Gmail (prod), on change uniquement les variables `SMTP_*` dans `.env`.

### Le contrat HTTP est resté stable

Le front du J1 fonctionne toujours **sans modification**, alors qu'on a changé l'implémentation de plusieurs routes. C'est le bénéfice du contrat HTTP figé qu'on a posé en architecture J1.

## 🎁 Bonus implémentés

- ✅ `POST /auth/login` validé avec zod (`LoginSchema`)
- ❌ `sendLikeNotification` — laissé en exercice ouvert dans la branche, libre à toi de l'implémenter

## 🔜 Au J3

On va sécuriser le login (bcrypt + JWT) et migrer les données de `data/` vers une vraie base SQLite avec **Prisma**. Le `.env` qu'on a appris aujourd'hui aura un nouveau locataire : `DATABASE_URL` (déjà préparé dans `.env.example`). À bientôt !
