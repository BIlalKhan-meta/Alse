# i18n Example Usage

## Basic Translation

```tsx
import {useAppTranslation} from '../i18n/hooks/useAppTranslation';

const MyComponent = () => {
  const {t} = useAppTranslation();

  return <Text>{t('selectLanguage')}</Text>;
};
```

## Language Switching

```tsx
import {useAppTranslation} from '../i18n/hooks/useAppTranslation';

const LanguageSwitcher = () => {
  const {currentLanguage, changeLanguage} = useAppTranslation();

  const switchToSwahili = async () => {
    await changeLanguage('sw');
  };

  const switchToEnglish = async () => {
    await changeLanguage('en');
  };

  return (
    <View>
      <Text>Current: {currentLanguage}</Text>
      <Button onPress={switchToSwahili} title="Switch to Swahili" />
      <Button onPress={switchToEnglish} title="Switch to English" />
    </View>
  );
};
```

## Available Translation Keys

### Language Selection Page

- `selectLanguage` - "Select Language" / "Chagua Lugha"
- `search` - "Search" / "Tafuta"
- `allLanguages` - "All Languages" / "Lugha Zote"

### Language Names

- `english` - "English" / "Kiingereza"
- `swahili` - "Swahili" / "Kiswahili"
- `chinese` - "Chinese" / "Kichina"
- `french` - "French" / "Kifaransa"
- `hindi` - "Hindi" / "Kihindi"
- `portuguese` - "Portuguese" / "Kireno"
- `spanish` - "Spanish" / "Kihispania"

### App Elements

- `appName` - "Alse" / "Alse"
- `cancel` - "Cancel" / "Ghairi"
- `done` - "Done" / "Imekamilika"

## Testing the Setup

1. Install dependencies:

   ```bash
   npm install i18next react-i18next react-native-localize
   ```

2. The app will automatically detect device language
3. Navigate to Settings > Language
4. Select a different language
5. The app will switch languages immediately
6. Language preference is saved and persists across app restarts

## Adding New Languages

1. Create `src/i18n/locales/[language-code].ts`
2. Add translations for all keys
3. Update `src/i18n/index.ts` resources
4. Update `src/i18n/LanguageContext.tsx` availableLanguages
