// Groups describe reader questions. Membership also controls neighbouring reading.
export const articleClusters = [
  { id: 'format', title: 'Нужен ли сайт и какой', description: 'Определить роль сайта и выбрать подходящий формат.', slugs: ['nuzhen-li-biznesu-sait-v-2026','landing-ili-mnogostranichnyi-sait','konstruktor-ili-individualnaya-razrabotka'] },
  { id: 'planning', title: 'Бюджет и подготовка', description: 'Оценить сроки, собрать материалы и разобраться в смете.', slugs: ['skolko-stoit-sozdanie-saita-v-2026','skolko-stoit-landing','skolko-vremeni-zanimaet-razrabotka-saita','kak-podgotovitsya-k-razrabotke-saita'] },
  { id: 'improvement', title: 'Дизайн и улучшения', description: 'Выбрать исполнителя и найти то, что мешает существующему сайту.', slugs: ['kak-vybrat-web-dizainera','kak-ponyat-chto-saitu-nuzhen-redizain','oshibki-kotorye-snizhayut-konversiyu-saita','kak-sdelat-sait-kotoryi-privodit-zayavki','chto-dolzhno-byt-na-saite-malogo-biznesa'] }
];

export const relatedArticleSlugs = {
  'nuzhen-li-biznesu-sait-v-2026': ['landing-ili-mnogostranichnyi-sait','chto-dolzhno-byt-na-saite-malogo-biznesa'],
  'landing-ili-mnogostranichnyi-sait': ['konstruktor-ili-individualnaya-razrabotka','skolko-stoit-sozdanie-saita-v-2026'],
  'konstruktor-ili-individualnaya-razrabotka': ['landing-ili-mnogostranichnyi-sait','skolko-vremeni-zanimaet-razrabotka-saita'],
  'skolko-stoit-sozdanie-saita-v-2026': ['skolko-stoit-landing','kak-podgotovitsya-k-razrabotke-saita'],
  'skolko-stoit-landing': ['skolko-stoit-sozdanie-saita-v-2026','skolko-vremeni-zanimaet-razrabotka-saita'],
  'skolko-vremeni-zanimaet-razrabotka-saita': ['kak-podgotovitsya-k-razrabotke-saita','konstruktor-ili-individualnaya-razrabotka'],
  'kak-podgotovitsya-k-razrabotke-saita': ['skolko-vremeni-zanimaet-razrabotka-saita','skolko-stoit-sozdanie-saita-v-2026'],
  'kak-vybrat-web-dizainera': ['kak-podgotovitsya-k-razrabotke-saita','kak-ponyat-chto-saitu-nuzhen-redizain'],
  'kak-ponyat-chto-saitu-nuzhen-redizain': ['oshibki-kotorye-snizhayut-konversiyu-saita','kak-sdelat-sait-kotoryi-privodit-zayavki'],
  'oshibki-kotorye-snizhayut-konversiyu-saita': ['kak-sdelat-sait-kotoryi-privodit-zayavki','kak-ponyat-chto-saitu-nuzhen-redizain'],
  'kak-sdelat-sait-kotoryi-privodit-zayavki': ['oshibki-kotorye-snizhayut-konversiyu-saita','chto-dolzhno-byt-na-saite-malogo-biznesa'],
  'chto-dolzhno-byt-na-saite-malogo-biznesa': ['kak-sdelat-sait-kotoryi-privodit-zayavki','nuzhen-li-biznesu-sait-v-2026']
};

export const localArticleLinks = {
  'chto-dolzhno-byt-na-saite-malogo-biznesa': { heading: 'Базовое SEO и локальный контекст', html: 'Если ваши клиенты в городе и области, отдельно посмотрите, <a href="/sozdanie-saitov-kaliningrad/">что учитывать на сайте бизнеса в Калининграде</a>: географию работы, контакты и связь с локальным поиском.' },
  'kak-podgotovitsya-k-razrabotke-saita': { heading: 'Сформулируйте аудиторию через ситуацию', html: 'Для бизнеса из Калининграда полезно заранее записать условия выезда и доставки по области. В разделе <a href="/sozdanie-saitov-kaliningrad/">о работе с местными компаниями</a> я объясняю, как учесть эту географию и организовать согласования.' },
  'kak-sdelat-sait-kotoryi-privodit-zayavki': { heading: 'Свяжите страницу с источником трафика', html: 'Когда человек приходит из поиска по городу, ему нужны конкретные условия рядом с собой. Об этом подробнее на странице <a href="/sozdanie-saitov-kaliningrad/">создания сайтов для бизнеса в Калининграде</a>.' }
};

export const articleServiceOverrides = {
  'skolko-stoit-sozdanie-saita-v-2026': '/website-development/',
  'kak-podgotovitsya-k-razrabotke-saita': '/website-development/',
  'nuzhen-li-biznesu-sait-v-2026': '/corporate-website/',
  'kak-sdelat-sait-kotoryi-privodit-zayavki': '/landing-page/'
};

export const noteConnections = {
  'pervyi-variant-eto-nachalo': { service:'/web-design/', caseSlug:'aero-x1', prefix:'Как визуальная идея переходит в макеты, описано на странице', serviceLabel:'веб-дизайна', caseText:'В концепте AERO X1 можно рассмотреть работу с формой устройства и крупными планами.' },
  'kak-ya-ishchu-referensy': { service:'/web-design/', caseSlug:'amber-soul', prefix:'Структура, референсы и макеты входят в работу над', serviceLabel:'дизайном сайта', caseText:'В AMBER SOUL показано, как свет и фактура материала задают настроение страницы.' },
  'sait-ne-dolzhen-rasskazyvat-vse-srazu': { service:'/corporate-website/', caseSlug:'waypoint', prefix:'Когда у компании несколько направлений, эту последовательность помогает построить', serviceLabel:'структура многостраничного сайта', caseText:'В WAYPOINT можно посмотреть переход от большого пейзажа к практическому каталогу.' }
};
