(() => {
  'use strict';

  const TOKEN_KEY = 'worldoracle_submission_token';
  const scriptUrl = new URL(document.currentScript?.src || 'assets/unified-nav.js', window.location.href);
  const root = new URL('../', scriptUrl);
  const urls = {
    project: new URL('./', root).href,
    leaderboard: new URL('leaderboard.html', root).href,
    guide: new URL('submission/', root).href,
    login: new URL('submission/login/', root).href,
    submissions: new URL('submission/dashboard/', root).href,
    profile: new URL('submission/profile/', root).href
  };

  function hasSession() {
    try { return Boolean(window.sessionStorage.getItem(TOKEN_KEY)); }
    catch (_) { return false; }
  }

  function activeItem() {
    const path = window.location.pathname.replace(/index\.html$/, '');
    if (/\/leaderboard\.html$/.test(path)) return 'leaderboard';
    if (/\/submission\/login(?:\/register)?\/?$/.test(path)) return 'login';
    if (/\/submission\/(dashboard|edit|view)\//.test(path)) return 'submissions';
    if (/\/submission\/(profile|change-password)\//.test(path)) return 'profile';
    if (/\/submission\//.test(path)) return 'guide';
    return 'project';
  }

  function link(item, current) {
    const anchor = document.createElement('a');
    anchor.href = urls[item.key];
    anchor.textContent = item.label;
    if (item.key === current) {
      anchor.classList.add('is-active');
      anchor.setAttribute('aria-current', 'page');
    }
    return anchor;
  }

  function logoutButton() {
    const button = document.createElement('button');
    button.className = 'nav-button';
    button.type = 'button';
    button.textContent = 'Sign Out';
    button.addEventListener('click', () => {
      try { window.sessionStorage.removeItem(TOKEN_KEY); } catch (_) {}
      window.location.assign(urls.login);
    });
    return button;
  }

  function languageButton(extraClass = '') {
    const button = document.createElement('button');
    button.className = `language-toggle ${extraClass}`.trim();
    button.type = 'button';
    button.dataset.languageToggle = '';
    button.dataset.i18nSkip = '';
    const primary = document.createElement('span');
    primary.className = 'language-primary';
    primary.textContent = 'ENG';
    const divider = document.createElement('span');
    divider.className = 'language-divider';
    divider.setAttribute('aria-hidden', 'true');
    divider.textContent = '/';
    const secondary = document.createElement('span');
    secondary.className = 'language-secondary';
    secondary.textContent = '中文';
    button.append(primary, divider, secondary);
    return button;
  }

  function ensureMobileNavigation(header) {
    let menuButton = header.querySelector('[data-menu-button]');
    if (!menuButton) {
      menuButton = document.createElement('button');
      menuButton.className = 'menu-button';
      menuButton.type = 'button';
      menuButton.setAttribute('aria-label', 'Open Navigation');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.dataset.menuButton = '';
      menuButton.append(document.createElement('span'), document.createElement('span'));
      header.querySelector('.header-inner')?.append(menuButton);
    }
    let mobile = document.querySelector('[data-mobile-menu]');
    if (!mobile) {
      mobile = document.createElement('nav');
      mobile.className = 'mobile-menu';
      mobile.dataset.mobileMenu = '';
      mobile.setAttribute('aria-label', 'Mobile Navigation');
      header.after(mobile);
    }
    if (!menuButton.dataset.unifiedMenuBound) {
      menuButton.dataset.unifiedMenuBound = 'true';
      menuButton.addEventListener('click', () => {
        const open = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', String(!open));
        mobile.classList.toggle('is-open', !open);
      });
      mobile.addEventListener('click', event => {
        if (!event.target.closest('a,button')) return;
        menuButton.setAttribute('aria-expanded', 'false');
        mobile.classList.remove('is-open');
      });
    }
    return mobile;
  }

  function render() {
    const header = document.querySelector('[data-header]');
    const desktop = header?.querySelector('.desktop-nav');
    if (!header || !desktop) return;
    const authenticated = hasSession();
    const current = activeItem();
    const items = authenticated
      ? [
          { key: 'project', label: 'Project Page' },
          { key: 'leaderboard', label: 'Leaderboard' },
          { key: 'guide', label: 'Submission Guide' },
          { key: 'submissions', label: 'My Submissions' },
          { key: 'profile', label: 'Profile' }
        ]
      : [
          { key: 'project', label: 'Project Page' },
          { key: 'leaderboard', label: 'Leaderboard' },
          { key: 'guide', label: 'Submission Guide' },
          { key: 'login', label: 'Sign In' }
        ];

    desktop.replaceChildren(...items.map(item => link(item, current)));
    if (authenticated) desktop.append(logoutButton());
    // Language switching stays available in both anonymous and signed-in
    // navigation states.
    desktop.append(languageButton());

    const inner = header.querySelector('.header-inner');
    let mobileLanguage = inner?.querySelector('.mobile-language-toggle');
    if (!mobileLanguage && inner) {
      mobileLanguage = languageButton('mobile-language-toggle');
      const menuButton = inner.querySelector('[data-menu-button]');
      inner.insertBefore(mobileLanguage, menuButton || null);
    }
    if (mobileLanguage) mobileLanguage.hidden = false;

    const mobile = ensureMobileNavigation(header);
    mobile.replaceChildren(...items.map(item => link(item, current)));
    if (authenticated) mobile.append(logoutButton());
  }

  render();
  window.addEventListener('pageshow', render);
  window.WorldOracleNavigation = { render };
})();
