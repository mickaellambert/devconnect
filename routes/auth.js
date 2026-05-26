import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { sendWelcomeEmail } from '../services/email.js';

const router = express.Router();

const RegisterSchema = z.object({
  username: z.string().min(3, "username doit faire au moins 3 caractères").max(20),
  email:    z.email("email invalide"),
  password: z.string().min(6, "password doit faire au moins 6 caractères")
});

const LoginSchema = z.object({
  email:    z.email("email invalide"),
  password: z.string().min(1, "password requis")
});


// ═══════════════════════════════════════════════════════════════
// POST /auth/register (via Prisma)
// ═══════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { username, email } = result.data;
  // 📌 password validé sur sa forme mais ignoré côté logique au J3.
  //    La sécurisation (hash bcrypt + JWT) arrivera au J4.

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
  }

  const newUser = await prisma.user.create({
    data: { username, email }
  });

  await sendWelcomeEmail(newUser);

  res.status(201).json({
    token: `user-${newUser.id}`,
    user: newUser
  });
});


// ═══════════════════════════════════════════════════════════════
// POST /auth/login (via Prisma)
// ═══════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { email } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  res.json({
    token: `user-${user.id}`,
    user
  });
});

export default router;
