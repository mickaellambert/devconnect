import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

// Construit un JWT signé pour un user donné.
// Le payload contient juste `sub` (id du user, claim standard JWT).
function signTokenFor(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

// Retire le hash du password avant de renvoyer un user au client.
function toPublicUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}


// ═══════════════════════════════════════════════════════════════
// POST /auth/register (Prisma + bcrypt + JWT)
// ═══════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { username, email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { username, email, password: passwordHash }
  });

  await sendWelcomeEmail(newUser);

  res.status(201).json({
    token: signTokenFor(newUser.id),
    user: toPublicUser(newUser)
  });
});


// ═══════════════════════════════════════════════════════════════
// POST /auth/login (Prisma + bcrypt.compare + JWT)
// ═══════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  res.json({
    token: signTokenFor(user.id),
    user: toPublicUser(user)
  });
});

export default router;
