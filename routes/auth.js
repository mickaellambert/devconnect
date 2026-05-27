// ═══════════════════════════════════════════════════════════════
// 📋 ATELIER J4 — TROUS À CODER DANS CE FICHIER
// ═══════════════════════════════════════════════════════════════
//   🔧 ATELIER 1 — Étape 2A : /register (hash bcrypt)          ↓ ligne ~70
//   🔧 ATELIER 1 — Étape 2B : /login    (bcrypt.compare)       ↓ ligne ~110
//   🔧 ATELIER 1 — Étape 3  : ne pas exposer le hash           ↓ helper + 2 lignes
//   🔧 ATELIER 2            : remplacer le token fake par JWT  ↑ après atelier 1
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { z } from 'zod';
// 🔧 ATELIER 1 — import à ajouter :   import bcrypt from 'bcrypt';
// 🔧 ATELIER 2 — import à ajouter :   import jwt from 'jsonwebtoken';
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
// 🔧 ATELIER 1 — Étape 3 : Helper toPublicUser (à coder)
// ═══════════════════════════════════════════════════════════════
// Une fois les passwords hashés en DB, on ne veut pas les ré-exposer
// via l'API. Écris un petit helper qui retire la clé `password` d'un
// objet user avant de le renvoyer au client. Tu l'utiliseras dans les
// `res.json(...)` de /register et /login (voir marqueurs Étape 3).
//
// Concept rapide :
//   • input  : { id, username, email, password, createdAt }
//   • output : { id, username, email,           createdAt }
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 1 — Étape 2A : POST /auth/register
// ═══════════════════════════════════════════════════════════════
// Aujourd'hui on récupère le `password` du body mais on l'IGNORE.
// On va le hasher avec bcrypt avant de le stocker en DB.
//
// Pattern à écrire toi-même (3 modifs, dans l'ordre) :
//   1. Récupère aussi `password` dans le destructuring de `result.data`.
//   2. Hashe-le avec `bcrypt.hash(password, 10)` avant le `create`.
//   3. Ajoute `password: <le hash>` dans le `data:` du `prisma.user.create`.
//
// 💡 Le "10" est le saltRounds (cf. Notion). Plus c'est élevé, plus
//    c'est cher à calculer (pour toi ET pour un attaquant).
//
// Tester (Thunder Client) :
//   POST /auth/register
//   Body : { "username": "test", "email": "test@x.io", "password": "demo123" }
//   → 201 + token, et en DB (Prisma Studio) le password = "$2b$10$…"
// ═══════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { username, email } = result.data;
  // 🔧 ÉTAPE 2A.1 — récupère aussi `password` ci-dessus.

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
  }

  // 🔧 ÉTAPE 2A.2 — hashe le password ici.

  const newUser = await prisma.user.create({
    data: { username, email }
    // 🔧 ÉTAPE 2A.3 — ajoute le hash dans le `data:` ↑
  });

  await sendWelcomeEmail(newUser);

  res.status(201).json({
    // 🔧 ATELIER 2 — remplace `user-${newUser.id}` par un vrai JWT (jwt.sign).
    token: `user-${newUser.id}`,
    // 🔧 ÉTAPE 3 — remplace `newUser` par `toPublicUser(newUser)`.
    user: newUser
  });
});


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 1 — Étape 2B : POST /auth/login
// ═══════════════════════════════════════════════════════════════
// Aujourd'hui la route trouve l'user par email et renvoie un token
// SANS vérifier le password → faille majeure. On corrige avec
// `bcrypt.compare(motDePasseEnvoyé, hashEnDB)` qui renvoie true/false.
//
// Pattern à écrire toi-même (2 modifs) :
//   1. Récupère aussi `password` dans le destructuring de `result.data`.
//   2. Après le `findUnique` (et la vérif que l'user existe), compare
//      le password reçu avec `user.password`. Renvoie 401 si invalide.
//
// 💡 `user.password` est un HASH, pas le mot de passe en clair. On ne
//    peut pas faire `===` — il faut passer par `bcrypt.compare` qui
//    sait re-hasher avec le bon sel et comparer.
//
// Tester (Thunder Client) :
//   POST /auth/login   { email, password: "demo" }   → 200 + token
//   POST /auth/login   { email, password: "wrong" } → 401
// ═══════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { email } = result.data;
  // 🔧 ÉTAPE 2B.1 — récupère aussi `password` ci-dessus.

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides" });
  }

  // 🔧 ÉTAPE 2B.2 — compare le password reçu avec user.password
  //                (`bcrypt.compare(...)`). 401 si invalide.

  res.json({
    // 🔧 ATELIER 2 — remplace `user-${user.id}` par un vrai JWT (jwt.sign).
    token: `user-${user.id}`,
    // 🔧 ÉTAPE 3 — remplace `user` par `toPublicUser(user)`.
    user
  });
});

export default router;
