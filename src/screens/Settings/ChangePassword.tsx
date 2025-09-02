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

const ChangePassword = ({navigation}: any) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!oldPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your current password',
      });
      return false;
    }

    if (!newPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a new password',
      });
      return false;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'New password must be at least 6 characters long',
      });
      return false;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'New password and confirm password do not match',
      });
      return false;
    }

    if (oldPassword === newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'New password must be different from current password',
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
          text1: 'Success',
          text2: 'Password changed successfully!',
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

      let errorMessage = 'Failed to change password. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Current password is incorrect';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid password format';
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
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
            Change Password
          </InterBoldLabel>
        </View>

        {/* Input Fields Container */}
        <View style={styles.settingsContainer}>
          {/* Current Password Input */}
          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              Current Password
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
            <InterRegular style={styles.inputLabel}>New Password</InterRegular>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.lightGrey}
              secureTextEntry
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              Confirm Password
            </InterRegular>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
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
              <InterRegular style={styles.saveButtonText}>Save</InterRegular>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePassword;
