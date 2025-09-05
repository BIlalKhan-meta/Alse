import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

interface GoogleMapsLinkProps {
  buyerLocation: Location;
  sellerLocation: Location;
  height?: number;
}

const GoogleMapsLink: React.FC<GoogleMapsLinkProps> = ({
  buyerLocation,
  sellerLocation,
  height = 200,
}) => {
  // Calculate distance between points
  const calculateDistance = () => {
    const R = 6371; // Earth's radius in km
    const dLat =
      ((sellerLocation.latitude - buyerLocation.latitude) * Math.PI) / 180;
    const dLon =
      ((sellerLocation.longitude - buyerLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((buyerLocation.latitude * Math.PI) / 180) *
        Math.cos((sellerLocation.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance();

  const {t} = useTranslation();

  // Create Google Maps URL with both locations
  const createGoogleMapsUrl = () => {
    const buyerCoords = `${buyerLocation.latitude},${buyerLocation.longitude}`;
    const sellerCoords = `${sellerLocation.latitude},${sellerLocation.longitude}`;

    // Create a route between the two points with both locations pinned
    const url = `https://www.google.com/maps/dir/${sellerCoords}/${buyerCoords}`;
    return url;
  };

  const openGoogleMaps = async () => {
    const url = createGoogleMapsUrl();
    console.log('Opening Google Maps URL:', url);

    try {
      // Try to open with Google Maps app first
      const mapsAppUrl = `comgooglemaps://?saddr=${sellerLocation.latitude},${sellerLocation.longitude}&daddr=${buyerLocation.latitude},${buyerLocation.longitude}&directionsmode=driving`;

      const canOpenMapsApp = await Linking.canOpenURL(mapsAppUrl);
      if (canOpenMapsApp) {
        await Linking.openURL(mapsAppUrl);
        return;
      }

      // Fallback to web URL
      const canOpenWeb = await Linking.canOpenURL(url);
      if (canOpenWeb) {
        await Linking.openURL(url);
      } else {
        console.log("Can't open Google Maps URL");
        // Try alternative URL format
        const sellerCoords = `${sellerLocation.latitude},${sellerLocation.longitude}`;
        const buyerCoords = `${buyerLocation.latitude},${buyerLocation.longitude}`;
        const altUrl = `https://maps.google.com/maps?f=d&saddr=${sellerCoords}&daddr=${buyerCoords}`;
        await Linking.openURL(altUrl);
      }
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      // Final fallback - try to open in browser
      try {
        await Linking.openURL(url);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  return (
    <View style={[styles.container, {height}]}>
      <View style={styles.mapCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🗺️ {t('orderTracking.tracking')}</Text>
          <Text style={styles.subtitle}>{t('orderTracking.openLocation')}</Text>
        </View>

        {/* Location Cards */}
        <View style={styles.locationContainer}>
          {/* Seller Location */}
          {/* <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationEmoji}>🏪</Text>
              <Text style={styles.locationTitle}>Seller Location</Text>
            </View>
            <Text style={styles.locationAddress}>
              {sellerLocation.description}
            </Text>
            <Text style={styles.coordinates}>
              {sellerLocation.latitude.toFixed(4)},{' '}
              {sellerLocation.longitude.toFixed(4)}
            </Text>
          </View> */}

          {/* Route Arrow */}
          {/* <View style={styles.routeArrow}>
            <Text style={styles.arrowText}>↓</Text>
            <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
          </View> */}

          {/* Buyer Location */}
          {/* <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationEmoji}>🏠</Text>
              <Text style={styles.locationTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.locationAddress}>
              {buyerLocation.description}
            </Text>
            <Text style={styles.coordinates}>
              {buyerLocation.latitude.toFixed(4)},{' '}
              {buyerLocation.longitude.toFixed(4)}
            </Text>
          </View> */}
        </View>

        {/* Open Maps Button */}
        <TouchableOpacity
          style={styles.openMapsButton}
          onPress={openGoogleMaps}>
          <Text style={styles.openMapsButtonText}>
            🗺️ {t('orderTracking.openMaps')}
          </Text>
          <Text style={styles.openMapsSubtext}>
            {t('orderTracking.viewRoute')}
          </Text>
        </TouchableOpacity>

        {/* Debug info - remove this later */}
        <Text style={styles.debugText}>
          Debug: {sellerLocation.latitude.toFixed(4)},{' '}
          {sellerLocation.longitude.toFixed(4)} →{' '}
          {buyerLocation.latitude.toFixed(4)},{' '}
          {buyerLocation.longitude.toFixed(4)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  mapCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  routeArrow: {
    alignItems: 'center',
    marginVertical: 8,
  },
  arrowText: {
    fontSize: 20,
    color: '#00A19D',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00A19D',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  openMapsButton: {
    backgroundColor: '#00A19D',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openMapsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  openMapsSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
});

export default GoogleMapsLink;
