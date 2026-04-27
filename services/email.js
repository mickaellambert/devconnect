// ═══════════════════════════════════════════════════════════════
// services/email.js — gestion de l'envoi de mails
// ═══════════════════════════════════════════════════════════════
// Ce fichier centralise tout ce qui concerne l'envoi de mails.
// Toute route qui veut envoyer un mail importe une fonction d'ici.
//
// 📋 ATELIERS DANS CE FICHIER (par ordre)
//   1. 🔧 ATELIER 3 — étape 1 : créer le transporter
//   2. 🔧 ATELIER 3 — étape 2 : implémenter sendWelcomeEmail
//   🎁 Bonus 2 — sendLikeNotification (optionnel, pour les rapides)
// ═══════════════════════════════════════════════════════════════

import nodemailer from 'nodemailer';


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 3 — étape 1 : Créer le transporter
// ═══════════════════════════════════════════════════════════════
// Le "transporter" est l'objet Nodemailer qui sait COMMENT envoyer
// un mail. Tu le crées une fois (au démarrage), tu l'utilises partout.
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. Vérifie que ton .env contient bien tes 4 valeurs Ethereal :
//    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
//    (Si tu n'as pas encore créé ton compte Ethereal, c'est le
//    moment ! → https://ethereal.email/create)
//
// 2. Crée le transporter avec nodemailer.createTransport({...}) :
//    👉 const transporter = nodemailer.createTransport({
//         host:   process.env.SMTP_HOST,
//         port:   Number(process.env.SMTP_PORT),
//         secure: false,
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASS
//         }
//       });
//
// ⚠️ ATTENTION 1 : process.env.SMTP_PORT est une STRING.
//    Tu DOIS la convertir avec Number().
//
// ⚠️ ATTENTION 2 : `secure: false` pour le port 587 (Ethereal/Gmail).
//    `secure: true` est uniquement pour le port 465.
//
// 📚 Doc : https://nodemailer.com/about/
// ═══════════════════════════════════════════════════════════════

const transporter = null; // ← à remplacer


// ═══════════════════════════════════════════════════════════════
// 🔧 ATELIER 3 — étape 2 : Implémenter sendWelcomeEmail
// ═══════════════════════════════════════════════════════════════
// Cette fonction envoie un mail de bienvenue à un nouvel utilisateur.
//
// Signature : sendWelcomeEmail(user) où user = { id, username, email, ... }
//
// ─── ÉTAPES ───────────────────────────────────────────────────
//
// 1. À l'intérieur de la fonction, appelle transporter.sendMail({...}) :
//    👉 const info = await transporter.sendMail({
//         from:    '"DevConnect" <hello@devconnect.io>',
//         to:      user.email,
//         subject: 'Bienvenue sur DevConnect 🚀',
//         text:    `Salut @${user.username}, bienvenue sur DevConnect !`,
//         html:    `<h1>Salut @${user.username} 👋</h1>
//                   <p>Bienvenue sur DevConnect.</p>`
//       });
//
// 2. sendMail() est ASYNC → utilise `await` (la fonction est déjà `async`).
//
// 3. Stocke le retour dans `info`, et log le lien de preview Ethereal :
//    👉 console.log('📧 Mail envoyé. Preview :', nodemailer.getTestMessageUrl(info));
//
// 💡 nodemailer.getTestMessageUrl(info) marche uniquement avec Ethereal.
//    En vraie prod (Gmail, etc.), cette fonction renvoie false.
//
// ─── POUR TESTER ──────────────────────────────────────────────
// Cette fonction sera appelée depuis routes/auth.js (étape 3 de l'atelier).
// Tu testeras en faisant une inscription depuis le front à
// http://localhost:4000.
// ═══════════════════════════════════════════════════════════════

export async function sendWelcomeEmail(user) {
  // ton code ici
}


// ═══════════════════════════════════════════════════════════════
// 🎁 BONUS 2 — sendLikeNotification (optionnel, pour les rapides)
// ═══════════════════════════════════════════════════════════════
// Quand quelqu'un like un de tes posts, on t'envoie un mail.
// À implémenter ici, puis à brancher dans `routes/posts.js` au moment
// du PUT /posts/:id/likes.
//
// Signature suggérée :
//    sendLikeNotification(post, liker)
//      - post  = le post liké { id, userId, content, ... }
//      - liker = l'utilisateur qui a liké { id, username, ... }
//
// 💡 À toi de retrouver l'auteur du post (post.userId → users[i].email)
//    et de construire le mail. Inspire-toi de sendWelcomeEmail ci-dessus.
//
// 💡 Question à te poser AVANT de coder : un mail à chaque like, c'est
//    discutable en prod (volumétrie, fatigue d'inbox). Quand est-ce
//    qu'on envoie vraiment, en vrai ? (Pas de bonne réponse — réfléchis-y.)
//
// Exemple de squelette :
//
//   export async function sendLikeNotification(post, liker) {
//     // 1. Trouver l'auteur du post (à l'aide de `users` depuis ../data/users.js)
//     // 2. Construire et envoyer le mail (transporter.sendMail({...}))
//     // 3. Logger le preview comme dans sendWelcomeEmail
//   }
// ═══════════════════════════════════════════════════════════════
