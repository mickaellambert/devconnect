# DevConnect — Jour 1 (Point de départ)

Bienvenue ! Aujourd'hui tu vas construire ta première **API REST** avec Express.

---

## 🎯 Ce que tu vas apprendre

- Construire un serveur HTTP avec **Express**
- Comprendre le **routage** : méthode HTTP + URL → action
- Manipuler `req` (requête) et `res` (réponse)
- Utiliser les **codes de statut HTTP** (200, 201, 400, 404)

---

## ✅ Prérequis (à vérifier avant de commencer)

Ouvre un terminal et tape :

```bash
node --version    # doit afficher v22.x ou plus
npm --version     # doit afficher 10.x ou plus
git --version     # doit afficher git version 2.x
```

Si l'une des trois ne marche pas, lève la main avant d'aller plus loin.

**Outils recommandés** :

- [VS Code](https://code.visualstudio.com/) comme éditeur
- Extension **Thunder Client** (icône éclair dans la barre latérale de VS Code) pour tester les routes

---

## 🚀 Installation pas-à-pas

### 1️⃣ Cloner le repo

```bash
git clone git@github.com:mickaellambert/devconnect.git
cd devconnect
```

### 2️⃣ Switcher sur la branche du jour

```bash
git checkout j1/start
```

### 3️⃣ Installer les dépendances

```bash
npm install
```

Tu vois `added 96 packages` ? Parfait.

### 4️⃣ Lancer le serveur

```bash
npm run dev
```

Tu dois voir apparaître :

```
✅ Serveur DevConnect lancé sur http://localhost:4000
```

> 💡 **nodemon** redémarre le serveur tout seul à chaque fois que tu enregistres un fichier. Pas besoin de faire Ctrl+C / relancer en boucle.

### 5️⃣ Ouvrir le front dans ton navigateur

Va sur [http://localhost:4000](http://localhost:4000). Tu dois voir un écran de connexion avec le logo DevConnect.

### 6️⃣ Te connecter

- **Email** : `alice@devconnect.io` (ou n'importe quel email présent dans `data/users.js`)
- **Mot de passe** : `demo` (il est ignoré au J1, on le sécurisera au J3)

Tu vois la timeline avec les 10 posts pré-existants ? 🎉 Tu es prêt à coder.

---

## 🗂️ Structure du projet

```
devconnect/
├── index.js                         ← serveur Express (port 4000)
├── data/
│   ├── users.js                     ← 5 users en dur
│   └── posts.js                     ← 10 posts en dur
├── middleware/
│   └── authenticate.js              🔒 NE PAS TOUCHER
├── routes/
│   ├── auth.js                      🔒 NE PAS TOUCHER
│   ├── users.js                     ✏️ à compléter
│   └── posts.js                     ✏️ à compléter
└── public/                          🔒 NE PAS TOUCHER (front fourni)
    ├── index.html
    ├── styles.css
    └── app.js
```

Les zones 🔒 **NE PAS TOUCHER** sont fournies : le middleware d'authentification, les routes de login/inscription, et le front. Elles travaillent pour toi. Tu te concentres sur `routes/users.js` et `routes/posts.js`.

---

## 📋 Les 7 routes du jour

*(2 fournies comme modèle + 4 à coder + 1 bonus)*

| # | Méthode | URL | Rôle | Statut |
|---|---------|-----|------|--------|
| 1 | `GET` | `/users` | Liste des users | ✅ Fournie (modèle) |
| 2 | `GET` | `/users/:id` | Détail d'un user | 🔧 À toi (facile) |
| 3 | `GET` | `/posts` | Liste des posts | ✅ Fournie (modèle) |
| 4 | `GET` | `/posts/:id` | Détail d'un post | 🔧 À toi (facile) |
| 5 | `POST` | `/posts` | Créer un post | 🔧 À toi (moyen) |
| 6 | `PUT` | `/posts/:id/likes` | Liker un post | 🔧 À toi (difficile) |
| 7 | `DELETE` | `/posts/:id/likes` | Retirer son like | 🎁 Bonus |

Chaque route à coder contient un **guide pas-à-pas en commentaires** juste au-dessus : indices de syntaxe, cas d'erreur, et requête exacte à tester.

---

## 🧩 C'est quoi un middleware ?

Tu vas voir dans `index.js` plein de `app.use(...)` :

```js
app.use(express.json());
app.use(authenticate);
app.use('/users', requireAuth, usersRouter);
```

Ces fonctions s'appellent des **middlewares**. C'est un concept central d'Express (et de la plupart des frameworks web modernes) — ça vaut le coup de comprendre ce que c'est avant de plonger dans le code.

### L'analogie du péage d'autoroute

> Imagine que ta requête HTTP est une **voiture** qui veut atteindre sa destination (= une de tes routes Express). Sur le chemin, elle passe par plusieurs **péages**. Chaque péage peut :
>
> - **laisser passer** la voiture sans rien faire,
> - **modifier** la voiture au passage (ex : coller un autocollant `req.user`),
> - **bloquer** la voiture s'il y a un problème (ticket invalide → demi-tour avec un `401`).
>
> Ces péages, ce sont les middlewares. Ils s'exécutent **dans l'ordre**, entre l'arrivée d'une requête et sa route finale. Chacun fait **une seule chose**.

### Les middlewares qu'on utilise dans ce projet

Tu n'as pas besoin de les coder (ils sont fournis), mais sache qu'ils sont là :

| Middleware | Rôle |
|------------|------|
| `express.json()` | Parse le body JSON entrant en objet JavaScript (sinon `req.body` serait vide) |
| `authenticate` | Lit le header `Authorization: Bearer user-X` et attache `req.user` à la requête |
| `requireAuth` | Renvoie `401 Unauthorized` si `req.user` n'a pas été défini |
| `express.static('public')` | Sert les fichiers du dossier `public/` (notre front) |

### Un concept transverse

Ce pattern n'est pas spécifique à Express ni à Node. Tu le retrouveras partout :

| Stack | Comment on appelle ça |
|-------|----------------------|
| Express (Node) | `middleware` |
| Spring (Java) | `filter` / `interceptor` |
| ASP.NET (.NET) | `middleware pipeline` |
| Symfony (PHP) | `kernel event` / `event listener` |
| Django (Python) | `middleware` |

Même idée partout : **une chaîne de fonctions qui transforment la requête** avant qu'elle atteigne ta logique métier.

---

## 🔑 Savoir qui fait l'action : `req.user.id`

Maintenant que tu sais ce qu'est un middleware, voici le concret. Toutes les routes `/users` et `/posts` exigent un header `Authorization: Bearer user-X`. Le middleware `authenticate` le lit et te met l'utilisateur connecté dans **`req.user`**.

👉 **Dans tes routes, utilise `req.user.id` pour savoir qui fait l'action.** Pas besoin de passer un userId dans le body ou l'URL — le serveur le connaît déjà grâce au token.

Exemple :

```js
router.post('/', (req, res) => {
  const newPost = {
    id: 42,
    userId: req.user.id,    // 👈 l'auteur est l'utilisateur connecté
    content: req.body.content,
    likes: [],
    createdAt: new Date().toISOString()
  };
  // …
});
```

---

## 🧪 Tester tes routes

### Avec Thunder Client (pour les tests précis et les cas d'erreur)

1. Ouvre Thunder Client (icône éclair à gauche dans VS Code).
2. Clique sur **New Request**.
3. Choisis la méthode HTTP et tape l'URL (ex : `http://localhost:4000/users/2`).
4. Onglet **Headers** → ajoute :
   ```
   Authorization: Bearer user-1
   ```
5. Pour un `POST` : onglet **Body** → **JSON** → écris ton JSON.
6. Clique sur **Send**.

### Dans le navigateur (pour le rendu visuel)

Le front fourni tape automatiquement ton API. **Dès que tu codes une route, l'action correspondante se débloque** dans l'interface :

- `POST /posts` → le bouton "Publier" fonctionne
- `PUT /posts/:id/likes` → les boutons ❤️ fonctionnent
- `DELETE /posts/:id/likes` → tu peux retirer ton like

C'est ton **tableau de bord de progression visuel**.

---

## ⚠️ "Ma requête reste bloquée sur Loading…"

C'est **normal** si tu n'as pas encore écrit le code de la route. Express attend que tu appelles `res.json()`, `res.status().send()`, ou `res.end()` pour renvoyer une réponse. Tant que tu ne le fais pas, la requête reste suspendue.

👉 **Solution** : écris le corps de la route, enregistre, relance la requête.

---

## 💪 Par où commencer ?

> 💡 **Ouvre `routes/users.js` et `routes/posts.js` dans VS Code, et utilise Ctrl+F** (ou Cmd+F sur Mac) **pour chercher `🔧 À TOI DE JOUER`**. Tu trouveras chaque emplacement à coder avec son guide pas-à-pas juste au-dessus.

Suis cet ordre, du plus facile au plus difficile :

1. **`GET /users/:id`** → 90 % du code est dans les commentaires. Victoire rapide pour te lancer.
2. **`GET /posts/:id`** → exactement la même logique que la 1, applique ce que tu as appris.
3. **`POST /posts`** → première création de ressource, tu découvres `req.body` et `req.user.id`.
4. **`PUT /posts/:id/likes`** → la plus subtile (idempotence, PUT vs POST — tout est expliqué dans les commentaires).
5. **`DELETE /posts/:id/likes`** 🎁 → bonus si tu as fini en avance.

Bon code ! 🚀
