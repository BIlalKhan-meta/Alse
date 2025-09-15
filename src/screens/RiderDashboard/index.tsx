import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Switch,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute} from '@react-navigation/native';

import {Bell, Search, MessageSquare, MoreHorizontal} from 'lucide-react-native';
import Svg, {Polyline} from 'react-native-svg';
import {styles} from './styles';
import {images} from '../../utils/images';
import GlobalHeader from '../../components/GlobalHeader';

interface RouteParams {
  riderData?: {
    name: string;
    email: string;
    vehicleInfo: string;
    idLicense: string;
    contactNumber: string;
    userId: number;
  };
}

const RiderDashboard: React.FC = () => {
  const route = useRoute();
  const {riderData} = (route.params as RouteParams) || {};
  const [isOnline, setIsOnline] = useState(true);
  const [deliveries] = useState<any[]>([]); // Empty deliveries array by default

  // Chart data points for earnings visualization
  const chartPoints =
    '10,60 20,45 30,55 40,35 50,40 60,25 70,30 80,20 90,25 100,15 110,20 120,10';

  // Google Maps embed URL for route summary
  const mapIframeSrc = `
    <iframe 
      width="100%" 
      height="100%" 
      frameborder="0" 
      style="border:0"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.2799160891!2d-74.25987368715491!3d40.697670063840774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1639584563896!5m2!1sen!2s"
      allowfullscreen>
    </iframe>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        {/* <View style={styles.headerLeft}>
          <Image source={images.alseLogo} style={styles.title} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MessageSquare size={24} color="#333" />
          </TouchableOpacity>
        </View> */}

        <GlobalHeader icon={true} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Online Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusLeft}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>{riderData?.name || 'Rider'}</Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{false: '#ccc', true: '#0C959B'}}
            thumbColor={isOnline ? '#fff' : '#fff'}
          />
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <View>
              <Text style={styles.earningsAmount}>$400,000</Text>
              <Text style={styles.earningsLabel}>today</Text>
            </View>
            <View style={styles.earningsPercentage}>
              <Text style={styles.percentageText}>100%</Text>
            </View>
          </View>
          <View style={styles.earningsSubtitle}>
            <Text style={styles.earningsDescription}>
              You have delivered 30 {'\n'}deliveries in last 30days
            </Text>
            <Text style={styles.deliveryCount}>
              Daily Deliveries 5{'\n'}New Orders 20
            </Text>
          </View>
          {/* Earnings Chart */}
          <View style={styles.chartContainer}>
            <Svg height="80" width="100%" viewBox="0 0 140 80">
              <Polyline
                points={chartPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Chart grid lines */}
              <Polyline
                points="0,20 140,20"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
              <Polyline
                points="0,40 140,40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
              <Polyline
                points="0,60 140,60"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
            </Svg>
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>M</Text>
              <Text style={styles.chartLabel}>T</Text>
              <Text style={styles.chartLabel}>W</Text>
              <Text style={styles.chartLabel}>T</Text>
              <Text style={styles.chartLabel}>F</Text>
              <Text style={styles.chartLabel}>S</Text>
              <Text style={styles.chartLabel}>S</Text>
            </View>
          </View>
        </View>

        {/* Route Summary */}
        <View style={styles.routeSection}>
          <Text style={styles.sectionTitle}>Route Summary</Text>
          <View style={styles.mapContainer}>
            <WebView
              source={{html: mapIframeSrc}}
              style={styles.mapWebView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
            />
            <View style={styles.mapOverlay}>
              <View style={styles.mapDots}>
                <View style={styles.mapDot} />
                <View style={styles.mapDot} />
              </View>
            </View>
          </View>
        </View>

        {/* Pending Deliveries */}
        <View style={styles.deliveriesSection}>
          <Text style={styles.sectionTitle}>Pending Deliveries</Text>
          {deliveries.length > 0 ? (
            deliveries.map(delivery => (
              <View key={delivery.id} style={styles.deliveryItem}>
                <View style={styles.deliveryLeft}>
                  <Image source={delivery.image} style={styles.productImage} />
                  <View style={styles.deliveryInfo}>
                    <Text style={styles.productName}>{delivery.product}</Text>
                    <Text style={styles.orderNumber}>
                      {delivery.orderNumber}
                    </Text>
                  </View>
                </View>
                <View style={styles.deliveryCenter}>
                  <Text style={styles.quantityText}>{delivery.quantity}</Text>
                </View>
                <View style={styles.deliveryRight}>
                  <Text style={styles.categoryText}>{delivery.category}</Text>
                  <TouchableOpacity style={styles.moreButton}>
                    <MoreHorizontal size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No deliveries available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RiderDashboard;
