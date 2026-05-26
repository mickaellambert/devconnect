# DevConnect — Jour 3 (Correction)

Cette branche contient la **correction complète** du jour 3 :

- **Atelier 1** : migration des routes `User` vers Prisma + SQLite
- **Atelier 2 — Étape 0** : Post (1-N) + Like (N-N + clé composite) + 2 migrations + seed
- **Atelier 2 — Partie A & B** : migration des routes `/posts` (Posts + Likes via clé composite)

À la fin de cette branche, **toute** la couche "données en mémoire" du J1/J2 est remplacée par une vraie base SQLite. Les fichiers `data/users.js` et `data/posts.js` ont été supprimés.

> 🎯 **Le contrat HTTP est resté EXACTEMENT le même** que le J2 (notamment `post.likes` au format tableau d'ids `[3, 5]`). Le front fourni au J1 n'a pas bougé d'une ligne, grâce au helper `toApi()`.

## 🚀 Lancer

```bash
npm install
cp .env.example .env                           # si pas déjà fait
npx prisma migrate dev                         # applique les 3 migrations (init + add-posts + add-likes)
npx prisma db seed                             # peuple la base (5 users + 10 posts + 21 likes)
npm run dev
```

Le serveur démarre sur [http://localhost:4000](http://localhost:4000).

## 📜 Historique git de cette branche

```bash
git log --oneline j3/solution
# (sha) chore(j3): remove legacy data/posts.js + finalize solution README
# (sha) feat(j3): solve atelier 2 routes — Posts (Partie A) + Likes (Partie B)
# (sha) feat(j3): atelier 2 étape 0 — Post & Like models + migrations
# (sha) chore(j3): remove legacy data/users.js
# (sha) feat(j3): solve atelier 1 — user routes migration to prisma
# (sha) feat(j3): scaffold prisma + ateliers 1 & 2 (users + posts/likes) ← j3/start
```

Les commits sont **incrémentaux** : un commit par étape pédagogique. Tu peux faire `git checkout <sha>` pour explorer l'état du repo après chaque étape.

## 💡 Points pédagogiques clés

### Le passage du tableau JS à la base de données

```js
// AVANT (J1/J2)                       // APRÈS (J3)
const user = users.find(u => u.id === id);
                                       const user = await prisma.user.findUnique({
                                         where: { id }
                                       });
```

L'API reste **identique** côté HTTP. Le front fourni au J1 continue de marcher **sans aucune modification**. C'est la promesse du **contrat HTTP stable** qu'on s'est fixé depuis le J1.

### Le seed — robuste, idempotent, ergonomique

Le fichier `prisma/seed.js` reproduit les 5 users + 10 posts + 21 likes qu'on avait en dur au J1/J2. **Au redémarrage du serveur, les données restent** — différence majeure avec le mode "tableau en mémoire" qui perdait tout.

Le seed a trois propriétés importantes :

1. **Dégradation gracieuse** : il fonctionne après l'atelier 1 (juste users), après l'étape 0 partielle (users + posts), et après l'étape 0 complète (users + posts + likes). Il détecte ce qui existe via `typeof prisma[name]?.deleteMany`.
2. **Idempotent** : tu peux le re-lancer autant de fois que tu veux. Les ids restent stables (`1..5` pour les users) grâce à un reset de `sqlite_sequence` (SQLite ne le fait pas tout seul).
3. **Affiche les credentials** : à la fin de chaque run, le seed log dans le terminal le mapping `email → Bearer user-N` — pratique pour tester via Thunder Client sans aller chercher les ids dans Prisma Studio.

### Les migrations versionnées

Le dossier `prisma/migrations/` contient les fichiers `.sql` que Prisma a générés. Ils sont **commités dans git** : ton historique de la structure de DB devient un historique versionné, exactement comme celui de ton code.

```
prisma/migrations/
├── 20260526_..._init/migration.sql        ← atelier 1 : table User
├── 20260526_..._add_posts/migration.sql   ← atelier 2 étape 0 : table Post + FK
└── 20260526_..._add_likes/migration.sql   ← atelier 2 étape 0 : table Like + clé composite
```

Chaque migration est **incrémentale** : elle ne re-crée pas tout, elle ajoute juste ce qui est nouveau.

### `findUnique` vs `findMany` vs `findFirst`

- **`findMany`** : récupère plusieurs lignes. Toujours sûr à utiliser (renvoie `[]` si rien trouvé).
- **`findUnique`** : récupère **une** ligne par une colonne **unique** (id, email…). Rapide (indexé). Renvoie `null` si rien trouvé.
- **`findFirst`** : récupère **une** ligne par une condition quelconque. Plus lent (scan).

Dans cette branche on utilise quasi exclusivement `findUnique` (colonne unique → optimal).

### Relation 1-N (User ↔ Post)

```prisma
model Post {
  userId Int
  user   User @relation(fields: [userId], references: [id])
}

model User {
  posts Post[]   // côté "1" : un user a plusieurs posts
}
```

La relation est déclarée des **deux côtés** : `userId` + `user` côté Post (le "N"), et `posts Post[]` côté User (le "1"). C'est ce qui permet à Prisma d'inclure les posts d'un user (`include: { posts: true }`) ou l'auteur d'un post (`include: { user: true }`).

### Relation N-N avec table de jointure (User ↔ Like ↔ Post)

```prisma
model Like {
  userId    Int
  user      User @relation(fields: [userId], references: [id])
  postId    Int
  post      Post @relation(fields: [postId], references: [id])
  createdAt DateTime @default(now())

  @@id([userId, postId])   // ← clé primaire COMPOSITE
}
```

On a choisi une **table explicite** parce qu'on voulait ajouter un champ `createdAt` sur la relation (savoir QUAND un like a été fait).

### La clé composite — concept nouveau

Une "clé primaire" identifie une ligne. Habituellement c'est UN champ (`id` auto-incrémenté). Mais parfois l'identifiant naturel est un **couple** : pour un Like, c'est `(userId, postId)` — un user ne peut pas liker deux fois le même post.

`@@id([userId, postId])` dit à Prisma :

- la clé primaire est le couple `(userId, postId)`
- impossible d'avoir deux fois la même ligne → la garantie d'unicité est au niveau base.

**`@id` vs `@@id`** : `@id` (un `@`) marque la PK quand c'est UNE colonne (l'`id` de User à l'atelier 1). `@@id` (deux `@`) marque la PK quand c'est PLUSIEURS colonnes — se met à la fin du model, comme une signature.

Pour interroger cette clé, Prisma génère un nom combiné `userId_postId` (les noms des champs joints par `_`) :

```js
await prisma.like.findUnique({
  where: { userId_postId: { userId: 3, postId: 1 } }
});
```

### `include` : récupérer les relations dans la même requête

Par défaut, Prisma ne suit PAS les relations (pour rester rapide). Si on veut le post avec ses likes :

```js
const post = await prisma.post.findUnique({
  where: { id },
  include: { likes: true }   // ← sans ça, post.likes est undefined
});
```

C'est l'**erreur n°1** des élèves sur la Partie A : oublier `include` → le compteur ❤️ du front reste figé à 0.

### Le helper `toApi` — comment on garde le contrat HTTP du J2

Prisma renvoie les likes sous forme d'**objets** Like complets. Au J1/J2, le front est codé pour des **tableaux d'ids** (`post.likes.includes(currentUser.id)`).

Plutôt que de toucher au front, on **aplatit côté serveur** dans toutes les routes :

```js
function toApi(post) {
  return {
    ...post,
    likes: (post.likes ?? []).map(l => l.userId)
  };
}
```

C'est un **pattern de prod réaliste** : la DB renvoie un format (riche, normalisé) et l'API expose un autre (adapté au consommateur). Le helper documente clairement cette transformation et centralise le code à un seul endroit.

### Pourquoi Étape 0 avant les routes ?

Les routes Posts utilisent `include: { likes: true }`. Si on essayait de migrer ces routes **avant** d'avoir créé le modèle Like dans le schema, Prisma rejetterait avec `"Unknown field 'likes' for include statement on model Post"`. Donc on prépare la DB d'abord (Post + Like + 2 migrations + seed), et on code les routes ensuite.

### Pourquoi migrer "par paquets" (Partie A / Partie B) ?

Les 3 routes Posts sont 3 variations du même pattern Prisma (`findMany` / `findUnique` / `create`, toutes passées par `toApi`). Les migrer ensemble fait taper le même squelette plusieurs fois d'affilée → ça consolide le pattern. Pareil pour la Partie B avec la clé composite.

Si on éclatait en 5 petits trous, on perdrait l'effet de répétition qui ancre le pattern, et la verbosité explose pour pas grand-chose côté pédagogique.

### Le nettoyage final

`data/users.js` et `data/posts.js` ont été supprimés (dossier `data/` complètement retiré). Plus aucun fichier ne les importe → c'est le geste "j'ai migré, je dégage l'ancien". Propre.

## 🔜 À l'atelier du J4

On rajoutera l'authentification sérieuse : `password` hashé avec bcrypt + JWT à la place des tokens fake. Et on en profitera pour illustrer une 4ᵉ migration `add-password` — qui montrera concrètement comment ajouter une colonne à une table existante (avec une valeur par défaut, sinon ça plante sur les lignes existantes).
