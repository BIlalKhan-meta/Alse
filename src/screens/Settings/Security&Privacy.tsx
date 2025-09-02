import React from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import InterLightAverage from '../../components/Text/InterLightAverage';
import {ChevronRight} from 'lucide-react-native';
import {colors} from '../../utils/theme';

const SecurityPrivacy = ({navigation}: any) => {
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
            Security & Privacy
          </InterLightAverage>
        </View>

        {/* Settings Container */}
        <View style={styles.settingsContainer}>
          {/* Change Password */}
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('ChangePassword')}>
            <InterLightAverage style={styles.navigationItemText}>
              Change Password
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>

          {/* Device & Login Activity */}
          <TouchableOpacity style={styles.navigationItem}>
            <InterLightAverage style={styles.navigationItemText}>
              Device & Login Activity
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
              Disable or Delete Account
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
