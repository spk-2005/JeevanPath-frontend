import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { login: 'Login / Signup', search_placeholder: 'Search resources' } },
  hi: { translation: { login: 'लॉगिन / साइनअप', search_placeholder: 'खोजें' } }
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;


