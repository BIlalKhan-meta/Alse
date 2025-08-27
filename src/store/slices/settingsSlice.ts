import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  getPrivacySettings,
  getNotificationSettings,
  getSellerSettings,
  updatePrivacySettings,
  updateNotificationSettings,
  updateSellerSettings,
} from '../../api/settings';

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
  biddingSettings: BiddingSettings; // always present
  universalSettings: UniversalSettings;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  security: null,
  notifications: null,
  seller: null,
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
  error: null,
};

// biddingSettings: {
//     autoBid: boolean;
//
//   };

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

    return {
      security: privacyRes.data,
      notifications: notifRes.data,
      seller: sellerRes.data,
    };
  },
);

export const savePrivacySettings = createAsyncThunk(
  'settings/savePrivacy',
  async ({formData, id}: {formData: FormData; id: number}) => {
    const res = await updatePrivacySettings(formData, id);
    return res.data;
  },
);

export const saveNotificationSettings = createAsyncThunk(
  'settings/saveNotifications',
  async ({formData, id}: {formData: FormData; id: number}) => {
    const res = await updateNotificationSettings(formData, id);
    return res.data;
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

    // Save updates
    builder.addCase(savePrivacySettings.fulfilled, (state, action) => {
      state.security = action.payload;
    });
    builder.addCase(saveNotificationSettings.fulfilled, (state, action) => {
      state.notifications = action.payload;
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
} = settingsSlice.actions;

export default settingsSlice.reducer;
