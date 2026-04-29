import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendWelcomeEmail(user) {
  const info = await transporter.sendMail({
    from:    '"DevConnect" <hello@devconnect.io>',
    to:      user.email,
    subject: 'Bienvenue sur DevConnect 🚀',
    text:    `Salut @${user.username}, bienvenue sur DevConnect !`,
    html:    `<h1>Salut @${user.username} 👋</h1>
              <p>Bienvenue sur DevConnect.</p>`
  });

  // Avec Ethereal, getTestMessageUrl() renvoie un lien direct vers
  // l'aperçu du mail. En vraie prod (Gmail, etc.), il renvoie false.
  console.log('📧 Mail envoyé. Preview :', nodemailer.getTestMessageUrl(info));
}


// ═══════════════════════════════════════════════════════════════
// 🎁 BONUS 2 — sendLikeNotification (laissé en exercice ouvert)
// ═══════════════════════════════════════════════════════════════
// Le bonus 2 du J2 (envoyer un mail à l'auteur d'un post quand
// quelqu'un le like) n'est volontairement PAS implémenté dans
// j2/solution — c'est un exercice ouvert.
//
// Le squelette et les indices sont dans j2/start, pour les élèves
// rapides qui veulent s'y attaquer en autonomie.
// ═══════════════════════════════════════════════════════════════
