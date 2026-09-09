import { DRAFT_KEY, DRAFT_TTL, cleanAnswers, validateStep, formatBrief, readDraft } from './brief-model.mjs';

const form = document.getElementById('project-brief');
const steps = JSON.parse(document.getElementById('brief-schema').textContent);
const fields = steps.flatMap(s => s.fields);
const byId = id => document.getElementById(id);
const controls = name => [...form.elements].filter(el => el.name === name);
let current = 0;
let sending = false;
let complete = false;
let expiresAt = Date.now() + DRAFT_TTL;
let expiryTimer;
let storage;
try { storage = window.localStorage; } catch {}
const answers = () => cleanAnswers(steps, Object.fromEntries(fields.flatMap(f => [
  [f.id, f.type === 'checkbox' ? controls(f.id).filter(el => el.checked).map(el => el.value) : f.type === 'radio' ? controls(f.id).find(el => el.checked)?.value || '' : byId(f.id).value],
  ...(f.options?.includes('Другое') ? [[`${f.id}Other`, byId(`${f.id}Other`).value]] : [])
])));

function removeDraft() { try { storage?.removeItem(DRAFT_KEY); } catch {} }
function scheduleExpiry() {
  clearTimeout(expiryTimer);
  expiryTimer = setTimeout(() => {
    removeDraft();
  }, Math.max(0, expiresAt - Date.now()));
}
function save() {
  if (sending || complete) return;
  if (Date.now() >= expiresAt) { expiresAt = Date.now() + DRAFT_TTL; scheduleExpiry(); }
  try {
    if (!storage) throw new Error('Storage unavailable');
    storage.setItem(DRAFT_KEY, JSON.stringify({ expiresAt, answers: answers() }));
  } catch {}
}
function syncOther() {
  for (const f of fields.filter(f => f.options?.includes('Другое'))) {
    const visible = controls(f.id).some(el => el.checked && el.value === 'Другое');
    form.querySelector(`[data-other="${f.id}"]`).hidden = !visible;
    byId(`${f.id}Other`).disabled = !visible;
    byId(`${f.id}Other`).required = visible;
  }
}
function focusElement(el) {
  el.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
function showStep(index, focus = true) {
  current = index;
  form.querySelectorAll('[data-step]').forEach((section,i) => { section.hidden = i !== index; });
  byId('brief-progress-label').textContent = `Шаг ${index + 1} из 7`;
  byId('brief-progress').value = index + 1;
  byId('brief-progress').textContent = `${index + 1} из 7`;
  byId('brief-back').hidden = index === 0;
  byId('brief-next').hidden = index === 6;
  byId('brief-submit').hidden = index !== 6;
  if (focus) focusElement(byId(`brief-step-${index}`));
}
function clearErrors() {
  form.querySelectorAll('.brief-error').forEach(el => { el.hidden = true; el.textContent = ''; });
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
}
function displayErrors(errors) {
  for (const [id,message] of Object.entries(errors)) {
    byId(`${id}-error`).textContent = message;
    byId(`${id}-error`).hidden = false;
    const targets = id === 'contacts' ? ['phone','telegram','email'].map(byId) : controls(id);
    targets.forEach(el => el.setAttribute('aria-invalid','true'));
  }
  const first = form.querySelector('[data-step]:not([hidden]) [aria-invalid="true"]');
  if (first) focusElement(first);
}
function check(index, values = answers()) {
  clearErrors();
  const errors = validateStep(steps[index], values, byId('consent').checked, index === 6);
  displayErrors(errors);
  return !Object.keys(errors).length;
}
for (const id of ['phone','telegram','email']) byId(id).setAttribute('aria-describedby', `${id}-error contacts-error brief-contact-note`);
const draft = storage && readDraft(storage, steps);
if (draft) {
  expiresAt = draft.expiresAt;
  for (const [name,value] of Object.entries(draft.answers)) {
    controls(name).forEach(el => {
      if (el.type === 'checkbox') el.checked = value.includes(el.value);
      else if (el.type === 'radio') el.checked = value === el.value;
      else el.value = value;
    });
  }
}
scheduleExpiry();
syncOther();
form.hidden = false;
form.addEventListener('input', save);
form.addEventListener('change', event => {
  const f = fields.find(f => f.id === event.target.name);
  if (f?.exclusive && event.target.checked) controls(f.id).forEach(el => {
    if (el !== event.target && (event.target.value === f.exclusive || el.value === f.exclusive)) el.checked = false;
  });
  syncOther();
  save();
});
byId('brief-next').addEventListener('click', () => { if (check(current)) showStep(current + 1); });
byId('brief-back').addEventListener('click', () => { clearErrors(); showStep(current - 1); });
form.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target.matches('input:not([type=checkbox]):not([type=radio])')) event.preventDefault();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || complete || current !== 6) return;
  const values = answers();
  for (let i = 0; i < steps.length; i++) {
    const errors = validateStep(steps[i], values, byId('consent').checked, i === 6);
    if (Object.keys(errors).length) { clearErrors(); showStep(i, false); displayErrors(errors); return; }
  }
  save();
  sending = true;
  byId('brief-send-error').hidden = true;
  form.setAttribute('aria-busy','true');
  byId('brief-submit').textContent = 'Отправляю бриф...';
  const enabled = [...form.elements].filter(el => !el.disabled);
  enabled.forEach(el => { el.disabled = true; });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const id = window.APP_CONFIG?.FORMSPREE_FORM_ID?.trim();
    if (!id || !/^[A-Za-z0-9]+$/.test(id)) throw new Error('Submission is not configured');
    const response = await fetch(`https://formspree.io/f/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: values.name.trim(), ...(values.email.trim() ? { email: values.email.trim() } : {}), subject: `Новый бриф: ${values.company.trim()}`, message: formatBrief(steps, values) }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Submission rejected');
    complete = true;
    removeDraft(); clearTimeout(expiryTimer); form.reset(); form.hidden = true;
    byId('brief-success').hidden = false;
    focusElement(byId('brief-success-title'));
  } catch {
    byId('brief-send-error').hidden = false;
    byId('brief-send-error').scrollIntoView({ block: 'center' });
  } finally {
    clearTimeout(timeout); sending = false;
    form.removeAttribute('aria-busy');
    enabled.forEach(el => { el.disabled = false; });
    byId('brief-submit').textContent = 'Получить предварительную оценку';
  }
});
