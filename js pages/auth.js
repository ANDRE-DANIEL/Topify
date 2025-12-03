// Client-side authentication helper for Topify
// NOTE: This is a client-only demo. For production, move auth to a server.

(function(window){
  const USERS_KEY = 'topify_users';
  const AUTH_KEY = 'topify_auth';

  function generateSalt(len = 16){
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function hashPassword(password, salt){
    const enc = new TextEncoder();
    const data = enc.encode(salt + password);
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    return hashArray.map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function loadUsers(){
    try{ return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
    catch(e){ return {}; }
  }

  function saveUsers(users){
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function registerUser(username, password){
    username = String(username).trim();
    if(!username || !password) throw new Error('Missing username or password');
    const users = loadUsers();
    if(users[username]) throw new Error('User already exists');
    const salt = generateSalt(16);
    const hash = await hashPassword(password, salt);
    users[username] = {salt, hash, created: Date.now()};
    saveUsers(users);
    return true;
  }

  async function loginUser(username, password){
    username = String(username).trim();
    const users = loadUsers();
    const u = users[username];
    if(!u) throw new Error('Invalid credentials');
    const hash = await hashPassword(password, u.salt);
    if(hash !== u.hash) throw new Error('Invalid credentials');
    const token = generateSalt(24);
    const session = {username, token, expires: Date.now() + (60*60*1000)}; // 1 hour
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  }

  function logout(){
    sessionStorage.removeItem(AUTH_KEY);
    // redirect to login page in the same folder, best-effort
    try{ window.location.href = 'login.html'; } catch(e){}
  }

  function getSession(){
    try{ return JSON.parse(sessionStorage.getItem(AUTH_KEY) || 'null'); } catch(e){ return null; }
  }

  function isAuthenticated(){
    const s = getSession();
    if(!s) return false;
    if(s.expires && Date.now() > s.expires){ sessionStorage.removeItem(AUTH_KEY); return false; }
    return true;
  }

  function getCurrentUser(){
    const s = getSession();
    return s ? s.username : null;
  }

  // Call on protected pages to redirect if not logged in.
  function protectPage(redirectTo = 'login.html'){
    if(!isAuthenticated()){
      // If calling from a nested folder where login is at ../html pages/login.html,
      // the caller can pass a specific redirect path. Default assumes same folder.
      window.location.href = redirectTo;
    }
  }

  // Expose API
  window.TopifyAuth = {
    registerUser,
    loginUser,
    logout,
    isAuthenticated,
    getCurrentUser,
    protectPage
  };

  // Also expose short global functions for convenience (used by pages)
  window.registerUser = registerUser;
  window.loginUser = loginUser;
  window.logout = logout;
  window.isAuthenticated = isAuthenticated;
  window.getCurrentUser = getCurrentUser;
  window.protectPage = protectPage;

})(window);
