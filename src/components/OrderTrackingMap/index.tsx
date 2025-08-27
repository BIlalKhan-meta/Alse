import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {vh, vw} from '../../constant';

interface Location {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

interface OrderTrackingMapProps {
  buyerLocation: Location;
  sellerLocation: Location;
  height?: number;
}

const {width: screenWidth} = Dimensions.get('window');

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  buyerLocation,
  sellerLocation,
  height = 200,
}) => {
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [zoomLevel, setZoomLevel] = useState(12);

  // Calculate center point between buyer and seller
  const centerLatitude = (buyerLocation.latitude + sellerLocation.latitude) / 2;
  const centerLongitude =
    (buyerLocation.longitude + sellerLocation.longitude) / 2;

  // Calculate distance between points for zoom adjustment
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance(
    buyerLocation.latitude,
    buyerLocation.longitude,
    sellerLocation.latitude,
    sellerLocation.longitude,
  );

  // Adjust zoom based on distance
  useEffect(() => {
    if (distance < 1) setZoomLevel(15);
    else if (distance < 5) setZoomLevel(13);
    else if (distance < 20) setZoomLevel(11);
    else setZoomLevel(9);
  }, [distance]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 1));
  };

  const toggleMapType = () => {
    setMapType(prev => (prev === 'standard' ? 'satellite' : 'standard'));
  };

  // Custom map rendering with pins
  const renderMap = () => {
    const mapStyle =
      mapType === 'satellite' ? styles.satelliteMap : styles.standardMap;

    return (
      <View style={[styles.mapContainer, mapStyle, {height}]}>
        {/* Route line between buyer and seller */}
        <View style={styles.routeLine} />

        {/* Seller pin */}
        <View style={[styles.pin, styles.sellerPin, {top: '30%', left: '20%'}]}>
          <View style={styles.pinIcon}>
            <Text style={styles.pinText}>🏪</Text>
          </View>
          <View style={styles.pinLabel}>
            <Text style={styles.pinTitle}>{sellerLocation.title}</Text>
            <Text style={styles.pinDescription}>
              {sellerLocation.description}
            </Text>
          </View>
        </View>

        {/* Buyer pin */}
        <View style={[styles.pin, styles.buyerPin, {top: '60%', right: '25%'}]}>
          <View style={styles.pinIcon}>
            <Text style={styles.pinText}>🏠</Text>
          </View>
          <View style={styles.pinLabel}>
            <Text style={styles.pinTitle}>{buyerLocation.title}</Text>
            <Text style={styles.pinDescription}>
              {buyerLocation.description}
            </Text>
          </View>
        </View>

        {/* Distance indicator */}
        <View style={styles.distanceIndicator}>
          <Text style={styles.distanceText}>
            Distance: {distance.toFixed(1)} km
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControl} onPress={handleZoomIn}>
          <Text style={styles.mapControlText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControl} onPress={handleZoomOut}>
          <Text style={styles.mapControlText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControl} onPress={toggleMapType}>
          <Text style={styles.mapControlText}>⛶</Text>
        </TouchableOpacity>
      </View>

      {/* Map Type Indicator */}
      <View style={styles.mapTypeIndicator}>
        <Text style={styles.mapTypeText}>
          {mapType === 'satellite' ? 'Satellite View' : 'Standard View'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  standardMap: {
    backgroundColor: '#e8f4f8',
    backgroundImage:
      'linear-gradient(45deg, #e8f4f8 25%, transparent 25%), linear-gradient(-45deg, #e8f4f8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8f4f8 75%), linear-gradient(-45deg, transparent 75%, #e8f4f8 75%)',
  },
  satelliteMap: {
    backgroundColor: '#2d5016',
    backgroundImage:
      'linear-gradient(45deg, #2d5016 25%, transparent 25%), linear-gradient(-45deg, #2d5016 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2d5016 75%), linear-gradient(-45deg, transparent 75%, #2d5016 75%)',
  },
  routeLine: {
    position: 'absolute',
    top: '45%',
    left: '25%',
    right: '30%',
    height: 3,
    backgroundColor: '#00A19D',
    borderRadius: 2,
    zIndex: 1,
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  sellerPin: {
    transform: [{translateX: -15}],
  },
  buyerPin: {
    transform: [{translateX: 15}],
  },
  pinIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pinText: {
    fontSize: 16,
  },
  pinLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    maxWidth: 120,
  },
  pinTitle: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  pinDescription: {
    color: '#ccc',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 1,
  },
  distanceIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  mapControls: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
  },
  mapControl: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  mapControlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapTypeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mapTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
});

export default OrderTrackingMap;
