import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 1 — Étape 3 (suite) : ne pas exposer le hash sur les GET
// ═══════════════════════════════════════════════════════════════
// `GET /users` et `GET /users/:id` renvoient l'objet user complet →
// le hash bcrypt fuiterait. Ici on a un raccourci propre : dire à
// Prisma de ne PAS sélectionner la colonne `password` du tout.
//
// À faire :
//   1. Crée une constante `publicUserSelect` (au-dessus des routes)
//      qui liste les colonnes publiques : id, username, email, createdAt.
//   2. Ajoute `select: publicUserSelect` aux deux appels Prisma
//      ci-dessous (findMany et findUnique).
//
// 💡 Différence avec le helper `toPublicUser` de auth.js :
//      • toPublicUser → on FETCH le password puis on le strip (nécessaire
//                       côté auth pour pouvoir faire `bcrypt.compare`).
//      • select        → on ne FETCH MÊME PAS le password (plus efficace,
//                       quand on n'en a pas besoin, comme ici).
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// GET /users → liste de tous les users
// ═══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  // 🔧 ÉTAPE 3 — ajoute `{ select: publicUserSelect }` dans findMany.
  const users = await prisma.user.findMany();
  res.json(users);
});


// ═══════════════════════════════════════════════════════════════
// GET /users/:id → détail d'un user
// ═══════════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  // 🔧 ÉTAPE 3 — ajoute `select: publicUserSelect` dans findUnique.
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return res.status(404).json({ error: "User non trouvé" });
  }

  res.json(user);
});


export default router;
