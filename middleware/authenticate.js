import { users } from '../data/users.js';

// ═══════════════════════════════════════════════════════════════
// Middleware d'authentification — VERSION FAKE pour J1 et J2
// ═══════════════════════════════════════════════════════════════
// Ce middleware lit le header `Authorization: Bearer user-<id>` envoyé
// par le client, retrouve le user correspondant et l'attache à la
// requête sous `req.user`.
//
// ⚠️ Version temporaire, non sécurisée (n'importe qui peut écrire
// `Bearer user-2` et se faire passer pour n'importe qui). Au J3, on
// remplacera ce middleware par une vraie vérification de jeton JWT
// signé cryptographiquement — le contrat HTTP ne changera pas.
//
// Usage :
//   app.use(authenticate);            → tente d'identifier l'user
//   app.use('/x', requireAuth, ...);  → refuse si pas authentifié
// ═══════════════════════════════════════════════════════════════

export function authenticate(req, res, next) {
  const header = req.header('Authorization');

  if (header && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);
    const match = token.match(/^user-(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      const user = users.find(u => u.id === id);
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
