// ═══════════════════════════════════════════════════════════════
// 📋 ATELIERS DANS CE FICHIER (par ordre conseillé)
// ═══════════════════════════════════════════════════════════════
//   1. 🔧 ATELIER 2 (zod) — valider POST /posts            ↓ ligne ~42
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { posts } from '../data/posts.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// GET /posts → timeline (tous les posts)
// ═══════════════════════════════════════════════════════════════
router.get('/', (req, res) => {
  res.json(posts);
});


// ═══════════════════════════════════════════════════════════════
// GET /posts/:id → détail d'un post
// ═══════════════════════════════════════════════════════════════
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) {
    return res.status(404).json({ error: "Post non trouvé" });
  }

  res.json(post);
});


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 2 (zod) — À TOI DE JOUER : valider POST /posts
// ═══════════════════════════════════════════════════════════════
// Hier, tu validais "à la main" avec un `if (!content)`. Aujourd'hui,
// on remplace ça par un schéma zod qui décrit ce qu'on attend dans
// le body, et la lib se charge de tout vérifier (présence, type,
// longueur, etc.).
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Importe zod en haut du fichier (sous l'import express) :
//    👉 import { z } from 'zod';
//
// 2. Définis le schéma juste avant la route ci-dessous :
//    👉 const PostSchema = z.object({
//         content: z.string()
//                   .min(1, "Le contenu ne peut pas être vide")
//                   .max(500, "500 caractères max")
//       });
//
// 3. Dans la route, remplace le `if (!content)` par un safeParse :
//    👉 const result = PostSchema.safeParse(req.body);
//       if (!result.success) {
//         return res.status(400).json({ error: result.error.issues[0].message });
//       }
//       const { content } = result.data;
//
// 💡 Pourquoi `safeParse` et pas `parse` ?
//    `parse` lance une exception si la validation échoue. Tu devrais
//    encadrer avec un try/catch. `safeParse` renvoie un objet
//    `{ success, data, error }` — plus propre, pas de try/catch.
//
// 💡 Bonus : pour récupérer TOUTES les erreurs d'un coup, regarde
//    `result.error.issues` — c'est un tableau.
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client (Authorization: Bearer user-1) :
//   POST /posts   { "content": "" }                  → 400
//   POST /posts   { "content": "abc" }               → 201
//   POST /posts   { "content": "x".repeat(501) }     → 400
// ═══════════════════════════════════════════════════════════════
router.post('/', (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "content est requis" });
  }

  const newPost = {
    id: Math.max(...posts.map(p => p.id)) + 1,
    userId: req.user.id,
    content,
    likes: [],
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});


// ═══════════════════════════════════════════════════════════════
// PUT /posts/:id/likes → liker un post (idempotent)
// ═══════════════════════════════════════════════════════════════
router.put('/:id/likes', (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post non trouvé" });
  }

  if (post.likes.includes(userId)) {
    return res.status(200).json(post);
  }

  post.likes.push(userId);
  res.status(201).json(post);
});


// ═══════════════════════════════════════════════════════════════
// DELETE /posts/:id/likes → retirer son like
// ═══════════════════════════════════════════════════════════════
router.delete('/:id/likes', (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.user.id;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post non trouvé" });
  }

  if (!post.likes.includes(userId)) {
    return res.status(404).json({ error: "Aucun like à supprimer" });
  }

  post.likes = post.likes.filter(id => id !== userId);
  res.status(204).send();
});


export default router;
