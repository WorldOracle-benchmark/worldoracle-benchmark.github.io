(() => {
  'use strict';

  const form = document.querySelector('[data-registration-form]');
  if (!form) return;

  const summary = form.querySelector('[data-registration-summary]');
  const submit = form.querySelector('[type="submit"]');
  const success = document.querySelector('[data-registration-success]');
  const apiBase = (document.querySelector('meta[name="worldoracle-api-base"]')?.content || '').replace(/\/$/, '');

  function clearServerErrors() {
    form.dispatchEvent(new CustomEvent('registration:server-errors', { detail: { errors: {} } }));
  }

  function showErrors(fieldErrors, fallback) {
    const errors = Object.fromEntries(Object.entries(fieldErrors || {}).filter(([, message]) => Boolean(message)));
    if (!Object.keys(errors).length && fallback) errors.form = fallback;
    form.dispatchEvent(new CustomEvent('registration:server-errors', { detail: { errors } }));
    if (summary && Object.keys(errors).length) summary.focus({ preventScroll: true });
    const firstName = Object.keys(errors)[0];
    const firstField = firstName ? form.elements[firstName] : null;
    const firstError = firstName
      ? form.querySelector(`[data-field-error="${CSS.escape(firstName)}"]`)
      : null;
    const target = firstField || firstError;
    if (target) {
      if (!firstField) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  form.addEventListener('submit', async (event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (!apiBase) {
      showErrors({}, 'Registration service configuration is missing. Please contact the organizer.');
      return;
    }
    clearServerErrors();
    submit.disabled = true;
    submit.textContent = 'Creating account…';
    try {
      const response = await fetch(`${apiBase}/api/v1/register`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      });
      let payload = {};
      try { payload = await response.json(); } catch (_) {}
      if (!response.ok) {
        const errors = { ...(payload.field_errors || {}) };
        let message = payload.message || 'Registration could not be completed. Please try again.';
        if (response.status === 413) {
          errors.logo = 'The uploaded logo is too large. Upload an image no larger than 1 MiB.';
          message = '';
        } else if (response.status === 429) {
          message = 'Too many registration attempts. Please try again later.';
        }
        showErrors(errors, message);
        return;
      }
      form.hidden = true;
      success.hidden = false;
      success.querySelector('[data-registration-success-message]').textContent = payload.message;
      success.focus();
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_) {
      showErrors({}, 'The registration service could not be reached. Check your connection and try again.');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Create Account & Verify Email ↗';
    }
  });
})();
