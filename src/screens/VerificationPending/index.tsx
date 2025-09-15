import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ChevronLeft} from 'lucide-react-native';
import {styles} from './styles';

interface RouteParams {
  riderData?: {
    name: string;
    email: string;
  };
}

const VerificationPending: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {riderData} = (route.params as RouteParams) || {};
  const [countdown, setCountdown] = useState(5);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleGoHome = () => {
    // Navigate to rider dashboard with rider data
    (navigation as any).navigate('RiderDashboard', {riderData});
  };

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Navigate to RiderDashboard when countdown reaches 0
          (navigation as any).navigate('RiderDashboard', {riderData});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Pending</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            For some Security reasons, We have sent some time to verify your
            docs. Normally it takes 5-6 business Days but Due to high volume it
            may takes up to 10 business days. Thank you for your Patience.
          </Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <View style={styles.userRow}>
            <Text style={styles.userLabel}>Also</Text>
            <Text style={styles.userValue}>
              {riderData?.name || '+1 567 567 567'}
            </Text>
          </View>
          <View style={styles.userRow}>
            <Text style={styles.userLabel}></Text>
            <Text style={styles.userValue}>
              {riderData?.email || 'Alex_Mac - Alex@companycom.com'}
            </Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Verification Pending</Text>
        </View>

        {/* Take me to the home button */}
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>
            We are taking you to riders dashboard ({countdown}s)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerificationPending;
