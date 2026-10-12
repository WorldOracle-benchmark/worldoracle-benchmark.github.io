(() => {
  'use strict';

  const form = document.querySelector('[data-registration-form]');
  if (!form) return;

  const summary = form.querySelector('[data-registration-summary]');
  const summaryList = form.querySelector('[data-registration-summary-list]');
  const submit = form.querySelector('[type="submit"]');
  const success = document.querySelector('[data-registration-success]');
  const apiBase = (document.querySelector('meta[name="worldoracle-api-base"]')?.content || '').replace(/\/$/, '');

  function clearServerErrors() {
    form.querySelectorAll('[data-field-error]').forEach((node) => {
      if (!node.dataset.serverError) return;
      node.textContent = '';
      node.hidden = true;
      delete node.dataset.serverError;
    });
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      if (field.validationMessage) return;
      field.removeAttribute('aria-invalid');
      field.closest('.registration-field, .registration-consent')?.classList.remove('has-error');
    });
  }

  function showErrors(fieldErrors, fallback) {
    clearServerErrors();
    const messages = [];
    Object.entries(fieldErrors || {}).forEach(([name, message]) => {
      if (!message) return;
      messages.push(message);
      const node = form.querySelector(`[data-field-error="${CSS.escape(name)}"]`);
      const field = form.elements[name];
      if (node) {
        node.textContent = message;
        node.hidden = false;
        node.dataset.serverError = 'true';
      }
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.closest('.registration-field, .registration-consent')?.classList.add('has-error');
      }
    });
    if (!messages.length && fallback) messages.push(fallback);
    if (summary && summaryList) {
      summaryList.replaceChildren(...messages.map((message) => {
        const item = document.createElement('li');
        item.textContent = message;
        return item;
      }));
      summary.hidden = messages.length === 0;
      if (messages.length) summary.focus({ preventScroll: true });
    }
    const first = Object.keys(fieldErrors || {}).map((name) => form.elements[name]).find(Boolean);
    first?.focus();
    first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('input', clearServerErrors);
  form.addEventListener('change', clearServerErrors);
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
        const message = response.status === 413
          ? 'The uploaded logo is too large. Upload an image no larger than 1 MiB.'
          : response.status === 429
            ? 'Too many registration attempts. Please try again later.'
            : payload.message || 'Registration could not be completed. Please try again.';
        showErrors(payload.field_errors || {}, message);
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
