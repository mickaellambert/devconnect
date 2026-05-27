import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();

// Colonnes "publiques" du User — on n'expose JAMAIS `password` via l'API.
// Plus efficace que fetcher tout puis stripper : on dit à Prisma de ne
// même pas sélectionner la colonne.
const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
};


// ═══════════════════════════════════════════════════════════════
// GET /users → liste de tous les users (sans le hash password)
// ═══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany({ select: publicUserSelect });
  res.json(users);
});


// ═══════════════════════════════════════════════════════════════
// GET /users/:id → détail d'un user (sans le hash password)
// ═══════════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    return res.status(404).json({ error: "User non trouvé" });
  }

  res.json(user);
});


export default router;
