(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WorldOracleRegistration = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const urlLabels = {
    github_url: 'GitHub / code repository',
    huggingface_url: 'Hugging Face / model weights',
    paper_url: 'paper / technical report'
  };

  function validHttpUrl(value) {
    try {
      const parsed = new URL(value);
      return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.host);
    } catch (_) {
      return false;
    }
  }

  function validationMessage(name, value, context) {
    const options = context || {};
    const text = String(value == null ? '' : value).trim();
    if (name === 'team_name') {
      if (!text) return 'Enter a team name.';
      if (text.length > 200) return 'Team name must be 200 characters or fewer.';
    }
    if (name === 'model_name') {
      if (!text) return 'Enter a model name.';
      if (text.length > 200) return 'Model name must be 200 characters or fewer.';
    }
    if (name === 'organization') {
      if (!text) return 'Enter an organization or independent-researcher name.';
      if (text.length > 300) return 'Organization must be 300 characters or fewer.';
    }
    if (name === 'email') {
      if (!text) return 'Enter a registration email.';
      if (text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        return 'Enter a valid email address, such as name@example.org.';
      }
    }
    if (name === 'password' && (String(value || '').length < 12 || String(value || '').length > 256)) {
      return 'Use a matching password of 12–256 characters.';
    }
    if (name === 'confirm' && String(value || '') !== String(options.password || '')) {
      return 'Use a matching password of 12–256 characters.';
    }
    if (Object.prototype.hasOwnProperty.call(urlLabels, name) && text) {
      if (text.length > 500 || !validHttpUrl(text)) {
        return `Provide valid HTTP/HTTPS links for the ${urlLabels[name]}.`;
      }
    }
    if (name === 'supplemental' && String(value || '').length > 4000) {
      return 'Review notes must be 4,000 characters or fewer.';
    }
    if (name === 'logo') {
      const file = options.file;
      const maximum = Number(options.maxBytes) || 1048576;
      if (!file) return 'Upload an organization logo in PNG, JPEG, or WebP format.';
      if (!file.size) return 'The organization logo file is empty.';
      if (file.size > maximum) return 'The organization logo must be 1 MiB or smaller.';
      const extension = String(file.name || '').toLowerCase().split('.').pop();
      const acceptedExtension = ['png', 'jpg', 'jpeg', 'webp'].includes(extension);
      const acceptedType = ['image/png', 'image/jpeg', 'image/webp'].includes(String(file.type || '').toLowerCase());
      if (!acceptedExtension && !acceptedType) return 'Upload a PNG, JPEG, or WebP organization logo.';
    }
    if (name === 'terms' && !options.checked) {
      return 'Confirm the registration terms to continue.';
    }
    if (name === 'privacy' && !options.checked) {
      return 'Confirm the privacy notice to continue.';
    }
    return '';
  }

  function initialize(form) {
    if (!form) return;
    const summary = form.querySelector('[data-registration-summary]');
    const summaryList = form.querySelector('[data-registration-summary-list]');
    const fields = [...form.querySelectorAll('input[name]:not([type="hidden"]), textarea[name]')];
    const errors = new Map([...form.querySelectorAll('[data-field-error]')]
      .map(node => [node.dataset.fieldError, node]));
    const messages = new Map();

    errors.forEach((node, name) => {
      if (!node.hidden && node.textContent.trim()) messages.set(name, node.textContent.trim());
    });

    const renderSummary = () => {
      if (!summary || !summaryList) return;
      summaryList.replaceChildren(...[...messages.values()].map(message => {
        const item = document.createElement('li');
        item.textContent = message;
        return item;
      }));
      summary.hidden = messages.size === 0;
    };

    const validateField = field => {
      const name = field.name;
      const message = validationMessage(name, field.value, {
        password: form.elements.password ? form.elements.password.value : '',
        checked: field.checked,
        file: field.files && field.files[0],
        maxBytes: field.dataset.maxBytes
      });
      field.setCustomValidity(message);
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        messages.set(name, message);
      } else {
        field.removeAttribute('aria-invalid');
        messages.delete(name);
      }
      const container = field.closest('.registration-field, .registration-consent');
      if (container) container.classList.toggle('has-error', Boolean(message));
      const node = errors.get(name);
      if (node) {
        node.textContent = message;
        node.hidden = !message;
      }
      renderSummary();
      return !message;
    };

    fields.forEach(field => {
      const eventName = field.type === 'file' || field.type === 'checkbox' ? 'change' : 'input';
      field.addEventListener(eventName, () => {
        validateField(field);
        if (field.name === 'password' && form.elements.confirm && form.elements.confirm.value) {
          validateField(form.elements.confirm);
        }
      });
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', event => {
      const invalid = fields.filter(field => !validateField(field));
      if (!invalid.length) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      renderSummary();
      if (summary) summary.focus({ preventScroll: true });
      invalid[0].focus();
      invalid[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, true);

    renderSummary();
  }

  if (typeof document !== 'undefined') {
    const start = () => initialize(document.querySelector('[data-registration-form]'));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }

  return { validHttpUrl, validationMessage, initialize };
});
