import express from 'express';
import { z } from 'zod';
import { users } from '../data/users.js';

const router = express.Router();

const RegisterSchema = z.object({
  username: z.string().min(3, "username doit faire au moins 3 caractères").max(20),
  email:    z.string().email("email invalide"),
  password: z.string().min(6, "password doit faire au moins 6 caractères")
});

const LoginSchema = z.object({
  email:    z.string().email("email invalide"),
  password: z.string().min(1, "password requis")
});


// ═══════════════════════════════════════════════════════════════
// POST /auth/register
// Body : { username, email, password }   (validé par RegisterSchema)
// Réponse : { token, user }
// ═══════════════════════════════════════════════════════════════
router.post('/register', (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { username, email } = result.data;
  // 📌 password validé sur sa forme mais ignoré côté logique au J2.
  //    La sécurisation (hash bcrypt + JWT) arrivera au J3.

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


// ═══════════════════════════════════════════════════════════════
// POST /auth/login
// Body : { email, password }   (validé par LoginSchema)
// Réponse : { token, user }
// ═══════════════════════════════════════════════════════════════
router.post('/login', (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { email } = result.data;

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
