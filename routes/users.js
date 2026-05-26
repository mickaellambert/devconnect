import express from 'express';
import { prisma } from '../prisma/client.js';

const router = express.Router();


// ═══════════════════════════════════════════════════════════════
// GET /users → liste de tous les users (via Prisma)
// ═══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


// ═══════════════════════════════════════════════════════════════
// GET /users/:id → détail d'un user (via Prisma)
// ═══════════════════════════════════════════════════════════════
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return res.status(404).json({ error: "User non trouvé" });
  }

  res.json(user);
});


export default router;
