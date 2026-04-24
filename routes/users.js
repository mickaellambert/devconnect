import express from 'express';
import { users } from '../data/users.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// GET /users → liste de tous les users
// ═══════════════════════════════════════════════════════════════
router.get('/', (req, res) => {
  res.json(users);
});


// ═══════════════════════════════════════════════════════════════
// GET /users/:id → détail d'un user
// ═══════════════════════════════════════════════════════════════
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User non trouvé" });
  }

  res.json(user);
});


export default router;
