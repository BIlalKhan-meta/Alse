import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles';
import {editProfile} from '../../../api/profile';
import {colors} from '../../../utils/theme';
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
}

const ProfileForm = ({
  profileData,
  handleProfileUpdate,
  setIsEditing,
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
            const formData = new FormData();

            // Map profile data to API fields according to the curl example
            if (profileData.description && profileData.description.trim()) {
              formData.append('bio', profileData.description.trim());
            }
            if (profileData.location && profileData.location.trim()) {
              formData.append('location_name', profileData.location.trim());
            }
            // Add other fields as needed
            if (profileData.firstName && profileData.firstName.trim()) {
              formData.append('first_name', profileData.firstName.trim());
            }
            if (profileData.lastName && profileData.lastName.trim()) {
              formData.append('last_name', profileData.lastName.trim());
            }
            if (profileData.userName && profileData.userName.trim()) {
              formData.append('username', profileData.userName.trim());
            }
            if (profileData.pronouns && profileData.pronouns.trim()) {
              formData.append('pronouns', profileData.pronouns.trim());
            }

            // Check if FormData has any content
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

            // Test FormData creation
            console.log('Testing FormData creation...');
            const testFormData = new FormData();
            testFormData.append('test', 'test_value');
            console.log('Test FormData created successfully:', testFormData);

            console.log('About to call editProfile API with FormData');
            console.log('FormData object:', formData);

            // Try to inspect FormData contents in a different way
            try {
              // @ts-ignore - React Native FormData might have different methods
              if ((formData as any).getParts) {
                console.log(
                  'FormData getParts():',
                  (formData as any).getParts(),
                );
              }
            } catch (e) {
              console.log('Could not inspect FormData contents:', e);
            }

            const response = await editProfile(formData);

            console.log('API Response:', response);
            console.log('Response data:', response.data);

            if (response.data) {
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile updated successfully!',
              });
              setIsEditing();
            }
          } catch (error: any) {
            console.error('Upload error:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            Toast.show({
              type: 'error',
              text1: t('error'),
              text2: t('toast.failedProfileUpdate'),
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
