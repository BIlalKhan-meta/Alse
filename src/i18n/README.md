# i18n Internationalization Setup

This directory contains the internationalization (i18n) setup for the Alse app, supporting English and Swahili languages.

## Installation

Install the required dependencies:

```bash
npm install i18next react-i18next react-native-localize
# or
yarn add i18next react-i18next react-native-localize
```

## Structure

```
src/i18n/
├── index.ts                 # Main i18n configuration
├── LanguageContext.tsx      # React context for language management
├── hooks/
│   └── useAppTranslation.ts # Custom hook for translations
└── locales/
    ├── en.ts               # English translations
    └── sw.ts               # Swahili translations
```

## Usage

### 1. Wrap your app with LanguageProvider

In your main App.tsx or index.js:

```tsx
import {LanguageProvider} from './src/i18n/LanguageContext';
import './src/i18n';

const App = () => {
  return <LanguageProvider>{/* Your app components */}</LanguageProvider>;
};
```

### 2. Use translations in components

```tsx
import {useAppTranslation} from '../i18n/hooks/useAppTranslation';

const MyComponent = () => {
  const {t, currentLanguage, changeLanguage} = useAppTranslation();

  return <Text>{t('hello')}</Text>;
};
```

### 3. Change language

```tsx
const {changeLanguage} = useAppTranslation();

const handleLanguageChange = async (languageCode: string) => {
  await changeLanguage(languageCode);
};
```

## Supported Languages

- **English (en)** - Default language
- **Swahili (sw)** - Secondary language

## Adding New Languages

1. Create a new translation file in `locales/` directory
2. Add the language to the resources in `index.ts`
3. Update the `availableLanguages` array in `LanguageContext.tsx`

## Features

- ✅ Automatic device language detection
- ✅ Persistent language storage
- ✅ Easy language switching
- ✅ Fallback to English
- ✅ Type-safe translations
- ✅ React context integration
