// ═══════════════════════════════════════════════════════════════
// 📋 ATELIERS DANS CE FICHIER (par ordre conseillé)
// ═══════════════════════════════════════════════════════════════
//   1. 🔧 ATELIER 2 (zod)  — valider POST /auth/register   ↓ ligne ~38
//   2. 🔧 ATELIER 3 (mail) — appeler sendWelcomeEmail      ↓ ligne ~70
//   🎁 Bonus 2 (zod)       — valider POST /auth/login      ↓ ligne ~95
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { users } from '../data/users.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════
// Routes d'authentification — STUBS pour J1 et J2
// ═══════════════════════════════════════════════════════════════
// Ces deux routes ont été fournies au J1 (le pourquoi/comment du
// login arrivera au J3). Aujourd'hui on en profite pour :
//
//   • valider proprement leurs inputs avec zod (ATELIER 2)
//   • envoyer un mail de bienvenue après inscription (ATELIER 3)
//
// La logique métier elle-même (création du user, génération du token)
// reste inchangée — c'est juste enrichi.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 2 (zod) — À TOI DE JOUER : valider POST /auth/register
// ═══════════════════════════════════════════════════════════════
// Remplace la validation manuelle (les `if (!username || !email…)`)
// par un schéma zod plus expressif.
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Importe zod en haut du fichier (sous l'import express) :
//    👉 import { z } from 'zod';
//
// 2. Définis le schéma juste avant la route :
//    👉 const RegisterSchema = z.object({
//         username: z.string().min(3, "username doit faire au moins 3 caractères").max(20),
//         email:    z.string().email("email invalide"),
//         password: z.string().min(6, "password doit faire au moins 6 caractères")
//       });
//
// 3. Dans la route, remplace les `if (!...)` par un safeParse :
//    👉 const result = RegisterSchema.safeParse(req.body);
//       if (!result.success) {
//         return res.status(400).json({ error: result.error.issues[0].message });
//       }
//       const { username, email, password } = result.data;
//
// 💡 Le password est validé sur sa forme (longueur min) mais reste
//    ignoré au J2 pour la suite (cf. J3 pour la sécurisation réelle).
// ═══════════════════════════════════════════════════════════════
//
// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 3 (mail) — À TOI DE JOUER : appeler sendWelcomeEmail
// ═══════════════════════════════════════════════════════════════
// Une fois ton service email prêt (cf. services/email.js), branche-le
// ici : à chaque création d'un nouveau user, on lui envoie un mail
// de bienvenue.
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Importe la fonction en haut du fichier :
//    👉 import { sendWelcomeEmail } from '../services/email.js';
//
// 2. Rends la route `register` ASYNC (ajoute `async` avant `(req, res)`).
//
// 3. Après `users.push(newUser)`, appelle la fonction :
//    👉 await sendWelcomeEmail(newUser);
//
// ⚠️ Si tu oublies `async` sur la route, le `await` plantera.
// ⚠️ Si tu oublies `await`, le mail partira "en arrière-plan" sans
//    que tu saches s'il a réussi ou échoué (pas grave fonctionnellement
//    mais tu n'auras pas le log preview Ethereal au bon moment).
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Inscris-toi via le front avec un email bidon. Regarde la console
// serveur : tu dois voir le lien preview Ethereal. Clique → tu vois
// ton mail.
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


// ═══════════════════════════════════════════════════════════════
// 🎁 BONUS — ATELIER 2 (zod) : valider POST /auth/login
// ═══════════════════════════════════════════════════════════════
// Si tu as fini les ateliers obligatoires et qu'il te reste du temps,
// applique zod aussi à la route de login.
//
// 👉 const LoginSchema = z.object({
//      email:    z.string().email("email invalide"),
//      password: z.string().min(1, "password requis")
//    });
//
// (Pas besoin de min(6) sur le password ici : on accepte tout password
// non vide. La vraie vérif se fera au J3.)
// ═══════════════════════════════════════════════════════════════

// POST /auth/login
// Body : { email, password }
// Réponse : { token, user }
router.post('/login', (req, res) => {
  const { email } = req.body;
  // 📌 Au J1-J2, le password est accepté sans vérification.
  //    La sécurisation (hash bcrypt + signature JWT) arrive au J3.

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
