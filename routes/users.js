// ═══════════════════════════════════════════════════════════════
// 📋 ATELIERS DANS CE FICHIER
// ═══════════════════════════════════════════════════════════════
//   ✅ EXEMPLE — GET /users   (déjà migré vers Prisma)   ↓ ligne ~30
//   🔧 ATELIER 1 — GET /users/:id (à migrer)             ↓ ligne ~55
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import { prisma } from '../prisma/client.js';
import { users } from '../data/users.js'; // ← legacy : à supprimer une fois TOUTES les routes migrées

const router = express.Router();


// ═══════════════════════════════════════════════════════════════
// ✅ EXEMPLE FOURNI — GET /users
// ═══════════════════════════════════════════════════════════════
// Cette route a été migrée vers Prisma pour te servir de MODÈLE.
// Compare avec ce que tu avais hier :
//
//   // J2 : on lit le tableau en mémoire
//   res.json(users);
//
//   // J3 : on lit la base de données via Prisma
//   const users = await prisma.user.findMany();
//   res.json(users);
//
// 💡 Notes importantes :
//   • La fonction est devenue `async` (Prisma renvoie une Promise)
//   • `prisma.user.findMany()` retourne TOUS les users
//   • C'est exactement le même résultat côté HTTP, mais les données
//     viennent maintenant d'une vraie base SQLite, pas d'un tableau.
//
// 🔠 Petite convention de nommage Prisma à connaître :
//     • Le model dans le schéma s'écrit  `User`        (PascalCase, singulier)
//     • Le delegate JS s'appelle         `prisma.user` (camelCase, singulier)
//     • Le tableau legacy J2 s'appelle   `users`       (pluriel)
//   La variable locale `const users = await prisma.user.findMany()`
//   (pluriel) fait juste son taf — elle masque le legacy importé en
//   haut, le temps qu'on supprime cet import en fin d'atelier.
// ═══════════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 1 — À TOI DE JOUER : migrer GET /users/:id
// ═══════════════════════════════════════════════════════════════
// Cette route lit un user par son id. Au J1-J2, on faisait :
//
//   const user = users.find(u => u.id === id);
//
// Aujourd'hui, on remplace `users.find(...)` par une requête Prisma.
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Transforme la fonction en `async` (Prisma renvoie des Promises) :
//    👉 router.get('/:id', async (req, res) => { ... })
//
// 2. Remplace `users.find(...)` par un appel Prisma :
//    👉 const user = await prisma.user.findUnique({
//         where: { id }
//       });
//
// 3. Le reste ne change pas : si `user` est null → 404, sinon res.json.
//
// 💡 `findUnique` cherche par une colonne UNIQUE (id, email…).
//    Si la colonne n'est pas unique, utilise `findFirst` à la place.
//
// ⚠️ N'oublie pas `await`. Sans lui, `user` sera une Promise, pas un
//    objet, et ton test `if (!user)` sera toujours faux.
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Dans Thunder Client (header Authorization: Bearer user-1) :
//   GET http://localhost:4000/users/2     → 200 + bob_backend
//   GET http://localhost:4000/users/999   → 404
//
// 💡 Le format `Bearer user-1` est un **token fake** du J3 : le chiffre
//    après `user-` est juste l'id du user qu'on prétend être. C'est
//    pratique pour tester mais pas sécurisé (n'importe qui peut écrire
//    `user-2` et se faire passer pour Bob). Au J4, ce sera remplacé
//    par un vrai JWT signé.
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
