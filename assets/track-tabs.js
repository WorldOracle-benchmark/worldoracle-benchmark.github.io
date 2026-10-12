/* Progressive enhancement: without JS all three result tables remain readable. */
function initializeTrackTabs(root, location, history, listen) {
  const nav = root.querySelector('[data-track-tabs]');
  if (!nav) return;
  const tabs = Array.from(nav.querySelectorAll('[data-track-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-track-panel]'));
  const aliases = {'#leaderboard':'main', '#policy-track':'policy', '#long-horizon':'long_horizon'};
  nav.setAttribute('role', 'tablist');
  function activate(key, updateURL = false) {
    if (!tabs.some(tab => tab.dataset.trackTab === key)) key = 'main';
    tabs.forEach(tab => {
      const active = tab.dataset.trackTab === key;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.trackPanel !== key;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', 'tab-' + panel.dataset.trackPanel);
      panel.tabIndex = 0;
    });
    if (updateURL) {
      const panel = panels.find(panel => panel.dataset.trackPanel === key);
      history.replaceState(null, '', '#' + panel.id);
    }
  }
  function revealDeepLink(hash) {
    if (!hash || aliases[hash]) return;
    const target = root.querySelector(hash);
    if (!target || typeof target.scrollIntoView !== 'function') return;
    const schedule = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : callback => callback();
    schedule(() => target.scrollIntoView({block:'start'}));
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.trackTab, true));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activate(tabs[next].dataset.trackTab, true);
      tabs[next].focus();
    });
  });
  activate(aliases[location.hash]);
  revealDeepLink(location.hash);
  listen('hashchange', () => {
    activate(aliases[location.hash]);
    revealDeepLink(location.hash);
  });
}
if (typeof document !== 'undefined') {
  initializeTrackTabs(document, window.location, window.history, window.addEventListener.bind(window));
}
if (typeof module !== 'undefined') module.exports = {initializeTrackTabs};
