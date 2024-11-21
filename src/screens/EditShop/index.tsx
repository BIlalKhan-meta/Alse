import React, {useEffect, useState} from 'react';
import Card from '../../components/Card';
import {Image, TouchableOpacity, View} from 'react-native';
import {styles} from './styles';
import RegularTextInput from '../../components/TextInput/RegularTextInput';
import InterRegular from '../../components/Text/InterRegular';
import {images} from '../../utils/images';
import useImagePicker from '../../hooks/useImagePicker';
import {useNavigation, useRoute} from '@react-navigation/native';
import {vh} from '../../constant';
import {shopDetail, updateShop} from '../../api/shop';
import Loader from '../../components/Loader';
import CustomButton from '../../components/CustomButton';
import Toast from 'react-native-toast-message';

export const EditShop = () => {
  const [name, setName] = useState('');
  const [fees, setFees] = useState('');
  const navigation = useNavigation();
  const [display, setDisplay] = useState();
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const shopId = route?.params?.shopId;
  const {imageData, image, captureImage, chooseImageFromLibrary} =
    useImagePicker();

  const fetchData = async () => {
    setLoading(true);
    await shopDetail(shopId)
      .then(res => {
        if (res?.data) {
          setDisplay(res?.data?.data);
          setName(res?.data?.data?.shop_name);
          setFees(res?.data?.data?.delivery_fees);
        }
      })
      .catch(err => console.log('ERORRRRRRRRRRRRR', err))
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  const handleSubmit = async () => {
    if (name.length == 0 || fees.length == 0) {
      return Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'All Fields are required',
      });
    }
    const image = {
      uri: imageData?.uri,
      name: imageData?.fileName,
      type: imageData?.type,
    };
    const data = {
      name: name,
      delivery_fees: fees,
      // shop_banner: image ? image : display?.banner,
      ...(imageData ? {shop_banner: image} : {}),
    };
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      form.append(key, value);
    });

    console.log('FORMMMMMMMMMMMM', JSON.stringify(form, null, 4));
    await updateShop(form, display?.id)
      .then(res => {
        if (res?.data) {
          navigation.goBack();
        }
      })
      .catch(err => {
        console.log('ERORRRRRRRRRRRRRRRR', err);
      });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Card>
        <RegularTextInput
          label="Shop Name *"
          placeholder="Enter Shop Name"
          // placeholderTextColor={colors.darkText}
          onChangeText={setName}
          value={name}
          style={styles.inputStyle}
        />
        <RegularTextInput
          label="Delivery Fees *"
          placeholder="Enter Shop Name"
          // placeholderTextColor={colors.darkText}
          onChangeText={setFees}
          value={fees}
          style={styles.inputStyle}
        />

        <InterRegular style={styles.dropdownLabel}>Product Image*</InterRegular>
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
        <CustomButton style={{alignSelf: 'center'}} onPress={handleSubmit}>
          Update
        </CustomButton>
      </Card>
    </View>
  );
};
