// ═══════════════════════════════════════════════════════════════
// prisma/client.js — Une seule instance Prisma partagée
// ═══════════════════════════════════════════════════════════════
// On crée UNE SEULE fois le client Prisma ici, et on l'importe partout
// dans l'app. (En anglais on appelle ça un *singleton*.)
//
// 💡 Pourquoi ne pas faire `new PrismaClient()` directement dans
//    chaque fichier qui en a besoin ?
//    Parce que chaque `new PrismaClient()` ouvre une NOUVELLE connexion
//    à la DB. En multipliant les instances, on consomme inutilement
//    des ressources et on peut atteindre la limite de connexions
//    (typiquement en dev, quand nodemon recharge le serveur).
//
// → Pour utiliser Prisma dans un fichier :
//     import { prisma } from '../prisma/client.js';
//     const user = await prisma.user.findUnique({ where: { id: 1 } });
//
// (Tu n'as pas à modifier ce fichier pendant l'atelier.)
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
