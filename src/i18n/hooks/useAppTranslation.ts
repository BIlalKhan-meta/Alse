import {useTranslation} from 'react-i18next';
import {useLanguage} from '../LanguageContext';

export const useAppTranslation = () => {
  const {t} = useTranslation();
  const {currentLanguage, changeLanguage, availableLanguages} = useLanguage();

  return {
    t,
    currentLanguage,
    changeLanguage,
    availableLanguages,
  };
};
