import { site, navigation, expertise, processSteps, services, cases, getCase } from './site-data.mjs';
import { articles } from './articles.mjs';
import { notes } from './notes.mjs';

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
  <link rel="preload" href="/assets/fonts/onest-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/onest-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/jura-semibold.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="/site.css?v=20260906-personal">
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
        <a class="button button--compact button--ink" href="/contact.html">Напишите мне <span aria-hidden="true">↗</span></a>
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
          <p>Придумываю дизайн и собираю сайты. Если пока непонятно, с чего начать, можно просто написать.</p>
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
        <span>Сделано Кириллом. Иногда переделано несколько раз.</span>
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

const marginNote = (text, className = '') => `<aside class="margin-note ${className}" aria-label="Заметка Кирилла"><span class="margin-note__mark" aria-hidden="true">К.</span><p>${esc(text)}</p></aside>`;

const contactCta = ({ title = 'Можно начать с идеи.', text = 'Расскажите, что хотите сделать. Сначала разберёмся, нужен ли здесь сайт и какой формат подойдёт.', subject = 'Идея для сайта' } = {}) => `<section class="final-cta" data-stack-reveal><div class="shell"><p class="eyebrow eyebrow--light">На связи · Кирилл</p><h2>${esc(title)}</h2><p>${esc(text)}</p><a class="button button--paper" href="${emailHref(subject)}">Напишите мне <span aria-hidden="true">↗</span></a></div></section>`;

const noteList = () => `<div class="note-list">${notes.map((note, index) => `<article class="note-row"><span class="note-row__index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><div><p class="eyebrow">Заметка · ${note.readTime}</p><h3><a href="/blog/${note.slug}/">${esc(note.title)}<span aria-hidden="true">↗</span></a></h3><p>${esc(note.description)}</p></div></article>`).join('')}</div>`;

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

const processGrid = (limit = processSteps.length) => `<ol class="process-grid">
  ${processSteps.slice(0, limit).map(item => `<li class="process-step" data-reveal><span class="mono" aria-hidden="true">${item.number}</span><h3>${item.title}</h3><p>${item.text}</p></li>`).join('')}
</ol>`;

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
      <h1>Я Кирилл.<br><em>Придумываю и собираю сайты.</em></h1>
      <div class="hero-introduction">
        <figure class="hero-portrait">${image(portrait, { eager: true })}<figcaption><strong>Кирилл Снежин</strong><span>Дизайн и разработка</span></figcaption></figure>
        <p class="hero-copy">Люблю, когда всё складывается: текст, фотографии, шрифт. Делаю сайты спокойными и понятными, но почти всегда оставляю место для небольшой необычной детали.</p>
        <div class="hero-actions"><a class="button button--accent" href="${emailHref('Идея для сайта')}">Напишите мне <span aria-hidden="true">↗</span></a><a class="text-link" href="#projects">Смотреть работы <span aria-hidden="true">↓</span></a></div>
      </div>
      <div class="hero-bottomline"><span>Веб-дизайн <i aria-hidden="true">/</i> UX/UI <i aria-hidden="true">/</i> Разработка</span><span>Портфолио — ${site.year}</span></div>
    </section>

    <section class="section shell selected-work" id="projects">
      ${indexLine('01', 'Избранные проекты')}
      <div class="section-heading"><h2>Пробую разное.<br><em>Вот что получается.</em></h2><p>Здесь мои концепты сайтов: от магазина снаряжения до истории янтаря. На них я пробую разные стили, композиции и способы рассказать о продукте.</p></div>
      <div class="projects-editorial">${featured.map((item, index) => caseCard(item, index, index === 0 ? 'wide' : index === 3 ? 'tall' : '')).join('')}</div>
      <div class="section-action"><a class="text-link text-link--large" href="/portfolio.html">Все проекты <span aria-hidden="true">↗</span></a></div>
    </section>

    <section class="section section--dark">
      <div class="shell">
        ${indexLine('02', 'Услуги и ориентиры', true)}
        <div class="section-heading section-heading--light"><h2>Чем могу<br><em>помочь.</em></h2><p>Могу придумать дизайн, собрать готовые макеты или сделать сайт целиком. Цены ниже помогают сориентироваться. Сначала я всё равно спрошу, для чего вам сайт.</p></div>
        ${servicesList()}
      </div>
    </section>

    <section class="section shell personal-thoughts" aria-labelledby="thoughts-title">
      ${indexLine('03', 'Немного от себя')}
      <div class="thoughts-layout"><div class="thoughts-heading"><h2 id="thoughts-title">Как я смотрю<br>на сайты</h2>${marginNote('Мне интереснее понять, почему автор сделал именно так, чем сразу оценивать чужую работу.')}<a class="text-link" href="/about.html">Ещё немного обо мне <span aria-hidden="true">↗</span></a></div><div class="thoughts-list"><article><h3>Хочется, чтобы было приятно остаться.</h3><p>Мне нравится, когда страница постепенно отвечает на вопросы. Когда есть время рассмотреть фотографию, прочитать мысль и понять, куда идти дальше.</p></article><article><h3>В первой идее ищу потенциал.</h3><p>Я почти никогда не воспринимаю первый вариант как готовый. Обычно интереснее посмотреть, что в нём уже есть и что из этого можно развить.</p></article><article><h3>Не каждая деталь должна удивлять.</h3><p>Люблю аккуратные интерфейсы с небольшой изюминкой. Но если ради неё человеку приходится разбираться, куда нажать, я бы поискал другое решение.</p></article></div></div>
    </section>

    <section class="section shell">
      ${indexLine('04', 'Как строится работа')}
      <div class="section-heading"><h2>Как я собираю<br><em>сайт.</em></h2><p>Обычно двигаюсь так. Иногда возвращаюсь к предыдущему шагу, если новая идея лучше собирает проект целиком.</p></div>
      ${processGrid(6)}
      ${marginNote('На этапе референсов у меня обычно уже открыто слишком много вкладок.', 'margin-note--process')}
    </section>

    <section class="section shell">
      ${indexLine('05', 'Блог')}
      <div class="section-heading"><h2>Записываю<br><em>по ходу дела.</em></h2><p>Здесь несколько мыслей о том, как я работаю. В блоге есть и практические статьи о стоимости, сроках и выборе сайта.</p></div>
      ${noteList()}
      <div class="section-action"><a class="text-link text-link--large" href="/blog/">Заметки и статьи <span aria-hidden="true">↗</span></a></div>
    </section>

    ${contactCta()}`;

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
      <h1>Мои работы.<br><em>Пять разных идей.</em></h1>
      <div class="page-hero-copy"><p>Это авторские концепты. В каждом я разбираюсь с отдельной задачей: как показать снаряжение, рассказать об украшениях или познакомить человека с тренировочным залом. Внутри есть экраны и пояснения к ним.</p><a class="button button--ink" href="${emailHref('Вопрос о работе')}">Спросить о работе <span aria-hidden="true">↗</span></a></div>
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
      <div class="section-heading"><h2>За экранами тоже есть работа.</h2><p>Референсы, первые попытки, пересборка. Важная часть для меня: посмотреть, подходит ли каждая деталь всему сайту.</p></div>
      ${processGrid()}
    </section>
    ${contactCta({ title: 'Что хотите сделать вы?', text: 'Можно прислать ссылку на понравившуюся работу и рассказать о своей идее. Разберёмся, что из этого подойдёт вашей задаче.' })}`;
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

      <section class="case-section shell" id="overview">${indexLine('01', 'О проекте')}<div class="case-copy"><h2>Что я здесь пробую</h2><p class="lead-copy">${item.overview}</p></div></section>
      <section class="case-section shell" id="challenge">${indexLine('02', 'Задача')}<div class="case-copy"><h2>${esc(item.headings.challenge)}</h2><p>${item.challenge}</p></div></section>
      <section class="case-section case-section--dark" id="research"><div class="shell">${indexLine('03', 'Как устроена страница', true)}<div class="case-copy case-copy--light"><h2>${esc(item.headings.research)}</h2><div class="principle-list">${item.research.map((text, itemIndex) => `<article><span class="mono">0${itemIndex + 1}</span><p>${text}</p></article>`).join('')}</div></div></div></section>
      <section class="case-section shell" id="solution">${indexLine('04', 'Что я пробовал')}<div class="case-copy"><div class="case-author-heading"><h2>${esc(item.headings.solution)}</h2>${marginNote(item.authorNote)}</div><p class="lead-copy">${item.solution}</p><div class="architecture"><h3>Что есть на сайте</h3><ol>${item.architecture.map((label, itemIndex) => `<li><span class="mono">${String(itemIndex + 1).padStart(2, '0')}</span>${label}</li>`).join('')}</ol></div></div></section>
      <section class="case-section case-system" id="system"><div class="shell">${indexLine('05', 'Визуальная система')}<div class="system-grid"><div><h2>Типографика</h2><p>${item.visual.typography}</p></div><div><h2>Компоненты</h2><p>${item.visual.components}</p></div><div><h2>Палитра</h2><div class="swatches">${item.visual.colors.map(color => `<span style="--swatch:${color}"><i></i><small class="mono">${color}</small></span>`).join('')}</div></div></div></div></section>
      <section class="case-section shell shell--wide" id="screens">${indexLine('06', 'Ключевые экраны')}<div class="screen-list">${item.screens.map((screen, itemIndex) => `<figure data-reveal><div class="screen-frame">${image(screen)}</div><figcaption><span class="mono">${String(itemIndex + 1).padStart(2, '0')}</span><div><h3>${screen.title}</h3><p>${screen.caption}</p></div></figcaption></figure>`).join('')}</div></section>
      <section class="case-section shell"><div class="case-copy split-copy"><div><p class="eyebrow">Responsive</p><h2>Один сценарий на разных экранах</h2></div><p>${item.responsive}</p></div><div class="tech-row">${item.technologies.map(tech => `<span>${tech}</span>`).join('')}</div></section>
      <section class="case-section case-result" id="result"><div class="shell">${indexLine('07', 'Результат', true)}<div class="case-copy case-copy--light"><h2>Что создано</h2><ul class="result-list">${item.result.map(text => `<li>${text}</li>`).join('')}</ul><a class="button button--paper" href="${item.liveUrl}" target="_blank" rel="noopener">Посмотреть концепт <span aria-hidden="true">↗</span></a></div></div></section>
      <nav class="case-pagination shell" aria-label="Навигация по кейсам"><a href="/portfolio/${previous.slug}/"><span class="mono">← Предыдущий</span><strong>${previous.title}</strong></a><a href="/portfolio/${next.slug}/"><span class="mono">Следующий →</span><strong>${next.title}</strong></a></nav>
      ${contactCta({ title: 'Хотите спросить об этой работе?', text: `Можно написать о ${item.title} или рассказать о своей идее. Объясню, как устроен этот концепт и что может пригодиться вам.`, subject: `Вопрос о ${item.title}` })}
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
    ['Можно начать без готового ТЗ?', 'Да. Расскажите, чем занимаетесь и зачем задумались о сайте. Спрошу, кто будет его смотреть и что должен сделать после просмотра. От этого будем выбирать формат.'],
    ['Что означает цена «от»?', 'Это стартовый ориентир для базового объёма. Точная смета зависит от страниц, контента, интеграций, анимации и готовности материалов.'],
    ['Можно заказать только дизайн или разработку?', 'Да. Могу подготовить структуру и макеты для вашего разработчика или собрать уже готовый дизайн. Сначала посмотрю, какие материалы есть.'],
    ['Что происходит после сообщения?', 'Я задам несколько вопросов и предложу вариант. Если он вам подойдёт, договоримся о составе работы, стоимости и сроках.']
  ];
  const body = `
    <section class="page-hero shell">${indexLine('01', 'Услуги / дизайн и разработка')}<h1>Какой сайт<br><em>вам нужен?</em></h1><div class="page-hero-copy"><p>Сначала хочу понять задачу. Возможно, достаточно одной страницы. Возможно, нужны каталог и несколько разделов. Ниже есть ориентиры по формату и цене, а точную стоимость обсудим после знакомства.</p><a class="button button--accent" href="${emailHref('Оценка проекта')}">Рассказать о задаче <span aria-hidden="true">↗</span></a></div></section>
    <section class="section shell">${indexLine('02', 'Направления')} ${servicesList()}</section>
    <section class="section section--dark"><div class="shell">${indexLine('03', 'Формат', true)}<div class="section-heading section-heading--light"><h2>Можно сделать<br>только нужную часть.</h2><p>Если у вас уже есть разработчик или готовые макеты, не нужно начинать заново. Посмотрю, что есть, и предложу, где могу помочь.</p></div><div class="format-grid"><article><span class="mono">A</span><h3>Структура и дизайн</h3><p>Придумаю, что и в каком порядке показать, подготовлю макеты для вашего разработчика.</p></article><article><span class="mono">B</span><h3>Дизайн и разработка</h3><p>Пройду с вами от первой идеи до сайта, который можно открыть в браузере.</p></article><article><span class="mono">C</span><h3>Редизайн</h3><p>Разберусь, что стоит сохранить в нынешнем сайте и что мешает. После этого обновлю нужные части.</p></article></div></div></section>
    <section class="section shell">${indexLine('04', 'Как работаю')}<div class="section-heading"><h2>От первого вопроса<br>до готового сайта.</h2><p>Мне важно сначала собрать общую идею. Потом можно пробовать детали и постепенно доводить их до результата.</p></div>${processGrid()}</section>
    <section class="section shell">${indexLine('05', 'Вопросы')}<div class="section-heading"><h2>До начала проекта.</h2></div>${faqBlock(faqs)}</section>
    ${contactCta({ title: 'Не уверены в формате?', text: 'Это нормально. Расскажите, зачем вам сайт, а я предложу, с чего начать.', subject: 'Вопрос о формате сайта' })}`;
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
    <section class="section shell">${indexLine('04', 'Как работаю')}<div class="section-heading"><h2>Как будем собирать сайт.</h2></div>${processGrid(6)}</section>
    <section class="section shell">${indexLine('05', 'Связанный кейс')}<div class="related-case">${caseCard(related, 0, 'wide')}</div></section>
    <section class="section shell">${indexLine('06', 'FAQ')}<div class="section-heading"><h2>Частые вопросы.</h2></div>${faqBlock(item.faqs)}</section>
    ${contactCta({ title: 'Расскажите о своей идее.', text: 'Можно прислать ссылку, описание или несколько вопросов. Сначала поймём, подходит ли вам этот формат.', subject: `Вопрос: ${item.eyebrow}` })}`;
  return shell({
    title: item.metaTitle, description: item.description, path, current: 'services', body,
    schema: [serviceSchema, faqSchema(item.faqs), breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Услуги', href: '/services.html' }, { label: item.eyebrow, href: path }])]
  });
};

export const renderAbout = () => {
  const body = `
    <section class="page-hero about-hero shell">${indexLine('01', 'Обо мне / Кирилл Снежин')}<h1>Люблю порядок.<br><em>И немного фантазии.</em></h1><div class="page-hero-copy"><p>Я Кирилл, веб-дизайнер и разработчик. Больше всего люблю придумывать, как будет выглядеть сайт. Потом собираю его в коде и смотрю, складывается ли всё в одну картинку.</p></div></section>
    <section class="section shell about-story" aria-labelledby="story-title">${indexLine('02', 'Как я к этому пришёл')}<div class="story-layout"><figure class="story-portrait">${image(portrait, { eager: true })}<figcaption>Кирилл Снежин<br>Калининград</figcaption></figure><div class="story-copy"><h2 id="story-title">Сначала были<br>реклама и лендинги.</h2><p>Я всегда любил творчество и возможность что-нибудь придумать. В рекламном колледже начал делать лендинги. Тогда больше думал о рекламе и маркетинге, чем о том, как устроена страница и как она выглядит.</p><p>Позже появилось свободное время, и я начал сам разбираться в HTML, CSS, JavaScript и веб-дизайне. Учился довольно хаотично: пробовал, искал примеры, ошибался и снова переделывал.</p><p>Со временем понял, что больше всего мне нравится придумывать визуальную часть. Представлять настроение будущего сайта и искать, как передать его через шрифт, фотографии и расстояния между ними.</p><p>Способность фантазировать считаю одним из своих сильных качеств. Мне легко увлечься необычной идеей. Но в готовом сайте хочется спокойствия: чтобы всё было аккуратно, понятно и немного не как обычно.</p>${marginNote('Когда смотрю на работу и мне спокойно, понимаю: визуально она наконец сложилась.')}</div></div></section>
    <section class="section section--ink"><div class="shell">${indexLine('03', 'Дизайн и разработка', true)}<div class="section-heading section-heading--light"><h2>От картинки<br>до страницы.</h2><p>Мне интересно и придумывать сайт, и разбираться, как он работает. Так могу сам вернуться к макету, если в браузере что-то ощущается не так.</p></div><div class="skill-columns"><div><h2>Что делаю</h2>${['Веб-дизайн и UX/UI', 'Лендинги и сайты', 'Интерфейсы магазинов', 'Frontend-разработка'].map(item => `<span>${item}</span>`).join('')}</div><div><h2>С чем работаю</h2>${['Figma', 'HTML / CSS / JavaScript', 'React / Next.js', 'GSAP / Three.js / Git'].map(item => `<span>${item}</span>`).join('')}</div></div></div></section>
    <section class="section shell photography-story" aria-labelledby="photo-title">${indexLine('04', 'Вне сайтов')}<div class="photography-layout"><div><p class="eyebrow">Свет / композиция / детали</p><h2 id="photo-title">Ещё я люблю<br><em>фотографировать.</em></h2></div><div class="photography-copy"><p class="lead-copy">Кроме сайтов мне нравится фотография. Наверное, поэтому я часто обращаю внимание на свет, композицию и небольшие детали.</p><p>В веб-дизайне это тоже часть того, что мне интересно: как кадр меняет настроение страницы, где ему нужно больше места и какой текст поставить рядом.</p>${marginNote('Иногда хочется просто рассмотреть кадр. В интерфейсах я тоже люблю оставлять для этого место.')}</div></div><dl class="outside-list"><div><dt>Реклама и маркетинг</dt><dd>Интерес из колледжа остался. Мне всё ещё любопытно, как люди замечают предложение и почему выбирают его.</dd></div><div><dt>Игры</dt><dd>Dota 2, Minecraft и Wormix. Ещё одна часть жизни вне макетов и кода.</dd></div></dl></section>
    <section class="section shell">${indexLine('05', 'Если будем работать вместе')}<div class="story-conversation"><h2>Сначала хочу<br>вас понять.</h2><div><p>Если вы спросите, сколько стоит лендинг, я сначала уточню, зачем он вам. Кто придёт на страницу, что человеку нужно узнать и что он должен сделать дальше. Может оказаться, что лучше подойдёт другой формат.</p><p>Если предложенное решение кажется мне неудачным, объясню, что меня смущает, и покажу другой вариант. Мне важнее спокойно разобраться вместе, чем настоять на своём.</p><p>Сейчас в портфолио в основном авторские концепты. Коммерческого опыта пока немного, зато по работам можно посмотреть, как я думаю и что умею собирать.</p><a class="text-link" href="/portfolio.html">Посмотреть мои работы <span aria-hidden="true">↗</span></a></div></div></section>
    ${contactCta({ title: 'Можно просто написать.', text: 'С готовым заданием или с мыслью «кажется, мне нужен сайт». Начнём с того, что уже понятно.' })}`;
  return shell({
    title: 'Обо мне — веб-дизайнер Кирилл Снежин',
    description: 'Кирилл Снежин, веб-дизайнер и frontend-разработчик: путь от рекламного колледжа к сайтам, самостоятельное обучение, фотография и подход к работе.',
    path: '/about.html', current: 'about', body, schema: [personSchema, breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Обо мне', href: '/about.html' }])]
  });
};

const articleCard = article => `<article class="article-card" data-reveal><div><span class="mono">${new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${article.date}T12:00:00Z`))}</span><span class="mono">${article.readTime}</span></div><h3><a href="/blog/${article.slug}/">${article.title}</a></h3><p>${article.description}</p><a class="text-link" href="/blog/${article.slug}/">Читать статью <span aria-hidden="true">↗</span></a></article>`;

export const renderBlog = () => {
  const body = `
    <section class="page-hero shell">${indexLine('01', 'Блог / Кирилл Снежин')}<h1>О сайтах.<br><em>И о том, как я их делаю.</em></h1><div class="page-hero-copy"><p>Здесь соседствуют мои заметки и практические разборы. В одних рассказываю, как смотрю на дизайн. В других разбираюсь с вопросами о стоимости, сроках и подготовке сайта.</p></div><nav class="blog-jump-links" aria-label="Разделы блога"><a class="text-link" href="#notes">Заметки · ${notes.length}</a><a class="text-link" href="#articles">Практические статьи · ${articles.length}</a></nav></section>
    <section class="section shell" id="notes" aria-labelledby="notes-title">${indexLine('02', 'Личное')}<div class="section-heading"><h2 id="notes-title">Заметки</h2><p>Про первые варианты, открытые вкладки и ощущение, что сайт наконец сложился.</p></div>${noteList()}</section>
    <section class="section shell" id="articles" aria-labelledby="articles-title">${indexLine('03', `Практика / ${articles.length} статей`)}<div class="section-heading"><h2 id="articles-title">Перед заказом сайта</h2><p>Что входит в работу, как выбрать формат и какие материалы подготовить. Можно начать с того вопроса, который сейчас важнее.</p></div><div class="article-grid article-grid--all">${articles.map(article => articleCard(article)).join('')}</div></section>
    ${contactCta({ title: 'Остался вопрос?', text: 'Напишите, что неясно. Постараюсь объяснить на примере вашей задачи.' })}`;
  return shell({
    title: 'Блог о веб-дизайне, сайтах и разработке | Кирилл Снежин',
    description: 'Заметки Кирилла Снежина о дизайне и референсах. Практические статьи о стоимости и сроках сайта, редизайне, SEO и подготовке к разработке.',
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
          <section class="article-cta"><p class="eyebrow">Если остались вопросы</p><h2>Можно спросить меня.</h2><p>Расскажите, над чем сейчас думаете. Помогу разобраться, как это относится к вашему сайту.</p><div class="button-group"><a class="button button--accent" href="${emailHref('Вопрос о сайте')}">Напишите мне <span aria-hidden="true">↗</span></a><a class="text-link" href="${article.relatedService}">Посмотреть услугу</a></div></section>
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

export const renderNote = (note, index) => {
  const path = `/blog/${note.slug}/`;
  const next = notes[(index + 1) % notes.length];
  const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${note.date}T12:00:00Z`));
  const body = `<article class="personal-note">
    <header class="article-hero shell"><nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><a href="/blog/#notes">Заметки</a></nav>${indexLine('К.', 'Личная заметка')}<h1>${esc(note.title)}</h1><p class="note-lead">${esc(note.lead)}</p><p class="note-byline">Кирилл Снежин <span aria-hidden="true">/</span> <time datetime="${note.date}">${date}</time> <span aria-hidden="true">/</span> ${note.readTime}</p></header>
    <div class="note-layout shell">${marginNote(note.aside)}<div class="article-body note-body">${note.sections.map((section, i) => `<section id="part-${i + 1}"><h2>${esc(section.heading)}</h2>${section.paragraphs.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}</section>`).join('')}<p class="note-signoff"><span class="margin-note__mark" aria-hidden="true">К.</span> Кирилл Снежин</p><p class="note-conversation">А как это ощущается вам? <a class="text-link" href="${emailHref(`О заметке: ${note.title}`)}">Можно написать мне</a>.</p></div></div>
    <nav class="next-article shell" aria-label="Другие заметки"><span class="mono">Ещё одна мысль</span><a href="/blog/${next.slug}/">${esc(next.title)} <span aria-hidden="true">↗</span></a><a class="text-link" href="/blog/#notes">Все заметки</a></nav>
  </article>`;
  return shell({ title: note.metaTitle, description: note.description, path, current: 'blog', body, type: 'article', schema: [
    { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: note.title, description: note.description, datePublished: note.date, dateModified: note.date, articleSection: 'Заметки', inLanguage: 'ru-RU', author: { '@type': 'Person', name: site.author, url: absolute('/about.html') }, mainEntityOfPage: absolute(path), image: absolute('/public/og.png') },
    breadcrumbSchema([{ label: 'Главная', href: '/' }, { label: 'Блог', href: '/blog/' }, { label: note.title, href: path }])
  ] });
};

export const renderContact = () => {
  const body = `
    <section class="page-hero contact-hero shell">${indexLine('01', 'Контакты / Кирилл Снежин')}<h1>Что хотите<br><em>сделать?</em></h1><div class="page-hero-copy"><p>Не обязательно приходить с готовым заданием. Можно просто рассказать об идее. Я помогу разобраться, нужен ли здесь сайт и какой формат имеет смысл.</p></div></section>
    <section class="section shell contact-layout">
      <section class="contact-brief" aria-labelledby="contact-brief-title">
        <p class="eyebrow">Для первого сообщения</p><h2 id="contact-brief-title">Пары предложений хватит.</h2>
        <p>Например: «У меня небольшая мастерская. Хочу показать работы и дать людям возможность написать. Пока не знаю, какой сайт нужен».</p><p>Если сайт уже есть, пришлите ссылку и расскажите, что в нём не устраивает. Сначала спрошу о задаче, посетителях и сроках. После этого смогу предложить формат и оценить работу.</p>
        <div class="button-group"><a class="button button--accent" href="mailto:${site.email}?subject=Новая%20задача%20с%20snezhin.design">Написать письмо <span aria-hidden="true">↗</span></a><a class="text-link" href="${site.telegram}" target="_blank" rel="noopener">Написать в Telegram <span aria-hidden="true">↗</span></a></div>
        <p class="form-note">Отвечаю сам. <a href="/privacy.html">Как обрабатываются обращения</a>.</p>
      </section>
      <aside class="direct-contact"><p class="eyebrow">Где меня найти</p><h2>Почта или мессенджер.</h2><a href="mailto:${site.email}">${site.email} <span aria-hidden="true">↗</span></a><a href="${site.telegram}" target="_blank" rel="noopener">Telegram: ${site.telegramLabel} <span aria-hidden="true">↗</span></a><a href="${site.vk}" target="_blank" rel="noopener">VK: papagama <span aria-hidden="true">↗</span></a><p>Выберите, где вам удобнее переписываться. Написать можно и с вопросом о работе из портфолио.</p><dl><div><dt>Где работаю</dt><dd>Калининград / удалённо</dd></div><div><dt>Чем занимаюсь</dt><dd>Веб-дизайн и разработка сайтов</dd></div></dl></aside>
    </section>`;
  return shell({
    title: 'Контакты веб-дизайнера Кирилла Снежина — написать о сайте',
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
