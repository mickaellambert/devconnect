import { prisma } from '../prisma/client.js';

// ═══════════════════════════════════════════════════════════════
// Middleware d'authentification — VERSION FAKE pour J3
// ═══════════════════════════════════════════════════════════════
// Ce middleware lit le header `Authorization: Bearer user-<id>` envoyé
// par le client, retrouve le user correspondant en BASE DE DONNÉES
// (via Prisma) et l'attache à la requête sous `req.user`.
//
// ⚠️ Version temporaire, non sécurisée (n'importe qui peut écrire
// `Bearer user-2` et se faire passer pour quelqu'un d'autre). Au J4,
// ce middleware sera remplacé par une vraie vérification de jeton JWT
// signé cryptographiquement — le contrat HTTP ne changera pas.
//
// 💡 Ce fichier est FOURNI DÉJÀ MIGRÉ vers Prisma. Sers-t'en comme
// modèle pour migrer les autres routes : tu vois comment on remplace
// `users.find(u => u.id === id)` par `prisma.user.findUnique(...)`.
// ═══════════════════════════════════════════════════════════════

export async function authenticate(req, res, next) {
  const header = req.header('Authorization');

  if (header && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length);
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
