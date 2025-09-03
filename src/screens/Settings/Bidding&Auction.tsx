import React, {useState, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import SettingsItem from './components/settingsItem';
import InterLightAverage from '../../components/Text/InterLightAverage';
import {
  updateBiddingSettings,
  getBiddingSettings,
  BiddingSettings,
} from '../../api/bidding';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

const BiddingAuctionSetting = () => {
  // State for the three toggle switches
  const [autoBidConfig, setAutoBidConfig] = useState(true);
  const [defaultBidIncrement, setDefaultBidIncrement] = useState(true);
  const [bidConfirmationPrompts, setBidConfirmationPrompts] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [autoBidLoading, setAutoBidLoading] = useState(false);
  const [bidConfirmationLoading, setBidConfirmationLoading] = useState(false);

  const {t} = useTranslation();

  // Load initial settings
  useEffect(() => {
    loadBiddingSettings();
  }, []);

  const loadBiddingSettings = async () => {
    try {
      const response = await getBiddingSettings();
      if (response.data) {
        const settings = response.data;
        // Handle both direct data and nested data structures
        const data = settings.data || settings;

        setAutoBidConfig(data.auto_bid_default_enabled ?? false);
        setDefaultBidIncrement((data.default_increment_fixed ?? 0) > 0);
        setBidConfirmationPrompts(data.bid_confirmation_enabled ?? false);
      }
    } catch (error) {
      console.error('Failed to load bidding settings:', error);
      // Don't show error toast on initial load to avoid user confusion
    }
  };

  const updateSettings = async (newSettings: Partial<BiddingSettings>) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const currentSettings: BiddingSettings = {
        default_increment_fixed: 10.0, // Keep this fixed at 10.0
        auto_bid_default_enabled: autoBidConfig,
        bid_confirmation_enabled: bidConfirmationPrompts,
        ...newSettings,
      };

      const response = await updateBiddingSettings(currentSettings);

      // Check if the update was successful
      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: t('toast.biddingSettingsChanged'),
        });
      } else {
        throw new Error('No response data received');
      }
    } catch (error: any) {
      console.error('Failed to update bidding settings:', error);

      let errorMessage = 'Failed to update bidding settings. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid settings data. Please check your input.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });

      // Revert the change on error
      if (newSettings.auto_bid_default_enabled !== undefined) {
        setAutoBidConfig(!newSettings.auto_bid_default_enabled);
      }
      if (newSettings.bid_confirmation_enabled !== undefined) {
        setBidConfirmationPrompts(!newSettings.bid_confirmation_enabled);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoBidToggle = async () => {
    const newValue = !autoBidConfig;
    setAutoBidConfig(newValue);
    setAutoBidLoading(true);

    try {
      await updateSettings({auto_bid_default_enabled: newValue});
    } finally {
      setAutoBidLoading(false);
    }
  };

  const handleDefaultBidIncrementToggle = () => {
    // Simple toggle without API call
    const newValue = !defaultBidIncrement;
    setDefaultBidIncrement(newValue);
  };

  const handleBidConfirmationToggle = async () => {
    const newValue = !bidConfirmationPrompts;
    setBidConfirmationPrompts(newValue);
    setBidConfirmationLoading(true);

    try {
      await updateSettings({bid_confirmation_enabled: newValue});
    } finally {
      setBidConfirmationLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Bidding & Auction Settings Header */}
        <View style={styles.languageHeader}>
          <InterLightAverage style={styles.languageTitle}>
            {t('biddingAuction.title')}
          </InterLightAverage>
        </View>

        {/* Settings Container */}
        <View style={styles.settingsContainer}>
          {/* Auto-Bid Configuration */}
          <SettingsItem
            title={t('biddingAuction.autoBid')}
            value={autoBidConfig}
            onToggle={handleAutoBidToggle}
            loading={autoBidLoading}
          />

          {/* Default bid increment Setting */}
          <SettingsItem
            title={t('biddingAuction.defaultBidIncrement')}
            value={defaultBidIncrement}
            onToggle={handleDefaultBidIncrementToggle}
          />

          {/* Bid Confirmation prompts */}
          <SettingsItem
            title={t('biddingAuction.bidConfirmation')}
            value={bidConfirmationPrompts}
            onToggle={handleBidConfirmationToggle}
            loading={bidConfirmationLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default BiddingAuctionSetting;
