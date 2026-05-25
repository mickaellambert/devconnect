# DevConnect — Jour 3 (Point de départ)

Bienvenue sur le **jour 3** de DevConnect ! Aujourd'hui, on découvre les **ORM** et on remplace les données en mémoire par une vraie base **SQLite** avec **Prisma**.

> 💡 Si tu reviens de la coupure d'1 mois entre J2 et J3 : pas de panique. Le cours du matin commence par une réactivation rapide.

---

## 🎯 Programme de la journée

| Slot | Quoi |
|------|------|
| Matin (~1h30) | Cours ORM + démo live Prisma |
| Pause déjeuner | |
| **Atelier 1 (~1h45)** | Setup Prisma + Modèle User + premier CRUD via Prisma |
| Correction live coding atelier 1 (~1h) | |
| **Atelier 2 — Étape 0 (~20 min)** | Préparer la DB : modèles `Post` + `Like` + 2 migrations + seed |
| **Atelier 2 — Partie A (~40 min)** | Migrer les 3 routes Posts en bloc |
| **Atelier 2 — Partie B (~40 min)** | Migrer les 2 routes Likes en bloc (clé composite) |
| Correction live coding atelier 2 (~30 min) | |

---

## ✅ Prérequis (à vérifier avant de commencer)

```bash
node --version    # v22.x ou plus
npm --version     # 10.x ou plus
git --version     # 2.x
```

---

## 🚀 Installation

### Si tu reprends ton repo du J2

```bash
cd devconnect
git fetch origin
git checkout j3/start
npm install     # ← important, on a ajouté Prisma aux dépendances
```

### Si tu pars d'un repo neuf

```bash
git clone git@github.com:mickaellambert/devconnect.git
cd devconnect
git checkout j3/start
npm install
```

### Crée ton `.env` (ou complète celui du J2)

```bash
cp .env.example .env
```

→ Vérifie qu'il contient bien `DATABASE_URL="file:./dev.db"`.

---

## 🛠️ Atelier 1 — Setup Prisma + Modèle User

**Objectif** : remplacer le tableau `data/users.js` par une vraie base SQLite, gérée par Prisma.

### 📖 Vocabulaire éclair (à garder sous le coude)

| Terme | Définition courte |
|-------|------|
| **ORM** (Object-Relational Mapping) | Une lib qui te laisse parler à ta DB en JS au lieu d'écrire du SQL à la main. Tu écris `prisma.user.findMany()`, Prisma traduit en `SELECT * FROM "User"`. |
| **Schéma Prisma** | Le fichier `prisma/schema.prisma` qui décrit la structure de ta DB (tables, colonnes, relations). C'est la source de vérité. |
| **Migration** | Un fichier `.sql` généré par Prisma qui décrit comment passer de l'état précédent de ta DB au nouveau. Versionné dans git → l'historique de la structure de ta DB. |
| **Client Prisma** | Un objet JS auto-généré à partir du schéma. C'est lui qui t'expose `prisma.user.findUnique(...)`. Re-généré à chaque migration. |

### Les fichiers déjà préparés (boilerplate fourni)

| Fichier | Rôle |
|---------|------|
| `prisma/schema.prisma` | Le schéma de la base (avec un trou pour le modèle User) |
| `prisma/client.js` | Une instance partagée du client Prisma (à importer dans tes routes) |
| `prisma/seed.js` | Le script de peuplement initial (5 users en dur) |
| `data/users.js` | Le tableau legacy du J1/J2 — encore utilisé dans les routes à migrer. À supprimer en fin d'atelier. |
| `middleware/authenticate.js` | 🔒 Déjà migré vers Prisma — sers-t'en comme modèle |
| `routes/users.js` (route `GET /users`) | ✅ Exemple migré, sers-t'en comme modèle |

### Les trous à coder (4 emplacements)

| Fichier | Trou | Difficulté |
|---------|-------|-----------|
| `prisma/schema.prisma` | Écrire le modèle `User` | facile |
| `routes/users.js` | `GET /users/:id` (`findUnique`) | facile |
| `routes/auth.js` | `POST /auth/login` (`findUnique` par email) | facile |
| `routes/auth.js` | `POST /auth/register` (`findUnique` + `create`) | moyen |

Tous les emplacements à modifier sont marqués `🔧 ATELIER 1` dans les fichiers. Cherche-les avec **Ctrl+F**.

### 📋 Ordre conseillé

1. **Ouvre `prisma/schema.prisma`** et écris le modèle `User` (suis le commentaire `🔧 ATELIER 1`)
2. **Lance la première migration** :
   ```bash
   npx prisma migrate dev --name init
   ```
   > 💡 **Ce qu'on vient de faire** : on a dit à Prisma "lis mon `schema.prisma`, génère le SQL qui crée la table User, applique-le sur `dev.db`, et range ce SQL dans `prisma/migrations/<timestamp>_init/migration.sql`". Le `--name init` est juste l'étiquette de la migration (comme un message de commit). Va ouvrir le `.sql` généré — c'est du SQL pur, lisible.

3. **Peuple la base avec le seed fourni** :
   ```bash
   npx prisma db seed
   ```
   → 5 users insérés. Le seed affiche dans le terminal les emails et leur token fake (`Bearer user-1` pour Alice, etc.) — garde la sortie sous les yeux pour tes tests Thunder Client.

4. **(Optionnel)** Ouvre Prisma Studio pour vérifier visuellement :
   ```bash
   npx prisma studio
   ```

5. **(Recommandé)** Ouvre `middleware/authenticate.js` et **lis-le** avant de coder. C'est une route déjà migrée pour toi → tu vois exactement le pattern `prisma.user.findUnique(...)` que tu vas répéter dans les trous.

6. **Migre les routes** dans cet ordre (du plus simple au plus dur) :
   - `routes/users.js` → `GET /users/:id` (le plus simple, calque sur l'exemple `GET /users`)
   - `routes/auth.js` → `POST /auth/login` (même pattern, mais `findUnique` par email)
   - `routes/auth.js` → `POST /auth/register` (vérif d'unicité **+** création)

7. **Teste avec le front** : démarre `npm run dev`, ouvre [http://localhost:4000](http://localhost:4000), connecte-toi → la timeline doit s'afficher **exactement comme au J2**. Les users viennent maintenant de la DB, les posts toujours de la mémoire (on les migrera à l'atelier 2).

   > 💡 **Rappel** : le front (HTML/JS dans `public/`) appelle l'API via `fetch`. Tu ne dois rien y toucher — le but de l'atelier est que **rien ne change côté front**, malgré le changement de stockage côté serveur.

---

## ✅ Critère de réussite

### Les tests classiques (à faire au fil de l'eau pendant l'atelier)

| Test | Résultat attendu |
|------|------------------|
| `GET /users/:id` (Thunder Client) | 200 + user, ou 404 |
| `POST /auth/login` avec `alice@devconnect.io` | 200 + token |
| `POST /auth/register` avec un nouvel email | 201 + user créé + mail Ethereal envoyé |
| `POST /auth/register` avec un email existant | 409 |

### 🎉 LE TEST QUI CHANGE TOUT (à faire à la fin)

C'est le moment où tu comprends pourquoi on utilise une base de données.

1. **Inscris-toi** avec un email à toi (ex : `ton-prenom@test.io`)
2. Note bien que ton inscription a marché → un nouvel id, un mail envoyé
3. **COUPE le serveur** (Ctrl+C dans le terminal)
   > *"Et là, tout devrait être perdu, non ?"*
4. **Relance** le serveur (`npm run dev`)
5. **Reconnecte-toi** avec le même email
   > 🤯 **Ça marche. Ton compte est resté.**

Hier (J2), ce test aurait raté — au redémarrage, tout disparaissait. Aujourd'hui, il passe. **C'est ça, la persistance.**

---

## 🧹 Nettoyage final atelier 1 (optionnel mais propre)

Une fois que tu as testé et que tout marche, tu peux nettoyer :

**Dans `routes/users.js` et `routes/auth.js`**, supprime l'import :
```js
import { users } from '../data/users.js'; // ← cet import ne sert plus à rien
```

→ Tu peux même supprimer le fichier `data/users.js` complètement, plus aucun fichier ne l'importe. (C'est ce qu'on a fait sur `j3/solution`.)

`data/posts.js` reste, lui, car il sert toujours aux routes `/posts` qu'on migrera à l'atelier 2.

---

Si tous les tests passent → ✅ tu as réussi l'atelier 1. Tu peux passer à l'atelier 2.

---

## 🛠️ Atelier 2 — Posts (1-N) + Likes (N-N)

**Objectif** : modéliser deux nouvelles tables (`Post` et `Like`) et migrer toutes les routes `/posts` vers Prisma.

> 📈 **On monte d'un cran.** L'atelier 1 t'a fait écrire UN model simple. L'atelier 2 t'introduit les **relations entre tables** — c'est ce qui rend une vraie DB intéressante par rapport à un tableau JS. On le fait en 2 paliers : **1-N** (un post a un auteur), puis **N-N** (un user peut liker plusieurs posts et inversement). Si certains termes te paraissent flous au début, c'est normal — chaque concept est posé au moment où tu en as besoin.

### 📖 Vocabulaire éclair atelier 2

| Terme | Définition courte |
|-------|------|
| **Foreign key (FK)** | Une colonne qui référence l'`id` d'une autre table. Pour `Post`, c'est `userId` (= "qui est l'auteur ?"). En SQL pur, ça vient avec `FOREIGN KEY (userId) REFERENCES User(id)` — Prisma le fait pour toi. |
| **Navigation property** | Le champ `user User @relation(...)` côté Post. Ce n'est PAS une vraie colonne SQL — c'est un raccourci JS qui te laisse écrire `post.user` au lieu de faire toi-même une 2ᵉ requête sur User par `userId`. |
| **Relation 1-N** | "Un côté, plusieurs de l'autre". Un User a plusieurs Posts (côté `1`), un Post appartient à un User (côté `N`). |
| **Relation N-N** | "Plusieurs des deux côtés". Un User like plusieurs Posts, un Post est liké par plusieurs Users. Modélisée via une **table de jointure** (chez nous : `Like`). |
| **Clé composite** | Une clé primaire faite de **plusieurs colonnes**. Pour `Like`, c'est le couple `(userId, postId)` — impossible d'avoir 2 fois la même ligne, donc impossible de liker 2 fois le même post. |
| **`include` (Prisma)** | "Récupère aussi la relation". `prisma.post.findMany({ include: { likes: true } })` ramène les posts ET leurs likes en une requête. Sans `include`, `post.likes` est `undefined`. |
| **Aplatir (helper `toApi`)** | Convertir un tableau d'objets `[{userId: 3}, {userId: 5}]` en tableau d'ids `[3, 5]`. C'est ce qu'on fait pour garder le contrat HTTP du J2. |
| **Seed idempotent** | Tu peux relancer `npx prisma db seed` autant de fois que tu veux — il nettoie tout avant de re-peupler, donc les ids restent stables (alice = 1, …). |

### 📐 La structure en 3 temps

- **Étape 0 — Préparer la DB (~20 min)** : écrire les **2 modèles** (`Post` + `Like`) + faire les **2 migrations** + le seed. **Avant de toucher au code des routes.**
- **Partie A — Routes Posts (~40 min)** : migrer `GET /posts`, `GET /:id`, `POST /posts` **en bloc**.
- **Partie B — Routes Likes (~40 min)** : migrer `PUT /:id/likes`, `DELETE /:id/likes` **en bloc** (focus : clé composite).

<details>
<summary>💭 Pourquoi cette structure ? (clique si tu veux comprendre le choix de design)</summary>

**Pourquoi créer Like dès l'Étape 0, avant les routes ?**
Parce que les routes Posts utilisent `include: { likes: true }`. Si tu essayais de coder ces routes avant d'avoir créé le modèle Like dans le schema, Prisma rejetterait avec `"Unknown field 'likes'"`. Donc on prépare les 2 tables d'abord, on code les routes après.

**Pourquoi migrer "en bloc" plutôt qu'une route à la fois ?**
Les 3 routes Posts (GET / GET/:id / POST) sont des variations du même pattern (`findMany` / `findUnique` / `create`, toutes passées par `toApi`). Les migrer ensemble te fait taper le même squelette plusieurs fois d'affilée → ça consolide. Pareil pour la Partie B avec la clé composite. Si on éclatait en 5 petits trous, tu n'aurais pas l'effet de répétition qui ancre le pattern.

</details>

### 🤝 Le contrat HTTP reste stable depuis le J1

Le front fourni au J1 attend `post.likes` au format **tableau d'ids** : `[3, 5]`. Prisma, lui, renvoie des **objets Like** complets quand on fait `include: { likes: true }`. Pour ne PAS casser le front, on **aplatit** côté serveur avec un petit helper `toApi(post)` (déjà fourni en tête de `routes/posts.js`). Le front n'a pas à bouger d'une ligne.

### Les fichiers déjà préparés

| Fichier | Rôle |
|---------|------|
| `prisma/schema.prisma` | Modèle `User` (atelier 1) + 2 trous (`Post` et `Like`) |
| `prisma/seed.js` | 5 users + 10 posts + 21 likes — s'adapte à l'état de ta DB (atelier 1 / partie A / complet) et est idempotent. |
| `routes/posts.js` | Helper `toApi` fourni en tête + commentaires détaillés sur chaque partie |
| `data/posts.js` | Le tableau legacy J1/J2 — encore utilisé par les routes à migrer. À supprimer en fin d'atelier. |

### Les trous à coder

| Trou | Quoi | Difficulté |
|---------|------|-----------|
| `prisma/schema.prisma` | Modèle `Post` (+ `posts Post[]` côté User) | facile |
| `prisma/schema.prisma` | Modèle `Like` (+ `likes Like[]` côté User et côté Post) | moyen (clé composite) |
| `routes/posts.js` — Partie A | Migrer `GET /posts` + `GET /:id` + `POST /posts` (en bloc) | facile (calque + `toApi`) |
| `routes/posts.js` — Partie B | Migrer `PUT /:id/likes` + `DELETE /:id/likes` (en bloc) | moyen (clé composite) |

Tous les emplacements à modifier sont marqués `🔧 ATELIER 2` dans les fichiers. Cherche-les avec **Ctrl+F**.

### 📋 Ordre conseillé

**Étape 0 — Préparer la DB (avant tout code de route !)**

1. **Écris le modèle `Post`** dans `prisma/schema.prisma`.
   - N'oublie pas `posts Post[]` dans `User`.
2. **Lance la 2e migration** :
   ```bash
   npx prisma migrate dev --name add-posts
   ```
3. **Écris le modèle `Like`** dans `prisma/schema.prisma`.
   - N'oublie pas `likes Like[]` dans **`User` ET dans `Post`**.
4. **Lance la 3e migration** :
   ```bash
   npx prisma migrate dev --name add-likes
   ```
5. **Peuple la base** :
   ```bash
   npx prisma db seed
   ```
   → 5 users + 10 posts + 21 likes.

> ✅ **Checklist fin d'Étape 0** — avant de passer aux routes, vérifie :
> - [ ] `model Post { … }` écrit, avec `userId Int` et `user User @relation(…)`
> - [ ] `posts Post[]` ajouté **dans le model User**
> - [ ] `npx prisma migrate dev --name add-posts` passé **sans erreur**
> - [ ] `model Like { … }` écrit, avec `@@id([userId, postId])` à la fin
> - [ ] `likes Like[]` ajouté **dans User ET dans Post** (les deux !)
> - [ ] `npx prisma migrate dev --name add-likes` passé **sans erreur**
> - [ ] `npx prisma db seed` affiche `5 users, 10 posts, 21 likes`

**Partie A — Migrer les routes Posts**

6. Suis le commentaire `🔧 PARTIE A` dans `routes/posts.js`. Tu migres les 3 routes en bloc en utilisant `findMany` / `findUnique` / `create`, avec `include: { likes: true }` sur les GET et `toApi(...)` avant chaque `res.json(...)`.
7. **Teste côté Thunder Client** : `GET /posts`, `GET /posts/3`, `POST /posts`.

**Partie B — Migrer les routes Likes (clé composite)**

8. Suis le commentaire `🔧 PARTIE B` dans `routes/posts.js`. Tu utilises la **clé composite** Prisma : `where: { userId_postId: { userId, postId } }`.
9. **Teste avec le front** : ouvre [http://localhost:4000](http://localhost:4000), connecte-toi, clique ❤️ sur des posts, crée un post → tout doit marcher.

---

## ✅ Critère de réussite atelier 2

| Test | Résultat attendu |
|------|------------------|
| `GET /posts` | 200 + 10 posts avec `likes: [...]` (tableau d'ids, format J2 préservé) |
| `GET /posts/3` | 200 + le post 3 avec ses likes |
| `GET /posts/999` | 404 |
| `POST /posts` (avec body valide) | 201 + post créé (id auto, createdAt auto, `likes: []`) |
| `PUT /posts/4/likes` (en `Bearer user-1`, 1ʳᵉ fois) | 201 + post avec le like ajouté |
| `PUT /posts/4/likes` (en `Bearer user-1`, 2ᵉ fois) | **409** (tu as déjà liké ce post) |
| `DELETE /posts/4/likes` | 204 (No Content) |
| `DELETE /posts/4/likes` (2ᵉ fois) | 404 (aucun like à supprimer) |

> 💡 **Pour tester le 409 sans repasser par 201 d'abord** : like le post `1` qui est déjà liké par Bob/Charlie/Dora au seed. Si tu te connectes en `Bearer user-2` (Bob) et fais `PUT /posts/1/likes`, tu auras 409 directement. Le post `4` à l'inverse n'a aucun like initial → idéal pour observer le cycle complet 201 → 409 → 204.

### 🎉 LE TEST FRONT (qui valide tout)

1. Connecte-toi
2. Like un post → le ❤️ devient rouge, le compteur monte
3. **Re-clique sur le ❤️** → il revient à la normale, le compteur descend
4. **Crée un nouveau post** depuis le formulaire → il apparaît en haut de la timeline
5. **Coupe le serveur, relance-le, recharge la page** → tout est encore là 🎯

---

## 🧹 Nettoyage final atelier 2 (optionnel mais propre)

Une fois que TOUTES les routes `/posts` sont migrées, le tableau `data/posts.js` ne sert plus à rien.

Dans `routes/posts.js`, supprime :
```js
import { posts } from '../data/posts.js'; // ← cet import ne sert plus à rien
```

Puis supprime le fichier `data/posts.js` (et même tout le dossier `data/` s'il est vide). C'est ce qu'on a fait sur `j3/solution`.

---

## 🆘 Coincé ?

1. **As-tu fait toute l'Étape 0 ?** Les 2 modèles (Post + Like) + 2 migrations + seed **avant** de toucher aux routes. Si tu sautes Like, la Partie A va planter avec `"Unknown field 'likes'"`.
2. **Le seed plante ?** Il est conçu pour être lancé même quand toutes les tables n'existent pas encore (il se dégrade). Et il est idempotent — tu peux le re-lancer autant de fois que tu veux. Si tu vois quand même une erreur, vérifie l'état des migrations : `npx prisma migrate status`.
3. **Migration ratée / DB dans un état bizarre ?** Hard-reset propre (OK en dev, **JAMAIS en prod**) :
   ```bash
   rm prisma/dev.db                       # supprime la DB locale
   rm -rf prisma/migrations/<le-dossier-cassé>   # si une migration a échoué
   npx prisma migrate dev                 # ré-applique tout depuis zéro
   npx prisma db seed                     # re-peuple
   ```
4. **Tes fonctions de route sont-elles `async`** ? Prisma renvoie des Promises, sans `async`/`await` ton code lit la Promise au lieu de la donnée.
5. **Tu oublies `include: { likes: true }`** ? C'est l'erreur n°1 sur la Partie A. Sans `include`, Prisma ne te renvoie PAS les likes (par défaut il ne suit pas les relations) → le compteur ❤️ du front reste à 0.
6. **Tu oublies `toApi(post)`** dans `res.json(...)` ? Le format des likes ne sera pas le bon (objets au lieu d'ids) et le front ne saura plus si tu as déjà liké un post.
7. **Erreur Prisma sur la clé composite ?** Le nom est `userId_postId` (les noms des champs joints par `_`). Et la valeur est un objet : `{ userId, postId }`.
8. **`npx prisma studio`** pour visualiser ta base, c'est souvent suffisant pour comprendre ce qui cloche.
9. Lève la main 🙋

---

## 📚 Documentation de référence

- [Doc officielle Prisma](https://www.prisma.io/docs)
- [Référence des queries Prisma](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Référence du schéma Prisma](https://www.prisma.io/docs/orm/reference/prisma-schema-reference)
