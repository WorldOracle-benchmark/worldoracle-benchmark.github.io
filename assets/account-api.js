(() => {
  'use strict';
  const base = (document.querySelector('meta[name="worldoracle-api-base"]')?.content || '').replace(/\/$/, '');
  const key = 'worldoracle_submission_token';
  const token = () => sessionStorage.getItem(key) || '';
  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    if (token()) headers.set('Authorization', `Bearer ${token()}`);
    if (options.body !== undefined && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
      options.body = JSON.stringify(options.body);
    }
    let response;
    try {
      response = await fetch(`${base}${path}`, {...options, mode: 'cors', credentials: 'omit', headers});
    } catch (_) {
      throw new Error('The WorldOracle service could not be reached. Check your connection and try again.');
    }
    if (response.status === 401) {
      sessionStorage.removeItem(key);
      if (!location.pathname.endsWith('/login/') && !location.pathname.endsWith('/login/index.html')) {
        location.replace(new URL('../login/', location.href));
      }
    }
    if (options.raw) {
      if (!response.ok) throw new Error(`Download failed (${response.status}).`);
      return response;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.message || payload.error || `Request failed (${response.status}).`);
      error.status = response.status; error.fields = payload.field_errors || {};
      throw error;
    }
    return payload;
  }
  function requireSession() {
    if (!token()) { location.replace(new URL('../login/', location.href)); return false; }
    return true;
  }
  function logout() { sessionStorage.removeItem(key); location.assign(new URL('../login/', location.href)); }
  window.WorldOracleAccount = {base, token, request, requireSession, logout, saveToken: value => sessionStorage.setItem(key, value)};
})();
