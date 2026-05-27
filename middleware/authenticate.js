import { prisma } from '../prisma/client.js';
// 🔧 ATELIER 2 — import à ajouter :   import jwt from 'jsonwebtoken';

// ═══════════════════════════════════════════════════════════════
// Middleware d'authentification — VERSION FAKE héritée du J3
// ═══════════════════════════════════════════════════════════════
// Lit le header `Authorization: Bearer <token>` et identifie l'user.
// Aujourd'hui le token est de la forme `user-1`, `user-2`… → trivial
// à falsifier. À l'atelier 2 on remplace par une vraie vérification
// de JWT signé.
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 2 — Remplacer le token fake par un vrai JWT.verify
// ═══════════════════════════════════════════════════════════════
//
// (Tout ce qui est "qu'est-ce qu'un JWT, signature, sub…" est dans
//  le vocabulaire éclair du Notion. Ici on se concentre sur le HOW.)
//
// Remplace le bloc `const match = token.match(...)` ci-dessous par
// 3 étapes à écrire toi-même :
//
//   a. `jwt.verify(token, process.env.JWT_SECRET)` → te renvoie le
//      payload signé (notamment `payload.sub` = l'id du user).
//
//   b. Utilise `payload.sub` pour faire le `findUnique` sur User et
//      assigner `req.user` si le user existe.
//
//   c. ENVELOPPE le tout dans un `try/catch`. Si tu oublies, un
//      token invalide ou expiré fait crasher le middleware (→ 500
//      au lieu de 401). Catch vide : on laisse `req.user` undefined
//      et `requireAuth` renverra 401 plus loin.
//
// Tester :
//   • GET /users/1 avec un JWT valide → 200
//   • Modifie 1 caractère du JWT → 401
//   • Bearer user-1 (l'ancien fake) → 401
// ═══════════════════════════════════════════════════════════════

export async function authenticate(req, res, next) {
  const header = req.header('Authorization');

  if (header && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);

    // 🔧 ATELIER 2 — remplace le bloc ci-dessous par jwt.verify + try/catch
    const match = token.match(/^user-(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) {
        req.user = user;
      }
    }
  }

  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentification requise" });
  }
  next();
}
