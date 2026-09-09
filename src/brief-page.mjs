import { briefSteps } from './brief-data.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderField(f) {
  const label = `${esc(f.label)}${f.required ? ' <span class="brief-required">*</span>' : ''}`;
  const described = `${f.id}-error${f.hint ? ` ${f.id}-hint` : ''}${f.required ? ' brief-required-note' : ''}`;
  const attrs = `id="${f.id}" name="${f.id}" aria-describedby="${described}"${f.required && !f.options ? ' required' : ''}${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ''}`;
  const hint = f.hint ? `<p class="brief-hint" id="${f.id}-hint">${esc(f.hint)}</p>` : '';
  const error = `<p class="brief-error" id="${f.id}-error" hidden></p>`;
  const other = f.options?.includes('Другое') ? `<div class="brief-other" data-other="${f.id}" hidden><label for="${f.id}Other">Расскажите подробнее <span class="brief-required">*</span></label><textarea id="${f.id}Other" name="${f.id}Other" maxlength="2000" rows="3" aria-describedby="${f.id}Other-error" disabled></textarea><p class="brief-error" id="${f.id}Other-error" hidden></p></div>` : '';
  let control;
  if (f.type === 'checkbox' || f.type === 'radio') {
    control = `<fieldset class="brief-field" data-field="${f.id}"><legend>${label}</legend>${hint}<div class="brief-options">${f.options.map((v,i) => `<label class="brief-option" for="${f.id}-${i}"><input id="${f.id}-${i}" type="${f.type}" name="${f.id}" value="${esc(v)}" aria-describedby="${described}"><span>${esc(v)}</span></label>`).join('')}</div>${error}${other}</fieldset>`;
  } else {
    const placeholder = esc(f.placeholder || '');
    const input = f.type === 'textarea' ? `<textarea ${attrs} maxlength="4000" rows="3" placeholder="${placeholder}"></textarea>` : f.type === 'select' ? `<select ${attrs}><option value="">Выберите вариант, если уже знаете</option>${f.options.map(v => `<option>${esc(v)}</option>`).join('')}</select>` : `<input ${attrs} type="${f.type}" maxlength="200" placeholder="${placeholder}">`;
    control = `<div class="brief-field" data-field="${f.id}"><label for="${f.id}">${label}</label>${hint}${input}${error}</div>`;
  }
  return `${f.contact ? '<div class="brief-contact-heading"><h3>Как с вами связаться?</h3><p id="brief-contact-note">Укажите имя и хотя бы один контакт: телефон, Telegram или email.</p><p id="contacts-error" class="brief-error" hidden></p></div>' : ''}${control}`;
}
export function briefBody(telegram) {
  return `<link rel="stylesheet" href="/brief.css?v=20260909"><div class="shell brief-page">
    <nav class="breadcrumbs" aria-label="Хлебные крошки"><a href="/">Главная</a><span>/</span><span>Бриф</span></nav>
    <header class="brief-intro"><h1>Расскажите о вашем проекте</h1><p>Ответьте на несколько вопросов – я изучу задачу и смогу точнее предложить формат сайта, объём работ, сроки и стоимость.</p><p class="brief-time">Обычно заполнение занимает 3–5 минут.</p></header>
    <form id="project-brief" novalidate hidden>
      <div class="brief-progress"><span id="brief-progress-label" aria-live="polite">Шаг 1 из 7</span><progress id="brief-progress" value="1" max="7" aria-labelledby="brief-progress-label">1 из 7</progress></div>
      <p class="brief-hint" id="brief-required-note">* Обязательные поля. Остальные можно пропустить.</p>
      ${briefSteps.map((step,i) => `<section class="brief-step" data-step="${i}" aria-labelledby="brief-step-${i}"${i ? ' hidden' : ''}><h2 id="brief-step-${i}" tabindex="-1">${esc(step.title)}</h2>${step.fields.map(renderField).join('')}${i === 6 ? `<div class="brief-field"><div class="brief-consent"><input type="checkbox" id="consent" name="consent" required aria-describedby="consent-error"><label for="consent">Я согласен на обработку персональных данных и принимаю <a href="/privacy.html" target="_blank" rel="noopener">Политику конфиденциальности</a>.</label></div><p id="consent-error" class="brief-error" hidden></p></div>` : ''}</section>`).join('')}
      <div id="brief-send-error" class="brief-send-error" role="alert" hidden><p>Не удалось отправить бриф. Попробуйте ещё раз или свяжитесь со мной напрямую.</p><a href="${esc(telegram)}" target="_blank" rel="noopener">Написать в Telegram ↗</a></div>
      <div class="brief-actions"><button type="button" class="button" id="brief-back" hidden>Назад</button><button type="button" class="button button--ink" id="brief-next">Далее <span aria-hidden="true">→</span></button><button type="submit" class="button button--ink" id="brief-submit" hidden>Получить предварительную оценку</button></div>
      <div class="brief-draft"><p id="brief-draft-status" role="status">Черновик сохраняется только в этом браузере на 7 дней. На общем компьютере удалите его после заполнения.</p><button type="button" id="brief-clear">Удалить черновик</button></div>
    </form>
    <section id="brief-success" class="brief-success" hidden aria-labelledby="brief-success-title"><h2 id="brief-success-title" tabindex="-1">Спасибо! Бриф отправлен</h2><p>Я изучу ваши ответы и свяжусь с вами, чтобы обсудить проект.</p><a class="button button--ink" href="/">Вернуться на главную</a></section>
    <noscript><p>Для пошагового брифа включите JavaScript в браузере или <a href="${esc(telegram)}">напишите мне в Telegram</a>.</p></noscript>
  </div><script id="brief-schema" type="application/json">${JSON.stringify(briefSteps).replace(/</g,'\\u003c')}</script><script src="/config.js"></script><script type="module" src="/brief.js?v=20260909"></script>`;
}
