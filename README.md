# DevConnect — Jour 4 (Point de départ)

Bienvenue sur le **jour 4** de DevConnect ! Aujourd'hui, on s'attaque à la **sécurité d'authentification** : hash de mot de passe avec **bcrypt** et tokens signés avec **JWT**. À la fin, ton app aura un niveau de sécu comparable à ce qu'on trouve en prod.

> 💡 Tu pars de l'état final du J3 : DB SQLite avec User + Post + Like, toutes les routes migrées vers Prisma. Deux trous de sécurité béants restent à boucher :
> 1. Les mots de passe ne sont pas hashés (ils sont juste ignorés côté logique au J3).
> 2. Le token `Bearer user-2` permet à n'importe qui de se faire passer pour Bob en tapant son id.

---

## 🎯 Programme de la journée

| Slot | Quoi |
|------|------|
| Matin (~1h30) | Cours : hash + salt (bcrypt) + JWT (header.payload.signature, démo jwt.io) |
| Pause déjeuner | |
| **Atelier 1 (~1h45)** | Migration `add-password` + hash bcrypt dans `/register` et `/login` |
| Correction live coding atelier 1 (~30-45 min) | |
| **Atelier 2 (~1h45)** | Remplacer le token fake `Bearer user-N` par un vrai JWT signé |
| Correction live coding atelier 2 (~30 min) | |

---

## ✅ Prérequis

```bash
node --version    # v22.x ou plus
npm --version     # 10.x ou plus
```

Tu dois avoir l'app du J3 qui tourne : timeline, login, like fonctionnent.

---

## 🚀 Installation

### Si tu reprends ton repo du J3

```bash
git fetch origin
git checkout j4/start
npm install     # ← important, on a ajouté bcrypt + jsonwebtoken
```

### Si tu pars d'un repo neuf

```bash
git clone git@github.com:mickaellambert/devconnect.git
cd devconnect
git checkout j4/start
npm install
cp .env.example .env
npx prisma migrate dev    # applique les 3 migrations héritées du J3
npx prisma db seed        # peuple 5 users + 10 posts + 21 likes
npm run dev
```

Vérifie que tu te connectes via `POST /auth/login` avec `alice@devconnect.io` (n'importe quel password, il est ignoré aujourd'hui — on va corriger ça à l'atelier 1).

---

## 🛠️ Atelier 1 — bcrypt + migration `add-password`

**Objectif** : ajouter la colonne `password` au model User, hasher les passwords avec bcrypt, et vérifier au login.

### 📖 Vocabulaire éclair atelier 1

| Terme | Définition courte |
|-------|------|
| **Hash** | Fonction à sens unique : on transforme `"demo"` en `$2b$10$Eix…` mais on ne peut pas remonter à `"demo"` depuis le hash. C'est ce qu'on stocke en DB. |
| **Salt** | Une chaîne aléatoire glissée dans le hash. Conséquence : 2 users avec le même password `demo` ont quand même 2 hashes **différents** en DB. bcrypt le gère tout seul, tu n'as rien à faire. |
| **`saltRounds`** | Le coût de calcul du hash. `10` = standard recommandé. Plus c'est élevé, plus c'est lent (pour toi ET pour un attaquant). |
| **`bcrypt.hash(motDePasse, 10)`** | Hashe un mot de passe en clair. À utiliser au register, avant d'écrire en DB. |
| **`bcrypt.compare(motDePasse, hash)`** | Compare un mot de passe en clair avec un hash. Renvoie `true` / `false`. À utiliser au login. |
| **Migration sur table peuplée** | Ajouter une colonne `NOT NULL` à une table qui a déjà des lignes = problème classique de prod. En dev, on a un raccourci : on jette la DB. |

### 📐 Les étapes

- **Étape 0 — DB (~30 min)** : ajouter `password` au schema, **regarder Prisma râler**, faire le hard-reset.
- **Étape 1 — Seed (~15 min)** : ajouter `bcrypt.hash("demo", 10)` dans `prisma/seed.js`.
- **Étape 2 — Routes auth (~45 min)** : `bcrypt.hash` au register (2A), `bcrypt.compare` au login (2B).
- **Étape 3 — Anti-fuite (~15 min)** : helper `toPublicUser` + `publicUserSelect` pour ne pas re-exposer le hash via l'API.

> ⚠️ Le `token: \`user-${id}\`` reste **FAKE** à la fin de l'atelier 1. On le remplace par un vrai JWT à l'atelier 2.

### Les fichiers à modifier

| Fichier | Trou |
|---------|------|
| `prisma/schema.prisma` | Ajouter `password String` au model User |
| `prisma/seed.js` | Hasher `"demo"` avant chaque insert |
| `routes/auth.js` — `/register` | `bcrypt.hash(...)` avant `create` (Étape 2A) |
| `routes/auth.js` — `/login` | `bcrypt.compare(...)` avant le succès (Étape 2B) |
| `routes/auth.js` + `routes/users.js` | Ne pas exposer le hash dans les réponses (Étape 3) |

Tous les emplacements sont marqués `🔧 ATELIER 1` / `🔧 ÉTAPE X` dans les fichiers. Cherche avec **Ctrl+F**.

### 📋 Ordre conseillé

#### Étape 0.1 — Ajouter `password` au schema

Ouvre `prisma/schema.prisma`, trouve `🔧 ATELIER 1`, et ajoute dans le model User :

```prisma
password  String
```

#### Étape 0.2 — Lancer la migration → **elle va planter**

```bash
npx prisma migrate dev --name add-password
```

Prisma va t'engueuler avec un message du genre :
> ⚠ A migration failed... `Added the required column 'password' to the User table without a default value. There are 5 rows in this table, it is not possible to execute this step.`

**C'est normal et c'est l'objectif pédagogique** : tu vis le vrai problème "ajouter une colonne NOT NULL à une table peuplée".

> 💡 **`--create-only`** : Prisma te suggère dans son message d'erreur d'utiliser `prisma migrate dev --create-only`. C'est la stratégie prod (créer le `.sql` à la main et y ajouter un backfill). On ne l'utilise pas dans cet atelier — on prend le raccourci dev (jeter la DB).

#### Étape 0.3 — Hard-reset (OK en dev, **JAMAIS en prod**)

```bash
rm prisma/dev.db                                        # supprime la DB locale
npx prisma migrate dev --name add-password --skip-seed  # ré-applique tout SANS seeder
```

> ⚠️ **Pourquoi `--skip-seed`** ? Sans ce flag, Prisma lance auto le seed après avoir recréé la DB. Mais le seed n'a pas encore été modifié pour fournir le `password` → il planterait. On l'adapte à l'étape suivante.

<details>
<summary>💭 Et en prod, on ferait comment ? (replié — pour curieux)</summary>

Jeter la DB est OK en dev parce qu'elle ne contient que tes seedés. En prod tu perdrais tous tes vrais utilisateurs. Les stratégies prod ressemblent à :

- Ajouter la colonne en `nullable` d'abord, **backfiller** les valeurs (via SQL ou script), puis passer en `NOT NULL` dans une 2ᵉ migration.
- OU ajouter la colonne `NOT NULL` avec un **default temporaire** (ex. `""`) puis re-itérer.

On en reparle en correction live coding. Pour l'atelier, raccourci dev.

</details>

#### Étape 1 — Modifier `prisma/seed.js`

Ajoute `bcrypt` et hash `"demo"` avant la boucle des users (suis le `🔧 ATELIER 1 J4` dans le fichier).

```bash
npx prisma db seed    # → 5 users avec password = hash de "demo"
```

Va voir dans Prisma Studio (`npx prisma studio`) : la colonne `password` ressemble à `$2b$10$...`.

#### Étape 2 — Migrer `/register` et `/login`

Suis les commentaires `🔧 ATELIER 1` dans `routes/auth.js`.

#### Étape 3 — Ne pas exposer le hash dans les réponses

Quand tu testes `/auth/login` avec Thunder Client après l'étape 2, tu remarques un truc dérangeant : la réponse contient `user.password` (le hash). Idem dans `GET /users/:id`.

**On vient de cacher le password en DB, on ne va pas le ré-exposer via l'API.**

- Dans `routes/auth.js` → écris un helper `toPublicUser(user)` qui retire la clé `password`, puis utilise-le dans les `res.json(...)` de /register et /login. (Marqueurs `🔧 ÉTAPE 3`.)
- Dans `routes/users.js` → définis une constante `publicUserSelect` (les colonnes publiques) et passe-la à Prisma via `select: publicUserSelect`. (Marqueurs `🔧 ÉTAPE 3`.)

**Pourquoi deux patterns différents ?** Côté auth on a **besoin** de fetcher le password (pour `bcrypt.compare`), on le strip après. Côté users on n'en a pas besoin → on ne le fetch même pas. On en reparle en correction.

### 🎯 Tu viens de boucher 1 des 2 trous de sécurité

Les passwords sont maintenant hashés en DB **et** ne fuient plus via l'API. Reste le 2ᵉ trou : le token `Bearer user-N` qu'on peut encore falsifier. On l'attaque à l'atelier 2.

### ✅ Critère de réussite atelier 1

| Test | Résultat attendu |
|------|------------------|
| `POST /auth/login` avec `alice@devconnect.io` + `demo` | 200 + token (encore fake `user-1`) |
| `POST /auth/login` avec `alice@devconnect.io` + `wrong` | **401** |
| `POST /auth/register` avec un nouveau user | 201 + token, password hashé en DB |
| `POST /auth/register` avec un email déjà pris | 409 |
| Après BONUS : la réponse `/login` **ne contient PAS** `user.password` | ✅ |
| Après BONUS : `GET /users/1` **ne contient PAS** `password` | ✅ |

### 🆘 Coincé ? (atelier 1)

1. **Migration plante à l'étape 0.2** → c'est normal et c'est l'objet de l'étape. Hard-reset (0.3) puis re-migrate avec `--skip-seed`.
2. **Seed plante avec `NOT NULL constraint failed: User.password`** → tu n'as pas encore mis `password: passwordHash` dans le `create` du seed. Va voir `🔧 ATELIER 1 J4` dans `prisma/seed.js`.
3. **Login passe avec n'importe quel password** → tu as oublié `await` devant `bcrypt.compare` (voir l'encart sécurité dans le commentaire `/login`).
4. **`bcrypt` ne s'installe pas** (compile error sur certains setups) → alternative `npm install bcryptjs` (API compatible, plus lent au runtime mais install trivial). Remplace l'import par `import bcrypt from 'bcryptjs'`.

---

## 🛠️ Atelier 2 — JWT

**Objectif** : remplacer le token fake `Bearer user-N` par un vrai **JSON Web Token** signé cryptographiquement.

### 📖 Vocabulaire éclair atelier 2

| Terme | Définition courte |
|-------|------|
| **JWT** | "JSON Web Token". Une string de la forme `xxx.yyy.zzz` (3 parties séparées par `.`). Utilisée comme badge d'identification que le serveur émet et vérifie. |
| **Header** | 1ʳᵉ partie. JSON encodé en base64. Indique l'algo de signature : `{ alg: "HS256", typ: "JWT" }`. |
| **Payload** | 2ᵉ partie. JSON encodé en base64. Contient les "claims" : `{ sub, iat, exp, ... }`. **LISIBLE PAR TOUS** — ne jamais y mettre de secret. |
| **Signature** | 3ᵉ partie. `HMAC-SHA256(header.payload, secret)`. Garantit que personne n'a modifié le token sans connaître le secret. |
| **`JWT_SECRET`** | La clé secrète serveur. Sert à signer ET à vérifier. C'est le SEUL gardien du système. Stockée dans `.env`. |
| **Claim `sub`** | "Subject". Le claim standard JWT pour identifier le sujet du token. Chez nous : l'id du user. |
| **`exp`** | Timestamp d'expiration. Inclus automatiquement par `jwt.sign(..., { expiresIn: '24h' })`. Vérifié automatiquement par `jwt.verify`. |
| **`jwt.sign(payload, secret, options)`** | Crée un JWT signé. À utiliser au login/register. |
| **`jwt.verify(token, secret)`** | Vérifie la signature ET l'expiration. Throw si invalide. À utiliser dans le middleware. |

### 📐 La structure en 3 temps

- **Étape 1 — Signer (~30 min)** : remplacer `token: \`user-${id}\`` par `jwt.sign({ sub: id }, secret, { expiresIn })` dans `/register` et `/login`.
- **Étape 2 — Vérifier (~30 min)** : remplacer le regex `^user-(\d+)$` par `jwt.verify(token, secret)` dans `middleware/authenticate.js`.
- **Étape 3 — Inspecter sur jwt.io (~10 min)** : décoder son propre token, comprendre la structure visuelle.
- **Étape 4 — Tester côté front (~10 min)** : vérifier que le contrat HTTP reste stable.

### Les fichiers à modifier

| Fichier | Trou |
|---------|------|
| `routes/auth.js` — `/register` | `jwt.sign({ sub: newUser.id }, secret, { expiresIn })` |
| `routes/auth.js` — `/login` | Idem (`{ sub: user.id }`) |
| `middleware/authenticate.js` | Remplacer regex par `jwt.verify` + try/catch |

Cherche `🔧 ATELIER 2` dans les fichiers.

### 📋 Ordre conseillé

#### Étape 1 — Signer les JWT au login/register

Dans `routes/auth.js`, importe `jsonwebtoken` et remplace les deux `token: \`user-${id}\`` par :

```js
token: jwt.sign({ sub: newUser.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
```

(Et idem dans `/login` avec `user.id` au lieu de `newUser.id`.)

#### Étape 2 — Vérifier les JWT au middleware

Dans `middleware/authenticate.js`, importe `jsonwebtoken`. Suis les étapes a/b/c du commentaire `🔧 ATELIER 2` pour remplacer le bloc regex par un `jwt.verify` enveloppé dans un try/catch.

#### Étape 3 — Décoder ton JWT sur [jwt.io](https://jwt.io)

C'est **le moment "aha" de l'atelier**. Récupère un token via Thunder Client :

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"alice@devconnect.io","password":"demo"}' \
  http://localhost:4000/auth/login
```

Copie le `token` de la réponse, va sur [https://jwt.io](https://jwt.io), colle dans la box de gauche. Tu vois le header + payload décodés. Le payload contient `{ "sub": 1, "iat": ..., "exp": ... }`.

Modifie maintenant **1 caractère du payload** sur jwt.io (par exemple `sub: 2`). La signature devient **rouge** ❌ — jwt.io te dit que le token n'est plus valide. Colle ce token modifié dans Thunder Client : tu reçois **401**. **La signature est le seul garde-fou.**

> 💡 Pour observer l'expiration en live (sans attendre 24h), tu peux temporairement remplacer `expiresIn: '24h'` par `'5s'` dans `routes/auth.js`, login, attends 6 secondes, puis fais une requête : tu auras 401. Remets `'24h'` après.

#### Étape 4 — Test côté front

Ouvre [http://localhost:4000](http://localhost:4000), connecte-toi avec `alice@devconnect.io` / `demo`. La timeline doit s'afficher comme d'habitude. Ouvre DevTools → Console → `localStorage.getItem('devconnect.token')` : tu vois un JWT.

**Le front n'a pas bougé d'une ligne pour passer de `user-1` à `eyJhbGci...`.** C'est la promesse du contrat HTTP stable depuis le J1.

### ✅ Critère de réussite atelier 2

| Test | Résultat attendu |
|------|------------------|
| `POST /auth/login` | 200 + `token` au format `xxx.yyy.zzz` |
| Coller le token sur jwt.io | Voir `{ "sub": 1, "iat": ..., "exp": ... }` |
| `GET /users/1` avec JWT en `Bearer` | 200 |
| Modifier 1 caractère du JWT | **401** (signature invalide) |
| Vieux JWT après modification de `JWT_SECRET` | **401** (signature invalide) |
| Inventer un JWT random | **401** |

### 🎉 LE TEST FRONT (qui valide tout)

1. Connecte-toi via le formulaire → tu vois la timeline
2. Ouvre la console DevTools → `localStorage.getItem('devconnect.token')` → c'est un JWT
3. Clique un ❤️ → ça marche
4. Coupe le serveur, modifie `JWT_SECRET` dans `.env`, relance, recharge → le front te déconnecte automatiquement (le 401 est géré au J1)
5. Reconnecte-toi avec `demo` → re-marche

**Le contrat HTTP est resté stable depuis le J1.** Le front n'a pas bougé d'une ligne pour passer de `user-1` à `eyJhbGci...`.

### 🆘 Coincé ? (atelier 2)

1. **`POST /auth/login` renvoie 500** → vérifie que tu as bien `JWT_SECRET` dans ton `.env` ET que le serveur a été relancé après. `dotenv` ne re-lit pas en cours d'exécution.
2. **`GET /users/1` avec JWT renvoie 500** → tu as oublié le `try/catch` autour de `jwt.verify`. Un token invalide throw une exception ; sans catch, le middleware crash.
3. **Mon JWT décodé sur jwt.io n'affiche pas `{ sub: 1 }`** → vérifie que tu as bien signé avec `{ sub: newUser.id }` et pas `newUser.id` directement (le payload doit être un objet).
4. **Tous mes JWT d'hier ne marchent plus** → tu as changé `JWT_SECRET` entre 2 sessions. C'est normal : le secret est le seul gardien, si tu le changes, tous les tokens existants deviennent invalides. Reconnecte-toi.
5. **`jwt.verify` lit mal `process.env.JWT_SECRET`** → vérifie que ton serveur a bien `import 'dotenv/config'` (déjà en place depuis le J2).

---

## 📚 Documentation de référence

- [bcrypt sur npm](https://www.npmjs.com/package/bcrypt) — `hash`, `compare`, `genSalt`
- [jsonwebtoken sur npm](https://www.npmjs.com/package/jsonwebtoken) — `sign`, `verify`
- [jwt.io](https://jwt.io) — décodeur visuel + intro JWT
- [Doc OWASP — Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — pour aller plus loin sur les bonnes pratiques bcrypt
