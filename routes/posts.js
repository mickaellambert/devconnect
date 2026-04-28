import express from 'express';
import { posts } from '../data/posts.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// ✅ EXEMPLE FOURNI : GET /posts
// ═══════════════════════════════════════════════════════════════
// Cette route renvoie la liste de tous les posts (la "timeline").
// Elle te sert de modèle pour les routes suivantes.
//
// Méthode HTTP : GET (on lit des données)
// URL          : /posts
// Headers      : Authorization: Bearer user-X (injecté par le front ;
//                à ajouter manuellement dans Thunder Client)
// Réponse      : un tableau de tous les posts au format JSON
// ═══════════════════════════════════════════════════════════════
router.get('/', (req, res) => {
  res.json(posts);
});


// ═══════════════════════════════════════════════════════════════
// 🔧 À TOI DE JOUER : GET /posts/:id
// ═══════════════════════════════════════════════════════════════
// Cette route renvoie le détail d'un seul post identifié par son id.
//
// Méthode HTTP : GET
// URL          : /posts/:id        (ex: /posts/3)
// Headers      : Authorization: Bearer user-X (injecté par le front ;
//                à ajouter manuellement dans Thunder Client)
// Réponse      : l'objet post au format JSON
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Récupère l'id depuis l'URL.
//    👉 Indice : req.params.id
//    👉 Attention : req.params.id est une string, convertis-le avec Number()
//
// 2. Trouve le post correspondant dans le tableau `posts`.
//    👉 Indice : utilise .find() sur le tableau
//       posts.find(p => p.id === id)
//
// 3. Si le post n'existe pas, renvoie un statut 404 avec un message :
//    👉 res.status(404).json({ error: "Post non trouvé" })
//
// 4. Sinon, renvoie le post au format JSON.
//    👉 res.json(post)
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client :
//   Méthode  : GET
//   URL      : http://localhost:4000/posts/3
//   Headers  : Authorization: Bearer user-1
// ═══════════════════════════════════════════════════════════════
router.get('/:id', (req, res) => {
  // ton code ici
});


// ═══════════════════════════════════════════════════════════════
// 🔧 À TOI DE JOUER : POST /posts
// ═══════════════════════════════════════════════════════════════
// Cette route crée un nouveau post.
//
// Méthode HTTP : POST (on crée une nouvelle ressource)
// URL          : /posts
// Headers      : Authorization: Bearer user-X (injecté par le front ;
//                à ajouter manuellement dans Thunder Client)
// Body envoyé  : { "content": "Mon premier post !" }
// Réponse      : le post créé, avec id, likes vides et date générés
//
// 💡 À noter : l'utilisateur qui publie est identifié par le token
// envoyé dans le header Authorization. Le middleware a déjà fait le
// travail → son id est disponible dans `req.user.id`. Pas besoin de
// l'envoyer dans le body : le serveur le connaît déjà.
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Récupère `content` depuis le body de la requête.
//    👉 Indice : req.body.content
//
// 2. Vérifie qu'il est bien présent.
//    👉 Si non, renvoie un statut 400 avec un message :
//       res.status(400).json({ error: "content est requis" })
//
// 3. Génère un nouvel id pour le post.
//    👉 Indice : Math.max(...posts.map(p => p.id)) + 1
//
// 4. Construis l'objet post complet :
//    {
//      id,
//      userId: req.user.id,   ← l'utilisateur authentifié
//      content,
//      likes: [],
//      createdAt: new Date().toISOString()
//    }
//
// 5. Ajoute le nouveau post au tableau `posts`.
//    👉 Indice : posts.push(newPost)
//
// 6. Renvoie le post créé avec le statut 201 (Created).
//    👉 res.status(201).json(newPost)
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client :
//   Méthode  : POST
//   URL      : http://localhost:4000/posts
//   Headers  : Authorization: Bearer user-2
//   Body     : { "content": "Un post écrit par user-2" }
// ═══════════════════════════════════════════════════════════════
router.post('/', (req, res) => {
  // ton code ici
});


// ═══════════════════════════════════════════════════════════════
// 🔧 À TOI DE JOUER : PUT /posts/:id/likes
// ═══════════════════════════════════════════════════════════════
// Cette route permet à l'utilisateur authentifié de liker un post.
//
// 💡 Pourquoi PUT et pas POST ?
// Un "like" est une ressource identifiée par le couple (postId, userId).
// - Le postId vient de l'URL.
// - Le userId vient du token (déjà résolu par le middleware → req.user.id).
// Le client connaît donc l'adresse complète du like avant de l'envoyer.
// Dans ce cas, la norme HTTP recommande PUT, pas POST.
//
// Avantage bonus : PUT est idempotent → liker 2 fois = même résultat
// final, pas d'erreur même si l'utilisateur double-clique sur ❤️.
//
// Méthode HTTP : PUT
// URL          : /posts/:id/likes       (ex: /posts/4/likes)
// Headers      : Authorization: Bearer user-X (injecté par le front ;
//                à ajouter manuellement dans Thunder Client)
// Body envoyé  : aucun
// Réponse      : le post mis à jour
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Récupère l'id du post depuis l'URL (convertis avec Number()).
//    👉 Indice : req.params.id
//
// 2. Récupère l'id de l'utilisateur connecté.
//    👉 Indice : req.user.id   ← déjà prêt grâce au middleware
//
// 3. Trouve le post correspondant dans le tableau `posts`.
//    👉 Si le post n'existe pas :
//       res.status(404).json({ error: "Post non trouvé" })
//
// 4. Vérifie si le user a déjà liké ce post.
//    👉 Indice : post.likes.includes(userId)
//    👉 Si oui : ne rien ajouter, mais renvoyer le post avec status 200
//       (PUT est idempotent : 2 appels = même résultat final)
//       return res.status(200).json(post)
//
// 5. Sinon, ajoute le userId au tableau `likes` du post.
//    👉 Indice : post.likes.push(userId)
//
// 6. Renvoie le post mis à jour avec le statut 201 (Created).
//    👉 res.status(201).json(post)
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client :
//   Méthode  : PUT
//   URL      : http://localhost:4000/posts/4/likes
//   Headers  : Authorization: Bearer user-2
//   Body     : (aucun)
// ═══════════════════════════════════════════════════════════════
router.put('/:id/likes', (req, res) => {
  // ton code ici
});


// ═══════════════════════════════════════════════════════════════
// 🎁 BONUS : DELETE /posts/:id/likes
// ═══════════════════════════════════════════════════════════════
// Pour ceux qui ont fini en avance ! Cette route permet à l'utilisateur
// authentifié de retirer son like d'un post.
//
// 💡 Note la symétrie avec la route PUT : même URL, verbe différent.
// C'est ça, le REST : une URL = une ressource, les verbes expriment
// les actions qu'on veut faire sur elle.
//
// Méthode HTTP : DELETE
// URL          : /posts/:id/likes       (ex: /posts/1/likes)
// Headers      : Authorization: Bearer user-X (injecté par le front ;
//                à ajouter manuellement dans Thunder Client)
// Body envoyé  : aucun
// Réponse      : 204 No Content si succès, 404 si le like n'existait pas
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Récupère l'id du post (URL) et l'id du user (req.user.id).
//
// 2. Trouve le post correspondant.
//    👉 Si le post n'existe pas : 404 "Post non trouvé"
//
// 3. Vérifie que le user avait bien liké ce post.
//    👉 Indice : post.likes.includes(userId)
//    👉 Si non : res.status(404).json({ error: "Aucun like à supprimer" })
//
// 4. Retire le userId du tableau `likes`.
//    👉 Indice : utilise .filter() pour créer un nouveau tableau
//       post.likes = post.likes.filter(id => id !== userId)
//
// 5. Renvoie un statut 204 (No Content), sans corps de réponse.
//    👉 res.status(204).send()
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client :
//   Méthode  : DELETE
//   URL      : http://localhost:4000/posts/1/likes
//   Headers  : Authorization: Bearer user-2
// ═══════════════════════════════════════════════════════════════
router.delete('/:id/likes', (req, res) => {
  // ton code ici
});


export default router;
