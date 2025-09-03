import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import {changePassword} from '../../api/settings';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

const ChangePassword = ({navigation}: any) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {t} = useTranslation();

  const validateForm = () => {
    if (!oldPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('toast.currentPassword'),
      });
      return false;
    }

    if (!newPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('toast.newPassword'),
      });
      return false;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('toast.newPasswordLength'),
      });
      return false;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('toast.passwordMatch'),
      });
      return false;
    }

    if (oldPassword === newPassword) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('toast.passwordMatch'),
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: t('toast.passwordChanged'),
        });

        // Clear form and navigate back
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Change password error:', error);

      let errorMessage = t('toast.failedToChangePassword');

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = t('toast.incorrectPassword');
      } else if (error.response?.status === 400) {
        errorMessage = t('toast.invalidFormat');
      }

      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
        {/* Screen Title */}
        <View style={styles.languageHeader}>
          <InterBoldLabel style={styles.languageTitle}>
            {t('changePassword.title')}
          </InterBoldLabel>
        </View>

        {/* Input Fields Container */}
        <View style={styles.settingsContainer}>
          {/* Current Password Input */}
          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              {t('currentPassword')}
            </InterRegular>
            <TextInput
              style={styles.textInput}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.lightGrey}
              secureTextEntry
            />
          </View>

          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              {t('changePassword.newPassword')}
            </InterRegular>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('newPassword')}
              placeholderTextColor={colors.lightGrey}
              secureTextEntry
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              {t('changePassword.confirmPassword')}
            </InterRegular>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('confirmPassword')}
              placeholderTextColor={colors.lightGrey}
              secureTextEntry
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <InterRegular style={styles.saveButtonText}>
                {t('save')}
              </InterRegular>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePassword;
