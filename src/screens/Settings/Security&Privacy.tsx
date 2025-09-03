import React from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import InterLightAverage from '../../components/Text/InterLightAverage';
import {ChevronRight} from 'lucide-react-native';
import {colors} from '../../utils/theme';
import {useTranslation} from 'react-i18next';

const SecurityPrivacy = ({navigation}: any) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Security & Privacy Header */}
        <View style={styles.languageHeader}>
          <InterLightAverage style={styles.languageTitle}>
            {t('securityPrivacy.title')}
          </InterLightAverage>
        </View>

        {/* Settings Container */}
        <View style={styles.settingsContainer}>
          {/* Change Password */}
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('ChangePassword')}>
            <InterLightAverage style={styles.navigationItemText}>
              {t('securityPrivacy.changePassword')}
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>

          {/* Device & Login Activity */}
          <TouchableOpacity style={styles.navigationItem}>
            <InterLightAverage style={styles.navigationItemText}>
              {t('securityPrivacy.deviceInfo')}
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>

          {/* Disable or Delete Account */}
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('DisableDeleteAccount')}>
            <InterLightAverage style={styles.navigationItemText}>
              {t('securityPrivacy.deleteAccount')}
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SecurityPrivacy;
