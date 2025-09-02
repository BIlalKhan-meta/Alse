import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import styles from '../styles';
import {colors} from '../../../utils/theme';
import InterRegular from '../../../components/Text/InterRegular';
import {useAppTranslation} from '../../../i18n/hooks/useAppTranslation';
import {LocationEdit} from 'lucide-react-native';

interface ProfileFormProps {
  profileData: {
    firstName: string;
    lastName: string;
    userName: string;
    location: string;
    description: string;
    pronouns: string;
    storeName: string;
    storeDescription: string;
    avatar: string | null;
  };
  handleProfileUpdate: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profileData,
  handleProfileUpdate,
  onSave,
  onCancel,
  loading,
}) => {
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
        onPress={onSave}
        disabled={loading}>
        {loading ? (
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
