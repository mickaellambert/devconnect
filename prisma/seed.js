// ═══════════════════════════════════════════════════════════════
// prisma/seed.js — Peuplement initial de la base
// ═══════════════════════════════════════════════════════════════
// Ce script peuple la base avec des données de démo. Il **s'adapte
// automatiquement** à l'état de ton schéma :
//   • Atelier 1 (User seul)          → 5 users
//   • Atelier 2 partie A (User+Post) → 5 users + 10 posts
//   • Atelier 2 complet              → 5 users + 10 posts + 21 likes
//
// Lancé par :  npx prisma db seed
//
// 💡 Comment Prisma sait quel fichier lancer ?
//    Regarde `package.json` à la racine → bloc :
//        "prisma": { "seed": "node prisma/seed.js" }
//    C'est ce qui dit à `npx prisma db seed` d'exécuter CE fichier.
//
// ⚠️ Lance ce seed APRÈS avoir fait tes migrations.
//    Sinon, Prisma ne connaîtra pas les tables et le script plantera.
//
// 💡 Le seed est **idempotent** : tu peux le re-lancer autant de fois
//    que tu veux, les ids restent stables (alice = 1, bob = 2, …).
//    En interne : on nettoie tout avant de re-créer, et on remet
//    l'autoincrement SQLite à zéro pour garder des ids prévisibles
//    (`Bearer user-1` = toujours Alice).
//
// (Tu n'as pas à modifier ce fichier aujourd'hui. Il est fourni
//  complet.)
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  { username: "alice_dev",         email: "alice@devconnect.io",   createdAt: new Date("2026-01-15T10:00:00Z") },
  { username: "bob_backend",       email: "bob@devconnect.io",     createdAt: new Date("2026-01-22T14:30:00Z") },
  { username: "charlie_fullstack", email: "charlie@devconnect.io", createdAt: new Date("2026-02-05T09:15:00Z") },
  { username: "dora_frontend",     email: "dora@devconnect.io",    createdAt: new Date("2026-02-18T16:45:00Z") },
  { username: "elias_devops",      email: "elias@devconnect.io",   createdAt: new Date("2026-03-10T11:20:00Z") },
];

// Posts référencés par `authorUsername` (et likes par `likedByUsernames`)
// pour être insensible aux id auto-incrémentés que SQLite ne reset pas.
const posts = [
  { authorUsername: "alice_dev",         content: "Premier post sur DevConnect ! Hâte de découvrir cette communauté 🚀",                                                       createdAt: new Date("2026-03-12T10:00:00Z"), likedByUsernames: ["bob_backend", "charlie_fullstack", "dora_frontend"] },
  { authorUsername: "bob_backend",       content: "Question du jour : vous préférez Express ou Fastify pour une API REST ? Besoin d'avis éclairés.",                            createdAt: new Date("2026-03-13T09:30:00Z"), likedByUsernames: ["alice_dev", "elias_devops"] },
  { authorUsername: "charlie_fullstack", content: "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 127 little bugs in the code.",                  createdAt: new Date("2026-03-14T14:20:00Z"), likedByUsernames: ["alice_dev", "bob_backend", "dora_frontend", "elias_devops"] },
  { authorUsername: "dora_frontend",     content: "Je cherche un dev back junior pour rejoindre notre équipe à Paris. MP si intéressé·e !",                                    createdAt: new Date("2026-03-15T11:45:00Z"), likedByUsernames: [] },
  { authorUsername: "elias_devops",      content: "Kubernetes, c'est simple : tu prends un truc compliqué et tu le rends encore plus compliqué, mais distribué.",              createdAt: new Date("2026-03-16T16:00:00Z"), likedByUsernames: ["bob_backend", "charlie_fullstack"] },
  { authorUsername: "alice_dev",         content: "Tip du jour : arrêtez de mettre des console.log partout, apprenez le debugger de VS Code. Vous me remercierez.",            createdAt: new Date("2026-03-17T08:30:00Z"), likedByUsernames: ["charlie_fullstack", "dora_frontend"] },
  { authorUsername: "bob_backend",       content: "Mon code ne marche pas. Je le relance. Il marche. Je ne sais pas pourquoi. J'ai peur.",                                     createdAt: new Date("2026-03-18T13:15:00Z"), likedByUsernames: ["alice_dev", "charlie_fullstack", "dora_frontend", "elias_devops"] },
  { authorUsername: "charlie_fullstack", content: "Fun fact : « CSS » signifie en réalité « Can't Sleep Surely ».",                                                            createdAt: new Date("2026-03-19T22:10:00Z"), likedByUsernames: ["dora_frontend"] },
  { authorUsername: "dora_frontend",     content: "Après 3h de debug acharné, c'était une virgule. Bien sûr que c'était une virgule.",                                         createdAt: new Date("2026-03-20T19:50:00Z"), likedByUsernames: [] },
  { authorUsername: "elias_devops",      content: "« Ça marche sur ma machine » → le mot d'ordre officiel de ma carrière.",                                                    createdAt: new Date("2026-03-21T10:05:00Z"), likedByUsernames: ["alice_dev", "bob_backend", "charlie_fullstack"] },
];

// Détecte si un modèle Prisma est disponible côté client généré.
// (À l'atelier 1, Like et Post n'existent pas encore — leurs delegates
//  ne sont donc PAS définis sur l'objet `prisma`.)
function hasModel(name) {
  return typeof prisma[name]?.deleteMany === 'function';
}

// Affiche la liste des users seedés avec leur token fake `Bearer user-N`,
// pour aider l'élève à tester via Thunder Client sans aller chercher
// les ids dans Prisma Studio.
async function printCredentials() {
  const allUsers = await prisma.user.findMany({
    select: { id: true, username: true, email: true },
    orderBy: { id: 'asc' },
  });
  console.log('\n🪪 Comptes seedés (pour tester via Thunder Client) :');
  for (const u of allUsers) {
    console.log(`   ${u.email.padEnd(28)} → Authorization: Bearer user-${u.id}`);
  }
  console.log('');
}

async function main() {
  console.log('🌱 Seed : nettoyage des données existantes…');
  // L'ordre est important : Like dépend de User et Post.
  // On supprime d'abord les "enfants", puis les "parents".
  // ⚠️ On NE peut PAS faire `prisma.like.deleteMany().catch(...)` :
  //    si le modèle n'existe pas, `prisma.like` vaut `undefined` et
  //    l'erreur est SYNCHRONE (avant que la promise n'existe), donc
  //    `.catch()` ne capture rien. On teste explicitement avant.
  if (hasModel('like')) await prisma.like.deleteMany();
  if (hasModel('post')) await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 🔧 SQLite ne reset PAS l'autoincrement après deleteMany — la
  //    table `sqlite_sequence` garde les compteurs. Sans ce reset,
  //    re-seeder donne des ids qui glissent (User id=6 au 2e seed,
  //    11 au 3e…) → les tokens fake `Bearer user-1` du J3 ne pointent
  //    plus sur Alice. Au J4 (JWT), ce souci disparaît.
  //
  //    `sqlite_sequence` peut ne pas exister si la table cible n'a
  //    jamais reçu d'insert → on protège avec try/catch.
  try { await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence`); } catch {}

  console.log('🌱 Seed : création des users…');
  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // À l'atelier 1, le modèle Post n'existe pas encore. On s'arrête là.
  if (!hasModel('post')) {
    const count = await prisma.user.count();
    console.log(`✅ Seed terminé (atelier 1) : ${count} users en base.`);
    await printCredentials();
    return;
  }

  console.log('🌱 Seed : création des posts…');
  // 💡 On utilise `connect: { username }` au lieu de `userId: <id>`
  //    pour éviter les FK violations quand SQLite ne reset pas
  //    l'autoincrement (les users seedés peuvent avoir n'importe quel id).
  for (const p of posts) {
    await prisma.post.create({
      data: {
        content:   p.content,
        createdAt: p.createdAt,
        user:      { connect: { username: p.authorUsername } },
      },
    });
  }

  // À l'atelier 2 partie A (juste après add-posts, avant add-likes),
  // le modèle Like n'existe pas encore. On s'arrête là.
  if (!hasModel('like')) {
    const postCount = await prisma.post.count();
    console.log(`✅ Seed terminé (atelier 2 partie A) : ${postCount} posts en base.`);
    await printCredentials();
    return;
  }

  console.log('🌱 Seed : création des likes…');
  // On retrouve l'id réel de chaque post via son auteur + content
  // (insensible à l'autoincrement).
  const allUsers = await prisma.user.findMany({ select: { id: true, username: true } });
  const userIdByName = Object.fromEntries(allUsers.map(u => [u.username, u.id]));

  let likeCount = 0;
  for (const p of posts) {
    const dbPost = await prisma.post.findFirst({
      where: { content: p.content, user: { username: p.authorUsername } },
      select: { id: true },
    });
    for (const username of p.likedByUsernames) {
      await prisma.like.create({
        data: { userId: userIdByName[username], postId: dbPost.id },
      });
      likeCount++;
    }
  }

  const postCount = await prisma.post.count();
  const userCount = await prisma.user.count();
  console.log(`✅ Seed terminé : ${userCount} users, ${postCount} posts, ${likeCount} likes.`);
  await printCredentials();
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
