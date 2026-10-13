(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WorldOracleRegistration = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const urlLabels = {
    github_url: 'code repository',
    huggingface_url: 'model weights',
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
    if (name === 'team_auth_email') {
      if (!text) return 'Enter the original team account email.';
      if (text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        return 'Enter the original team account email.';
      }
    }
    if (name === 'team_auth_password' && !String(value || '')) {
      return 'Enter the original team account password.';
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
    const clientMessages = new Map();
    const serverMessages = new Map();
    const codeField = form.elements.github_url;
    const weightsField = form.elements.huggingface_url;
    const weightsRegion = form.querySelector('[data-weights-field]');
    const modeField = form.elements.registration_mode;
    const modeCards = [...form.querySelectorAll('[data-registration-mode]')];
    const heading = form.querySelector('[data-registration-heading]');
    const teamHelp = form.querySelector('[data-team-name-help]');
    const submitButton = form.querySelector('[data-registration-submit]');
    const authDialog = form.querySelector('[data-team-auth-dialog]');
    const authPanel = authDialog?.querySelector('.team-auth-dialog-panel');
    const authEmail = form.elements.team_auth_email;
    const authPassword = form.elements.team_auth_password;
    const authConfirm = form.querySelector('[data-team-auth-confirm]');

    const copy = () => document.documentElement.lang.toLowerCase().startsWith('zh') ? {
      headingNew: '创建提交账号', headingSame: '添加新模型账号',
      helpNew: '公开展示的模型提交队伍名称。', helpSame: '请输入现有队伍已登记的公开名称。',
      submitNew: '创建账号并验证邮箱 ↗', submitSame: '添加模型并验证邮箱 ↗'
    } : {
      headingNew: 'Create Submission Account', headingSame: 'Add a Model Account',
      helpNew: 'Public name of the team submitting this model.',
      helpSame: 'Enter the existing public team name exactly as registered.',
      submitNew: 'Create Account & Verify Email ↗', submitSame: 'Add Model & Verify Email ↗'
    };

    errors.forEach((node, name) => {
      if (!node.hidden && node.textContent.trim()) serverMessages.set(name, node.textContent.trim());
    });

    const combinedMessages = () => {
      const combined = new Map(serverMessages);
      clientMessages.forEach((message, name) => combined.set(name, message));
      return combined;
    };

    const renderSummary = () => {
      if (!summary || !summaryList) return;
      const messages = combinedMessages();
      summaryList.replaceChildren(...[...messages.values()].map(message => {
        const item = document.createElement('li');
        item.textContent = message;
        return item;
      }));
      summary.hidden = messages.size === 0;
    };

    const renderField = name => {
      const message = clientMessages.get(name) || serverMessages.get(name) || '';
      const field = form.elements[name];
      const node = errors.get(name);
      if (node) {
        node.textContent = message;
        node.hidden = !message;
      }
      if (field) {
        field.toggleAttribute('aria-invalid', Boolean(message));
        field.closest('.registration-field, .registration-consent')?.classList.toggle('has-error', Boolean(message));
      }
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
        clientMessages.set(name, message);
      } else {
        clientMessages.delete(name);
      }
      renderField(name);
      renderSummary();
      return !message;
    };

    const closeAuthDialog = (disable = true) => {
      if (!authDialog) return;
      authDialog.hidden = true;
      document.body.classList.remove('team-auth-open');
      if (disable) {
        if (authEmail) authEmail.disabled = true;
        if (authPassword) authPassword.disabled = true;
        form.dataset.teamAuthReady = 'false';
      }
    };

    const openAuthDialog = () => {
      if (!authDialog) return;
      if (authEmail) authEmail.disabled = false;
      if (authPassword) authPassword.disabled = false;
      authDialog.hidden = false;
      document.body.classList.add('team-auth-open');
      authPanel?.focus({ preventScroll: true });
      (authEmail?.value ? authPassword : authEmail)?.focus();
    };

    const syncMode = mode => {
      const selected = mode === 'same_team' ? 'same_team' : 'new_account';
      if (modeField) modeField.value = selected;
      modeCards.forEach(card => {
        const active = card.dataset.registrationMode === selected;
        card.classList.toggle('is-active', active);
        card.setAttribute('aria-checked', String(active));
      });
      const strings = copy();
      if (heading) heading.textContent = selected === 'same_team' ? strings.headingSame : strings.headingNew;
      if (teamHelp) teamHelp.textContent = selected === 'same_team' ? strings.helpSame : strings.helpNew;
      if (submitButton) submitButton.textContent = selected === 'same_team' ? strings.submitSame : strings.submitNew;
      form.dataset.teamAuthReady = 'false';
      if (selected !== 'same_team') {
        closeAuthDialog();
        ['team_auth_email', 'team_auth_password'].forEach(name => {
          clientMessages.delete(name); serverMessages.delete(name); renderField(name);
        });
      } else if (!authDialog?.hidden && (serverMessages.has('team_auth_email') || serverMessages.has('team_auth_password'))) {
        openAuthDialog();
      } else {
        if (authEmail) authEmail.disabled = true;
        if (authPassword) authPassword.disabled = true;
      }
      renderSummary();
    };

    const syncWeightsField = () => {
      if (!codeField || !weightsField || !weightsRegion) return;
      const codeValue = String(codeField.value || '').trim();
      const reveal = Boolean(codeValue) && !validationMessage('github_url', codeValue);
      weightsRegion.classList.toggle('is-revealed', reveal);
      weightsRegion.setAttribute('aria-hidden', String(!reveal));
      weightsField.disabled = !reveal;
      if (!reveal) {
        clientMessages.delete('huggingface_url');
        serverMessages.delete('huggingface_url');
        renderField('huggingface_url');
        renderSummary();
      }
    };

    fields.forEach(field => {
      const eventName = field.type === 'file' || field.type === 'checkbox' ? 'change' : 'input';
      field.addEventListener(eventName, () => {
        serverMessages.delete(field.name);
        validateField(field);
        if (field === codeField) syncWeightsField();
        if (field.name === 'password' && form.elements.confirm && form.elements.confirm.value) {
          validateField(form.elements.confirm);
        }
      });
      field.addEventListener('blur', () => validateField(field));
    });

    modeCards.forEach(card => card.addEventListener('click', () => syncMode(card.dataset.registrationMode)));
    form.querySelectorAll('[data-team-auth-close]').forEach(node => node.addEventListener('click', () => closeAuthDialog()));
    authConfirm?.addEventListener('click', () => {
      const authFields = [authEmail, authPassword].filter(Boolean);
      const invalid = authFields.filter(field => !validateField(field));
      if (invalid.length) {
        invalid[0].focus();
        return;
      }
      form.dataset.teamAuthReady = 'true';
      closeAuthDialog(false);
      form.requestSubmit();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && authDialog && !authDialog.hidden) closeAuthDialog();
    });
    window.addEventListener('worldoracle:languagechange', () => syncMode(modeField?.value));

    form.addEventListener('registration:server-errors', event => {
      serverMessages.clear();
      Object.entries(event.detail?.errors || {}).forEach(([name, message]) => {
        if (message) serverMessages.set(name, String(message));
      });
      errors.forEach((_, name) => renderField(name));
      renderSummary();
      syncWeightsField();
      if (serverMessages.has('team_auth_email') || serverMessages.has('team_auth_password')) {
        openAuthDialog();
      }
    });

    form.addEventListener('submit', event => {
      syncWeightsField();
      const invalid = fields.filter(field => !field.disabled && !validateField(field));
      if (invalid.length) {
        event.preventDefault();
        event.stopImmediatePropagation();
        renderSummary();
        if (summary) summary.focus({ preventScroll: true });
        invalid[0].focus();
        invalid[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (modeField?.value === 'same_team' && form.dataset.teamAuthReady !== 'true') {
        event.preventDefault();
        event.stopImmediatePropagation();
        openAuthDialog();
      }
    }, true);

    syncMode(modeField?.value);
    if (serverMessages.has('team_auth_email') || serverMessages.has('team_auth_password')) openAuthDialog();
    syncWeightsField();
    renderSummary();
  }

  if (typeof document !== 'undefined') {
    const start = () => initialize(document.querySelector('[data-registration-form]'));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }

  return { validHttpUrl, validationMessage, initialize };
});
