import React, {useState} from 'react';
import {
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import styles from '../styles';
import {editProfile} from '../../../api/profile';
import {colors} from '../../../utils/theme';
import InterRegular from '../../../components/Text/InterRegular';
import {useAppTranslation} from '../../../i18n/hooks/useAppTranslation';
import Toast from 'react-native-toast-message';
import {LocationEdit} from 'lucide-react-native';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../../store/slices/authSlice';

const ProfileForm = ({profileData, handleProfileUpdate, setIsEditing}) => {
  const user = useSelector(selectUserProfile);
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
            const formData = new FormData();

            // Map profile data to API fields according to the curl example
            if (profileData.description) {
              formData.append('bio', profileData.description);
            }
            if (profileData.location) {
              formData.append('location_name', profileData.location);
            }
            // Add other fields as needed
            if (profileData.firstName) {
              formData.append('first_name', profileData.firstName);
            }
            if (profileData.lastName) {
              formData.append('last_name', profileData.lastName);
            }
            if (profileData.userName) {
              formData.append('username', profileData.userName);
            }
            if (profileData.pronouns) {
              formData.append('pronouns', profileData.pronouns);
            }

            const response = await editProfile(formData);

            if (response.data) {
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile updated successfully!',
              });
              setIsEditing();
            }
          } catch (error) {
            console.error('Upload error:', error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to update profile',
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
