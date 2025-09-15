import React, {useState, useEffect} from 'react';
import {
  Image,
  Modal,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {ChevronDown} from 'lucide-react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {getAvailableRiders} from '../../api/rider';

const {width, height} = Dimensions.get('window');

interface Rider {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: number;
  is_approved: number;
}

interface AssignDeliveryModalProps {
  visible: boolean;
  closeModal: () => void;
  onAssign: (riderId: number, riderName: string) => void;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const AssignDeliveryModal: React.FC<AssignDeliveryModalProps> = ({
  visible,
  closeModal,
  onAssign,
  selectedValue,
  onValueChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch riders when modal opens
  useEffect(() => {
    if (visible) {
      fetchRiders();
    }
  }, [visible]);

  const fetchRiders = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching riders...');

      // Try the API call without any parameters first to see if it works
      const response = await getAvailableRiders();

      console.log('Riders API Response:', JSON.stringify(response, null, 2));

      // Handle axios response structure (response.data contains the actual API response)
      const apiResponse = response.data;
      console.log('API Response Data:', JSON.stringify(apiResponse, null, 2));

      // Handle different response structures based on your API response format
      if (apiResponse?.data?.data) {
        console.log('Riders found (nested):', apiResponse.data.data.length);
        setRiders(apiResponse.data.data);
      } else if (apiResponse?.data) {
        console.log('Riders found (direct):', apiResponse.data.length);
        setRiders(apiResponse.data);
      } else {
        console.log('No riders in response structure');
        console.log('Full API response:', apiResponse);
        setError('No riders available');
      }
    } catch (err) {
      console.log('Error fetching riders:', err);
      console.log('Error details:', err);
      setError('Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (selectedValue) {
      const selectedRider = riders.find(
        rider => rider.id.toString() === selectedValue,
      );
      if (selectedRider) {
        onAssign(
          selectedRider.id,
          `${selectedRider.first_name} ${selectedRider.last_name}`,
        );
        closeModal();
      }
    }
  };

  const selectedRider = riders.find(
    rider => rider.id.toString() === selectedValue,
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={closeModal}
      animationType="fade"
      transparent>
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
      />
      <TouchableOpacity style={styles.blurContainer} onPress={closeModal} />
      <View style={styles.centeredView}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image source={images.shoppingBag} style={styles.icon} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Assign Delivery</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Select your desired option below!</Text>

          {/* Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => {
                if (!loading) {
                  // Fetch riders when dropdown is opened if not already loaded
                  if (riders.length === 0 && !error) {
                    fetchRiders();
                  }
                  setDropdownOpen(!dropdownOpen);
                }
              }}
              disabled={loading}>
              <Text style={styles.dropdownText}>
                {selectedRider
                  ? `${selectedRider.first_name} ${selectedRider.last_name}`
                  : loading
                  ? 'Loading riders...'
                  : error
                  ? 'No riders available'
                  : 'Select a rider'}
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <ChevronDown size={20} color="#666" />
              )}
            </TouchableOpacity>

            {dropdownOpen && !loading && riders.length > 0 && (
              <View style={styles.dropdownList}>
                {riders.map((rider, index) => (
                  <TouchableOpacity
                    key={rider.id}
                    style={[
                      styles.dropdownItem,
                      index === riders.length - 1 && styles.lastDropdownItem,
                    ]}
                    onPress={() => {
                      onValueChange(rider.id.toString());
                      setDropdownOpen(false);
                    }}>
                    <View style={styles.riderItem}>
                      <Text style={styles.riderName}>
                        {rider.first_name} {rider.last_name}
                      </Text>
                      <Text style={styles.riderPhone}>
                        {rider.phone_number}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {dropdownOpen && !loading && riders.length === 0 && !error && (
              <View style={styles.dropdownList}>
                <View style={styles.emptyItem}>
                  <Text style={styles.emptyText}>No riders available</Text>
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchRiders}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
  },
  centeredView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: width * 0.85,
    maxHeight: height * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 48,
    height: 48,
    tintColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  dropdownContainer: {
    marginBottom: 24,
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  doneButton: {
    backgroundColor: '#20B2AA',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  riderItem: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  riderPhone: {
    fontSize: 14,
    color: '#666',
  },
  emptyItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#20B2AA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AssignDeliveryModal;
