import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Plus,
  MoreVertical,
  Calendar,
  Store,
  X,
  Camera,
} from 'lucide-react-native';
import {checkIsSeller, createShop} from '../../api/shop';
import GlobalHeader from '../../components/GlobalHeader';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

interface Shop {
  id: number;
  shop_name: string;
  status: string;
  created_at: string;
  product_count: number;
  is_verified: boolean;
  banner: string;
  delivery_fees: string;
}

const ExistingSeller: React.FC = () => {
  const navigation = useNavigation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStoreAdded, setNewStoreAdded] = useState(false);
  const user = useSelector(selectUserProfile);

  // Store creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    country: '',
    deliveryFees: '',
  });

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await checkIsSeller();
      if (response.data?.data?.data) {
        setShops(response.data.data.data);
      }
      console.log('Shops:', response.data.data.data);
    } catch (error) {
      console.log('Error fetching shops:', error);
      Alert.alert('Error', 'Failed to load your shops');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewShop = () => {
    setShowCreateModal(true);
  };

  const handleShopPress = (shop: Shop) => {
    // Navigate to shop detail or products
    (navigation as any).navigate('MyShop', {shopId: shop.id});
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Store name is required',
      });
      return false;
    }
    if (!formData.description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Store description is required',
      });
      return false;
    }
    if (!formData.address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Store address is required',
      });
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Phone number is required',
      });
      return false;
    }
    if (!formData.country.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Country is required',
      });
      return false;
    }
    if (!formData.deliveryFees.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Delivery fees is required',
      });
      return false;
    }
    if (!selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Shop banner is required',
      });
      return false;
    }
    return true;
  };

  const handleCreateStore = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setCreateLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone_number', formData.phoneNumber);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('delivery_fees', formData.deliveryFees);

      if (selectedImage) {
        formDataToSend.append('shop_banner', {
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'banner.jpg',
        });
      }

      const response = await createShop(formDataToSend);

      if (response.data?.status === true || response.data?.success) {
        // Show success message with store name
        Toast.show({
          type: 'success',
          text1: '🎉 Store Created Successfully!',
          text2: `"${formData.name}" has been added to your stores`,
          visibilityTime: 4000,
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          address: '',
          phoneNumber: '',
          country: '',
          deliveryFees: '',
        });
        setSelectedImage(null);
        setShowCreateModal(false);

        // Refresh shops list to show the new store
        await fetchShops();

        // Set flag to show new store indicator
        setNewStoreAdded(true);
        setTimeout(() => setNewStoreAdded(false), 5000);

        // Show additional success feedback
        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: 'Store Added!',
            text2: 'Your new store is now visible in the dashboard',
            visibilityTime: 3000,
          });
        }, 1000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data?.message || 'Failed to create store',
        });
      }
    } catch (error) {
      console.log('Error creating store:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create store. Please try again.',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      description: '',
      address: '',
      phoneNumber: '',
      country: '',
      deliveryFees: '',
    });
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A19D" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <GlobalHeader icon={true} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.dateContainer}>
              <Calendar size={16} color="#666" />
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
            <Text style={styles.sellerName}>
              {user?.full_name ||
                user?.first_name + ' ' + user?.last_name ||
                'Seller Dashboard'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addStoreButton}
              onPress={handleCreateNewShop}>
              <Plus size={16} color="white" />
              <Text style={styles.addStoreText}>Add Store</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Stores */}
        <View style={styles.storesCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Store size={20} color="#00A19D" />
              <Text style={styles.sectionTitle}>My Stores</Text>
              {newStoreAdded && (
                <View style={styles.newStoreBadge}>
                  <Text style={styles.newStoreBadgeText}>NEW!</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleCreateNewShop}>
              <Text style={styles.viewAllText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {shops.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Store size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No stores found</Text>
              <Text style={styles.emptyDescription}>
                Create your first store to start selling
              </Text>
              <TouchableOpacity
                style={styles.createStoreButton}
                onPress={handleCreateNewShop}>
                <Plus size={16} color="white" />
                <Text style={styles.createStoreText}>Create Store</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.storesList}>
              {shops.map(shop => (
                <TouchableOpacity
                  key={shop.id}
                  style={styles.storeItem}
                  onPress={() => handleShopPress(shop)}>
                  <View style={styles.storeImageContainer}>
                    {shop.banner ? (
                      <Image
                        source={{uri: shop.banner}}
                        style={styles.storeImage}
                      />
                    ) : (
                      <View style={styles.storeImagePlaceholder}>
                        <Store size={24} color="#ccc" />
                      </View>
                    )}
                    {shop.is_verified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{shop.shop_name}</Text>
                    <Text style={styles.storeStatus}>
                      Status: {shop.status}
                    </Text>
                    <Text style={styles.storeProducts}>
                      {shop.product_count} Products
                    </Text>
                    <Text style={styles.storeDate}>
                      Created: {new Date(shop.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.storeMenu}>
                    <MoreVertical size={20} color="#666" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Store Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}>
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Store</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}>
              {/* Store Banner Upload */}
              <View style={styles.imageUploadContainer}>
                <Text style={styles.label}>Store Banner *</Text>
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={selectImage}>
                  {selectedImage ? (
                    <Image
                      source={{uri: selectedImage.uri}}
                      style={styles.uploadedImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Camera size={32} color="#ccc" />
                      <Text style={styles.imagePlaceholderText}>
                        Tap to add banner
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Store Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Store Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={value => handleInputChange('name', value)}
                  placeholder="Enter store name"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Store Description */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={value =>
                    handleInputChange('description', value)
                  }
                  placeholder="Describe your store"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Store Address */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Address *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.address}
                  onChangeText={value => handleInputChange('address', value)}
                  placeholder="Enter store address"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Phone Number */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.phoneNumber}
                  onChangeText={value =>
                    handleInputChange('phoneNumber', value)
                  }
                  placeholder="Enter phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Country */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Country *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.country}
                  onChangeText={value => handleInputChange('country', value)}
                  placeholder="Enter country"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Delivery Fees */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Delivery Fees *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.deliveryFees}
                  onChangeText={value =>
                    handleInputChange('deliveryFees', value)
                  }
                  placeholder="Enter delivery fees (e.g., $5.00)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  createLoading && styles.createButtonDisabled,
                ]}
                onPress={handleCreateStore}
                disabled={createLoading}>
                {createLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Create Store</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerLeft: {
    flex: 1,
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A19D',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    alignItems: 'center',
  },
  addStoreButton: {
    backgroundColor: '#00A19D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addStoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 4,
  },
  storesCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#00A19D',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createStoreButton: {
    backgroundColor: '#00A19D',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createStoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  storesList: {
    gap: 12,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storeImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  storeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00A19D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  storeProducts: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  storeDate: {
    fontSize: 12,
    color: '#666',
  },
  storeMenu: {
    padding: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageUploadContainer: {
    marginBottom: 20,
  },
  imageUploadButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#00A19D',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  newStoreBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  newStoreBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ExistingSeller;
