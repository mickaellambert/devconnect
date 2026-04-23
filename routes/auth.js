import express from 'express';
import { users } from '../data/users.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// Routes d'authentification — STUBS pour J1 et J2
// ═══════════════════════════════════════════════════════════════
// Ces deux routes sont FOURNIES au J1. Elles simulent l'inscription
// et la connexion sans sécuriser quoi que ce soit (le password n'est
// même pas vérifié). Au J3, leur corps sera réécrit avec bcrypt et
// JWT, mais leur signature HTTP ne changera pas.
//
// Elles ne font PAS partie de l'atelier du J1 — ne les touchez pas.
// ═══════════════════════════════════════════════════════════════

// POST /auth/register
// Body : { username, email, password }
// Réponse : { token, user }
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email et password sont requis" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
  }

  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    username,
    email,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);

  res.status(201).json({
    token: `user-${newUser.id}`,
    user: newUser
  });
});

// POST /auth/login
// Body : { email, password }
// Réponse : { token, user }
router.post('/login', (req, res) => {
  const { email } = req.body;
  // 📌 Au J1, le password est accepté tel quel sans vérification.
  //    La sécurisation (hash bcrypt + signature JWT) arrivera au J3.

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  res.json({
    token: `user-${user.id}`,
    user
  });
});

export default router;
