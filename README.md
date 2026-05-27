# DevConnect — Jour 4 (Correction)

Cette branche contient la **correction complète** du jour 4 :

- **Atelier 1** : ajout de la colonne `password` au model User + hash bcrypt à `/register` et `/login` + helpers anti-fuite du hash
- **Atelier 2** : remplacement du token fake `Bearer user-N` par un vrai **JWT signé**

À la fin de cette branche, **les deux trous de sécurité du J3 sont bouchés** :

1. ✅ Les passwords sont stockés sous forme de hash bcrypt en DB et **ne fuient plus via l'API**.
2. ✅ Les tokens sont des JWT signés (plus de "n'importe qui peut écrire `user-2`").

> 🎯 **Le contrat HTTP est resté EXACTEMENT le même** depuis le J1. Le front fourni au J1 n'a pas bougé d'une ligne — le passage `user-1` → `eyJhbGci...` est totalement transparent côté client.

## 🚀 Lancer

```bash
npm install
cp .env.example .env                # si pas déjà fait
npx prisma migrate dev              # applique les 4 migrations
npx prisma db seed                  # peuple 5 users + 10 posts + 21 likes
npm run dev
```

Le serveur démarre sur [http://localhost:4000](http://localhost:4000).

> 🔑 **Pour tester** : tous les users seedés ont le password `demo` (hashé en DB).

## 📜 Historique git de cette branche

```bash
git log --oneline j4/solution
# (sha) chore(j4): finalize solution README
# (sha) feat(j4): solve atelier 2 — JWT sign/verify
# (sha) feat(j4): solve atelier 1 — bcrypt + add-password + no-leak helpers
# (sha) feat(j4): scaffold — bcrypt + JWT ateliers (auth secure)  ← j4/start
```

Les commits sont **incrémentaux** : un commit par étape pédagogique.

## 💡 Points pédagogiques clés

### Le vrai défi de la migration incrémentale

Au J3, le model User n'avait pas de colonne `password`. On l'ajoute avec `password String` (NOT NULL). Prisma refuse alors la migration :

```
Step 0 Added the required column `password` to the `User` table without
a default value. There are 5 rows in this table, it is not possible to
execute this step.
```

C'est le **vrai problème de prod** : "ajouter une colonne obligatoire à une table peuplée". En prod, la stratégie classique :

1. Ajouter la colonne en **nullable** (`String?`).
2. **Backfill** des valeurs existantes (SQL ou script).
3. Passer la colonne en **NOT NULL** dans une 2ᵉ migration.

En dev, on a un raccourci : `rm prisma/dev.db` puis `npx prisma migrate dev --name add-password --skip-seed`. **Acceptable en dev, JAMAIS en prod.**

### Pourquoi hasher les passwords avec bcrypt

Stocker un password en clair en DB = inacceptable. Si la DB fuit :

- Tous les passwords sont compromis.
- Beaucoup d'utilisateurs réutilisent le même password ailleurs → l'attaque déborde.

Un hash bcrypt est **quasi-irréversible** :

```js
await bcrypt.hash("demo", 10)
// → "$2b$10$Eix..."  (60 caractères)
```

- Le **salt** (aléatoire) est inclus dans le hash → un même password = des hashes différents.
- Le **saltRounds** (`10`) = coût de calcul. Brute-forcer un seul hash prend des années.
- bcrypt est **conçu pour être lent**, à l'inverse de SHA-256 / MD5 qui sont rapides (donc faibles face à des GPU).

### Pourquoi pas `===` pour comparer les passwords

`user.password` est un **hash**, pas le mot de passe en clair. On doit re-hasher le password reçu pour comparer — c'est ce que fait `bcrypt.compare(motDePasse, hash)`.

### Ne JAMAIS exposer le hash via l'API

Deux patterns selon le contexte :

```js
// Dans routes/auth.js — on DOIT fetcher le password (pour bcrypt.compare),
// donc on le strip APRÈS via un mini helper :
function toPublicUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}
```

```js
// Dans routes/users.js — on n'a PAS besoin du password, donc on ne le
// fetch même pas :
const publicUserSelect = {
  id: true, username: true, email: true, createdAt: true,
};
const users = await prisma.user.findMany({ select: publicUserSelect });
```

### Anatomie d'un JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOjEsImlhdCI6MTcxNCxIxIiOjB9 . AbCd...
└────────────────── header ─────────┘   └────────────── payload ───────────┘   └─ signature ─┘
```

- **Header** : `{ "alg": "HS256", "typ": "JWT" }` — algo utilisé.
- **Payload** : `{ "sub": 1, "iat": ..., "exp": ... }` — tes données. **LISIBLE PAR TOUS** (base64). Ne JAMAIS y mettre de secret.
- **Signature** : `HMAC-SHA256(header.payload, JWT_SECRET)` — garantit l'intégrité.

> 💡 Va sur [jwt.io](https://jwt.io), colle ton token : tu décodes le payload sans aucun secret. C'est normal — un JWT n'est pas un secret, c'est un **badge signé**.

### Le rôle critique de `JWT_SECRET`

Le secret est le **seul gardien** du système :

- Si tu le perds (commit dans git, log en clair, partagé par chat…), n'importe qui peut signer des tokens valides.
- Si tu le changes, **tous les JWT déjà émis deviennent invalides**.

Bonne pratique : `JWT_SECRET` = chaîne aléatoire d'au moins 32 caractères, dans `.env` (jamais commité), différente entre dev / staging / prod.

### Le claim `sub` (standard JWT)

`sub` = "subject" = le sujet du token. Pour nous, c'est l'id du user. C'est un claim standard JWT (RFC 7519). On l'utilise dans le middleware :

```js
const payload = jwt.verify(token, process.env.JWT_SECRET);
const user = await prisma.user.findUnique({ where: { id: payload.sub } });
```

### Le helper `signTokenFor`

Factorisation simple en haut de `routes/auth.js` :

```js
function signTokenFor(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}
```

Évite la duplication entre `/register` et `/login`, centralise le format du payload.

### Le `try/catch` autour de `jwt.verify`

`jwt.verify(...)` lève une erreur si :

- Token mal formé.
- Signature invalide.
- Token expiré.

Sans `try/catch`, le middleware crashe et renvoie 500 au lieu d'un 401 propre. Le catch reste vide : `req.user` reste `undefined`, `requireAuth` renvoie 401 plus loin.

### Le contrat HTTP stable depuis le J1

Le front fourni au J1 :

- Stocke `token` dans `localStorage` — fonctionne avec n'importe quelle string.
- L'envoie en `Authorization: Bearer ${token}` — fonctionne avec un JWT.
- Sur 401 → `clearAuth()` + `showAuth()` — gère naturellement l'expiration.

**Aucune modification du front nécessaire** pour passer de `user-1` à `eyJhbGci...`.

## 🔜 À l'atelier du J5 (si vous en faites un)

- **Refresh token** : aujourd'hui, JWT expiré → relogin. En prod on aurait un refresh token longue durée.
- **Rôles** : colonne `role` (`'user'` / `'admin'`) au User, dans le payload JWT, middleware `requireRole('admin')`.
- **Reset password par email** : route `/auth/forgot-password` qui envoie un token de reset.
- **Tests automatisés** : Jest ou Vitest.
