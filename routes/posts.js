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
// POST /posts → création d'un nouveau post
// Body : { content }    ← userId vient du token (req.user.id)
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

  // Idempotence : si le like existe déjà, on renvoie le post tel quel.
  // Un PUT répété doit donner le même état final, sans erreur.
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
