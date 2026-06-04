/**
 * NUDE Club - Authentication Module
 * Handles user registration, login, session management, and role-based access.
 * Stores data in localStorage (client-side demo, no backend).
 */

const AUTH = (() => {

  const USERS_KEY = 'nude_users';
  const SESSION_KEY = 'nude_session';

  // ── Default admin account ──────────────────────────────────────────────────
  const DEFAULT_ADMIN = {
    id: 'admin-nude-001',
    nombre: 'Administrador',
    email: 'admin@nudeclub.mx',
    // password: "nude2026admin" stored as simple hash for demo
    passwordHash: btoa('nude2026admin'),
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z'
  };

  // ── Initialize storage ────────────────────────────────────────────────────
  function init() {
    let users = getUsers();
    // Ensure admin always exists
    if (!users.find(u => u.id === DEFAULT_ADMIN.id)) {
      users.unshift(DEFAULT_ADMIN);
      saveUsers(users);
    }
  }

  // ── User storage helpers ──────────────────────────────────────────────────
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // ── Simple hash (base64 for demo) ─────────────────────────────────────────
  function hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
  }

  // ── Register ──────────────────────────────────────────────────────────────
  function register({ nombre, email, password }) {
    const users = getUsers();

    if (!nombre || !email || !password) {
      return { success: false, error: 'Todos los campos son obligatorios.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Ya existe una cuenta con ese correo electrónico.' };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true, user: sanitizeUser(newUser) };
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  function login({ email, password }) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return { success: false, error: 'No existe una cuenta con ese correo electrónico.' };
    }

    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Contraseña incorrecta. Inténtalo de nuevo.' };
    }

    const session = { ...sanitizeUser(user), loggedAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  // ── Get current session ───────────────────────────────────────────────────
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch { return null; }
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function isAdmin() {
    const session = getSession();
    return session && session.role === 'admin';
  }

  // ── Strip sensitive data ──────────────────────────────────────────────────
  function sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ── Get all users (admin only) ────────────────────────────────────────────
  function getAllUsers() {
    return getUsers().map(sanitizeUser);
  }

  // ── Require login guard ───────────────────────────────────────────────────
  // Redirects to login page if user is not logged in
  function requireLogin(redirectBack = true) {
    if (!isLoggedIn()) {
      const returnTo = redirectBack ? encodeURIComponent(window.location.pathname + window.location.search) : '';
      window.location.href = 'login.html' + (returnTo ? '?return=' + returnTo : '');
    }
  }

  // ── Require admin guard ───────────────────────────────────────────────────
  function requireAdmin() {
    if (!isAdmin()) {
      window.location.href = isLoggedIn() ? 'index.html' : 'login.html';
    }
  }

  // ── Inject nav user UI into every page ───────────────────────────────────
  function renderNavUser() {
    // Find all nav menus (desktop + mobile)
    const navMenus = document.querySelectorAll('.nav-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    const session = getSession();

    navMenus.forEach(navMenu => {
      // Remove existing auth items
      navMenu.querySelectorAll('.nav-auth-item').forEach(el => el.remove());

      if (session) {
        // Logged in: show user name + logout
        const isAdminUser = session.role === 'admin';

        if (isAdminUser) {
          const adminLi = document.createElement('li');
          adminLi.className = 'nav-auth-item';
          adminLi.innerHTML = `<a href="admin.html" class="nav-link nav-admin-link"><i class="fas fa-shield-alt"></i> Admin</a>`;
          navMenu.appendChild(adminLi);
        }

        const userLi = document.createElement('li');
        userLi.className = 'nav-auth-item nav-user-li';
        userLi.innerHTML = `
          <div class="nav-user-dropdown">
            <button class="nav-user-btn" id="navUserBtn" aria-label="Mi cuenta">
              <div class="nav-avatar">${getInitials(session.nombre)}</div>
              <span>${session.nombre.split(' ')[0]}</span>
              <i class="fas fa-chevron-down nav-chevron"></i>
            </button>
            <div class="nav-dropdown-menu" id="navDropdownMenu">
              <div class="nav-dropdown-header">
                <strong>${session.nombre}</strong>
                <span>${session.email}</span>
                <span class="role-badge role-${session.role}">${session.role === 'admin' ? '👑 Admin' : '🎟️ Usuario'}</span>
              </div>
              ${isAdminUser ? `<a href="admin.html" class="nav-dropdown-item"><i class="fas fa-tachometer-alt"></i> Panel Admin</a>` : ''}
              <button class="nav-dropdown-item nav-dropdown-logout" id="navLogoutBtn"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</button>
            </div>
          </div>
        `;
        navMenu.appendChild(userLi);

        // Toggle dropdown
        setTimeout(() => {
          const btn = document.getElementById('navUserBtn');
          const menu = document.getElementById('navDropdownMenu');
          if (btn && menu) {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              menu.classList.toggle('open');
            });
            document.addEventListener('click', () => menu.classList.remove('open'));
          }

          const logoutBtn = document.getElementById('navLogoutBtn');
          if (logoutBtn) logoutBtn.addEventListener('click', logout);
        }, 0);

      } else {
        // Not logged in: show Login button
        const loginLi = document.createElement('li');
        loginLi.className = 'nav-auth-item';
        loginLi.innerHTML = `<a href="login.html" class="btn btn-outline-purple nav-login-btn"><i class="fas fa-user"></i> Iniciar Sesión</a>`;
        navMenu.appendChild(loginLi);
      }
    });

    // Mobile nav auth
    if (mobileNav) {
      mobileNav.querySelectorAll('.mobile-auth-item').forEach(el => el.remove());

      if (session) {
        const adminLink = session.role === 'admin' ? `<a href="admin.html" class="nav-link mobile-auth-item"><i class="fas fa-shield-alt"></i> Panel Admin</a>` : '';
        const userEl = document.createElement('div');
        userEl.className = 'mobile-auth-item';
        userEl.innerHTML = `
          ${adminLink}
          <div class="mobile-user-info">
            <div class="nav-avatar">${getInitials(session.nombre)}</div>
            <span>${session.nombre}</span>
          </div>
          <button class="btn btn-outline-purple mobile-logout-btn"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</button>
        `;
        mobileNav.appendChild(userEl);
        userEl.querySelector('.mobile-logout-btn')?.addEventListener('click', logout);
      } else {
        const loginEl = document.createElement('a');
        loginEl.href = 'login.html';
        loginEl.className = 'btn btn-outline-purple nav-cta mobile-auth-item';
        loginEl.innerHTML = '<i class="fas fa-user"></i> Iniciar Sesión';
        mobileNav.appendChild(loginEl);
      }
    }
  }

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  // Public API
  return { init, register, login, logout, getSession, isLoggedIn, isAdmin, requireLogin, requireAdmin, renderNavUser, getAllUsers };

})();

// Auto-init on load
AUTH.init();
