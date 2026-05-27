import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';

// ═══════════════════════════════════════════════════════════════
// Middleware d'authentification — JWT
// ═══════════════════════════════════════════════════════════════
// Lit le header `Authorization: Bearer <jwt>` envoyé par le client,
// vérifie la signature + l'expiration via `jwt.verify`, et attache
// l'utilisateur correspondant à `req.user`.
//
// Sur token invalide ou expiré, `jwt.verify` lève une erreur → on
// l'attrape (catch vide) et `req.user` reste undefined → `requireAuth`
// renverra 401 plus loin (réponse propre, pas un 500).
// ═══════════════════════════════════════════════════════════════

export async function authenticate(req, res, next) {
  const header = req.header('Authorization');

  if (header && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (user) {
        req.user = user;
      }
    } catch {
      // Token invalide ou expiré → req.user reste undefined → 401 via requireAuth.
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
