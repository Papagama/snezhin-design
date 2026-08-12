/*
 * Эта конфигурация загружается в браузер и поэтому является публичной.
 * Здесь разрешён только Publishable key (sb_publishable_...) или старый anon key (eyJ...).
 * Никогда не вставляйте сюда sb_secret_ / service_role key и пароль администратора.
 */
window.APP_CONFIG = {
  ADMIN_EMAIL: 'snezhin.design@mail.ru',
  SUPABASE_URL: 'https://kvlrnntvwvupkrzrnivg.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_bQj6siVkwDS9B2wmBA9UCQ_Urtuf0RE',
  // Formspree form ID из Dashboard → Integration, например: xqazwser.
  // Это публичный ID формы, не пароль и не API-ключ.
  FORMSPREE_FORM_ID: 'xwleonpz'
};
