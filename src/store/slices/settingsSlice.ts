import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  getPrivacySettings,
  getNotificationSettings,
  getSellerSettings,
  updatePrivacySettings,
  updateNotificationSettings,
  updateNotificationToggle,
} from '../../api/settings';
import {editProfile} from '../../api/profile';
import {GetUserProfile} from './authSlice';

interface SecuritySettings {
  post_visibility: 'public' | 'followers' | 'private';
  allow_tags: boolean;
  comment_permissions: 'everyone' | 'followers' | 'private';
  story_visibility: 'everyone' | 'followers' | 'private';
  story_replies: 'everyone' | 'followers' | 'off';
  profile_visibility: 'public' | 'private';
  auto_filter_offensive: boolean;
  message_requests: 'everyone' | 'followers' | 'off';
}

interface NotificationTypes {
  social_likes: boolean;
  social_comments: boolean;
  social_follows: boolean;
  marketplace_orders: boolean;
  marketplace_payments: boolean;
  seller_new_orders: boolean;
  seller_reviews: boolean;
  security_alerts: boolean;
}

interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  types: NotificationTypes;
}

interface SellerSettings {
  auto_responder_enabled: boolean;
  cross_post_to_feed: boolean;
  allow_dm_inquiries: boolean;
  show_store_feedback: boolean;
  auto_accept_orders: boolean;
}

// Add Profile interface
interface ProfileData {
  firstName: string;
  lastName: string;
  userName: string;
  location: string;
  description: string;
  pronouns: string;
  storeName: string;
  storeDescription: string;
  avatar: string | null;
}

// local-only
interface BiddingSettings {
  autoBid: boolean;
  bidConfirmation: boolean;
  outbidAlerts: boolean;
  auctionsWon: number;
  watchlistUpdates: boolean;
}

interface UniversalSettings {
  language: 'en' | 'fr' | 'es'; // TODO add languages
  theme: 'system' | 'light' | 'dark';
}

interface SettingsState {
  security: SecuritySettings | null;
  notifications: NotificationSettings | null;
  seller: SellerSettings | null;
  profile: ProfileData | null; // Add profile to state
  biddingSettings: BiddingSettings; // always present
  universalSettings: UniversalSettings;
  loading: boolean;
  profileUpdateLoading: boolean; // Separate loading state for profile updates
  notificationToggleLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  security: null,
  notifications: null,
  seller: null,
  profile: null, // Initialize profile
  biddingSettings: {
    autoBid: false,
    bidConfirmation: false,
    outbidAlerts: false,
    auctionsWon: 0,
    watchlistUpdates: false,
  },
  universalSettings: {
    language: 'en',
    theme: 'system',
  },
  loading: false,
  profileUpdateLoading: false,
  notificationToggleLoading: false,
  error: null,
};

// -----------------------
// Thunks
// -----------------------
export const fetchAllSettings = createAsyncThunk(
  'settings/fetchAll',
  async () => {
    const [privacyRes, notifRes, sellerRes] = await Promise.all([
      getPrivacySettings(),
      getNotificationSettings(),
      getSellerSettings(),
    ]);

    console.log('Privacy Settings', privacyRes.data);

    return {
      security: privacyRes.data,
      notifications: notifRes.data?.data ?? notifRes.data,
      seller: sellerRes.data,
    };
  },
);

// New thunk for updating profile
export const updateUserProfile = createAsyncThunk(
  'settings/updateProfile',
  async (
    profileData: {
      formData: FormData;
      profileFields: ProfileData;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await editProfile(profileData.formData);
      console.log('this is response from edit profile', response);

      // Return both the API response and the local profile fields
      return {
        apiResponse: response.data,
        profileFields: profileData.profileFields,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Profile update failed');
    }
  },
);

export const savePrivacySettings = createAsyncThunk(
  'settings/savePrivacy',
  async (data: any) => {
    console.log('Making PUT API call with data:', data);
    const res = await updatePrivacySettings(data);
    console.log('API response:', res.data);
    return res.data.data;
  },
);

export const saveNotificationSettings = createAsyncThunk(
  'settings/saveNotifications',
  async ({formData, id}: {formData: FormData; id: number}) => {
    const res = await updateNotificationSettings(formData, id);
    return res.data;
  },
);

export const saveNotificationToggle = createAsyncThunk(
  'settings/saveNotificationToggle',
  async (
    {typeKey, value}: {typeKey: string; value: boolean},
    {rejectWithValue},
  ) => {
    try {
      const res = await updateNotificationToggle(typeKey as any, value);
      return {typeKey, value, data: res.data?.data ?? res.data};
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || error.message || 'Failed to update toggle',
      );
    }
  },
);

export const saveSellerSettings = createAsyncThunk(
  'settings/saveSeller',
  async ({formData, id}: {formData: FormData; id: number}) => {
    const res = await updateSellerSettings(formData, id);
    return res.data;
  },
);

// -----------------------
// Slice
// -----------------------
export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettings: () => initialState,
    updateSecurity: (state, action: PayloadAction<Partial<any>>) => {
      state.security = {...state.security, ...action.payload};
    },
    updateNotifications: (state, action: PayloadAction<Partial<any>>) => {
      state.notifications = {...state.notifications, ...action.payload};
    },
    updateSeller: (state, action: PayloadAction<Partial<any>>) => {
      state.seller = {...state.seller, ...action.payload};
    },
    updateBidding: (
      state,
      action: PayloadAction<Partial<typeof state.biddingSettings>>,
    ) => {
      state.biddingSettings = {...state.biddingSettings, ...action.payload};
    },
    // New reducer for updating profile data locally
    updateProfile: (state, action: PayloadAction<Partial<ProfileData>>) => {
      state.profile = {...state.profile, ...action.payload};
    },
    // Initialize profile from user data
    initializeProfile: (state, action: PayloadAction<any>) => {
      const user = action.payload;
      state.profile = {
        firstName: user?.first_name || user?.full_name?.split(' ')[0] || '',
        lastName: user?.last_name || user?.full_name?.split(' ')[1] || '',
        userName: user?.username || user?.full_name || '',
        location: user?.location_name || '',
        description: user?.bio || '',
        pronouns: user?.pronouns || '',
        storeName: user?.store_name || '',
        storeDescription: user?.store_description || '',
        avatar: user?.avatar || null,
      };
    },
  },
  extraReducers: builder => {
    // Fetch all
    builder.addCase(fetchAllSettings.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllSettings.fulfilled, (state, action) => {
      state.loading = false;
      state.security = action.payload.security;
      state.notifications = action.payload.notifications;
      state.seller = action.payload.seller;
    });
    builder.addCase(fetchAllSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch settings';
    });

    builder.addCase(GetUserProfile.fulfilled, (state, action) => {
      const apiData = action.payload?.data;
      const avatar =
        apiData?.avatar ??
        apiData?.profile_picture ??
        apiData?.profile_image ??
        apiData?.user?.avatar ??
        state.profile?.avatar;
      state.profile = {
        ...state.profile,
        ...apiData,
        avatar: avatar ?? state.profile?.avatar,
      };
    });
    // Profile update cases
    builder.addCase(updateUserProfile.pending, state => {
      state.profileUpdateLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.profileUpdateLoading = false;

      // Safely merge existing profile with API response + profileFields
      state.profile = {
        ...state.profile, // keep everything already there
        ...action.payload.profileFields, // local fields (like inputs)
        ...action.payload.apiResponse, // API-confirmed fields
        avatar: action.payload.apiResponse?.avatar ?? state.profile?.avatar, // keep old avatar if not returned
      };
    });
    //
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.profileUpdateLoading = false;
      state.error = action.payload as string;
    });

    // Save updates
    builder.addCase(savePrivacySettings.fulfilled, (state, action) => {
      state.security = action.payload;
    });
    builder.addCase(saveNotificationSettings.fulfilled, (state, action) => {
      state.notifications = action.payload;
    });
    builder.addCase(saveNotificationToggle.pending, state => {
      state.notificationToggleLoading = true;
    });
    builder.addCase(saveNotificationToggle.fulfilled, (state, action) => {
      state.notificationToggleLoading = false;
      const {typeKey, value} = action.payload || {};
      if (typeKey) {
        if (!state.notifications) {
          state.notifications = {
            push_enabled: true,
            email_enabled: true,
            types: {} as NotificationTypes,
          };
        }
        if (!state.notifications.types) {
          state.notifications.types = {} as NotificationTypes;
        }
        state.notifications.types[typeKey as keyof NotificationTypes] = value;
      }
    });
    builder.addCase(saveNotificationToggle.rejected, state => {
      state.notificationToggleLoading = false;
    });
    builder.addCase(saveSellerSettings.fulfilled, (state, action) => {
      state.seller = action.payload;
    });
  },
});

export const {
  resetSettings,
  updateSecurity,
  updateNotifications,
  updateSeller,
  updateBidding,
  updateProfile,
  initializeProfile,
} = settingsSlice.actions;

// Selectors
export const selectProfileData = (state: any) => state.settings.profile;
export const selectProfileUpdateLoading = (state: any) =>
  state.settings.profileUpdateLoading;
export const selectNotificationSettings = (state: any) =>
  state.settings.notifications;
export const selectNotificationToggleLoading = (state: any) =>
  state.settings.notificationToggleLoading;

export default settingsSlice.reducer;
