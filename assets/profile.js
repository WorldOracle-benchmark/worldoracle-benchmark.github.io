/* Upgrade the API-rendered Profile into a structured settings page without duplicating account logic. */
(() => {
  'use strict';

  const root = document.querySelector('[data-profile]');
  if (!root) return;

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const valueFor = (summary, labels) => {
    const terms = [...summary.querySelectorAll('dt')];
    const term = terms.find(item => labels.includes(item.textContent.trim()));
    return term?.nextElementSibling?.textContent.trim() || '';
  };

  const addFieldNotes = summary => {
    const notes = new Map([
      ['Model', 'The model identity is locked after organizer approval.'],
      ['模型', '模型身份将在主办方审核通过后锁定。'],
      ['Organization', 'Displayed with this model on public benchmark records.'],
      ['所属机构', '将在公开评测记录中与该模型一同展示。'],
      ['Status', 'Submission access follows the organizer review state.'],
      ['状态', '提交权限取决于主办方审核状态。']
    ]);
    summary.querySelectorAll('dt').forEach(term => {
      const description = notes.get(term.textContent.trim());
      const value = term.nextElementSibling;
      if (!description || !value || value.querySelector('.settings-field-note')) return;
      value.append(make('span', 'settings-field-note', description));
    });
  };

  const sidebarLink = (href, label, active = false) => {
    const link = make('a', active ? 'is-active' : '', label);
    link.href = href;
    if (active) link.setAttribute('aria-current', 'page');
    return link;
  };

  const enhance = () => {
    if (root.dataset.settingsEnhanced === 'true') return true;
    const heading = root.querySelector(':scope > .page-heading');
    const identity = root.querySelector(':scope > .team-summary');
    const resources = root.querySelector(':scope > .resource-update-panel');
    if (!heading || !identity || !resources) return false;

    root.dataset.settingsEnhanced = 'true';
    root.classList.add('account-settings-page');

    const titleBlock = heading.querySelector(':scope > div');
    const accountName = titleBlock?.querySelector('h1')?.textContent.trim() || 'Submission Account';
    const email = titleBlock?.querySelector('.muted')?.textContent.trim() || '';
    const passwordLink = heading.querySelector('a[href*="change-password"]');
    passwordLink?.remove();
    heading.className = 'settings-page-heading';
    if (titleBlock) {
      const eyebrow = titleBlock.querySelector('.eyebrow');
      const title = titleBlock.querySelector('h1');
      const description = titleBlock.querySelector('.muted');
      if (eyebrow) eyebrow.textContent = 'Account Settings';
      if (title) title.textContent = 'Profile';
      if (description) description.textContent = 'Manage the identity, review status, public resources, and security of this submission account.';
    }

    const identitySummary = identity.querySelector('.summary');
    const status = identitySummary
      ? valueFor(identitySummary, ['Status', '状态', 'Registration Review', '注册审核'])
      : '';
    const initial = [...accountName.trim()][0]?.toUpperCase() || 'W';

    identity.id = 'profile-overview';
    identity.className = 'settings-section settings-identity';
    const identityTitle = identity.querySelector('h2');
    if (identityTitle) identityTitle.textContent = 'Account Identity';
    const identityDescription = make('p', 'settings-section-description', 'Organizer-approved details used to identify this model across submissions and public benchmark records.');
    identityTitle?.insertAdjacentElement('afterend', identityDescription);

    const identityHeader = make('div', 'settings-identity-header');
    const avatar = make('span', 'settings-avatar', initial);
    avatar.setAttribute('aria-hidden', 'true');
    avatar.setAttribute('data-i18n-skip', '');
    const identityCopy = make('div', 'settings-identity-copy');
    identityCopy.append(make('strong', '', accountName), make('span', '', email));
    identityHeader.append(avatar, identityCopy);
    if (status) identityHeader.append(make('span', 'badge approved', status));
    identityDescription.insertAdjacentElement('afterend', identityHeader);
    if (identitySummary) {
      identitySummary.classList.add('settings-details');
      addFieldNotes(identitySummary);
    }

    resources.id = 'public-resources';
    resources.classList.add('settings-section');
    const resourcesHeading = resources.querySelector('.page-heading');
    resourcesHeading?.classList.add('settings-section-heading');
    resources.querySelector('.summary')?.classList.add('settings-details');

    const security = make('section', 'settings-section settings-security');
    security.id = 'security';
    const securityHeading = make('div', 'settings-section-heading');
    const securityTitle = make('div');
    securityTitle.append(
      make('h2', '', 'Password & Security'),
      make('p', 'settings-section-description', 'Use a unique password for this account and update it whenever access changes.')
    );
    securityHeading.append(securityTitle);
    const securityRow = make('div', 'settings-security-row');
    const securityCopy = make('div');
    securityCopy.append(
      make('strong', '', 'Account password'),
      make('p', '', 'Changing the password signs future requests with the new credential; your submission history remains unchanged.')
    );
    if (passwordLink) {
      passwordLink.textContent = 'Change Password →';
      passwordLink.classList.add('button');
    }
    securityRow.append(securityCopy);
    if (passwordLink) securityRow.append(passwordLink);
    security.append(securityHeading, securityRow);

    const sidebar = make('aside', 'settings-sidebar');
    sidebar.setAttribute('aria-label', 'Profile settings');
    sidebar.append(make('p', 'settings-sidebar-label', 'Settings'));
    const nav = make('nav');
    nav.setAttribute('aria-label', 'Profile sections');
    nav.append(
      sidebarLink('#profile-overview', 'Profile', true),
      sidebarLink('#public-resources', 'Public Resources'),
      sidebarLink('#security', 'Password & Security')
    );
    sidebar.append(nav);
    const sidebarStatus = make('div', 'settings-sidebar-status');
    sidebarStatus.append(
      make('span', '', 'Review Status'),
      make('strong', '', status || 'Unavailable')
    );
    sidebar.append(sidebarStatus);

    const content = make('div', 'settings-content');
    content.append(identity, resources, security);
    const layout = make('div', 'account-settings-layout');
    layout.append(sidebar, content);

    root.replaceChildren(heading, layout);

    nav.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      nav.querySelectorAll('a').forEach(item => {
        item.classList.toggle('is-active', item === link);
        if (item === link) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    });
    return true;
  };

  if (enhance()) return;
  const observer = new MutationObserver(() => {
    if (!enhance()) return;
    observer.disconnect();
  });
  observer.observe(root, { childList: true, subtree: true });
})();
