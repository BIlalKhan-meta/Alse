import {useState, useEffect, useCallback} from 'react';
import Geolocation from 'react-native-geolocation-service';
import {PermissionsAndroid, Platform, Alert} from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const result = await Geolocation.requestAuthorization('whenInUse');
      return result === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message:
            'This app needs to access your location to show your current address',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  };

  const reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();

      if (data && data.display_name) {
        // Parse the address to get a more readable format
        const address = data.address;
        let formattedAddress = '';

        if (address.house_number && address.road) {
          formattedAddress += `${address.house_number} ${address.road}`;
        } else if (address.road) {
          formattedAddress += address.road;
        }

        if (address.suburb || address.neighbourhood) {
          formattedAddress += formattedAddress
            ? `, ${address.suburb || address.neighbourhood}`
            : address.suburb || address.neighbourhood;
        }

        if (address.city || address.town || address.village) {
          formattedAddress += formattedAddress
            ? `, ${address.city || address.town || address.village}`
            : address.city || address.town || address.village;
        }

        if (address.state) {
          formattedAddress += formattedAddress
            ? `, ${address.state}`
            : address.state;
        }

        return formattedAddress || data.display_name;
      }

      return 'Location not found';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Address unavailable';
    }
  };

  const getCurrentLocation = useCallback(async () => {
    setState(prev => ({...prev, loading: true, error: null}));

    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Location permission denied',
        }));
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;

          // Get address from coordinates
          const address = await reverseGeocode(latitude, longitude);

          setState({
            location: {
              latitude,
              longitude,
              address,
            },
            loading: false,
            error: null,
          });
        },
        error => {
          console.error('Location error:', error);
          let errorMessage = 'Failed to get location';

          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied';
              break;
            case 2:
              errorMessage = 'Location not available';
              break;
            case 3:
              errorMessage = 'Location request timeout';
              break;
            default:
              errorMessage = 'Failed to get location';
          }

          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to get location',
      }));
    }
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      location: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearLocation,
  };
};
