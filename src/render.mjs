import { site, navigation, expertise, processSteps, services, cases, getCase } from './site-data.mjs';
import { articles } from './articles.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const absolute = path => /^https?:\/\//.test(path) ? path : `${site.baseUrl}${path === '/' ? '/' : path}`;
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const compactDashes = value => String(value).replaceAll('—', '–');
const emailHref = (subject = 'Новая задача с snezhin.design') => `mailto:${site.email}?subject=${encodeURIComponent(subject)}`;

const breadcrumbSchema = items => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: absolute(item.href)
  }))
});

const professionalSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: site.name,
  url: site.baseUrl,
  image: `${site.baseUrl}/public/og.png`,
  email: site.email,
  founder: { '@type': 'Person', name: site.author },
  areaServed: ['Калининград', 'Россия', 'Удалённо'],
  sameAs: [site.telegram, site.vk]
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.author,
  url: site.baseUrl,
  jobTitle: 'Веб-дизайнер и frontend-разработчик',
  email: site.email,
  sameAs: [site.telegram, site.vk]
};

const pageHead = ({ title, description, path, type = 'website', image = '/public/og.png', schema = [] }) => {
  const canonical = absolute(path);
  const schemas = Array.isArray(schema) ? schema : [schema];
  return `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="${esc(type)}">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(absolute(image))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#F6F4EF">
  <link rel="icon" href="/public/favicon.svg?v=20260906-jura" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/public/apple-touch-icon.png?v=20260906-jura">
  <link rel="stylesheet" href="/site.css?v=20260906-jura">
  ${schemas.filter(Boolean).map(item => `<script type="application/ld+json">${json(item)}</script>`).join('\n  ')}
  <script src="/site.js?v=20260906-email-actions" defer></script>`;
};

const header = current => `
  <a class="skip-link" href="#main">К содержанию</a>
  <header class="site-header" data-header>
    <div class="shell header-inner">
      <a class="brand" href="/" aria-label="snezhin.design — главная"><span class="brand-symbol" aria-hidden="true">S</span>snezhin<span class="brand-domain">.design</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="Открыть меню" data-menu-toggle>
        <span></span><span></span>
      </button>
      <div class="menu-panel" id="site-menu" data-menu-panel>
        <nav class="main-nav" aria-label="Основная навигация">
          ${navigation.map(item => `<a href="${item.href}"${current === item.key ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}
        </nav>
        <a class="button button--compact button--ink" href="/contact.html">Обсудить проект <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="shell">
      <div class="footer-contact-row">
        <span class="footer-label">Есть задача?</span>
        <a class="footer-action" href="/contact.html">Связаться <span aria-hidden="true">↗</span></a>
      </div>
      <div class="footer-grid">
        <div>
          <a class="brand brand--light" href="/">snezhin.design</a>
          <p>Веб-дизайн и разработка для брендов, экспертов и новых проектов.</p>
        </div>
        <nav aria-label="Навигация в подвале">
          <span class="footer-label">Страницы</span>
          ${navigation.map(item => `<a href="${item.href}">${item.label}</a>`).join('')}
          <a href="/contact.html">Контакты</a>
        </nav>
        <div class="footer-contacts">
          <span class="footer-label">Связь</span>
          <a href="mailto:${site.email}">${site.email}</a>
          <a href="${site.telegram}" target="_blank" rel="noopener">Telegram</a>
          <a href="${site.vk}" target="_blank" rel="noopener">VK</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${site.year} ${site.name}</span>
        <a href="/privacy.html">Обработка данных</a>
        <span>Калининград / удалённо</span>
      </div>
    </div>
  </footer>`;

const emailDialog = () => `
  <dialog class="email-dialog" data-email-dialog aria-labelledby="email-dialog-title">
    <form class="email-dialog__panel" method="dialog">
      <button class="email-dialog__close" type="submit" aria-label="Закрыть окно">×</button>
      <p class="eyebrow">Написать письмо</p>
      <h2 id="email-dialog-title">Выберите способ связи</h2>
      <p class="email-dialog__address" data-email-recipient></p>
      <div class="email-dialog__actions">
        <a class="button button--accent" data-email-gmail target="_blank" rel="noopener">Открыть Gmail <span aria-hidden="true">↗</span></a>
        <a class="button button--ink" data-email-system>Открыть почтовое приложение <span aria-hidden="true">↗</span></a>
        <button class="button button--copy" type="button" data-email-copy>Скопировать адрес <span aria-hidden="true">⧉</span></button>
      </div>
      <p class="email-dialog__status" data-email-status aria-live="polite">Адрес можно скопировать или открыть в удобной почте.</p>
    </form>
  </dialog>`;

const shell = ({ current, title, description, path, body, bodyClass = '', type, image, schema }) => compactDashes(`<!doctype html>
<html lang="ru">
<head>${pageHead({ title, description, path, type, image, schema })}
</head>
<body class="${esc(bodyClass)}">
${header(current)}
<main id="main">${body}</main>
${footer()}
${emailDialog()}
</body>
</html>
`);

const indexLine = (number, label, light = false) => `<p class="index-line${light ? ' index-line--light' : ''}"><span class="section-number">${esc(number)}</span>${esc(label)}</p>`;

const image = (item, { eager = false, className = '' } = {}) => `<img${className ? ` class="${className}"` : ''} src="${item.src}"${/^\/assets\/(cases|profile)\/.+\.png$/.test(item.src) ? ` srcset="${item.src.replace(/\.png$/, '.webp')}"` : ''} alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

const portrait = {
  src: '/assets/profile/kirill-snezhin.png',
  alt: 'Портрет веб-дизайнера Кирилла Снежина',
  width: 1024,
  height: 1024
};

const caseCard = (item, index, variant = '') => `
  <article class="project-card${variant ? ` project-card--${variant}` : ''}" data-reveal>
    <a class="project-image" href="/portfolio/${item.slug}/" aria-label="Открыть кейс ${esc(item.title)}">
      ${image(item.cover, { eager: index < 1 })}
      <span class="project-view" aria-hidden="true">↗</span>
    </a>
    <div class="project-meta">
      <p class="project-kind"><span>${esc(item.category)} · Концепт</span><span>${item.year}</span></p>
      <h3><a href="/portfolio/${item.slug}/"><span>${esc(item.title)}</span><small>${esc(item.subtitle)}</small></a></h3>
      <p>${esc(item.summary)}</p>
    </div>
  </article>`;

const servicesList = (limit = services.length) => `<div class="service-rows">
${services.slice(0, limit).map(item => `
    <a class="service-row" href="${item.href}" data-reveal>
      <span class="mono service-index">${item.number}</span>
      <span><strong>${esc(item.title)}</strong><small>${esc(item.text)}</small></span>
      <span class="service-cost"><b>${esc(item.price)}</b><small>${esc(item.time)}</small></span>
      <span class="service-arrow" aria-hidden="true">↗</span>
    </a>`).join('')}
</div>`;

const processGrid = (limit = processSteps.length) => `<div class="process-grid">
  ${processSteps.slice(0, limit).map(item => `<article class="process-step" data-reveal><span class="mono">${item.number}</span><h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}
</div>`;

const faqBlock = faqs => `<div class="faq-list">
  ${faqs.map(([question, answer], index) => `<details class="faq-item"${index === 0 ? ' open' : ''}><summary><span>${esc(question)}</span><span aria-hidden="true">+</span></summary><p>${esc(answer)}</p></details>`).join('')}
</div>`;

const faqSchema = faqs => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer }
  }))
});

export const renderHome = () => {
  const featured = cases.slice(0, 4);
  const body = `
    <section class="home-hero shell">
      <div class="hero-topline"><p class="eyebrow">Независимый веб-дизайнер и разработчик</p><span>Калининград · Работаю удалённо</span></div>
      <h1>Дизайн со смыслом.<br><em>Сайты с характером.</em></h1>
      <div class="hero-introduction">
        <figure class="hero-portrait">${image(portrait, { eager: true })}<figcaption><strong>Кирилл Снежин</strong><span>От идеи до запуска</span></figcaption></figure>
        <p class="hero-copy">Помогаю бизнесу обрести своё лицо в интернете. Продумываю структуру, создаю дизайн и превращаю его в работающий сайт.</p>
        <div class="hero-actions"><a class="button button--accent" href="${emailHref('Обсуждение задачи')}">Обсудить проект <span aria-hidden="true">↗</span></a><a class="text-link" href="#projects">Смотреть работы <span aria-hidden="true">↓</span></a></div>
      </div>
      <div class="hero-bottomline"><span>Веб-дизайн <i aria-hidden="true">/</i> UX/UI <i aria-hidden="true">/</i> Разработка</span><span>Портфолио — ${site.year}</span></div>
    </section>

    <section class="section shell selected-work" id="projects">
      ${indexLine('01', 'Избранные проекты')}
      <div class="section-heading"><h2>Разные задачи.<br><em>Свой характер.</em></h2><p>Магазин снаряжения, ювелирный бренд, технологичный продукт, тренировочный зал. Авторские концепты — от первого вопроса до последнего экрана.</p></div>
      <div class="projects-editorial">${featured.map((item, index) => caseCard(item, index, index === 0 ? 'wide' : index === 3 ? 'tall' : '')).join('')}</div>
      <div class="section-action"><a class="text-link text-link--large" href="/portfolio.html">Все проекты <span aria-hidden="true">↗</span></a></div>
    </section>

    <section class="section section--dark">
      <div class="shell">
        ${indexLine('02', 'Услуги и ориентиры', true)}
        <div class="section-heading section-heading--light"><h2>Что могу сделать<br><em>для вас.</em></h2><p>Отдельный дизайн или сайт целиком. Подберём формат под вашу задачу, согласуем объём, сроки и стоимость до начала работы.</p></div>
        ${servicesList()}
      </div>
    </section>

    <section class="section shell">
      ${indexLine('03', 'Подход')}
      <div class="manifesto-grid"><div class="author-note">${image(portrait)}<span>Личный подход<br>к каждому проекту</span></div><blockquote>Хороший сайт начинается<br>не с картинки.<br><em>А с понимания.</em></blockquote><div class="manifesto-copy"><p>Я сам веду проект от первого разговора до запуска. Разбираюсь в вашем бизнесе, нахожу точную форму и отвечаю за то, как она работает.</p><a class="text-link" href="/about.html">Познакомимся ближе <span aria-hidden="true">↗</span></a></div></div>
    </section>

    <section class="section shell">
      ${indexLine('04', 'Как строится работа')}
      <div class="section-heading"><h2>От разговора<br><em>к результату.</em></h2><p>На каждом этапе понятно, что мы делаем, зачем это нужно и каким будет следующий шаг.</p></div>
      ${processGrid(6)}
    </section>

    <section class="section shell">
      ${indexLine('05', 'Практический блог')}
      <div class="section-heading"><h2>О сайтах.<br><em>Человеческим языком.</em></h2><p>Что стоит знать перед запуском: стоимость, сроки, выбор формата и решения, которые влияют на результат.</p></div>
      <div class="article-grid">${articles.slice(0, 3).map(article => articleCard(article)).join('')}</div>
      <div class="section-action"><a class="text-link text-link--large" href="/blog/">Все статьи <span aria-hidden="true">↗</span></a></div>
    </section>

    <section class="final-cta" data-stack-reveal><div class="shell"><p class="eyebrow eyebrow--light">Следующий проект может быть вашим</p><h2>Начнём<br><em>с разговора.</em></h2><p>Расскажите об идее. Вместе разберёмся, какой сайт нужен вашему бизнесу.</p><a class="button button--paper" href="${emailHref('Новый проект')}">Написать о проекте <span aria-hidden="true">↗</span></a></div></section>`;

  return shell({
    title: 'Веб-дизайнер Кирилл Снежин | Дизайн и разработка сайтов',
    description: 'Кирилл Снежин — веб-дизайнер и frontend-разработчик. Лендинги, корпоративные сайты, интернет-магазины и UX/UI: от структуры до адаптивной разработки.',
    path: '/', current: 'home', body, bodyClass: 'home-page', schema: [professionalSchema, personSchema]
  });
};

export const renderPortfolio = () => {
  const body = `
    <section class="page-hero shell">
      ${indexLine('01', 'Портфолио / авторские концепты')}
      <h1>Продумано.<br><em>Спроектировано.</em></h1>
      <div class="page-hero-copy"><p>Пять концептов для разных типов бизнеса: e-commerce, технологичный продукт, тренировочный зал, ювелирный и гастрономический бренды.</p><a class="button button--ink" href="${emailHref('Похожая задача')}">Обсудить похожую задачу <span aria-hidden="true">↗</span></a></div>
    </section>
    <section class="section shell">
      ${indexLine('02', 'Все проекты')}
      <div class="projects-stack">${cases.map((item, index) => caseCard(item, index, index % 3 === 0 ? 'wide' : '')).join('')}</div>
    </section>
    <section class="section section--ink"><div class="shell">
      ${indexLine('03', 'Экспертиза', true)}
      <div class="expertise-list">${expertise.map((item, index) => `<span><small class="mono">${String(index + 1).padStart(2, '0')}</small>${item}</span>`).join('')}</div>
    </div></section>
    <section class="section shell">
      ${indexLine('04', 'Процесс')}
      <div class="section-heading"><h2>От вопроса к запуску.</h2><p>В кейсе важна не длина галереи, а способность объяснить задачу, выбор и проверенный результат.</p></div>
      ${processGrid()}
    </section>
    <section class="final-cta" data-stack-reveal><div class="shell"><p class="eyebrow eyebrow--light">Следующий проект</p><h2>Есть задача?<br>Давайте обсудим.</h2><a class="button button--paper" href="${emailHref('Новый проект')}">Начать разговор <span aria-hidden="true">↗</span></a></div></section>`;
  return shell({
    title: 'Портфолио веб-дизайнера Кирилла Снежина — сайты и UX/UI',
    description: 'Портфолио Кирилла Снежина: пять авторских концептов сайтов с задачей, UX-логикой, визуальной системой, адаптивом и технологиями.',
    path: '/portfolio.html', current: 'portfolio', body, schema: breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Портфолио', href: '/portfolio.html' }])
  });
};

export const renderCase = (item, index) => {
  const previous = cases[(index - 1 + cases.length) % cases.length];
  const next = cases[(index + 1) % cases.length];
  const path = `/portfolio/${item.slug}/`;
  const body = `
    <article class="case-page">
      <header class="case-hero shell">
        <nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><a href="/portfolio.html">Портфолио</a><span>/</span><span>${item.title}</span></nav>
        ${indexLine(item.number, `${item.category} / ${item.year}`)}
        <h1>${item.title}<small>${item.subtitle}</small></h1>
        <p class="case-summary">${item.summary}</p>
        <div class="case-actions"><a class="button button--accent" href="${item.liveUrl}" target="_blank" rel="noopener">Открыть сайт <span aria-hidden="true">↗</span></a><a class="text-link" href="${item.serviceHref}">Связанная услуга</a></div>
        <dl class="case-facts"><div><dt>Тип</dt><dd>${item.type}</dd></div><div><dt>Год</dt><dd>${item.year}</dd></div><div><dt>Роль</dt><dd>${item.role}</dd></div><div><dt>Статус</dt><dd>Авторский концепт</dd></div></dl>
      </header>
      <figure class="case-cover shell shell--wide">${image(item.cover, { eager: true })}<figcaption>Главный визуальный кадр проекта ${item.title}</figcaption></figure>
      <nav class="case-route" aria-label="Разделы кейса" data-case-route><div class="shell"><a href="#overview">Контекст</a><a href="#challenge">Задача</a><a href="#research">Логика</a><a href="#solution">Решение</a><a href="#system">Система</a><a href="#screens">Экраны</a><a href="#result">Результат</a></div></nav>

      <section class="case-section shell" id="overview">${indexLine('01', 'Обзор проекта')}<div class="case-copy"><h2>Что это за проект</h2><p class="lead-copy">${item.overview}</p></div></section>
      <section class="case-section shell" id="challenge">${indexLine('02', 'Задача и ограничения')}<div class="case-copy"><h2>В чём была сложность</h2><p>${item.challenge}</p></div></section>
      <section class="case-section case-section--dark" id="research"><div class="shell">${indexLine('03', 'Исследование и UX-логика', true)}<div class="case-copy case-copy--light"><h2>Как устроен путь</h2><div class="principle-list">${item.research.map((text, itemIndex) => `<article><span class="mono">0${itemIndex + 1}</span><p>${text}</p></article>`).join('')}</div></div></div></section>
      <section class="case-section shell" id="solution">${indexLine('04', 'Решение')}<div class="case-copy"><h2>Почему система выглядит именно так</h2><p class="lead-copy">${item.solution}</p><div class="architecture"><h3>Информационная архитектура</h3><ol>${item.architecture.map((label, itemIndex) => `<li><span class="mono">${String(itemIndex + 1).padStart(2, '0')}</span>${label}</li>`).join('')}</ol></div></div></section>
      <section class="case-section case-system" id="system"><div class="shell">${indexLine('05', 'Визуальная система')}<div class="system-grid"><div><h2>Типографика</h2><p>${item.visual.typography}</p></div><div><h2>Компоненты</h2><p>${item.visual.components}</p></div><div><h2>Палитра</h2><div class="swatches">${item.visual.colors.map(color => `<span style="--swatch:${color}"><i></i><small class="mono">${color}</small></span>`).join('')}</div></div></div></div></section>
      <section class="case-section shell shell--wide" id="screens">${indexLine('06', 'Ключевые экраны')}<div class="screen-list">${item.screens.map((screen, itemIndex) => `<figure data-reveal><div class="screen-frame">${image(screen)}</div><figcaption><span class="mono">${String(itemIndex + 1).padStart(2, '0')}</span><div><h3>${screen.title}</h3><p>${screen.caption}</p></div></figcaption></figure>`).join('')}</div></section>
      <section class="case-section shell"><div class="case-copy split-copy"><div><p class="eyebrow">Responsive</p><h2>Один сценарий на разных экранах</h2></div><p>${item.responsive}</p></div><div class="tech-row">${item.technologies.map(tech => `<span>${tech}</span>`).join('')}</div></section>
      <section class="case-section case-result" id="result"><div class="shell">${indexLine('07', 'Результат', true)}<div class="case-copy case-copy--light"><h2>Что создано</h2><ul class="result-list">${item.result.map(text => `<li>${text}</li>`).join('')}</ul><a class="button button--paper" href="${item.liveUrl}" target="_blank" rel="noopener">Посмотреть концепт <span aria-hidden="true">↗</span></a></div></div></section>
      <nav class="case-pagination shell" aria-label="Навигация по кейсам"><a href="/portfolio/${previous.slug}/"><span class="mono">← Предыдущий</span><strong>${previous.title}</strong></a><a href="/portfolio/${next.slug}/"><span class="mono">Следующий →</span><strong>${next.title}</strong></a></nav>
      <section class="final-cta"><div class="shell"><p class="eyebrow eyebrow--light">Похожая задача</p><h2>Обсудим ваш проект.</h2><a class="button button--paper" href="${emailHref('Похожая задача')}">Написать о задаче <span aria-hidden="true">↗</span></a></div></section>
    </article>`;

  const creativeSchema = {
    '@context': 'https://schema.org', '@type': 'CreativeWork', name: `${item.title} — ${item.subtitle}`,
    description: item.summary, creator: { '@type': 'Person', name: site.author }, dateCreated: item.year,
    image: absolute(item.cover.src), url: absolute(path), isBasedOn: item.liveUrl
  };
  return shell({
    title: `${item.title} — кейс веб-дизайна | Кирилл Снежин`, description: item.summary, path,
    current: 'portfolio', body, bodyClass: 'case-document', image: item.cover.src,
    schema: [creativeSchema, breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Портфолио', href: '/portfolio.html' }, { label: item.title, href: path }])]
  });
};

export const renderServices = () => {
  const faqs = [
    ['Можно начать без готового ТЗ?', 'Да. Достаточно описать продукт, аудиторию, задачу и ориентир по сроку. Структуру и состав работ определим на первом этапе.'],
    ['Что означает цена «от»?', 'Это стартовый ориентир для базового объёма. Точная смета зависит от страниц, контента, интеграций, анимации и готовности материалов.'],
    ['Можно заказать только дизайн или разработку?', 'Да. Проект можно разделить на исследование и дизайн либо взять готовые макеты в frontend-разработку после аудита состояний.'],
    ['Что происходит после заявки?', 'Я уточняю контекст, предлагаю подходящий формат и фиксирую состав, срок и стоимость. Только после этого принимаем решение о старте.']
  ];
  const body = `
    <section class="page-hero shell">${indexLine('01', 'Услуги / форматы работы')}<h1>Понятный состав работ <em>до старта</em>.</h1><div class="page-hero-copy"><p>Исследование, структура, дизайн и разработка — в одном процессе. Здесь можно сравнить форматы и стартовые цены. Точную стоимость определим после обсуждения вашей задачи.</p><a class="button button--accent" href="${emailHref('Оценка проекта')}">Получить оценку <span aria-hidden="true">↗</span></a></div></section>
    <section class="section shell">${indexLine('02', 'Направления')} ${servicesList()}</section>
    <section class="section section--dark"><div class="shell">${indexLine('03', 'Формат', true)}<div class="section-heading section-heading--light"><h2>Не пакет ради пакета. Объём следует задаче.</h2><p>Можно начать с аудита и прототипа, заказать только дизайн или пройти полный путь до готовой сборки. Границы фиксируются заранее.</p></div><div class="format-grid"><article><span class="mono">A</span><h3>Стратегия + дизайн</h3><p>Когда разработка уже есть в команде, но нужно проверить структуру и собрать систему макетов.</p></article><article><span class="mono">B</span><h3>Дизайн + frontend</h3><p>Цельный путь для лендинга или сайта: от прототипа до адаптивной реализации и QA.</p></article><article><span class="mono">C</span><h3>Редизайн</h3><p>Аудит текущих URL, контента и UX, затем последовательное обновление без потери работающих страниц.</p></article></div></div></section>
    <section class="section shell">${indexLine('04', 'Этапы')}<div class="section-heading"><h2>Что происходит после первого сообщения.</h2><p>Без навязчивой продажи: сначала контекст и подходящий объём, затем прозрачное решение о старте.</p></div>${processGrid()}</section>
    <section class="section shell">${indexLine('05', 'Вопросы')}<div class="section-heading"><h2>До начала проекта.</h2></div>${faqBlock(faqs)}</section>
    <section class="final-cta"><div class="shell"><p class="eyebrow eyebrow--light">Оценка проекта</p><h2>Опишите задачу обычными словами.</h2><p>Я помогу определить формат, состав и следующий шаг.</p><a class="button button--paper" href="${emailHref('Оценка проекта')}">Получить оценку <span aria-hidden="true">↗</span></a></div></section>`;
  return shell({
    title: 'Услуги и цены — веб-дизайнер Кирилл Снежин',
    description: 'Лендинги от 45 000 ₽, корпоративные сайты от 90 000 ₽, интернет-магазины от 150 000 ₽, UX/UI и frontend-разработка.',
    path: '/services.html', current: 'services', body,
    schema: [professionalSchema, faqSchema(faqs), breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Услуги', href: '/services.html' }])]
  });
};

export const renderServicePage = item => {
  const related = getCase(item.caseSlug);
  const path = `/${item.slug}/`;
  const serviceSchema = {
    '@context': 'https://schema.org', '@type': 'Service', name: item.eyebrow, description: item.description,
    provider: { '@type': 'Person', name: site.author, url: site.baseUrl }, areaServed: ['Калининград', 'Россия', 'Удалённо'],
    offers: { '@type': 'Offer', priceCurrency: 'RUB', description: `${item.price}; точная стоимость после брифа` }
  };
  const body = `
    <section class="page-hero service-hero shell"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><a href="/services.html">Услуги</a><span>/</span><span>${item.eyebrow}</span></nav>${indexLine('01', item.eyebrow)}<h1>${item.title}</h1><div class="page-hero-copy"><p>${item.lead}</p><a class="button button--accent" href="${emailHref('Обсуждение услуги')}">Обсудить задачу <span aria-hidden="true">↗</span></a></div><dl class="offer-strip"><div><dt>Стоимость</dt><dd>${item.price}</dd></div><div><dt>Срок</dt><dd>${item.time}</dd></div><div><dt>Формат</dt><dd>Поэтапно, с проверкой</dd></div></dl></section>
    <section class="section shell">${indexLine('02', 'Кому подходит')}<div class="section-heading"><h2>Когда этот формат уместен.</h2></div><div class="audience-list">${item.audience.map((label, index) => `<span><small class="mono">${String(index + 1).padStart(2, '0')}</small>${label}</span>`).join('')}</div></section>
    <section class="section section--dark"><div class="shell">${indexLine('03', 'Что входит', true)}<div class="deliverables"><div><h2>Результат работы</h2><p>${item.outcome}</p></div><ol>${item.deliverables.map((label, index) => `<li><span class="mono">${String(index + 1).padStart(2, '0')}</span>${label}</li>`).join('')}</ol></div></div></section>
    <section class="section shell">${indexLine('04', 'Процесс')}<div class="section-heading"><h2>От задачи до проверенного результата.</h2></div>${processGrid(6)}</section>
    <section class="section shell">${indexLine('05', 'Связанный кейс')}<div class="related-case">${caseCard(related, 0, 'wide')}</div></section>
    <section class="section shell">${indexLine('06', 'FAQ')}<div class="section-heading"><h2>Частые вопросы.</h2></div>${faqBlock(item.faqs)}</section>
    <section class="final-cta"><div class="shell"><p class="eyebrow eyebrow--light">Первый шаг</p><h2>Получите оценку под вашу задачу.</h2><p>Напишите, что запускаете, кому это нужно и к какому сроку хотите прийти.</p><a class="button button--paper" href="${emailHref('Обсуждение услуги')}">Обсудить проект <span aria-hidden="true">↗</span></a></div></section>`;
  return shell({
    title: item.metaTitle, description: item.description, path, current: 'services', body,
    schema: [serviceSchema, faqSchema(item.faqs), breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Услуги', href: '/services.html' }, { label: item.eyebrow, href: path }])]
  });
};

export const renderAbout = () => {
  const body = `
    <section class="page-hero about-hero shell">${indexLine('01', 'Обо мне / Кирилл Снежин')}<h1>Дизайнер, который отвечает не только за <em>картинку</em>.</h1><div class="page-hero-copy"><p>Работаю на стыке структуры, визуального дизайна и frontend. Мне интересны задачи, где сайт должен ясно объяснить продукт и при этом иметь собственный характер.</p><a class="button button--ink" href="${emailHref('Обсуждение задачи')}">Обсудить задачу <span aria-hidden="true">↗</span></a></div></section>
    <section class="section shell">${indexLine('02', 'Мой подход')}<div class="manifesto-grid"><div class="author-note">${image(portrait)}<span>Кирилл Снежин<br>Дизайнер и разработчик</span></div><blockquote>Сначала разбираюсь, что должен понять человек. Затем строю структуру, визуальную систему и реализацию.</blockquote><div class="manifesto-copy"><p>Так дизайн не отрывается от контента, а код — от макета. Я не обещаю метрики без данных и честно отмечаю, где проект является концептом.</p></div></div></section>
    <section class="section section--ink"><div class="shell">${indexLine('03', 'Навыки и инструменты', true)}<div class="skill-columns"><div><h2>Что делаю</h2>${expertise.map(item => `<span>${item}</span>`).join('')}</div><div><h2>С чем работаю</h2>${['Figma', 'HTML / CSS', 'JavaScript', 'React', 'Next.js', 'GSAP', 'Three.js', 'Git'].map(item => `<span>${item}</span>`).join('')}</div></div></div></section>
    <section class="section shell">${indexLine('04', 'Ценности')}<div class="values-grid"><article><span class="mono">01</span><h2>Прозрачно</h2><p>До старта обсуждаем состав, срок, зависимости и следующий шаг. Неясное фиксируется, а не маскируется.</p></article><article><span class="mono">02</span><h2>Вдумчиво</h2><p>Сначала задача и факты, затем визуальное направление. Референс — источник принципа, а не макет для копирования.</p></article><article><span class="mono">03</span><h2>Цельно</h2><p>Структура, дизайн, адаптив и разработка работают как одна система, а не как набор независимых экранов.</p></article></div></section>
    <section class="section shell">${indexLine('05', 'Как работаю')}<div class="section-heading"><h2>Понятные этапы и результат каждого.</h2></div>${processGrid()}</section>
    <section class="section shell">${indexLine('06', 'Проекты')}<div class="projects-editorial">${cases.slice(0, 3).map((item, index) => caseCard(item, index, index === 0 ? 'wide' : '')).join('')}</div></section>
    <section class="final-cta"><div class="shell"><p class="eyebrow eyebrow--light">Контакт</p><h2>Есть проект или пока только идея?</h2><p>Можно начать с нескольких предложений. Я помогу определить подходящий формат.</p><a class="button button--paper" href="${emailHref('Обсуждение задачи')}">Написать о задаче <span aria-hidden="true">↗</span></a></div></section>`;
  return shell({
    title: 'Обо мне — веб-дизайнер Кирилл Снежин',
    description: 'Кирилл Снежин — веб-дизайнер и frontend-разработчик. Подход, навыки, инструменты, этапы работы и авторские проекты.',
    path: '/about.html', current: 'about', body, schema: [personSchema, breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Обо мне', href: '/about.html' }])]
  });
};

const articleCard = article => `<article class="article-card" data-reveal><div><span class="mono">${new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${article.date}T12:00:00Z`))}</span><span class="mono">${article.readTime}</span></div><h3><a href="/blog/${article.slug}/">${article.title}</a></h3><p>${article.description}</p><a class="text-link" href="/blog/${article.slug}/">Читать статью <span aria-hidden="true">↗</span></a></article>`;

export const renderBlog = () => {
  const body = `
    <section class="page-hero shell">${indexLine('01', 'Блог / практика')}<h1>О сайтах — <em>понятно</em> и по делу.</h1><div class="page-hero-copy"><p>Стоимость, сроки, выбор формата, подготовка, конверсия и SEO. Материалы для предпринимателя, который хочет понимать решение до вложения бюджета.</p></div></section>
    <section class="section shell">${indexLine('02', `Статьи / ${articles.length}`)}<div class="article-grid article-grid--all">${articles.map(article => articleCard(article)).join('')}</div></section>
    <section class="final-cta"><div class="shell"><p class="eyebrow eyebrow--light">Нужен не совет, а проект?</p><h2>Обсудим вашу задачу.</h2><a class="button button--paper" href="${emailHref('Обсуждение задачи')}">Написать <span aria-hidden="true">↗</span></a></div></section>`;
  return shell({
    title: 'Блог о веб-дизайне, сайтах и разработке | Кирилл Снежин',
    description: 'Практические статьи о стоимости и сроках сайта, выборе дизайнера, редизайне, SEO, конверсии и подготовке к разработке.',
    path: '/blog/', current: 'blog', body, schema: breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Блог', href: '/blog/' }])
  });
};

export const renderArticle = (article, index) => {
  const path = `/blog/${article.slug}/`;
  const related = getCase(article.relatedCase);
  const next = articles[(index + 1) % articles.length];
  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description,
    datePublished: article.date, dateModified: article.date, author: { '@type': 'Person', name: site.author, url: `${site.baseUrl}/about.html` },
    publisher: { '@type': 'Organization', name: site.name, logo: { '@type': 'ImageObject', url: `${site.baseUrl}/public/og.png` } },
    mainEntityOfPage: absolute(path), image: `${site.baseUrl}/public/og.png`
  };
  const body = `
    <article class="longread">
      <header class="article-hero shell"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><a href="/blog/">Блог</a><span>/</span><span>Статья</span></nav>${indexLine(String(index + 1).padStart(2, '0'), 'Практика / веб-сайт')}<h1>${article.title}</h1><div class="article-intro"><p>${article.lead}</p><dl><div><dt>Опубликовано</dt><dd>${new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${article.date}T12:00:00Z`))}</dd></div><div><dt>Чтение</dt><dd>${article.readTime}</dd></div><div><dt>Автор</dt><dd>${site.author}</dd></div></dl></div></header>
      <div class="article-layout shell">
        <aside class="article-aside"><span class="mono">Содержание</span><nav>${article.sections.map((section, sectionIndex) => `<a href="#part-${sectionIndex + 1}">${String(sectionIndex + 1).padStart(2, '0')} ${section.heading}</a>`).join('')}<a href="#faq">FAQ</a></nav></aside>
        <div class="article-body">
          ${article.sections.map((section, sectionIndex) => `<section id="part-${sectionIndex + 1}"><span class="mono">${String(sectionIndex + 1).padStart(2, '0')}</span><h2>${section.heading}</h2>${section.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')}</section>`).join('')}
          ${article.conclusion ? `<section class="article-conclusion"><span class="mono">Вывод</span><h2>Коротко</h2><p>${article.conclusion}</p></section>` : ''}
          <section id="faq"><span class="mono">FAQ</span><h2>Частые вопросы</h2>${faqBlock(article.faq)}</section>
          <section class="article-cta"><p class="eyebrow">Следующий шаг</p><h2>Нужен сайт под вашу задачу?</h2><p>Посмотрите связанный кейс или опишите проект — я помогу определить подходящий формат и состав.</p><div class="button-group"><a class="button button--accent" href="${emailHref('Обсуждение проекта')}">Обсудить проект <span aria-hidden="true">↗</span></a><a class="text-link" href="${article.relatedService}">Посмотреть услугу</a></div></section>
        </div>
      </div>
      <section class="section shell">${indexLine('Case', 'Связанный проект')}<div class="related-case">${caseCard(related, 0, 'wide')}</div></section>
      <nav class="next-article shell"><span class="mono">Следующая статья</span><a href="/blog/${next.slug}/">${next.title} <span aria-hidden="true">↗</span></a></nav>
    </article>`;
  return shell({
    title: article.metaTitle, description: article.description, path, current: 'blog', body, type: 'article',
    schema: [articleSchema, faqSchema(article.faq), breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Блог', href: '/blog/' }, { label: article.title, href: path }])]
  });
};

export const renderContact = () => {
  const body = `
    <section class="page-hero contact-hero shell">${indexLine('01', 'Первое сообщение')}<h1>Расскажите о задаче. Я помогу определить <em>следующий шаг</em>.</h1><div class="page-hero-copy"><p>Не нужен идеальный бриф. Достаточно нескольких предложений: что вы запускаете, кому это нужно и к какому сроку хотите прийти.</p></div></section>
    <section class="section shell contact-layout">
      <section class="contact-brief" aria-labelledby="contact-brief-title">
        <p class="eyebrow">Первый контакт</p><h2 id="contact-brief-title">Начнём с короткого сообщения.</h2>
        <p>Опишите продукт, задачу и ориентир по сроку. Можно прислать ссылку на текущий сайт или несколько предложений — разберём, какой формат работы будет уместен.</p>
        <div class="button-group"><a class="button button--accent" href="mailto:${site.email}?subject=Новая%20задача%20с%20snezhin.design">Написать письмо <span aria-hidden="true">↗</span></a><a class="text-link" href="${site.telegram}" target="_blank" rel="noopener">Написать в Telegram <span aria-hidden="true">↗</span></a></div>
        <p class="form-note">Выберите удобный канал связи. Для первого сообщения достаточно идеи или ссылки на текущий сайт. <a href="/privacy.html">Как обрабатываются обращения</a>.</p>
      </section>
      <aside class="direct-contact"><p class="eyebrow">Напрямую</p><h2>Можно написать в удобный канал.</h2><a href="mailto:${site.email}">${site.email} <span aria-hidden="true">↗</span></a><a href="${site.telegram}" target="_blank" rel="noopener">Telegram: ${site.telegramLabel} <span aria-hidden="true">↗</span></a><a href="${site.vk}" target="_blank" rel="noopener">VK: papagama <span aria-hidden="true">↗</span></a><p>Отправьте ссылку на текущий сайт или просто опишите идею. Начнём с контекста, а не с формального ТЗ.</p><dl><div><dt>Формат</dt><dd>Калининград / удалённо</dd></div><div><dt>Проекты</dt><dd>Лендинги, сайты, e-commerce, UX/UI</dd></div></dl></aside>
    </section>`;
  return shell({
    title: 'Обсудить проект — веб-дизайнер Кирилл Снежин',
    description: 'Расскажите Кириллу Снежину о задаче: лендинг, корпоративный сайт, интернет-магазин, веб-дизайн или frontend-разработка.',
    path: '/contact.html', current: 'contact', body, schema: breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Контакты', href: '/contact.html' }])
  });
};

export const renderPrivacy = () => {
  const body = `
    <article class="legal-page shell"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><span>Обработка данных</span></nav>${indexLine('Legal', 'Информация об обработке данных')}<h1>Обработка персональных данных</h1><p class="lead-copy">Актуально на 5 сентября 2026 года. На сайте нет формы, регистрации, аналитики и рекламных cookie: он не передаёт введённые посетителем данные в сторонний сервис.</p><section><h2>Оператор и связь</h2><p>Оператор — Кирилл Снежин. По вопросам, связанным с обращениями и персональными данными, можно написать на <a href="mailto:${site.email}">${site.email}</a>.</p></section><section><h2>Какие данные могут обрабатываться</h2><p>Если вы добровольно пишете на почту или в мессенджер, сообщение может содержать имя, контакт и описание задачи. Не отправляйте через открытые каналы пароли, платёжные данные, документы, медицинскую информацию и иные чувствительные сведения.</p></section><section><h2>Цель и основание</h2><p>Данные из добровольного обращения используются только для ответа, обсуждения возможного проекта и последующей переписки по нему. Для рассылок, передачи данных третьим лицам или публикации обращений сайт их не использует.</p></section><section><h2>Сторонние сервисы и технические данные</h2><p>Переход по ссылке на почту, Telegram или VK открывает выбранный вами внешний сервис; его правила обработки данных действуют отдельно. Статический хостинг может вести технические журналы запросов, включая IP-адрес и сведения браузера. На сайте не подключены счётчики, пиксели и форма Formspree.</p></section><section><h2>Права и срок хранения</h2><p>Вы можете запросить сведения об обращении, уточнение или удаление данных, написав на <a href="mailto:${site.email}">${site.email}</a>. Обращения хранятся не дольше, чем это необходимо для ответа и дальнейшей рабочей переписки, если более длительный срок не требуется законом.</p></section><section><h2>Что требуется подтвердить владельцу</h2><p>Для окончательной юридической проверки нужно подтвердить статус оператора, почтовый адрес для обращений, место хранения переписки и технических журналов, а также применимость требований конкретной юрисдикции. Эта страница описывает фактическую схему сайта, но не заменяет консультацию юриста.</p></section></article>`;
  return shell({
    title: 'Обработка персональных данных — snezhin.design', description: 'Информация об обработке персональных данных и технических данных посетителей snezhin.design.',
    path: '/privacy.html', current: 'privacy', body, schema: breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Обработка данных', href: '/privacy.html' }])
  });
};

export const render404 = () => compactDashes(`<!doctype html><html lang="ru"><head>${pageHead({ title: 'Страница не найдена — snezhin.design', description: 'Запрошенная страница не найдена.', path: '/404.html' })}<meta name="robots" content="noindex"></head><body>${header('')}<main id="main"><section class="not-found shell">${indexLine('404', 'Страница не найдена')}<h1>Здесь ничего нет.</h1><p>Возможно, адрес изменился или в ссылке опечатка.</p><div class="button-group"><a class="button button--accent" href="/">На главную</a><a class="text-link" href="/portfolio.html">Портфолио</a></div></section></main>${footer()}</body></html>`);
