import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
} from 'react-native';
import {useSelector} from 'react-redux';
import {LocationEdit, PencilLine} from 'lucide-react-native';
import InterRegular from '../../components/Text/InterRegular';
import {selectUserProfile} from '../../store/slices/authSlice';
import {images} from '../../utils/images';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';
import InterLight from '../../components/Text/InterLight';
import InterBoldLabel from '../../components/Text/InterBoldLabel';

const Settings: React.FC = () => {
  const user = useSelector(selectUserProfile);

  // Settings states
  const [advanceProtection, setAdvanceProtection] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    general: true,
    messages: true,
    likes: false,
    comments: true,
    follows: true,
    posts: false,
  });

  // Profile form states
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || user?.full_name.split(' ')[0] || '',
    lastName: user?.last_name || user?.full_name.split(' ')[1] || '',
    userName: user?.username || user?.full_name,
    location: user?.location || '',
    description: user?.bio || '',
  });

  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    {code: 'en', name: 'English', flag: '🇺🇸'},
    {code: 'zh', name: '中文', flag: '🇨🇳'},
    {code: 'fr', name: 'Français', flag: '🇫🇷'},
    {code: 'hi', name: 'हिंदी', flag: '🇮🇳'},
    {code: 'pt', name: 'Português', flag: '🇵🇹'},
    {code: 'es', name: 'Español', flag: '🇪🇸'},
    {code: 'ko', name: '한국어', flag: '🇰🇷'},
    {code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳'},
  ];

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderSettingsItem = (
    title: string,
    value: boolean,
    onToggle: () => void,
    icon?: React.ReactNode,
  ) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        {icon && <View style={styles.settingsIcon}>{icon}</View>}
        <InterRegular style={styles.settingsItemText}>{title}</InterRegular>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{false: '#E5E7EB', true: colors.themeColor}}
        thumbColor={value ? '#ffffff' : '#ffffff'}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );

  const renderLanguageItem = (language: any) => (
    <TouchableOpacity
      key={language.code}
      style={[
        styles.languageItem,
        selectedLanguage === language.name && styles.languageItemSelected,
      ]}
      onPress={() => setSelectedLanguage(language.name)}>
      <View style={styles.languageLeft}>
        <InterRegular style={styles.languageFlag}>{language.flag}</InterRegular>
        <InterRegular
          style={[
            styles.languageText,
            selectedLanguage === language.name && styles.languageTextSelected,
          ]}>
          {language.name}
        </InterRegular>
      </View>
      {selectedLanguage === language.name && (
        <View style={styles.checkmark}>
          <InterRegular style={styles.checkmarkText}>✓</InterRegular>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <GlobalHeader icon />
      {/* <View style={styles.header}>
        <InterMedium style={styles.headerTitle}>Settings</InterMedium>
      </View> */}

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={user?.avatar ? {uri: user.avatar} : images.profile}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.profileInfo}>
          {/* make it a column for name and address */}
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <InterBoldLabel>{user?.full_name || 'User Name'}</InterBoldLabel>
              <InterLight>{user.username || '@username'}</InterLight>
            </View>
            <InterLight>{user?.location || 'New Jersey, NY'}</InterLight>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}>
            <PencilLine size={24} color={colors.themeColor} />
          </TouchableOpacity>
        </View>

        {isEditing && (
          <View style={styles.profileForm}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <InterRegular style={styles.inputLabel}>
                  First Name
                </InterRegular>
                <TextInput
                  style={styles.textInput}
                  value={profileData.firstName}
                  onChangeText={text => handleProfileUpdate('firstName', text)}
                  placeholder="First Name"
                />
              </View>
              <View style={styles.inputContainer}>
                <InterRegular style={styles.inputLabel}>Last Name</InterRegular>
                <TextInput
                  style={styles.textInput}
                  value={profileData.lastName}
                  onChangeText={text => handleProfileUpdate('lastName', text)}
                  placeholder="Last Name"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <InterRegular style={styles.inputLabel}>User Name</InterRegular>
              <TextInput
                style={styles.textInput}
                value={profileData.userName}
                onChangeText={text => handleProfileUpdate('userName', text)}
                placeholder="User Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <InterRegular style={styles.inputLabel}>Location</InterRegular>
              <View style={styles.textInputWithIcon}>
                <TextInput
                  style={[styles.textInput, styles.textInputWithIconInput]}
                  value={profileData.location}
                  onChangeText={text => handleProfileUpdate('location', text)}
                  placeholder="Location"
                />
                <TouchableOpacity style={styles.inputIcon}>
                  <LocationEdit />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <InterRegular style={styles.inputLabel}>Description</InterRegular>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={profileData.description}
                onChangeText={text => handleProfileUpdate('description', text)}
                placeholder="Enter description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}
      </View>

      {/* <InterMedium style={styles.sectionTitle}>Language</InterMedium>
        <View style={styles.languageContainer}>
          {languages.map(renderLanguageItem)}
        </View> */}

      {!isEditing && (
        <View style={styles.settingsSection}>
          {renderSettingsItem('Advanced protection', advanceProtection, () =>
            setAdvanceProtection(!advanceProtection),
          )}

          {Object.entries(notifications).map(([key, value]) =>
            renderSettingsItem(
              key.charAt(0).toUpperCase() + key.slice(1),
              value,
              () => handleNotificationToggle(key),
            ),
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default Settings;
