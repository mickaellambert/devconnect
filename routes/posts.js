// ═══════════════════════════════════════════════════════════════
// 📋 ATELIER 2 — DEUX TROUS À CODER ICI
// ═══════════════════════════════════════════════════════════════
//   🔧 PARTIE A : migrer les 3 routes Posts en bloc      ↓ ligne ~60
//   🔧 PARTIE B : migrer les 2 routes Likes en bloc      ↓ ligne ~140
// ═══════════════════════════════════════════════════════════════
//
// ⚠️ AVANT DE TOUCHER AU CODE — ÉTAPE 0 obligatoire dans le README :
//      1. Écrire les modèles Post ET Like dans schema.prisma
//      2. Lancer les 2 migrations (`add-posts`, `add-likes`)
//      3. Lancer le seed
//
//    On crée les 2 modèles AVANT de migrer la moindre route, parce que
//    `include: { likes: true }` n'existe que si Like est dans le schéma.
//    (Sans ça, dès la Partie A, Prisma râle avec "Unknown field `likes`").
//
// 📐 Pourquoi 2 GROS trous au lieu de 5 petits ?
//    Les 3 routes Posts sont 3 variations du MÊME pattern Prisma
//    (`findMany` / `findUnique` / `create`, toutes passées par `toApi`).
//    Les migrer ensemble te fait taper le même squelette 3 fois d'affilée
//    → ça consolide. Pareil pour la Partie B avec la clé composite.
//    Si on éclatait en 5 petits trous, tu n'aurais pas l'effet répétition
//    qui ancre le pattern.
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { posts } from '../data/posts.js'; // ← legacy : à supprimer une fois TOUT migré

const router = express.Router();

const PostSchema = z.object({
  content: z.string()
            .min(1, "Le contenu ne peut pas être vide")
            .max(500, "500 caractères max")
});


// ═══════════════════════════════════════════════════════════════
// 💡 Helper `toApi` — garder le contrat HTTP stable depuis le J1
// ═══════════════════════════════════════════════════════════════
// Le front J1 attend `post.likes` au format tableau d'ids (`[3, 5]`).
// Prisma renvoie des objets Like (`[{ userId: 3, postId: 1, … }, …]`)
// quand on fait `include: { likes: true }`. On aplatit ici → le front
// n'a pas à bouger. Contrat HTTP stable J1 → J2 → J3 → J4.
// ═══════════════════════════════════════════════════════════════
function toApi(post) {
  return {
    ...post,
    // `post.likes ?? []` : si `post.likes` est `undefined` (cas du POST
    // qui crée un post tout neuf sans `include`), on prend `[]` à la
    // place. Le `??` (nullish coalescing) = "si le truc à gauche est
    // null/undefined, prends celui de droite".
    likes: (post.likes ?? []).map(l => l.userId)
  };
}


// ═══════════════════════════════════════════════════════════════
// 🔧 PARTIE A — Migrer les 3 routes Posts EN BLOC
// ═══════════════════════════════════════════════════════════════
//
// Tu vas remplacer les 3 implémentations en mémoire ci-dessous. C'est
// répétitif : 3 variations du même pattern (`findMany` / `findUnique` /
// `create`), toutes passées par `toApi` avant `res.json(...)`.
//
// Pour chacune, voici le **squelette** à écrire toi-même
// (calque-toi sur les routes /users migrées à l'atelier 1) :
//
//   GET /posts
//     → findMany sur Post, AVEC `include: { likes: true }`
//     → res.json(...) du résultat passé par `toApi` (utilise `.map(toApi)`
//       car on a un tableau de posts à aplatir)
//
//   GET /posts/:id
//     → findUnique sur Post par `id`, AVEC `include: { likes: true }`
//     → 404 si null, sinon res.json(toApi(post))
//
//   POST /posts
//     → create sur Post avec `data: { userId: ..., content }`
//     → res.status(201).json(toApi(newPost))
//
//     💡 D'où sort le `userId` ? Du middleware `authenticate` (qui te
//        l'attache sur `req.user`). Tu utilises `req.user.id` — exactement
//        comme dans la version mémoire ci-dessous, c'est le même contrat.
//
// 💡 `include: { likes: true }` est CRUCIAL sur les GET : sans ça,
//    `post.likes` est `undefined` → le compteur ❤️ du front reste figé.
//    C'est l'erreur n°1 sur cette partie.
//
// 💡 La DB gère l'id (`@default(autoincrement())`) et la date
//    (`@default(now())`) — pas besoin de les calculer côté JS.
//
// ─── À tester (Thunder Client) ────────────────────────────────
//   GET    /posts/3                                 → 200 + post (avec likes seedés)
//   GET    /posts/999                               → 404
//   POST   /posts  body: { "content": "Hello DB" }  → 201 + post créé
// ═══════════════════════════════════════════════════════════════

// ─── GET /posts (timeline) ─────────────────────────────────────
router.get('/', async (req, res) => {
  const dbPosts = await prisma.post.findMany({
    include: { likes: true }
  });
  res.json(dbPosts.map(toApi));
});

// ─── GET /posts/:id (détail) ───────────────────────────────────
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({
    where: { id },
    include: { likes: true }
  });

  if (!post) {
    return res.status(404).json({ error: "Post non trouvé" });
  }

  res.json(toApi(post));
});

// ─── POST /posts (création) ────────────────────────────────────
router.post('/', async (req, res) => {
  const result = PostSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { content } = result.data;

  const newPost = await prisma.post.create({
    data: { userId: req.user.id, content }
  });

  res.status(201).json(toApi(newPost));
});


// ═══════════════════════════════════════════════════════════════
// 🔧 PARTIE B — Migrer les 2 routes Likes EN BLOC (clé composite)
// ═══════════════════════════════════════════════════════════════
//
// Le concept NOUVEAU de cette partie : la **clé composite Prisma**.
//
// 💡 La PK du modèle Like est `@@id([userId, postId])` (déclaré dans
//    le schema). Pour interroger cette clé, Prisma génère un nom
//    combiné `userId_postId` :
//
//        where: { userId_postId: { userId, postId } }
//                 └─────┬──────┘  └────────┬────────┘
//                  nom combiné       les vraies valeurs
//
//    L'unicité du couple est garantie au niveau base (impossible
//    d'avoir 2 fois la même ligne). On vérifie quand même côté code
//    pour renvoyer un 409 propre au client.
//
// ─── PUT /posts/:id/likes — pattern en 4 étapes ───────────────
//
//   1. Vérifier que le post existe (sinon 404)
//      → findUnique sur Post par `id: postId`
//
//   2. Vérifier que le user n'a pas déjà liké (sinon 409)
//      → findUnique sur Like par la **clé composite** :
//        `where: { userId_postId: { userId, postId } }`
//
//   3. Créer le Like
//      → prisma.like.create avec `data: { userId, postId }`
//
//   4. Re-récupérer le post à jour (avec ses likes) et le renvoyer
//      → findUnique sur Post par `id: postId`, avec `include: { likes: true }`
//      → res.status(201).json(toApi(updated))
//
//   💡 Pourquoi re-récupérer le post à l'étape 4 ?
//      Parce que `prisma.like.create()` renvoie le Like (`{ userId, postId,
//      createdAt }`), pas le Post à jour. Le front veut le Post avec sa
//      nouvelle liste de likes → on le re-fetch.
//
// ─── DELETE /posts/:id/likes — pattern en 3 étapes ────────────
//
//   1. Vérifier que le Like existe (sinon 404)
//      → findUnique sur Like (clé composite, même syntaxe qu'au PUT)
//
//   2. Supprimer le Like
//      → prisma.like.delete avec la même clé composite
//
//   3. Renvoyer 204 (No Content, pas de body)
//      → res.status(204).send()
//
//   💡 Pas besoin de vérifier que le post existe à part : si l'user
//      n'a pas de like sur ce post (post inexistant OU jamais liké),
//      on retourne 404 sur le like.
//
// ─── À tester (Thunder Client) ────────────────────────────────
//   PUT    /posts/4/likes  (1ʳᵉ)  → 201 + post avec like
//   PUT    /posts/4/likes  (2ᵉ)   → 409
//   PUT    /posts/999/likes        → 404
//   DELETE /posts/4/likes  (1ʳᵉ)  → 204
//   DELETE /posts/4/likes  (2ᵉ)   → 404
//
// 🎉 Une fois la Partie B finie : ouvre le front, clique ❤️ partout,
//    coupe/relance le serveur, recharge → tout est persisté.
// ═══════════════════════════════════════════════════════════════

// ─── PUT /posts/:id/likes (like) ───────────────────────────────
router.put('/:id/likes', async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return res.status(404).json({ error: "Post non trouvé" });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } }
  });
  if (existing) {
    return res.status(409).json({ error: "Tu as déjà liké ce post" });
  }

  await prisma.like.create({ data: { userId, postId } });

  const updated = await prisma.post.findUnique({
    where: { id: postId },
    include: { likes: true }
  });
  res.status(201).json(toApi(updated));
});

// ─── DELETE /posts/:id/likes (unlike) ──────────────────────────
router.delete('/:id/likes', async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } }
  });
  if (!existing) {
    return res.status(404).json({ error: "Aucun like à supprimer" });
  }

  await prisma.like.delete({
    where: { userId_postId: { userId, postId } }
  });

  res.status(204).send();
});


export default router;
