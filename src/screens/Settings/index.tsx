import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
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
  CreditCard,
  Package,
  Users,
  Settings as SettingsIcon,
  Moon,
  Sun,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import InterRegular from '../../components/Text/InterRegular';
import InterLight from '../../components/Text/InterLight';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import {selectUserProfile} from '../../store/slices/authSlice';
import {images} from '../../utils/images';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import {colors} from '../../utils/theme';
import SettingsItem from './components/settingsItem';
import {useAppDispatch, useAppSelector} from '../../hooks/storeHooks';
import {
  fetchAllSettings,
  saveNotificationSettings,
  updateBidding,
  updateNotifications,
  updateSecurity,
  updateSeller,
} from '../../store/slices/settingsSlice';

const Settings = () => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUserProfile);
  const userRole = user?.role || 'buyer';

  const {
    security,
    notifications,
    seller,
    biddingSettings,
    universalSettings,
    loading,
  } = useAppSelector(state => state.settings);

  useEffect(() => {
    if (!security || !notifications || !seller) {
      dispatch(fetchAllSettings());
    }
  }, [dispatch, security, notifications, seller]);

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

  // Generic handler for settings updates
  const handleSettingUpdate = async (
    category: string,
    key: string,
    value: any,
    onChange?: (key: string, value: any) => Promise<void>,
  ) => {
    try {
      // Call API update if provided
      if (onChange) {
        await onChange(key, value);
      }

      // Dispatch to redux store instead of local useState
      switch (category) {
        case 'security':
          dispatch(updateSecurity({[key]: value}));
          break;
        case 'notifications':
          dispatch(updateNotifications({[key]: value}));
          break;
        case 'seller':
          dispatch(updateSeller({[key]: value}));
          break;
        //  case 'social':
        //   dispatch(updateSocial({[key]: value}));
        //   break;
        // case 'bidding':
        //   dispatch(updateBidding({[key]: value}));
        //   break;
        // case 'universal':
        //   dispatch(updateUniversal({[key]: value}));
        //   break;
        default:
          console.warn(`Unknown settings category: ${category}`);
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
          {/* Lets first organize the settings */}

          {/* Social Activity Settings */}
          <SettingsItem
            title="Post Visibility"
            subtitle="Who can see your posts"
            icon={Eye}
            type="select"
            value={security.postVisibility}
            options={[
              {label: 'Public', value: 'public'},
              {label: 'Followers Only', value: 'followers'},
              {label: 'Private', value: 'private'},
            ]}
            onValueChange={() => {}}
          />
          <SettingsItem
            title="Allow Tags"
            subtitle="Let others tag you in posts"
            icon={User}
            value={security.allowTags}
            onToggle={value =>
              handleSettingUpdate('social', 'allowTags', value)
            }
            onPress={undefined}
          />
          <SettingsItem
            title="Auto-filter Offensive Content"
            subtitle="Automatically hide offensive comments"
            icon={MessageSquare}
            value={security.autoFilterOffensive}
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
            value={security.commentPermissions}
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

          <SettingsItem
            title="Change Password"
            icon={Lock}
            type="navigation"
            onPress={() => {
              /* Navigate to change password */
            }}
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

          {/* Bidding & Auction Settings */}
          <SettingsItem
            title="Auto-bid"
            subtitle="Automatically bid up to your maximum"
            icon={Gavel}
            value={biddingSettings.autoBid}
            onToggle={val => {
              // Only updates locally, no backend call
              dispatch(updateBidding({autoBid: val}));
            }}
            // onToggle={value => handleSettingUpdate('bidding', 'autoBid', value)}
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

          {/* Marketplace Settings */}
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

          {/* Seller Settings - Only shown if user is seller */}
          {userRole === 'seller' && (
            <>
              <SettingsItem
                title="Cross-post Products"
                subtitle="Share listings to your personal feed"
                icon={Globe}
                value={seller.crossPostProducts}
                onToggle={value =>
                  handleSettingUpdate('seller', 'crossPostProducts', value)
                }
                onPress={undefined}
              />
              <SettingsItem
                title="Allow DM Inquiries"
                subtitle="Let buyers message you directly"
                icon={MessageSquare}
                value={seller.allowDMInquiries}
                onToggle={value =>
                  handleSettingUpdate('seller', 'allowDMInquiries', value)
                }
                onPress={undefined}
              />
              <SettingsItem
                title="Enable Bundle Listings"
                subtitle="Allow multiple items in one listing"
                icon={Package}
                value={seller.enableBundles}
                onToggle={value =>
                  handleSettingUpdate('seller', 'enableBundles', value)
                }
                onPress={undefined}
              />
              <SettingsItem
                title="Auto-responder"
                subtitle="Automatically respond to messages"
                icon={MessageSquare}
                value={seller.autoResponder}
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
            </>
          )}

          {/* Notifications */}
          <SettingsItem
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            icon={Bell}
            value={notifications.push_enabled}
            onToggle={val => {
              dispatch(updateNotifications({receiveNotifications: val}));
              const formData = new FormData();
              formData.append('push_enabled', String(val));
              dispatch(saveNotificationSettings({formData, id: user?.id}));
            }}
            // onToggle={value =>
            //   // handleSettingUpdate('universal', 'pushNotifications', value)
            // }
            onPress={undefined}
          />
          <SettingsItem
            title="Email Notifications"
            subtitle="Receive notifications via email"
            icon={Bell}
            value={notifications.email_enabled}
            onToggle={val => {
              dispatch(updateNotifications({receiveNotifications: val}));
              const formData = new FormData();
              formData.append('email_enabled', String(val));
              dispatch(saveNotificationSettings({formData, id: user?.id}));
            }}
            onPress={undefined}
          />
          <SettingsItem
            title="Likes & Comments"
            subtitle="Activity on your posts"
            icon={Bell}
            value={notifications.types.social_likes}
            onToggle={val => {
              dispatch(updateNotifications({receiveNotifications: val}));
              const formData = new FormData();
              formData.append('email_enabled', String(val));
              dispatch(saveNotificationSettings({formData, id: user?.id}));
            }}
            onPress={undefined}
          />
          <SettingsItem
            title="New Followers"
            subtitle="When someone follows you"
            icon={Users}
            value={notifications.types.social_follows}
            onToggle={val => {
              dispatch(
                updateNotifications({
                  types: {
                    ...notifications.types,
                    social_follows: val,
                  },
                }),
              );
              const formData = new FormData();
              formData.append(
                'types',
                JSON.stringify({
                  ...notifications?.types,
                  social_comments: val,
                }),
              );
              dispatch(saveNotificationSettings({formData, id: user?.id}));
            }}
            onPress={undefined}
          />
          {userRole === 'seller' && (
            <>
              <SettingsItem
                title="Auto Responder"
                subtitle="Auto respond to messages"
                icon={Gavel}
                value={seller.auto_responder_enabled}
                onValueChange={val => {
                  dispatch(updateSeller({auto_responder_enabled: val}));
                }}
                onPress={undefined}
              />
              <SettingsItem
                title="Cross Post to Feed"
                subtitle="Share listings to your personal feed"
                icon={Bell}
                value={seller.cross_post_to_feed}
                onValueChange={val => {
                  dispatch(updateSeller({cross_post_to_feed: val}));
                }}
                onPress={undefined}
              />
              <SettingsItem
                title="Allow DM Inquiries"
                subtitle="Let buyers message you directly"
                icon={Bell}
                value={seller.allow_dm_inquiries}
                onValueChange={val => {
                  dispatch(updateSeller({allow_dm_inquiries: val}));
                }}
                onPress={undefined}
              />
              <SettingsItem
                title="Show store feedback"
                subtitle="Show store feedback from buyers"
                icon={Bell}
                value={seller.show_store_feedback}
                onValueChange={val => {
                  dispatch(updateSeller({show_store_feedback: val}));
                }}
                onPress={undefined}
              />
              <SettingsItem
                title="Auto accept orders"
                subtitle="Automatically accept orders"
                icon={Bell}
                value={seller.auto_accept_orders}
                onValueChange={val => {
                  dispatch(updateSeller({auto_accept_orders: val}));
                }}
                onPress={undefined}
              />
            </>
          )}

          {/* Universal Settings */}
          {/* TODO for language, we need to shift the UI into language selection view */}
          <SettingsItem
            title="Language"
            subtitle="App display language"
            icon={Globe}
            type="select"
            value={universalSettings.language}
            options={[
              {label: 'English', value: 'english'},
              {label: 'Spanish', value: 'spanish'},
              {label: 'French', value: 'french'},
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
          {/* TODO need a screen for help centre */}
          <SettingsItem
            title="Help Center"
            subtitle="Get help and support"
            icon={HelpCircle}
            type="navigation"
            onPress={() => {
              /* Navigate to help center */
            }}
          />
          <SettingsItem
            title="Contact Support"
            subtitle="Get in touch with our team"
            icon={MessageSquare}
            type="navigation"
            onPress={() => {
              /* Navigate to contact support */
            }}
          />
          <SettingsItem
            title="Delete Account"
            subtitle="Permanently delete your account"
            icon={User}
            type="navigation"
            onPress={() => {
              /* Show delete account confirmation */
            }}
          />
        </>
      )}
    </ScrollView>
  );
};

export default Settings;
