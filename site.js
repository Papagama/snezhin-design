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
    if (menuToggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      closeMenu();
      menuToggle.focus();
    }
    if (event.key === 'Tab') {
      const items = [menuToggle, ...menuPanel.querySelectorAll('a[href]')];
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 850) closeMenu();
  });
}

const revealItems = [...document.querySelectorAll('[data-reveal]')];
const stackItems = [...document.querySelectorAll('[data-stack-reveal]')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  revealItems.forEach(item => revealObserver.observe(item));

  const stackObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-stacked');
      stackObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });
  stackItems.forEach(item => stackObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
  stackItems.forEach(item => item.classList.add('is-stacked'));
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

const emailDialog = document.querySelector('[data-email-dialog]');
const emailLinks = [...document.querySelectorAll('a[href^="mailto:"]')];

if (emailDialog?.showModal && emailLinks.length) {
  const recipient = emailDialog.querySelector('[data-email-recipient]');
  const gmailLink = emailDialog.querySelector('[data-email-gmail]');
  const systemLink = emailDialog.querySelector('[data-email-system]');
  const copyButton = emailDialog.querySelector('[data-email-copy]');
  const status = emailDialog.querySelector('[data-email-status]');
  let activeLink = null;
  let email = '';

  const updateStatus = text => { status.textContent = text; };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    updateStatus('Адрес скопирован. Вставьте его в любое письмо.');
    copyButton.textContent = 'Адрес скопирован';
  };

  emailLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activeLink = link;
      const [address, query = ''] = link.getAttribute('href').slice('mailto:'.length).split('?');
      const subject = new URLSearchParams(query).get('subject') || 'Новая задача с snezhin.design';
      email = decodeURIComponent(address);
      recipient.textContent = email;
      gmailLink.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
      systemLink.href = link.getAttribute('href');
      copyButton.innerHTML = 'Скопировать адрес <span aria-hidden="true">⧉</span>';
      updateStatus('Адрес можно скопировать или открыть в удобной почте.');
      emailDialog.showModal();
      emailDialog.querySelector('.email-dialog__close').focus();
    });
  });

  copyButton.addEventListener('click', copyEmail);
  emailDialog.addEventListener('click', event => {
    const bounds = emailDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) emailDialog.close();
  });
  emailDialog.addEventListener('close', () => activeLink?.focus());
}
