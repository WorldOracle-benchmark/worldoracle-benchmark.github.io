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
    if (name === 'supplemental') {
      if (!text) return "Provide review notes to support the organizer's assessment.";
      if (text.length > 4000) return 'Review notes must be 4,000 characters or fewer.';
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
    const teamNameField = form.elements.team_name;
    const teamNameCheck = form.querySelector('[data-team-name-check]');
    const teamNameStatus = form.querySelector('[data-team-name-status]');
    const apiBase = (document.querySelector('meta[name="worldoracle-api-base"]')?.content || '').replace(/\/$/, '');
    const authDialog = form.querySelector('[data-team-auth-dialog]');
    const authPanel = authDialog?.querySelector('.team-auth-dialog-panel');
    const authEmail = form.elements.team_auth_email;
    const authPassword = form.elements.team_auth_password;
    const authConfirm = form.querySelector('[data-team-auth-confirm]');
    let teamCheckState = 'idle';
    let checkedTeamName = '';
    let teamCheckSequence = 0;

    const copy = () => document.documentElement.lang.toLowerCase().startsWith('zh') ? {
      headingNew: '创建提交账号', headingSame: '添加新模型账号',
      helpNew: '公开展示的模型提交队伍名称。', helpSame: '请输入现有队伍已登记的公开名称。',
      submitNew: '创建账号并验证邮箱 ↗', submitSame: '添加模型并验证邮箱 ↗',
      checkTeam: '检查队伍', checkingTeam: '正在检查…',
      teamFound: '已找到该队伍，可以继续添加新模型。',
      teamMissing: '未找到使用该名称且已完成邮箱验证的队伍。',
      teamCheckFailed: '暂时无法检查队伍，请稍后重试。',
      teamCheckRequired: '请先检查并确认队伍名称。'
    } : {
      headingNew: 'Create Submission Account', headingSame: 'Add a Model Account',
      helpNew: 'Public name of the team submitting this model.',
      helpSame: 'Enter the existing public team name exactly as registered.',
      submitNew: 'Create Account & Verify Email ↗', submitSame: 'Add Model & Verify Email ↗',
      checkTeam: 'Check team', checkingTeam: 'Checking…',
      teamFound: 'Team found. You can continue with the new model account.',
      teamMissing: 'No verified team was found with this name.',
      teamCheckFailed: 'The team could not be checked. Please try again.',
      teamCheckRequired: 'Check and confirm the team name before continuing.'
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

    const normalizedTeamName = () => String(teamNameField?.value || '').trim().toLocaleLowerCase();

    const renderTeamCheck = () => {
      const sameTeam = modeField?.value === 'same_team';
      const strings = copy();
      if (teamNameCheck) {
        teamNameCheck.hidden = !sameTeam;
        teamNameCheck.textContent = teamCheckState === 'checking' ? strings.checkingTeam : strings.checkTeam;
        teamNameCheck.disabled = !sameTeam || teamCheckState === 'checking' || !String(teamNameField?.value || '').trim();
      }
      if (teamNameStatus) {
        const messages = {
          found: strings.teamFound,
          missing: strings.teamMissing,
          error: strings.teamCheckFailed,
          required: strings.teamCheckRequired
        };
        const message = messages[teamCheckState] || '';
        teamNameStatus.textContent = message;
        teamNameStatus.hidden = !sameTeam || !message;
        teamNameStatus.classList.toggle('is-success', teamCheckState === 'found');
        teamNameStatus.classList.toggle('is-error', ['missing', 'error', 'required'].includes(teamCheckState));
      }
      if (submitButton) submitButton.disabled = sameTeam && teamCheckState !== 'found';
      form.dataset.teamNameChecked = String(sameTeam && teamCheckState === 'found');
    };

    const invalidateTeamCheck = () => {
      teamCheckSequence += 1;
      teamCheckState = 'idle';
      checkedTeamName = '';
      form.dataset.teamAuthReady = 'false';
      renderTeamCheck();
    };

    const checkTeamName = async () => {
      if (!teamNameField || !validateField(teamNameField)) {
        teamNameField?.focus();
        return;
      }
      const requestedName = normalizedTeamName();
      const sequence = ++teamCheckSequence;
      teamCheckState = 'checking';
      checkedTeamName = '';
      renderTeamCheck();
      try {
        const response = await fetch(`${apiBase}/api/v1/team-name-check`, {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ team_name: String(teamNameField.value || '').trim() })
        });
        let payload = {};
        try { payload = await response.json(); } catch (_) {}
        if (sequence !== teamCheckSequence || requestedName !== normalizedTeamName()) return;
        if (!response.ok) {
          teamCheckState = 'error';
          renderTeamCheck();
          return;
        }
        if (payload.exists === true) {
          checkedTeamName = requestedName;
          teamCheckState = 'found';
        } else {
          teamCheckState = 'missing';
        }
        renderTeamCheck();
      } catch (_) {
        if (sequence !== teamCheckSequence || requestedName !== normalizedTeamName()) return;
        teamCheckState = 'error';
        renderTeamCheck();
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

    const updateModeCopy = selected => {
      const strings = copy();
      if (heading) heading.textContent = selected === 'same_team' ? strings.headingSame : strings.headingNew;
      if (teamHelp) teamHelp.textContent = selected === 'same_team' ? strings.helpSame : strings.helpNew;
      if (submitButton) submitButton.textContent = selected === 'same_team' ? strings.submitSame : strings.submitNew;
    };

    const syncMode = mode => {
      const selected = mode === 'same_team' ? 'same_team' : 'new_account';
      if (modeField) modeField.value = selected;
      modeCards.forEach(card => {
        const active = card.dataset.registrationMode === selected;
        card.classList.toggle('is-active', active);
        card.setAttribute('aria-checked', String(active));
      });
      updateModeCopy(selected);
      invalidateTeamCheck();
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
        if (field === teamNameField && modeField?.value === 'same_team') invalidateTeamCheck();
        validateField(field);
        if (field === codeField) syncWeightsField();
        if (field.name === 'password' && form.elements.confirm && form.elements.confirm.value) {
          validateField(form.elements.confirm);
        }
      });
      field.addEventListener('blur', () => validateField(field));
    });

    modeCards.forEach(card => card.addEventListener('click', () => syncMode(card.dataset.registrationMode)));
    teamNameCheck?.addEventListener('click', checkTeamName);
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
    window.addEventListener('worldoracle:languagechange', () => {
      updateModeCopy(modeField?.value === 'same_team' ? 'same_team' : 'new_account');
      renderTeamCheck();
    });

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
      if (modeField?.value === 'same_team' &&
          (teamCheckState !== 'found' || checkedTeamName !== normalizedTeamName())) {
        event.preventDefault();
        event.stopImmediatePropagation();
        teamCheckState = 'required';
        renderTeamCheck();
        teamNameCheck?.focus();
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
