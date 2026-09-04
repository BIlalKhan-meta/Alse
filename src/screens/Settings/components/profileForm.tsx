import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles';
import {editProfileWithJson, EditProfilePayload} from '../../../api/profile';
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
  /** Baseline values when the form opened — only diffs are sent on save. */
  initialProfileData?: ProfileData;
  handleProfileUpdate: (field: keyof ProfileData, value: string) => void;
  setIsEditing: () => void;
  onProfileUpdateSuccess?: () => void;
}

const normalize = (value?: string | null) => (value ?? '').trim();

const ProfileForm = ({
  profileData,
  initialProfileData,
  handleProfileUpdate,
  setIsEditing,
  onProfileUpdateSuccess,
}: ProfileFormProps) => {
  const [uploading, setUploading] = useState(false);
  const {t} = useAppTranslation();

  // Snapshot once when the form mounts (or when parent passes a new baseline).
  const baselineRef = useRef<ProfileData>(
    initialProfileData ?? {...profileData},
  );

  useEffect(() => {
    if (initialProfileData) {
      baselineRef.current = initialProfileData;
    }
  }, [initialProfileData]);

  const buildChangedPayload = (): EditProfilePayload => {
    const baseline = baselineRef.current;
    const payload: EditProfilePayload = {};

    const firstName = normalize(profileData.firstName);
    const lastName = normalize(profileData.lastName);
    const userName = normalize(profileData.userName);
    const location = normalize(profileData.location);
    const bio = normalize(profileData.description);
    const pronouns = normalize(profileData.pronouns);

    if (firstName !== normalize(baseline.firstName)) {
      payload.first_name = firstName;
    }
    if (lastName !== normalize(baseline.lastName)) {
      payload.last_name = lastName;
    }
    if (userName !== normalize(baseline.userName)) {
      payload.username = userName;
    }
    if (location !== normalize(baseline.location)) {
      payload.location_name = location;
    }
    if (bio !== normalize(baseline.description)) {
      payload.bio = bio;
    }
    if (pronouns !== normalize(baseline.pronouns)) {
      payload.pronouns = pronouns;
    }

    return payload;
  };

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

            const payload = buildChangedPayload();
            if (Object.keys(payload).length === 0) {
              Toast.show({
                type: 'info',
                text1: t('settings.save'),
                text2: 'No changes to save',
              });
              return;
            }

            const response = await editProfileWithJson(payload);

            const isSuccess =
              (response.status >= 200 && response.status < 300) ||
              response.data?.success === true ||
              (response.data && !response.data?.errors);

            if (isSuccess) {
              baselineRef.current = {...profileData};
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
                text2:
                  getMessage(response.data) || t('toast.failedProfileUpdate'),
              });
            }
          } catch (error: any) {
            const errorBody = error.response?.data ?? error;
            const message =
              getMessage(errorBody) || t('toast.failedProfileUpdate');
            console.error(
              'Profile update error:',
              error?.response?.data ?? error,
            );
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
