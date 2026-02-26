import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles';
import {editProfileWithJson} from '../../../api/profile';
import {colors} from '../../../utils/theme';
import {getMessage} from '../../../utils/helpers';
import InterRegular from '../../../components/Text/InterRegular';
import {useAppTranslation} from '../../../i18n/hooks/useAppTranslation';
import Toast from 'react-native-toast-message';
import {LocationEdit} from 'lucide-react-native';

interface ProfileData {
  firstName: string;
  lastName: string;
  userName: string;
  location: string;
  description: string;
  pronouns: string;
}

interface ProfileFormProps {
  profileData: ProfileData;
  handleProfileUpdate: (field: keyof ProfileData, value: string) => void;
  setIsEditing: () => void;
  onProfileUpdateSuccess?: () => void;
}

const ProfileForm = ({
  profileData,
  handleProfileUpdate,
  setIsEditing,
  onProfileUpdateSuccess,
}: ProfileFormProps) => {
  const [uploading, setUploading] = useState(false);
  const {t} = useAppTranslation();

  return (
    <View style={styles.profileForm}>
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <InterRegular style={styles.inputLabel}>
            {t('settings.firstName')}
          </InterRegular>
          <TextInput
            style={styles.textInput}
            value={profileData.firstName}
            onChangeText={text => handleProfileUpdate('firstName', text)}
            placeholder={t('settings.firstName')}
            // editable={isEditing}
          />
        </View>
        <View style={styles.inputContainer}>
          <InterRegular style={styles.inputLabel}>
            {t('settings.lastName')}
          </InterRegular>
          <TextInput
            style={styles.textInput}
            value={profileData.lastName}
            onChangeText={text => handleProfileUpdate('lastName', text)}
            placeholder={t('settings.lastName')}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.userName')}
        </InterRegular>
        <TextInput
          style={styles.textInput}
          value={profileData.userName}
          onChangeText={text => handleProfileUpdate('userName', text)}
          placeholder={t('settings.userName')}
        />
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.pronouns')}
        </InterRegular>
        <TextInput
          style={styles.textInput}
          value={profileData.pronouns}
          onChangeText={text => handleProfileUpdate('pronouns', text)}
          placeholder={t('settings.pronounsPlaceholder')}
        />
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.location')}
        </InterRegular>
        <View style={styles.textInputWithIcon}>
          <TextInput
            style={[styles.textInput, styles.textInputWithIconInput]}
            value={profileData.location}
            onChangeText={text => handleProfileUpdate('location', text)}
            placeholder={t('settings.location')}
          />
          <TouchableOpacity style={styles.inputIcon}>
            <LocationEdit size={20} color={colors.inputText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>
          {t('settings.bio')}
        </InterRegular>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profileData.description}
          onChangeText={text => handleProfileUpdate('description', text)}
          placeholder={t('settings.bioPlaceholder')}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={async () => {
          try {
            setUploading(true);

            let hasContent = false;
            if (profileData.description && profileData.description.trim()) {
              hasContent = true;
            }
            if (profileData.location && profileData.location.trim()) {
              hasContent = true;
            }
            if (profileData.firstName && profileData.firstName.trim()) {
              hasContent = true;
            }
            if (profileData.lastName && profileData.lastName.trim()) {
              hasContent = true;
            }
            if (profileData.userName && profileData.userName.trim()) {
              hasContent = true;
            }
            if (profileData.pronouns && profileData.pronouns.trim()) {
              hasContent = true;
            }

            if (!hasContent) {
              Toast.show({
                type: 'error',
                text1: t('error'),
                text2: t('toast.cantBeEmpty'),
              });
              return;
            }

            const payload = {
              ...(profileData.firstName?.trim() && {
                first_name: profileData.firstName.trim(),
              }),
              ...(profileData.lastName?.trim() && {
                last_name: profileData.lastName.trim(),
              }),
              ...(profileData.userName?.trim() && {
                username: profileData.userName.trim(),
              }),
              ...(profileData.location?.trim() && {
                location_name: profileData.location.trim(),
              }),
              ...(profileData.description?.trim() && {
                bio: profileData.description.trim(),
              }),
              ...(profileData.pronouns?.trim() && {
                pronouns: profileData.pronouns.trim(),
              }),
            };

            const response = await editProfileWithJson(payload);

            const isSuccess =
              (response.status >= 200 && response.status < 300) ||
              response.data?.success === true ||
              (response.data && !response.data?.errors);

            if (isSuccess) {
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile updated successfully!',
              });
              onProfileUpdateSuccess?.();
              setIsEditing();
            } else {
              Toast.show({
                type: 'error',
                text1: t('error'),
                text2: getMessage(response.data) || t('toast.failedProfileUpdate'),
              });
            }
          } catch (error: any) {
            const errorBody = error.response?.data ?? error;
            const message = getMessage(errorBody) || t('toast.failedProfileUpdate');
            console.error('Profile update error:', error?.response?.data ?? error);
            Toast.show({
              type: 'error',
              text1: t('error'),
              text2: message,
            });
          } finally {
            setUploading(false);
          }
        }}
        disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <InterRegular style={styles.saveButtonText}>
            {t('settings.save')}
          </InterRegular>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProfileForm;
