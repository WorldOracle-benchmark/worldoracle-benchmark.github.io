const navigationReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initializeScrollReveal() {
  const selectors = [
    'main.shell > *',
    '.guide-copy > section',
    '.form-layout > *',
    '.wizard-layout > *',
    '.card-grid > *',
    '.role-grid > *',
    '.team-grid > *',
    '.submission-list > *',
    '.profile-history > *'
  ];
  const targets = [...new Set(document.querySelectorAll(selectors.join(',')))];
  if (!targets.length) return;
  targets.forEach((element, index) => {
    element.dataset.scrollReveal = '';
    element.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
  });
  if (navigationReducedMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -9% 0px' });
  targets.forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9) element.classList.add('is-revealed');
    else observer.observe(element);
  });
  document.documentElement.classList.add('scroll-reveal-ready');
}

initializeScrollReveal();
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin || destination.href === window.location.href || navigationReducedMotion.matches) return;
  if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
  // Modern browsers perform the cross-document View Transition declared in CSS.
  // Let the native navigation start immediately so the fixed header never pauses.
  if ('startViewTransition' in document) return;
  event.preventDefault();
  document.documentElement.classList.add('is-navigating');
  window.setTimeout(() => { window.location.href = destination.href; }, 100);
});
window.addEventListener('pageshow', () => document.documentElement.classList.remove('is-navigating'));

const portalHeader = document.querySelector('[data-header]');
const portalMenuButton = document.querySelector('[data-menu-button]');
const portalMobileMenu = document.querySelector('[data-mobile-menu]');
let headerTicking = false;
function syncPortalHeader() {
  portalHeader?.classList.toggle('is-scrolled', window.scrollY > 8);
  headerTicking = false;
}
window.addEventListener('scroll', () => {
  if (!headerTicking) {
    headerTicking = true;
    window.requestAnimationFrame(syncPortalHeader);
  }
}, { passive: true });
syncPortalHeader();

portalMenuButton?.addEventListener('click', () => {
  const open = portalMenuButton.getAttribute('aria-expanded') === 'true';
  portalMenuButton.setAttribute('aria-expanded', String(!open));
  portalMobileMenu.classList.toggle('is-open', !open);
});
portalMobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  portalMenuButton.setAttribute('aria-expanded', 'false');
  portalMobileMenu.classList.remove('is-open');
}));

const guideLinks = [...document.querySelectorAll('.contents nav a')];
const guideSections = guideLinks.map(link => document.querySelector(link.hash)).filter(Boolean);
let scheduled = false;
function updateGuideLocation() {
  const offset = (portalHeader?.offsetHeight || 66) + 55;
  let active = guideSections[0]?.id;
  guideSections.forEach(section => { if (section.getBoundingClientRect().top <= offset) active = section.id; });
  guideLinks.forEach(link => {
    const selected = link.hash === '#' + active;
    link.classList.toggle('is-active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
}
if (guideLinks.length) {
  updateGuideLocation();
  ['scroll', 'resize'].forEach(event => window.addEventListener(event, () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateGuideLocation); }
  }, { passive: true }));
}
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', event => {
    if (event.defaultPrevented) return;
    if (form.hasAttribute('data-chunk-upload')) return;
    if (form.dataset.confirm && !window.confirm(form.dataset.confirm)) { event.preventDefault(); return; }
    const status = form.querySelector('[data-submit-status]');
    if (status) status.textContent = form.enctype === 'multipart/form-data' ? 'Uploading and checking the package. Please keep this page open…' : 'Saving your submission…';
    const button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
  });
});
window.addEventListener('pageshow', () => {
  document.querySelectorAll('form:not([data-chunk-upload]) button[type="submit"]').forEach(button => { button.disabled = false; });
});


const accountMenu = document.querySelector('[data-account-menu]');
if (accountMenu) {
  const trigger = accountMenu.querySelector('[data-account-trigger]');
  const dropdown = accountMenu.querySelector('.account-dropdown');
  let openedByHover = false;
  const setOpen = (open) => {
    trigger.setAttribute('aria-expanded', String(open));
    dropdown.hidden = !open;
  };
  accountMenu.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && dropdown.hidden) { openedByHover = true; setOpen(true); }
  });
  accountMenu.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !accountMenu.contains(document.activeElement)) { openedByHover = false; setOpen(false); }
  });
  trigger.addEventListener('click', () => {
    if (openedByHover) { openedByHover = false; setOpen(true); }
    else setOpen(dropdown.hidden);
  });
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); dropdown.querySelector('a').focus(); }
  });
  accountMenu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setOpen(false); openedByHover = false; trigger.focus(); }
  });
  accountMenu.addEventListener('focusout', () => {
    setTimeout(() => { if (!accountMenu.contains(document.activeElement)) setOpen(false); }, 0);
  });
  document.addEventListener('click', event => {
    if (!accountMenu.contains(event.target)) { setOpen(false); openedByHover = false; }
  });
}

// Policy Track is G2-only; retain the user's platform when switching back.
const platformSelect = document.querySelector('[data-platform-select]');
if (platformSelect) {
  const choices = [...document.querySelectorAll('input[name="benchmark_track"]')];
  let previousPlatform = platformSelect.value;
  let policyActive = false;
  const syncTrackPlatform = () => {
    const key = choices.find(input => input.checked)?.value;
    const policy = key === 'policy';
    if (policy && !policyActive) previousPlatform = platformSelect.value;
    [...platformSelect.options].forEach(option => {
      option.disabled = policy && option.value !== 'agibot_g2';
      option.hidden = option.disabled;
    });
    if (policy) platformSelect.value = 'agibot_g2';
    else if (policyActive) platformSelect.value = previousPlatform;
    policyActive = policy;
    document.querySelector('[data-track-help]').textContent = policy
      ? 'Policy Track: upload complete prediction videos on policy-rollout actions. AgiBot G2 only; PO / KRO / IA / MVC where supported.'
      : 'Upload prediction videos on recorded actions. PO / KRO / IA / MVC where supported; Main evaluates 30s, Long-Horizon evaluates full trajectories.';
  };
  choices.forEach(input => input.addEventListener('change', syncTrackPlatform));
  window.addEventListener('pageshow', syncTrackPlatform);
  syncTrackPlatform();
}
