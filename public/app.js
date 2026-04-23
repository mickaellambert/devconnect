// ═══════════════════════════════════════════════════════════════
// DevConnect — front vanilla
// ═══════════════════════════════════════════════════════════════
// Ce fichier est fourni. Les élèves ne sont pas censés le modifier.
// Il consomme l'API REST servie par le même serveur Express (même
// origine, pas de CORS).
//
// Auth : le token est stocké en localStorage. Le wrapper `api()`
// l'injecte dans le header `Authorization: Bearer <token>` de chaque
// requête, que le back soit au J1 (fake) ou au J3+ (JWT réel).
// ═══════════════════════════════════════════════════════════════

const TOKEN_KEY = 'devconnect.token';
const USER_KEY = 'devconnect.user';

let usersCache = [];

// ─── Fetch wrapper ──────────────────────────────────────────────

async function api(method, path, body) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erreur ${res.status}`);
  }
  return data;
}

// ─── Auth helpers ────────────────────────────────────────────────

function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

// ─── Views ───────────────────────────────────────────────────────

function showAuth() {
  document.getElementById('authScreen').hidden = false;
  document.getElementById('appScreen').hidden = true;
  document.getElementById('userInfo').hidden = true;
  document.getElementById('loginForm').hidden = false;
  document.getElementById('registerForm').hidden = true;
}

function showApp() {
  const user = getCurrentUser();
  document.getElementById('authScreen').hidden = true;
  document.getElementById('appScreen').hidden = false;
  document.getElementById('userInfo').hidden = false;
  document.getElementById('usernameLabel').textContent = user?.username || '';
  loadTimeline();
}

// ─── Timeline ────────────────────────────────────────────────────

async function loadTimeline() {
  try {
    usersCache = await api('GET', '/users');
    const posts = await api('GET', '/posts');
    renderTimeline(posts);
  } catch (err) {
    if (err.message.includes('401')) {
      clearAuth();
      showAuth();
    } else {
      console.error(err);
    }
  }
}

function renderTimeline(posts) {
  const container = document.getElementById('timeline');
  if (!posts.length) {
    container.innerHTML = '<p class="empty">Aucun post pour l\'instant. Sois le premier !</p>';
    return;
  }
  const currentUser = getCurrentUser();
  const sorted = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  container.innerHTML = sorted.map(p => renderPost(p, currentUser)).join('');
  attachLikeHandlers();
}

function renderPost(post, currentUser) {
  const author = usersCache.find(u => u.id === post.userId);
  const hasLiked = currentUser && post.likes.includes(currentUser.id);
  const date = new Date(post.createdAt).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  return `
    <article class="post" data-post-id="${post.id}">
      <header class="post-header">
        <span class="post-author">@${author?.username || 'inconnu'}</span>
        <time class="post-date">${date}</time>
      </header>
      <p class="post-content">${escapeHtml(post.content)}</p>
      <footer class="post-footer">
        <button class="like-btn ${hasLiked ? 'liked' : ''}" data-liked="${hasLiked}">
          ❤️ <span>${post.likes.length}</span>
        </button>
      </footer>
    </article>
  `;
}

function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

function attachLikeHandlers() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const postEl = btn.closest('.post');
      const postId = postEl.dataset.postId;
      const liked = btn.dataset.liked === 'true';
      try {
        if (liked) {
          await api('DELETE', `/posts/${postId}/likes`);
        } else {
          await api('PUT', `/posts/${postId}/likes`);
        }
        loadTimeline();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

// ─── Event handlers ──────────────────────────────────────────────

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const { token, user } = await api('POST', '/auth/login', data);
    setAuth(token, user);
    showApp();
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    const { token, user } = await api('POST', '/auth/register', data);
    setAuth(token, user);
    showApp();
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById('showRegister').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginForm').hidden = true;
  document.getElementById('registerForm').hidden = false;
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginForm').hidden = false;
  document.getElementById('registerForm').hidden = true;
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearAuth();
  showAuth();
});

document.getElementById('newPostForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await api('POST', '/posts', data);
    e.target.reset();
    loadTimeline();
  } catch (err) {
    alert(err.message);
  }
});

// ─── Init ────────────────────────────────────────────────────────

if (localStorage.getItem(TOKEN_KEY)) {
  showApp();
} else {
  showAuth();
}
