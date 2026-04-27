// 🔧 ATELIER 1 (.env) — étape 1 : ajoute ici l'import de dotenv.
//
// Cette ligne DOIT être TOUT EN HAUT du fichier, AVANT tous les
// autres imports. Sinon les imports plus bas ne verront pas les
// variables d'environnement (cf. doc Notion "le piège").
//
// 👉 import 'dotenv/config';

import express from 'express';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import { authenticate, requireAuth } from './middleware/authenticate.js';

const app = express();

// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 1 (.env) — étape 2 : remplace cette constante
// ═══════════════════════════════════════════════════════════════
// Aujourd'hui on sort la configuration du code. Le port ne sera plus
// une constante codée en dur ici, mais une variable d'environnement
// lue depuis ton fichier `.env`.
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Vérifie que ton fichier `.env` existe à la racine du projet.
//    Sinon : cp .env.example .env
//
// 2. Vérifie que `import 'dotenv/config'` est bien la première ligne
//    de ce fichier (étape 1 ci-dessus).
//
// 3. Remplace la constante PORT ci-dessous pour qu'elle lise la
//    variable d'environnement, avec 4000 en valeur par défaut.
//    👉 Number(process.env.PORT) || 4000
//
// ⚠️ ATTENTION : process.env.X est TOUJOURS une string. Si tu
//    attends un nombre, convertis-le avec Number(). C'est un piège
//    classique qu'on retrouvera à l'atelier 3 (port SMTP).
//
// ─── POUR VÉRIFIER ─────────────────────────────────────────────
// Modifie temporairement ton .env : PORT=4001
// Relance le serveur (npm run dev). Il doit démarrer sur 4001.
// Remets PORT=4000 ensuite.
// ═══════════════════════════════════════════════════════════════

const PORT = 4000;

// Permet à Express de lire le JSON reçu dans le body des requêtes.
app.use(express.json());

// Middleware d'authentification : lit le header Authorization: Bearer
// et attache req.user si le token est valide.
app.use(authenticate);

// Routes d'auth publiques (pas besoin d'être connecté).
app.use('/auth', authRouter);

// Routes protégées : toute requête doit présenter un token valide.
app.use('/users', requireAuth, usersRouter);
app.use('/posts', requireAuth, postsRouter);

// Sert le front (HTML/CSS/JS) à la racine.
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`✅ Serveur DevConnect lancé sur http://localhost:${PORT}`);
});
