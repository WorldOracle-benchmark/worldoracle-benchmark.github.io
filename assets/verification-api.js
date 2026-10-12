(() => {
  'use strict';
  const panel = document.querySelector('[data-verification-panel]');
  if (!panel) return;
  const button = panel.querySelector('[data-verify-button]');
  const status = panel.querySelector('[data-verify-status]');
  const apiBase = (document.querySelector('meta[name="worldoracle-api-base"]')?.content || '').replace(/\/$/, '');
  const token = new URLSearchParams(window.location.search).get('token') || '';

  if (!token) {
    button.disabled = true;
    status.className = 'notice error';
    status.textContent = 'This verification link is incomplete. Request a new verification email from the sign-in page.';
    status.hidden = false;
    return;
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Verifying…';
    status.hidden = true;
    try {
      const response = await fetch(`${apiBase}/api/v1/verify-email`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      let payload = {};
      try { payload = await response.json(); } catch (_) {}
      status.className = response.ok ? 'notice' : 'notice error';
      status.textContent = payload.message || (response.ok
        ? 'Email verified. Your submission account is awaiting organizer review.'
        : 'This verification link is invalid or expired.');
      status.hidden = false;
      if (response.ok) {
        button.hidden = true;
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        button.disabled = false;
        button.textContent = 'Verify Email';
      }
    } catch (_) {
      status.className = 'notice error';
      status.textContent = 'The verification service could not be reached. Check your connection and try again.';
      status.hidden = false;
      button.disabled = false;
      button.textContent = 'Verify Email';
    }
  });
})();
