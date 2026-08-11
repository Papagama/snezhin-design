;
insert into public.projects (
  id, title, slug, category, year, client, site_url,
  short_description, description, cover_image,
  gallery, desktop_images, mobile_images,
  services, technologies, featured, status, created_at, updated_at
)
values
(
  'p-amber-soul',
  'AMBER SOUL — Ювелирная история',
  'amber-soul',
  'landing',
  2026,
  'AMBER SOUL · концепт',
  'https://papagama.github.io/ambersoul/',
  'Иммерсивный лендинг ювелирного бренда, где 3D-объект, типографика и скролл превращают происхождение янтаря в цельную историю.',
  $case$
    <h3>Контекст</h3>
    <p>AMBER SOUL — концепт премиального бренда украшений из балтийского янтаря. Вместо обычного каталога требовалось создать эмоциональный цифровой опыт: передать тепло материала, его природное происхождение и ощущение уникальности каждого изделия.</p>
    <h3>Задача</h3>
    <p>Собрать выразительный лендинг, который одновременно формирует образ бренда, объясняет ценность продукта и ведёт посетителя к заявке или получению каталога.</p>
    <h3>Визуальная система</h3>
    <p>Основой стали глубокий чёрный фон, янтарно-золотой акцент и контраст крупной антиквы с нейтральным гротеском. Центральный 3D-объект работает как цифровая метафора янтаря и связывает все экраны в единое повествование.</p>
    <h3>UX и структура</h3>
    <p>Сценарий выстроен от эмоции к действию: знакомство с брендом, происхождение материала, преимущества, путь мастера, социальное доказательство, специальное предложение, ответы на вопросы и финальная форма. Призывы к действию повторяются в ключевых точках, не разрушая атмосферу.</p>
    <h3>Интерактивность</h3>
    <p>Three.js отвечает за объёмную сцену, а GSAP и ScrollTrigger синхронизируют движение объекта с прокруткой и появлением контента. Для мобильных устройств предусмотрена облегчённая композиция с сохранением основной драматургии.</p>
    <h3>Результат</h3>
    <p>Создан адаптивный интерактивный прототип, в котором сторителлинг, визуальная айдентика и конверсионный сценарий работают как одна система.</p>
  $case$,
  'assets/cases/amber-soul-cover.png',
  '["assets/cases/amber-soul-process.png","assets/cases/amber-soul-offer.png"]'::jsonb,
  '["assets/cases/amber-soul-cover.png","assets/cases/amber-soul-process.png","assets/cases/amber-soul-offer.png"]'::jsonb,
  '[]'::jsonb,
  '["UX/UI","Web Design","Art Direction","Development","Motion"]'::jsonb,
  '["Figma","HTML/CSS","JavaScript","GSAP","Three.js"]'::jsonb,
  true,
  'published',
  now(),
  now()
),
(
  'p-aero-x1',
  'AERO X1 — Точность в форме',
  'aero-x1',
  'landing',
  2026,
  'AERO X1 · концепт',
  'https://papagama.github.io/aero-x1-showroom/',
  'Продуктовый лендинг премиального медиахаба, соединяющий инженерную точность, тактильный дизайн и эмоциональную подачу технологии.',
  $case$
    <h3>Контекст</h3>
    <p>AERO X1 — концепт премиального устройства для современной аудиовизуальной среды. Продукт должен восприниматься не как очередная техника, а как архитектурный объект и естественная часть интерьера.</p>
    <h3>Задача</h3>
    <p>Показать сложный технологический продукт понятным и желанным: сохранить ощущение инженерной строгости, но добавить эмоцию, тактильность и премиальный характер.</p>
    <h3>Арт-дирекшн</h3>
    <p>Визуальный язык построен на графитовом, молочно-белом и электрическом синем. Воздушная модульная сетка, тонкая типографика и крупные предметные изображения создают баланс между технологичностью и редакционной эстетикой.</p>
    <h3>Информационная архитектура</h3>
    <p>Первый экран формирует позиционирование, блок характеристик быстро доказывает технологический уровень, разделы об инженерии и философии звука раскрывают продукт через детали, а шоурум и галерея переводят свойства в сценарии использования.</p>
    <h3>Детали опыта</h3>
    <p>Контент раскрывается постепенно при прокрутке, изображения меняют характер при наведении, а светлая и тёмная темы поддерживают разные условия просмотра. Интерфейс остаётся спокойным, чтобы главным героем всегда был продукт.</p>
    <h3>Результат</h3>
    <p>Собран адаптивный продуктовый прототип с ясной иерархией, выразительной подачей характеристик и последовательным маршрутом к резервированию устройства.</p>
  $case$,
  'assets/cases/aero-x1-cover.png',
  '["assets/cases/aero-x1-engineering.png","assets/cases/aero-x1-gallery.png"]'::jsonb,
  '["assets/cases/aero-x1-cover.png","assets/cases/aero-x1-engineering.png","assets/cases/aero-x1-gallery.png"]'::jsonb,
  '[]'::jsonb,
  '["UX/UI","Web Design","Art Direction","Development"]'::jsonb,
  '["Figma","HTML/CSS","JavaScript"]'::jsonb,
  true,
  'published',
  now(),
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  year = excluded.year,
  client = excluded.client,
  site_url = excluded.site_url,
  short_description = excluded.short_description,
  description = excluded.description,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  desktop_images = excluded.desktop_images,
  mobile_images = excluded.mobile_images,
  services = excluded.services,
  technologies = excluded.technologies,
  featured = excluded.featured,
  status = excluded.status,
  updated_at = now();

insert into public.projects (
  id, title, slug, category, year, client, site_url,
  short_description, description, cover_image,
  gallery, desktop_images, mobile_images,
  services, technologies, featured, status, created_at, updated_at
)
values (
  'p-dream-house',
  'DREAM HOUSE — Сайт строительной компании',
  'dream-house',
  'multi-page',
  2026,
  'DREAM HOUSE · концепт',
  'https://papagama.github.io/dream-house/',
  'Конверсионный сайт строительной компании с каталогом проектов, калькулятором стоимости и последовательным сценарием заявки.',
  $case$
    <h3>Контекст</h3>
    <p>DREAM HOUSE — концепт сайта компании, которая строит каркасные дома под ключ. В этой сфере решение принимается долго, поэтому интерфейс должен одновременно объяснять продукт, снижать тревогу и давать посетителю понятный следующий шаг.</p>
    <h3>Задача</h3>
    <p>Собрать убедительную цифровую витрину: показать условия строительства, раскрыть процесс, представить готовые проекты и перевести интерес пользователя в расчёт стоимости или консультацию.</p>
    <h3>Структура и UX</h3>
    <p>Первый экран сразу отвечает на главные вопросы о цене, сроках и гарантии. Далее пользователь последовательно знакомится с преимуществами, этапами работы, каталогом домов, калькулятором, галереей и формой обратной связи. Повторяющиеся CTA поддерживают сценарий на всей длине страницы.</p>
    <h3>Визуальная система</h3>
    <p>Глубокий сине-серый формирует ощущение надёжности, а оранжевый выделяет действия и ключевые цифры. Крупные фотографии домов, карточная сетка и спокойная типографика помогают быстро сканировать насыщенный информацией интерфейс.</p>
    <h3>Функциональность</h3>
    <p>Интерактивный калькулятор позволяет оценить бюджет по площади, этажности и уровню отделки. Каталог проектов сравнивает готовые решения по площади, комнатам и стоимости, а формы захватывают заявки на разных этапах принятия решения.</p>
    <h3>Результат</h3>
    <p>Создан адаптивный прототип сайта строительной компании, где продуктовая информация, доказательства доверия и инструменты расчёта объединены в единый конверсионный маршрут.</p>
  $case$,
  'assets/cases/dream-house-cover.png',
  '["assets/cases/dream-house-projects.png","assets/cases/dream-house-calculator.png"]'::jsonb,
  '["assets/cases/dream-house-cover.png","assets/cases/dream-house-projects.png","assets/cases/dream-house-calculator.png"]'::jsonb,
  '[]'::jsonb,
  '["UX/UI","Web Design","Development"]'::jsonb,
  '["Figma","HTML/CSS","JavaScript"]'::jsonb,
  true,
  'published',
  now(),
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  year = excluded.year,
  client = excluded.client,
  site_url = excluded.site_url,
  short_description = excluded.short_description,
  description = excluded.description,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  desktop_images = excluded.desktop_images,
  mobile_images = excluded.mobile_images,
  services = excluded.services,
  technologies = excluded.technologies,
  featured = excluded.featured,
  status = excluded.status,
  updated_at = now();
insert into public.projects (
  id, title, slug, category, year, client, site_url,
  short_description, description, cover_image,
  gallery, desktop_images, mobile_images,
  services, technologies, featured, status, created_at, updated_at
)
values (
  'p-melnik',
  'MELNIK — Путь настоящего зерна',
  'melnik',
  'landing',
  2026,
  'MELNIK · концепт',
  'https://papagama.github.io/melnik/',
  'Иммерсивный 3D-лендинг ремесленной пивоварни, превращающий путь зерна в кинематографичную интерактивную историю.',
  $case$
    <h3>Контекст</h3>
    <p>MELNIK — концепт ремесленной пивоварни с характером старой мельницы. Вместо привычного каталога посетитель проходит визуальный путь от зерна и жерновов до медных варочных ёмкостей, выдержки и готового напитка.</p>
    <h3>Задача</h3>
    <p>Передать ценность медленного производства и малых партий через цифровой опыт, который не просто рассказывает о продукте, а погружает пользователя в его происхождение.</p>
    <h3>Сценарий и UX</h3>
    <p>Длинный скролл разделён на последовательные сцены: мельница, зерно, жернова, механизм, варка, преимущества, выдержка и финальная подача продукта. Прогресс-индикатор и короткие текстовые акценты помогают удерживать ориентацию внутри насыщенного 3D-повествования.</p>
    <h3>Визуальная система</h3>
    <p>Тёмное дерево, медь, янтарный свет и выразительная антиква формируют атмосферу ремесла и исторической глубины. Контрастные подписи не конкурируют с пространством, а работают как главы единой истории.</p>
    <h3>Интерактивность</h3>
    <p>Three.js создаёт полноценную WebGL-сцену, которая меняется вместе со скроллом. Камера последовательно проводит пользователя через производство, а финальный сценарий переводит эмоциональный интерес в выбор дегустационного набора и заявку.</p>
    <h3>Результат</h3>
    <p>Получился кинематографичный промосайт, где 3D-графика, сторителлинг и коммерческий сценарий объединены в цельный бренд-опыт.</p>
  $case$,
  'assets/cases/melnik-cover.png',
  '["assets/cases/melnik-hero.png","assets/cases/melnik-process.png","assets/cases/melnik-offer.png"]'::jsonb,
  '["assets/cases/melnik-hero.png","assets/cases/melnik-process.png","assets/cases/melnik-offer.png"]'::jsonb,
  '[]'::jsonb,
  '["UX/UI","Web Design","Development","Art Direction","Motion"]'::jsonb,
  '["HTML/CSS","JavaScript","Three.js","WebGL"]'::jsonb,
  true,
  'published',
  now(),
  now()
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  year = excluded.year,
  client = excluded.client,
  site_url = excluded.site_url,
  short_description = excluded.short_description,
  description = excluded.description,
  cover_image = excluded.cover_image,
  gallery = excluded.gallery,
  desktop_images = excluded.desktop_images,
  mobile_images = excluded.mobile_images,
  services = excluded.services,
  technologies = excluded.technologies,
  featured = excluded.featured,
  status = excluded.status,
  updated_at = now();