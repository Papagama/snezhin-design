document.documentElement.classList.add('js');

const legacyRoutes = {
  '#/': '/',
  '#/works': '/portfolio.html',
  '#/about': '/about.html',
  '#/services': '/services.html',
  '#/contact': '/contact.html'
};

function handleLegacyHash() {
  const hash = window.location.hash;
  if (!hash) return;
  if (hash.startsWith('#/admin')) {
    window.location.replace(`/legacy-admin.html${hash}`);
    return;
  }
  const caseMatch = hash.match(/^#\/works\/([a-z0-9-]+)$/);
  if (caseMatch) {
    window.location.replace(`/portfolio/${caseMatch[1]}/`);
    return;
  }
  if (legacyRoutes[hash]) window.location.replace(legacyRoutes[hash]);
}

handleLegacyHash();
window.addEventListener('hashchange', handleLegacyHash);

const menuToggle = document.querySelector('[data-menu-toggle]');
const menuPanel = document.querySelector('[data-menu-panel]');

function closeMenu() {
  if (!menuToggle || !menuPanel) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  menuPanel.classList.remove('is-open');
  document.body.classList.remove('menu-open');
}

if (menuToggle && menuPanel) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menuPanel.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  menuPanel.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

const revealItems = [...document.querySelectorAll('[data-reveal]')];
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

const routeNav = document.querySelector('[data-case-route]');
if (routeNav && 'IntersectionObserver' in window) {
  const links = [...routeNav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-24% 0px -66% 0px', threshold: 0 });
  sections.forEach(section => sectionObserver.observe(section));
}

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  const status = contactForm.querySelector('[data-form-status]');
  contactForm.addEventListener('invalid', event => {
    event.target.setAttribute('aria-invalid', 'true');
    if (status) status.textContent = 'Проверьте обязательные поля и согласие перед отправкой.';
  }, true);
  contactForm.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
  });
}
