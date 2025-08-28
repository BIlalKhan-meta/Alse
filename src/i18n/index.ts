import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {Platform, NativeModules} from 'react-native';

// Import translation files
import en from './locales/en';
import sw from './locales/sw';

const resources = {
  en: {
    translation: en,
  },
  sw: {
    translation: sw,
  },
};

// Get device language using React Native's built-in localization
const getDeviceLanguage = () => {
  let deviceLanguage = 'en';

  try {
    if (Platform.OS === 'ios') {
      deviceLanguage =
        NativeModules.SettingsManager.settings.AppleLocale || 'en';
    } else {
      deviceLanguage = NativeModules.I18nManager.localeIdentifier || 'en';
    }

    // Extract language code (e.g., 'en-US' -> 'en')
    deviceLanguage = deviceLanguage.split('-')[0];

    // Check if we support the device language
    if (resources[deviceLanguage as keyof typeof resources]) {
      return deviceLanguage;
    }
  } catch (error) {
    console.log('Error getting device language:', error);
  }

  // Fallback to English
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
