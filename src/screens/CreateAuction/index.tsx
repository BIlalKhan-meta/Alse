import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ArrowLeft, Plus, Upload, X} from 'lucide-react-native';
import {createAuction, CreateAuctionRequest} from '../../api/auction';
import {checkIsSeller} from '../../api/shop';

const CreateAuction: React.FC = () => {
  const navigation: any = useNavigation();
  
  // Required fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [duration, setDuration] = useState('7');

  // Optional fields
  const [reservePrice, setReservePrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [autoExtend, setAutoExtend] = useState(false);
  const [autoExtendMinutes, setAutoExtendMinutes] = useState('5');
  
  // Shipping info
  const [shippingCost, setShippingCost] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  
  // Product images
  const [productImages, setProductImages] = useState<string[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an auction title');
      return false;
    }
    if (title.length > 255) {
      Alert.alert('Error', 'Title must be 255 characters or less');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (description.length > 5000) {
      Alert.alert('Error', 'Description must be 5000 characters or less');
      return false;
    }
    if (!startingPrice.trim()) {
      Alert.alert('Error', 'Please enter a starting price');
      return false;
    }
    const startPrice = parseFloat(startingPrice);
    if (isNaN(startPrice) || startPrice < 0.01 || startPrice > 999999.99) {
      Alert.alert('Error', 'Starting price must be between $0.01 and $999,999.99');
      return false;
    }
    const durationDays = parseInt(duration);
    if (isNaN(durationDays) || durationDays < 1 || durationDays > 30) {
      Alert.alert('Error', 'Duration must be between 1 and 30 days');
      return false;
    }
    
    // Validate reserve price
    if (reservePrice.trim()) {
      const reserve = parseFloat(reservePrice);
      if (isNaN(reserve) || reserve < startPrice) {
        Alert.alert('Error', 'Reserve price must be greater than or equal to starting price');
        return false;
      }
    }
    
    // Validate buy now price
    if (buyNowPrice.trim()) {
      const buyNow = parseFloat(buyNowPrice);
      if (isNaN(buyNow) || buyNow <= startPrice) {
        Alert.alert('Error', 'Buy now price must be greater than starting price');
        return false;
      }
    }
    
    // Validate auto extend
    if (autoExtend) {
      const minutes = parseInt(autoExtendMinutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 30) {
        Alert.alert('Error', 'Auto extend minutes must be between 1 and 30');
        return false;
      }
    }
    
    // Validate product images (optional but if provided, should be valid URLs)
    if (productImages.length > 0) {
      const urlPattern = /^https?:\/\/.+/;
      for (let i = 0; i < productImages.length; i++) {
        if (!urlPattern.test(productImages[i])) {
          Alert.alert('Error', `Image URL ${i + 1} is not a valid URL. Please use http:// or https://`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleCreateAuction = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Skip seller check for now to test the API call
      console.log('🚀 Starting auction creation process...');
      
      // Optional: Check seller status (commented out for testing)
      // console.log('Checking seller status...');
      // const sellerCheck = await checkIsSeller();
      // console.log('Seller status response:', sellerCheck);
      const auctionData: CreateAuctionRequest = {
        title: title.trim(),
        description: description.trim(),
        starting_price: parseFloat(startingPrice),
        duration_days: parseInt(duration),
        auto_extend: autoExtend,
        auto_extend_minutes: autoExtend ? parseInt(autoExtendMinutes) : 0,
        category: category.trim() || 'General',
        location: location.trim() || 'Not specified',
        shipping_info: {
          cost: parseFloat(shippingCost) || 0,
          method: shippingMethod.trim() || 'Standard Shipping',
          delivery_time: deliveryTime.trim() || '5-7 business days',
        },
        product_images: productImages,
      };

      // Add optional fields if provided
      if (reservePrice.trim()) {
        auctionData.reserve_price = parseFloat(reservePrice);
      }
      if (buyNowPrice.trim()) {
        auctionData.buy_now_price = parseFloat(buyNowPrice);
      }

      console.log('📝 Creating auction with data:', JSON.stringify(auctionData, null, 2));
      console.log('🌐 Making API call to create auction...');
      
      const response = await createAuction(auctionData);
      console.log('✅ Auction created successfully:', JSON.stringify(response, null, 2));

    Alert.alert('Success', 'Auction created successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
    } catch (error) {
      console.error('❌ Error creating auction:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Show more detailed error message
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to create auction. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Auction</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Required Fields */}
          <Text style={styles.sectionTitle}>Required Information</Text>
          
          <Text style={styles.label}>Auction Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter auction title (max 255 chars)"
            placeholderTextColor="#999"
            maxLength={255}
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item... (max 5000 chars)"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            maxLength={5000}
          />

          <Text style={styles.label}>Starting Price ($) *</Text>
          <TextInput
            style={styles.input}
            value={startingPrice}
            onChangeText={setStartingPrice}
            placeholder="0.01 - 999,999.99"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Duration (days) *</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="1-30 days"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          {/* Optional Fields */}
          <Text style={styles.sectionTitle}>Optional Information</Text>
          
          <Text style={styles.label}>Reserve Price ($)</Text>
          <TextInput
            style={styles.input}
            value={reservePrice}
            onChangeText={setReservePrice}
            placeholder="Minimum price to sell (optional)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Buy Now Price ($)</Text>
          <TextInput
            style={styles.input}
            value={buyNowPrice}
            onChangeText={setBuyNowPrice}
            placeholder="Instant buy price (optional)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Electronics, Fashion, Art"
            placeholderTextColor="#999"
            maxLength={100}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g., New York, NY"
            placeholderTextColor="#999"
            maxLength={255}
          />

          {/* Auto Extend Settings */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAutoExtend(!autoExtend)}>
              <View style={[styles.checkboxBox, autoExtend && styles.checkboxChecked]}>
                {autoExtend && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Enable Auto-Extend</Text>
            </TouchableOpacity>
          </View>

          {autoExtend && (
            <View>
              <Text style={styles.label}>Auto-Extend Minutes</Text>
              <TextInput
                style={styles.input}
                value={autoExtendMinutes}
                onChangeText={setAutoExtendMinutes}
                placeholder="1-30 minutes"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Shipping Information */}
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          
          <Text style={styles.label}>Shipping Cost ($)</Text>
          <TextInput
            style={styles.input}
            value={shippingCost}
            onChangeText={setShippingCost}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Shipping Method</Text>
          <TextInput
            style={styles.input}
            value={shippingMethod}
            onChangeText={setShippingMethod}
            placeholder="e.g., FedEx Express, UPS Ground"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Delivery Time</Text>
          <TextInput
            style={styles.input}
            value={deliveryTime}
            onChangeText={setDeliveryTime}
            placeholder="e.g., 2-3 business days"
            placeholderTextColor="#999"
          />

          {/* Product Images */}
          <Text style={styles.sectionTitle}>Product Images</Text>
          <Text style={styles.label}>Image URLs (one per line)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={productImages.join('\n')}
            onChangeText={(text) => {
              const urls = text.split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0);
              setProductImages(urls);
            }}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateAuction}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
            <Plus size={20} color="white" />
            )}
            <Text style={styles.createButtonText}>
              {loading ? 'Creating Auction...' : 'Create Auction'}
            </Text>
          </TouchableOpacity>

          {/* Debug Test Button */}
          {/* <TouchableOpacity
            style={[styles.createButton, styles.testButton]}
            onPress={() => {
              console.log('🧪 TEST: Manual API call test');
              handleCreateAuction();
            }}>
            <Text style={styles.createButtonText}>🧪 Test API Call</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#00A19D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  checkboxContainer: {
    marginVertical: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00A19D',
    borderColor: '#00A19D',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#ff6b6b',
    marginTop: 16,
  },
});

export default CreateAuction;
