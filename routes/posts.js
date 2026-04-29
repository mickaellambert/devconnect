import express from 'express';
import { z } from 'zod';
import { posts } from '../data/posts.js';

const router = express.Router();

const PostSchema = z.object({
  content: z.string()
            .min(1, "Le contenu ne peut pas être vide")
            .max(500, "500 caractères max")
});


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
// POST /posts → création d'un nouveau post
// Body : { content }   (validé par PostSchema)
// ═══════════════════════════════════════════════════════════════
router.post('/', (req, res) => {
  const result = PostSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { content } = result.data;

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
