import React, {useState} from 'react';
import {View} from 'react-native';
import styles from './styles';
import InterRegular from '../Text/InterRegular';
import CustomButton from '../CustomButton';
import QunatityControls from '../QuantityControls';
import {useNavigation} from '@react-navigation/native';
import {addProductToCart, productDetail} from '../../api/product';
import {getMessage, Toast} from '../../utils/helpers';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import InterMedium from '../Text/InterMedium';

const StoreOrderComponent: React.FC = props => {
  const navigation = useNavigation();
  const productItem = props?.productItem;
  const user = useSelector(selectUserProfile);
  const [value, setValue] = useState(1);
  const [loader, setLoader] = useState(false);

  const handleChange = (status: string) => {
    if (status == 'decrement' && value == 1) {
      return;
    }
    if (status == 'increment') {
      setValue(value + 1);
    } else {
      setValue(value - 1);
    }
  };

  const handleAddToCart = async () => {
    setLoader(true);
    const temp = {
      color: productItem?.colors[0].color,
      size: productItem?.sizes[0].size,
      quantity: value,
    };

    const form = new FormData();
    Object.entries(temp).forEach(([key, value]) => {
      form.append(key, value);
    });

    // console.log(JSON.stringify(form, null, 4));

    try {
      await addProductToCart(productItem?.id, form).then(res => {
        if (res?.data) {
          Toast.success(getMessage(res?.data?.message));
        }
      });
    } catch (error) {
      Toast.error(getMessage(error?.message));
      console.log('Fromm add tocartt erro', error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <InterRegular style={styles.label}>
          {productItem?.description}
        </InterRegular>
      </View>

      <View style={styles.selectionCon}>
        {productItem.colors && productItem.colors.length != 0 && (
          <InterMedium>Color : {productItem.colors[0].color}</InterMedium>
        )}
        {productItem.sizes && productItem.sizes.length != 0 && (
          <InterMedium>Size : {productItem.sizes[0].size}</InterMedium>
        )}
        {/* <Selection
          mode="color"
          options={colorsType}
          selectedOption={selectedColor}
          setSelectedOption={setSelectedColor}
        />
        <Selection
          mode="size"
          options={sizes}
          selectedOption={selectedSize}
          setSelectedOption={setSelectedSize}
        /> */}
      </View>

      {user?.id != productItem.shop.user_id ? (
        <View style={styles.btnContainer}>
          <CustomButton
            style={styles.checkoutButton}
            loading={loader}
            onPress={handleAddToCart}>
            Add to Cart
          </CustomButton>

          <QunatityControls
            quantity={value}
            onIncrement={() => handleChange('increment')}
            onDecrement={() => handleChange('decrement')}
          />
        </View>
      ) : (
        <CustomButton
          style={styles.checkoutButton}
          onPress={() =>
            navigation.navigate('AddProduct', {
              shopId: productItem?.shop.id,
              title: 'Edit Product',
              item: productItem,
            })
          }>
          Edit Product
        </CustomButton>
      )}
    </View>
  );
};

export default StoreOrderComponent;
