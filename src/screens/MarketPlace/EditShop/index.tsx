import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {styles} from './styles';
import RegularTextInput from '../../../components/TextInput/RegularTextInput';
import InterRegular from '../../../components/Text/InterRegular';
import {images} from '../../../utils/images';
import useImagePicker from '../../../hooks/useImagePicker';
import {useNavigation, useRoute} from '@react-navigation/native';
import {vh} from '../../../constant';
import {shopDetail, updateShop} from '../../../api/shop';
import Loader from '../../../components/Loader';
import CustomButton from '../../../components/CustomButton';
import Toast from 'react-native-toast-message';
import Card from '../../../components/Card';

export const EditShop = () => {
  const [name, setName] = useState('');
  const [fees, setFees] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const navigation = useNavigation();
  const [display, setDisplay] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const route = useRoute();
  const shopId = (route as any)?.params?.shopId;
  const {imageData, captureImage} = useImagePicker();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await shopDetail(shopId);
      if (res?.data) {
        const shop = res?.data?.data;
        setDisplay(shop);
        setName(shop?.shop_name || '');
        setFees(String(shop?.delivery_fees ?? ''));
        setDescription(shop?.description || '');
        setAddress(shop?.address || '');
        setPhoneNumber(shop?.phone_number || '');
        setCountry(shop?.country || '');
        setCity(shop?.city || '');
      }
    } catch (err) {
      console.log('EditShop fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  const handleSubmit = async () => {
    if (!name.trim() || !String(fees).trim()) {
      return Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Shop name and delivery fees are required',
      });
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('delivery_fees', String(fees).trim());
      form.append('description', description.trim());
      form.append('address', address.trim());
      form.append('phone_number', phoneNumber.trim());
      form.append('country', country.trim());
      form.append('city', city.trim());

      if (imageData?.uri) {
        form.append('shop_banner', {
          uri: imageData.uri,
          name: imageData.fileName || 'shop_banner.jpg',
          type: imageData.type || 'image/jpeg',
        } as any);
      }

      const res = await updateShop(form, display?.id || shopId);
      if (res?.data) {
        Toast.show({
          type: 'success',
          text1: 'Updated',
          text2: 'Shop updated successfully',
        });
        navigation.goBack();
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.response?.data?.message || 'Failed to update shop',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: vh * 4}}>
      <Card>
        <RegularTextInput
          label="Shop Name *"
          placeholder="Enter Shop Name"
          onChangeText={setName}
          value={name}
          style={styles.inputStyle}
        />
        <RegularTextInput
          label="Delivery Fees *"
          placeholder="Enter delivery fees"
          onChangeText={setFees}
          value={fees}
          keyboardType="decimal-pad"
          style={styles.inputStyle}
        />
        <RegularTextInput
          label="Description"
          placeholder="Tell customers about your store"
          onChangeText={setDescription}
          value={description}
          multiline
          style={styles.inputStyle}
        />
        <RegularTextInput
          label="Address"
          placeholder="Store address"
          onChangeText={setAddress}
          value={address}
          style={styles.inputStyle}
        />
        <RegularTextInput
          label="City"
          placeholder="City"
          onChangeText={setCity}
          value={city}
          style={styles.inputStyle}
        />
        <RegularTextInput
          label="Country"
          placeholder="Country"
          onChangeText={setCountry}
          value={country}
          style={styles.inputStyle}
        />
        <RegularTextInput
          label="Phone"
          placeholder="Phone number"
          onChangeText={setPhoneNumber}
          value={phoneNumber}
          keyboardType="phone-pad"
          style={styles.inputStyle}
        />

        <InterRegular style={styles.dropdownLabel}>Shop Banner</InterRegular>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => captureImage('photo')}>
          <InterRegular style={styles.uploadTxt}>Upload</InterRegular>
          <Image source={images.upload} style={styles.uploadImg} />
        </TouchableOpacity>

        <View>
          {(imageData || display?.banner != undefined) && (
            <Image
              source={imageData ? {uri: imageData.uri} : {uri: display?.banner}}
              style={{
                width: '100%',
                height: vh * 15,
                resizeMode: 'cover',
              }}
            />
          )}
        </View>
        <CustomButton
          style={{alignSelf: 'center'}}
          onPress={handleSubmit}>
          {saving ? 'Updating…' : 'Update'}
        </CustomButton>
      </Card>
    </ScrollView>
  );
};
