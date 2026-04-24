# DevConnect — Jour 1 (Correction)

Cette branche contient la **correction complète** du jour 1 : toutes les routes à trous sont implémentées.

## 🚀 Lancer

```bash
npm install
npm run dev
```

Le serveur démarre sur [http://localhost:4000](http://localhost:4000).

## 🔐 Connexion pour la démo

- Email : `alice@devconnect.io` (ou n'importe quel email de `data/users.js`)
- Mot de passe : n'importe quoi (ignoré au J1)

## 📋 Les routes

### Fournies (scaffolding commun, non modifiées pendant l'atelier)

| Méthode | URL | Rôle |
|---------|-----|------|
| `POST` | `/auth/register` | Inscription (stub : ignore le password, renvoie un token fake) |
| `POST` | `/auth/login` | Connexion (stub : accepte l'email, ignore le password) |
| `GET` | `/users` | Liste des users |
| `GET` | `/posts` | Timeline |

### Implémentées pendant l'atelier

| Méthode | URL | Rôle |
|---------|-----|------|
| `GET` | `/users/:id` | Détail d'un user |
| `GET` | `/posts/:id` | Détail d'un post |
| `POST` | `/posts` | Créer un post |
| `PUT` | `/posts/:id/likes` | Liker un post |
| `DELETE` | `/posts/:id/likes` | Retirer son like |

Toutes les routes `/users/*` et `/posts/*` exigent le header `Authorization: Bearer user-X`, géré automatiquement par le front via le token stocké en `localStorage`.

## 💡 Points pédagogiques clés

### Muter un tableau en mémoire ≠ persistance

`posts.push(...)` modifie le tableau **en RAM uniquement**. Au redémarrage du serveur, toutes les créations sont perdues : le code relit les fichiers `data/` qui sont restés intacts. On corrigera ça au **J2 avec Prisma + SQLite**.

### L'authentification : fake aujourd'hui, JWT au J3

Le middleware `authenticate.js` lit un token au format `user-X` et récupère l'utilisateur. **C'est volontairement trivial à forger** : n'importe qui peut écrire `Bearer user-2` et se faire passer pour Bob. Au **J3**, on remplacera ce token par un vrai JWT signé cryptographiquement. Le contrat HTTP restera identique : seul le contenu du token évolue, le front ne bouge pas.

### PUT vs POST sur les likes

Un like est identifié par le couple `(postId, userId)` :
- `postId` vient de l'URL
- `userId` vient du token (injecté dans `req.user.id` par le middleware)

Le client connaît donc **l'adresse complète** du like avant de l'envoyer. Dans ce cas, HTTP recommande `PUT` (client-defined URI) plutôt que `POST` (server-defined URI).

Bonus : `PUT` est **idempotent**. Liker 2 fois le même post = même état final, sans erreur — l'UX est robuste aux double-clics. La symétrie `PUT` / `DELETE` sur la même URL renforce le modèle REST : **une URL = une ressource**.

### Les codes de statut HTTP

| Code | Signification | Utilisation ici |
|------|---------------|-----------------|
| `200` | OK | Lecture réussie, ou PUT sans effet (déjà liké) |
| `201` | Created | Création d'une ressource (POST / PUT first-time) |
| `204` | No Content | Suppression réussie, pas de corps de réponse |
| `400` | Bad Request | Validation du body échouée |
| `401` | Unauthorized | Token absent ou invalide |
| `404` | Not Found | Ressource inexistante |
