import express from 'express';
import { users } from '../data/users.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// ✅ EXEMPLE FOURNI : GET /users
// ═══════════════════════════════════════════════════════════════
// Cette route renvoie la liste de tous les users.
// Elle te sert de modèle pour les routes suivantes.
//
// Méthode HTTP : GET (on lit des données)
// URL          : /users
// Headers      : Authorization: Bearer user-X (injecté par le front ;
//                à ajouter manuellement dans Thunder Client)
// Réponse      : un tableau de tous les users au format JSON
// ═══════════════════════════════════════════════════════════════
router.get('/', (req, res) => {
  res.json(users);
});


// ═══════════════════════════════════════════════════════════════
// 🔧 À TOI DE JOUER : GET /users/:id
// ═══════════════════════════════════════════════════════════════
// Cette route renvoie le détail d'un seul user identifié par son id.
//
// Méthode HTTP : GET
// URL          : /users/:id        (ex: /users/2)
// Headers      : Authorization: Bearer user-X (injecté par le front ;
//                à ajouter manuellement dans Thunder Client)
// Réponse      : l'objet user au format JSON
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Récupère l'id depuis l'URL.
//    👉 Indice : req.params.id
//    👉 Attention : req.params.id est une string, convertis-le avec Number()
//
// 2. Trouve le user correspondant dans le tableau `users`.
//    👉 Indice : utilise .find() sur le tableau
//       users.find(u => u.id === id)
//
// 3. Si le user n'existe pas, renvoie un statut 404 avec un message :
//    👉 res.status(404).json({ error: "User non trouvé" })
//
// 4. Sinon, renvoie le user au format JSON.
//    👉 res.json(user)
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client :
//   Méthode  : GET
//   URL      : http://localhost:4000/users/2
//   Headers  : Authorization: Bearer user-1
// ═══════════════════════════════════════════════════════════════
router.get('/:id', (req, res) => {
  // ton code ici
});


export default router;
