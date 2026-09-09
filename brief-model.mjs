export const DRAFT_KEY = 'snezhin-brief-v1';
export const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;
export function cleanAnswers(steps, raw = {}) {
  const answers = {};
  for (const f of steps.flatMap(s => s.fields)) {
    if (f.type === 'checkbox') {
      answers[f.id] = Array.isArray(raw[f.id]) ? f.options.filter(v => raw[f.id].includes(v)) : [];
      if (f.exclusive && answers[f.id].includes(f.exclusive)) answers[f.id] = [f.exclusive];
    } else if (f.options) answers[f.id] = f.options.includes(raw[f.id]) ? raw[f.id] : '';
    else answers[f.id] = typeof raw[f.id] === 'string' ? raw[f.id].slice(0, f.type === 'textarea' ? 4000 : 200) : '';
    if (f.options?.includes('Другое')) answers[`${f.id}Other`] = typeof raw[`${f.id}Other`] === 'string' ? raw[`${f.id}Other`].slice(0,2000) : '';
  }
  return answers;
}
export function validateStep(step, answers, consent = false, last = false) {
  const errors = {};
  for (const f of step.fields) {
    const value = answers[f.id];
    if (f.required && !(Array.isArray(value) ? value.length : value?.trim())) errors[f.id] = f.type === 'checkbox' ? 'Выберите хотя бы один вариант.' : 'Заполните это поле.';
    if (f.options?.includes('Другое') && (Array.isArray(value) ? value.includes('Другое') : value === 'Другое') && !answers[`${f.id}Other`]?.trim()) errors[`${f.id}Other`] = 'Уточните ваш вариант.';
  }
  if (last) {
    const { phone = '', telegram = '', email = '' } = answers;
    if (![phone,telegram,email].some(v => v.trim())) errors.contacts = 'Укажите хотя бы один контакт: телефон, Telegram или email.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Проверьте email. Например: name@example.com.';
    if (phone.trim() && (!/^\+?[\d\s()\-]+$/.test(phone.trim()) || !/^\d{7,15}$/.test(phone.replace(/\D/g,'')))) errors.phone = 'Укажите телефон с кодом страны: от 7 до 15 цифр.';
    if (telegram.trim() && !/^(?:@|(?:https?:\/\/)?t\.me\/)?[A-Za-z][A-Za-z0-9_]{3,31}\/?$/.test(telegram.trim())) errors.telegram = 'Укажите имя пользователя: @username или t.me/username.';
    if (!consent) errors.consent = 'Для отправки нужно согласие на обработку данных.';
  }
  return errors;
}
export function formatBrief(steps, answers) {
  return ['Новый бриф с сайта', ...steps.flatMap(step => [
    '', step.title.toUpperCase(), ...step.fields.map(f => {
      const v = answers[f.id];
      const selected = Array.isArray(v) ? v.join(', ') : (v || '').trim();
      const other = (Array.isArray(v) ? v.includes('Другое') : v === 'Другое') ? answers[`${f.id}Other`]?.trim() : '';
      return `${f.label}\n${selected || 'Не указано'}${other ? `: ${other}` : ''}`;
    })
  ]), '', 'Согласие на обработку персональных данных: получено', 'Политика: https://design.kirill-verstak.ru/privacy.html', 'Источник: https://design.kirill-verstak.ru/brief/'].join('\n\n');
}
export function readDraft(storage, steps, now = Date.now()) {
  try {
    const draft = JSON.parse(storage.getItem(DRAFT_KEY));
    if (!draft) return null;
    if (!Number.isFinite(draft.expiresAt) || draft.expiresAt <= now || draft.expiresAt > now + DRAFT_TTL || !draft.answers || typeof draft.answers !== 'object') {
      storage.removeItem(DRAFT_KEY); return null;
    }
    return { answers: cleanAnswers(steps, draft.answers), expiresAt: draft.expiresAt };
  } catch { try { storage.removeItem(DRAFT_KEY); } catch {} return null; }
}
