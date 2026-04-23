import express from 'express';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import { authenticate, requireAuth } from './middleware/authenticate.js';

const app = express();
const PORT = 4000;

// Permet à Express de lire le JSON reçu dans le body des requêtes.
// (On reparlera du concept de "middleware" plus en détail plus tard.)
app.use(express.json());

// Middleware d'authentification : lit le header Authorization: Bearer
// et attache req.user si le token est valide. Ne bloque pas — c'est
// requireAuth qui rejette les requêtes non authentifiées.
app.use(authenticate);

// Routes d'auth publiques (pas besoin d'être connecté).
app.use('/auth', authRouter);

// Routes protégées : toute requête doit présenter un token valide.
app.use('/users', requireAuth, usersRouter);
app.use('/posts', requireAuth, postsRouter);

// Sert le front (HTML/CSS/JS) à la racine. À lancer :
// navigateur → http://localhost:4000
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`✅ Serveur DevConnect lancé sur http://localhost:${PORT}`);
});
