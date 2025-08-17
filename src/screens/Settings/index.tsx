import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {
  LocationEdit,
  PencilLine,
  Shield,
  Bell,
  Globe,
  User,
  MessageSquare,
  Gavel,
  ShoppingCart,
  Lock,
  Store,
  CreditCard,
  Package,
  Users,
  Settings as SettingsIcon,
  Moon,
  Sun,
  HelpCircle,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import InterRegular from '../../components/Text/InterRegular';
import InterLight from '../../components/Text/InterLight';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import InterMedium from '../../components/Text/InterMedium';
import {selectUserProfile} from '../../store/slices/authSlice';
import {images} from '../../utils/images';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';

const Settings = () => {
  const user = useSelector(selectUserProfile);
  const userRole = user?.role || 'buyer';

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || user?.full_name?.split(' ')[0] || '',
    lastName: user?.last_name || user?.full_name?.split(' ')[1] || '',
    userName: user?.username || user?.full_name || '',
    location: user?.location || '',
    description: user?.bio || '',
    pronouns: user?.pronouns || '',
    storeName: user?.store_name || '',
    storeDescription: user?.store_description || '',
  });

  // Settings states - organized by category
  const [securitySettings, setSecuritySettings] = useState({
    advanceProtection: true,
    twoFactorAuth: user?.two_factor_enabled || false,
  });

  const [socialSettings, setSocialSettings] = useState({
    postVisibility: user?.post_visibility || 'public', // 'public', 'followers', 'private'
    allowTags: user?.allow_tags ?? true,
    autoFilterOffensive: user?.auto_filter_offensive ?? true,
    commentPermissions: user?.comment_permissions || 'everyone', // 'everyone', 'followers', 'none'
    storyViewers: user?.story_viewers || 'everyone',
    storyReplies: user?.story_replies || 'everyone',
  });

  const [biddingSettings, setBiddingSettings] = useState({
    autoBid: user?.auto_bid_enabled || false,
    bidConfirmation: user?.bid_confirmation ?? true,
    outbidAlerts: user?.outbid_alerts ?? true,
    auctionsWon: user?.auctions_won_alerts ?? true,
    watchlistUpdates: user?.watchlist_alerts ?? true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    general: user?.general_notifications ?? true,
    messages: user?.message_notifications ?? true,
    likes: user?.like_notifications ?? false,
    comments: user?.comment_notifications ?? true,
    follows: user?.follow_notifications ?? true,
    posts: user?.post_notifications ?? false,
    newBids: user?.new_bid_notifications ?? true,
    auctionEnding: user?.auction_ending_notifications ?? true,
  });

  // Seller-specific settings
  const [sellerSettings, setSellerSettings] = useState({
    crossPostProducts: user?.cross_post_products ?? true,
    allowDMInquiries: user?.allow_dm_inquiries ?? true,
    enableBundles: user?.enable_bundles ?? false,
    autoResponder: user?.auto_responder_enabled ?? false,
    profileVisibility: user?.seller_profile_visibility || 'public',
  });

  const [universalSettings, setUniversalSettings] = useState({
    language: user?.language || 'English',
    theme: user?.theme || 'system', // 'light', 'dark', 'system'
    pushNotifications: user?.push_notifications ?? true,
    emailNotifications: user?.email_notifications ?? true,
  });

  // Generic handler for settings updates
  const handleSettingUpdate = async (
    category: string,
    key: any,
    value: any,
    onChange?: () => void,
  ) => {
    try {
      // Call the onChange prop if provided (for API calls)
      if (onChange) {
        await onChange(key, value);
      }

      // Update local state based on category
      switch (category) {
        case 'security':
          setSecuritySettings(prev => ({...prev, [key]: value}));
          break;
        case 'social':
          setSocialSettings(prev => ({...prev, [key]: value}));
          break;
        case 'bidding':
          setBiddingSettings(prev => ({...prev, [key]: value}));
          break;
        case 'notifications':
          setNotificationSettings(prev => ({...prev, [key]: value}));
          break;
        case 'seller':
          setSellerSettings(prev => ({...prev, [key]: value}));
          break;
        case 'universal':
          setUniversalSettings(prev => ({...prev, [key]: value}));
          break;
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reusable Settings Item Component
  const SettingsItem = ({
    title,
    subtitle,
    icon: IconComponent,
    value,
    onToggle,
    type = 'switch', // 'switch', 'select', 'navigation'
    options = [],
    onPress,
    showChevron = false,
  }) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        {IconComponent && (
          <View style={styles.settingsIcon}>
            <IconComponent size={20} color={colors.inputText} />
          </View>
        )}
        <View style={styles.settingsTextContainer}>
          <InterRegular style={styles.settingsItemText}>{title}</InterRegular>
          {subtitle && (
            <InterLight style={styles.settingsItemSubtitle}>
              {subtitle}
            </InterLight>
          )}
        </View>
      </View>

      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{false: '#E5E7EB', true: colors.themeColor}}
          thumbColor={value ? '#ffffff' : '#ffffff'}
          ios_backgroundColor="#E5E7EB"
        />
      )}

      {type === 'select' && (
        <TouchableOpacity onPress={onPress} style={styles.selectButton}>
          <InterRegular style={styles.selectButtonText}>
            {options.find(opt => opt.value === value)?.label || value}
          </InterRegular>
          <ChevronRight size={16} color={colors.inputText} />
        </TouchableOpacity>
      )}

      {(type === 'navigation' || showChevron) && (
        <TouchableOpacity onPress={onPress}>
          <ChevronRight size={20} color={colors.inputText} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Section Header Component
  const SectionHeader = ({title, icon: IconComponent}) => (
    <View style={styles.sectionHeader}>
      {IconComponent && <IconComponent size={20} color={colors.themeColor} />}
      <InterMedium style={styles.sectionTitle}>{title}</InterMedium>
    </View>
  );

  // Profile Form Component
  const ProfileForm = () => (
    <View style={styles.profileForm}>
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <InterRegular style={styles.inputLabel}>First Name</InterRegular>
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
        <InterRegular style={styles.inputLabel}>Pronouns</InterRegular>
        <TextInput
          style={styles.textInput}
          value={profileData.pronouns}
          onChangeText={text => handleProfileUpdate('pronouns', text)}
          placeholder="e.g., they/them, she/her, he/him"
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
            <LocationEdit size={20} color={colors.inputText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <InterRegular style={styles.inputLabel}>Bio</InterRegular>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profileData.description}
          onChangeText={text => handleProfileUpdate('description', text)}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {userRole === 'seller' && (
        <>
          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>Store Name</InterRegular>
            <TextInput
              style={styles.textInput}
              value={profileData.storeName}
              onChangeText={text => handleProfileUpdate('storeName', text)}
              placeholder="Your store name"
            />
          </View>

          <View style={styles.inputContainer}>
            <InterRegular style={styles.inputLabel}>
              Store Description
            </InterRegular>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={profileData.storeDescription}
              onChangeText={text =>
                handleProfileUpdate('storeDescription', text)
              }
              placeholder="Describe your store"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GlobalHeader icon />

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
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <InterBoldLabel>{user?.full_name || 'User Name'}</InterBoldLabel>
              <InterLight>{user?.username || '@username'}</InterLight>
            </View>
            <InterLight>{user?.location || 'New Jersey, NY'}</InterLight>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}>
            <PencilLine size={24} color={colors.themeColor} />
          </TouchableOpacity>
        </View>

        {isEditing && <ProfileForm />}
      </View>

      {!isEditing && (
        <>
          {/* Security & Privacy Settings */}
          <SectionHeader title="Security & Privacy" icon={Shield} />
          <View style={styles.settingsSection}>
            <SettingsItem
              title="Two-Factor Authentication"
              subtitle="Add an extra layer of security"
              icon={Lock}
              value={securitySettings.twoFactorAuth}
              onToggle={value =>
                handleSettingUpdate('security', 'twoFactorAuth', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Change Password"
              icon={Lock}
              type="navigation"
              onPress={() => {
                /* Navigate to change password */
              }}
              subtitle={undefined}
              value={undefined}
              onToggle={undefined}
            />
            <SettingsItem
              title="Login Activity"
              subtitle="View recent login activity"
              icon={Eye}
              type="navigation"
              onPress={() => {
                /* Navigate to login activity */
              }}
              value={undefined}
              onToggle={undefined}
            />
          </View>

          {/* Social Activity Settings */}
          <SectionHeader title="Social Activity" icon={Users} />
          <View style={styles.settingsSection}>
            <SettingsItem
              title="Post Visibility"
              subtitle="Who can see your posts"
              icon={Eye}
              type="select"
              value={socialSettings.postVisibility}
              options={[
                {label: 'Public', value: 'public'},
                {label: 'Followers Only', value: 'followers'},
                {label: 'Private', value: 'private'},
              ]}
              onPress={() => {
                /* Show visibility options */
              }}
            />
            <SettingsItem
              title="Allow Tags"
              subtitle="Let others tag you in posts"
              icon={User}
              value={socialSettings.allowTags}
              onToggle={value =>
                handleSettingUpdate('social', 'allowTags', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Auto-filter Offensive Content"
              subtitle="Automatically hide offensive comments"
              icon={MessageSquare}
              value={socialSettings.autoFilterOffensive}
              onToggle={value =>
                handleSettingUpdate('social', 'autoFilterOffensive', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Comment Permissions"
              subtitle="Who can comment on your posts"
              icon={MessageSquare}
              type="select"
              value={socialSettings.commentPermissions}
              options={[
                {label: 'Everyone', value: 'everyone'},
                {label: 'Followers', value: 'followers'},
                {label: 'No One', value: 'none'},
              ]}
              onPress={() => {
                /* Show comment permissions */
              }}
            />
            <SettingsItem
              title="Blocked Users"
              subtitle="Manage your blocked users list"
              icon={EyeOff}
              type="navigation"
              onPress={() => {
                /* Navigate to blocked users */
              }}
              value={undefined}
              onToggle={undefined}
            />
          </View>

          {/* Bidding & Auction Settings */}
          <SectionHeader title="Bidding & Auctions" icon={Gavel} />
          <View style={styles.settingsSection}>
            <SettingsItem
              title="Auto-bid"
              subtitle="Automatically bid up to your maximum"
              icon={Gavel}
              value={biddingSettings.autoBid}
              onToggle={value =>
                handleSettingUpdate('bidding', 'autoBid', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Bid Confirmation"
              subtitle="Confirm before placing bids"
              icon={Shield}
              value={biddingSettings.bidConfirmation}
              onToggle={value =>
                handleSettingUpdate('bidding', 'bidConfirmation', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Outbid Alerts"
              subtitle="Get notified when you're outbid"
              icon={Bell}
              value={biddingSettings.outbidAlerts}
              onToggle={value =>
                handleSettingUpdate('bidding', 'outbidAlerts', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Auction Won Alerts"
              subtitle="Get notified when you win auctions"
              icon={Bell}
              value={biddingSettings.auctionsWon}
              onToggle={value =>
                handleSettingUpdate('bidding', 'auctionsWon', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Watchlist Updates"
              subtitle="Get updates on watched items"
              icon={Bell}
              value={biddingSettings.watchlistUpdates}
              onToggle={value =>
                handleSettingUpdate('bidding', 'watchlistUpdates', value)
              }
              onPress={undefined}
            />
          </View>

          {/* Marketplace Settings */}
          <SectionHeader title="Marketplace" icon={ShoppingCart} />
          <View style={styles.settingsSection}>
            <SettingsItem
              title="Purchase History"
              subtitle="View your purchase history"
              icon={ShoppingCart}
              type="navigation"
              onPress={() => {
                /* Navigate to purchase history */
              }}
              value={undefined}
              onToggle={undefined}
            />
            <SettingsItem
              title="Watchlist"
              subtitle="Manage your saved auctions"
              icon={Eye}
              type="navigation"
              onPress={() => {
                /* Navigate to watchlist */
              }}
              value={undefined}
              onToggle={undefined}
            />
            <SettingsItem
              title="Shipping Addresses"
              subtitle="Manage delivery addresses"
              icon={Package}
              type="navigation"
              onPress={() => {
                /* Navigate to shipping addresses */
              }}
              value={undefined}
              onToggle={undefined}
            />
            <SettingsItem
              title="Payment Methods"
              subtitle="Manage your payment methods"
              icon={CreditCard}
              type="navigation"
              onPress={() => {
                /* Navigate to payment methods */
              }}
              value={undefined}
              onToggle={undefined}
            />
          </View>

          {/* Seller Settings - Only shown if user is seller */}
          {userRole === 'seller' && (
            <>
              <SectionHeader title="Seller Settings" icon={Store} />
              <View style={styles.settingsSection}>
                <SettingsItem
                  title="Cross-post Products"
                  subtitle="Share listings to your personal feed"
                  icon={Globe}
                  value={sellerSettings.crossPostProducts}
                  onToggle={value =>
                    handleSettingUpdate('seller', 'crossPostProducts', value)
                  }
                  onPress={undefined}
                />
                <SettingsItem
                  title="Allow DM Inquiries"
                  subtitle="Let buyers message you directly"
                  icon={MessageSquare}
                  value={sellerSettings.allowDMInquiries}
                  onToggle={value =>
                    handleSettingUpdate('seller', 'allowDMInquiries', value)
                  }
                  onPress={undefined}
                />
                <SettingsItem
                  title="Enable Bundle Listings"
                  subtitle="Allow multiple items in one listing"
                  icon={Package}
                  value={sellerSettings.enableBundles}
                  onToggle={value =>
                    handleSettingUpdate('seller', 'enableBundles', value)
                  }
                  onPress={undefined}
                />
                <SettingsItem
                  title="Auto-responder"
                  subtitle="Automatically respond to messages"
                  icon={MessageSquare}
                  value={sellerSettings.autoResponder}
                  onToggle={value =>
                    handleSettingUpdate('seller', 'autoResponder', value)
                  }
                  onPress={undefined}
                />
                <SettingsItem
                  title="Sales Reports"
                  subtitle="Download your sales data"
                  icon={Package}
                  type="navigation"
                  onPress={() => {
                    /* Navigate to sales reports */
                  }}
                  value={undefined}
                  onToggle={undefined}
                />
                <SettingsItem
                  title="Payout Settings"
                  subtitle="Manage your payout methods"
                  icon={CreditCard}
                  type="navigation"
                  onPress={() => {
                    /* Navigate to payout settings */
                  }}
                  value={undefined}
                  onToggle={undefined}
                />
              </View>
            </>
          )}

          {/* Notifications */}
          <SectionHeader title="Notifications" icon={Bell} />
          <View style={styles.settingsSection}>
            <SettingsItem
              title="Push Notifications"
              subtitle="Receive notifications on your device"
              icon={Bell}
              value={universalSettings.pushNotifications}
              onToggle={value =>
                handleSettingUpdate('universal', 'pushNotifications', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Email Notifications"
              subtitle="Receive notifications via email"
              icon={Bell}
              value={universalSettings.emailNotifications}
              onToggle={value =>
                handleSettingUpdate('universal', 'emailNotifications', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Likes & Comments"
              subtitle="Activity on your posts"
              icon={Bell}
              value={notificationSettings.likes}
              onToggle={value =>
                handleSettingUpdate('notifications', 'likes', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="New Followers"
              subtitle="When someone follows you"
              icon={Users}
              value={notificationSettings.follows}
              onToggle={value =>
                handleSettingUpdate('notifications', 'follows', value)
              }
              onPress={undefined}
            />
            <SettingsItem
              title="Messages"
              subtitle="New direct messages"
              icon={MessageSquare}
              value={notificationSettings.messages}
              onToggle={value =>
                handleSettingUpdate('notifications', 'messages', value)
              }
              onPress={undefined}
            />
            {userRole === 'seller' && (
              <>
                <SettingsItem
                  title="New Bids"
                  subtitle="When someone bids on your items"
                  icon={Gavel}
                  value={notificationSettings.newBids}
                  onToggle={value =>
                    handleSettingUpdate('notifications', 'newBids', value)
                  }
                  onPress={undefined}
                />
                <SettingsItem
                  title="Auction Ending Soon"
                  subtitle="When your auctions are about to end"
                  icon={Bell}
                  value={notificationSettings.auctionEnding}
                  onToggle={value =>
                    handleSettingUpdate('notifications', 'auctionEnding', value)
                  }
                  onPress={undefined}
                />
              </>
            )}
          </View>

          {/* Universal Settings */}
          <SectionHeader title="General" icon={SettingsIcon} />
          <View style={styles.settingsSection}>
            <SettingsItem
              title="Language"
              subtitle="App display language"
              icon={Globe}
              type="select"
              value={universalSettings.language}
              options={[
                {label: 'English', value: 'English'},
                {label: 'Spanish', value: 'Spanish'},
                {label: 'French', value: 'French'},
              ]}
              onPress={() => {
                /* Show language options */
              }}
            />
            <SettingsItem
              title="Theme"
              subtitle="App appearance"
              icon={universalSettings.theme === 'dark' ? Moon : Sun}
              type="select"
              value={universalSettings.theme}
              options={[
                {label: 'Light', value: 'light'},
                {label: 'Dark', value: 'dark'},
                {label: 'System', value: 'system'},
              ]}
              onPress={() => {
                /* Show theme options */
              }}
            />
            <SettingsItem
              title="Help Center"
              subtitle="Get help and support"
              icon={HelpCircle}
              type="navigation"
              onPress={() => {
                /* Navigate to help center */
              }}
              value={undefined}
              onToggle={undefined}
            />
            <SettingsItem
              title="Contact Support"
              subtitle="Get in touch with our team"
              icon={MessageSquare}
              type="navigation"
              onPress={() => {
                /* Navigate to contact support */
              }}
              value={undefined}
              onToggle={undefined}
            />
            <SettingsItem
              title="Delete Account"
              subtitle="Permanently delete your account"
              icon={User}
              type="navigation"
              onPress={() => {
                /* Show delete account confirmation */
              }}
              value={undefined}
              onToggle={undefined}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default Settings;
