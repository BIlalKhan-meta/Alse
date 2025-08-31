import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Text,
} from 'react-native';
import {
  Bell,
  User,
  MessageSquare,
  Globe,
  Search,
  Check,
  Home,
} from 'lucide-react-native';
import InterLight from '../../components/Text/InterLight';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import {colors} from '../../utils/theme';
import styles from './styles';
import {images} from '../../utils/images';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useAppTranslation} from '../../i18n/hooks/useAppTranslation';
import GlobalHeader from '../../components/GlobalHeader';

interface Language {
  code: string;
  name: string;
  englishName: string;
  nativeName: string;
}

const LanguageSelection = ({navigation}: any) => {
  const user = useSelector(selectUserProfile);
  const {t, currentLanguage, changeLanguage} = useAppTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [searchQuery, setSearchQuery] = useState('');

  const languages: Language[] = [
    {
      code: 'en',
      name: t('english'),
      englishName: t('english'),
      nativeName: t('englishNative'),
    },
    {
      code: 'zh',
      name: t('chineseNative'),
      englishName: t('chinese'),
      nativeName: t('chineseNative'),
    },
    {
      code: 'fr',
      name: t('frenchNative'),
      englishName: t('french'),
      nativeName: t('frenchNative'),
    },
    {
      code: 'hi',
      name: t('hindiNative'),
      englishName: t('hindi'),
      nativeName: t('hindiNative'),
    },
    {
      code: 'pt',
      name: t('portugueseNative'),
      englishName: t('portuguese'),
      nativeName: t('portugueseNative'),
    },
    {
      code: 'es',
      name: t('spanishNative'),
      englishName: t('spanish'),
      nativeName: t('spanishNative'),
    },
    {
      code: 'sw',
      name: t('swahiliNative'),
      englishName: t('swahili'),
      nativeName: t('swahiliNative'),
    },
  ];

  const filteredLanguages = languages.filter(
    lang =>
      lang.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);

    // Change the app language
    await changeLanguage(languageCode);

    // Navigate back to settings after a short delay
    setTimeout(() => {
      navigation.goBack();
    }, 500);
  };

  const getLanguageIcon = (code: string) => {
    return t(code as keyof typeof t) || code.toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Language Selection Header */}
        <View style={styles.languageHeader}>
          <View style={styles.globeContainer}>
            <Globe size={60} color={colors.white} />
          </View>
          <InterBoldLabel style={styles.languageTitle}>
            {t('selectLanguage')}
          </InterBoldLabel>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search
              size={20}
              color={colors.lightGrey}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('search')}
              placeholderTextColor={colors.lightGrey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <InterLight style={styles.allLanguagesLabel}>
            {t('allLanguages')}
          </InterLight>
        </View>

        {/* Language List */}
        <View style={styles.languageList}>
          {filteredLanguages.map(language => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageCard,
                selectedLanguage === language.code &&
                  styles.selectedLanguageCard,
              ]}
              onPress={() => handleLanguageSelect(language.code)}>
              <View style={styles.languageCardLeft}>
                <View style={styles.languageIcon}>
                  <Text style={styles.languageIconText}>
                    {getLanguageIcon(language.code)}
                  </Text>
                </View>
                <View style={styles.languageTextContainer}>
                  <InterBoldLabel style={styles.languageName}>
                    {language.nativeName}
                  </InterBoldLabel>
                  <InterLight style={styles.languageEnglishName}>
                    {language.englishName}
                  </InterLight>
                </View>
              </View>
              {selectedLanguage === language.code && (
                <Check size={24} color={colors.themeColor} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default LanguageSelection;
