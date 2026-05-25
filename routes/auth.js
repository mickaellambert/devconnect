// ═══════════════════════════════════════════════════════════════
// 📋 ATELIERS DANS CE FICHIER
// ═══════════════════════════════════════════════════════════════
//   🔧 ATELIER 1 — POST /auth/register (à migrer vers Prisma)   ↓ ligne ~50
//   🔧 ATELIER 1 — POST /auth/login (à migrer vers Prisma)      ↓ ligne ~125
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { users } from '../data/users.js'; // ← legacy : à supprimer une fois TOUTES les routes migrées
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
// 🔧 ATELIER 1 — À TOI DE JOUER : migrer POST /auth/register vers Prisma
// ═══════════════════════════════════════════════════════════════
// Cette route crée un nouvel utilisateur. Aujourd'hui elle écrit dans
// le tableau `users` (en mémoire). On va la faire écrire en BASE.
//
// ⚠️ Cette route a DEUX endroits à modifier — fais-les un par un.
//
// ─── SOUS-ÉTAPE A : vérification d'unicité de l'email ─────────
//
//    Remplace :
//       if (users.find(u => u.email === email)) { ... }
//
//    Par :
//       const existing = await prisma.user.findUnique({ where: { email } });
//       if (existing) { ... }
//
//    💡 Même pattern que POST /login : un `findUnique` par email.
//
// ─── SOUS-ÉTAPE B : création du user ──────────────────────────
//
//    Remplace :
//       const newUser = {
//         id: Math.max(...users.map(u => u.id)) + 1,
//         username, email,
//         createdAt: new Date().toISOString()
//       };
//       users.push(newUser);
//
//    Par :
//       const newUser = await prisma.user.create({
//         data: { username, email }
//       });
//
// 💡 `prisma.user.create()` :
//    • génère l'id auto-incrémenté (grâce à @default(autoincrement()))
//    • génère le createdAt (grâce à @default(now()))
//    • renvoie l'objet créé complet (avec id et createdAt remplis)
//
// ⚠️ Pas besoin de `Math.max(...) + 1` : la DB s'en charge.
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client :
//   POST http://localhost:4000/auth/register
//   Body : { "username": "nouveau", "email": "nouveau@test.io", "password": "demo123" }
//   → 201 + un user avec un id auto-généré + un mail envoyé
//
// Vérifie aussi qu'on rejette les doublons :
//   POST {même body} → 409 (l'email existe déjà)
// ═══════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  const { username, email } = result.data;
  // 📌 password validé sur sa forme mais ignoré côté logique au J3.
  //    La sécurisation (hash bcrypt + JWT) arrivera au J4.

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

  await sendWelcomeEmail(newUser);

  res.status(201).json({
    token: `user-${newUser.id}`,
    user: newUser
  });
});


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 1 — À TOI DE JOUER : migrer POST /auth/login vers Prisma
// ═══════════════════════════════════════════════════════════════
// Cette route cherche un user par email. Au J1-J2, on faisait :
//
//   const user = users.find(u => u.email === email);
//
// On la remplace par une requête Prisma `findUnique` sur la colonne
// email (qui est marquée `@unique` dans le schéma).
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Rends la fonction `async` (Prisma renvoie des Promises).
//    👉 router.post('/login', async (req, res) => { ... })
//
// 2. Remplace `users.find(...)` par :
//    👉 const user = await prisma.user.findUnique({ where: { email } });
//
// 3. Le reste ne change pas : si `user` null → 401, sinon res.json.
//
// 💡 Comme l'email est `@unique` dans le schéma, on peut utiliser
//    `findUnique` (rapide, indexé). Sinon il faudrait `findFirst`.
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client :
//   POST http://localhost:4000/auth/login
//   Body : { "email": "alice@devconnect.io", "password": "demo" }
//   → 200 + token user-1
//
//   Body : { "email": "nobody@x.io", "password": "demo" }
//   → 401 (Identifiants invalides)
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
