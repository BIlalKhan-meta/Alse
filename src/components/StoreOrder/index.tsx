import React, {useState} from 'react';
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import styles from './styles';
// import TabsComponent from '../TabsComponent';
import InterBold from '../Text/InterBold';
import InterRegular from '../Text/InterRegular';
import CustomButton from '../CustomButton';
import QunatityControls from '../QuantityControls';
import Selection from '../Selection';
import {useNavigation} from '@react-navigation/native';
import {addProductToCart, productDetail} from '../../api/product';
import {getMessage, Toast} from '../../utils/helpers';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import InterBoldAverage from '../Text/InterBoldAverage';
import InterBoldSmall from '../Text/InterBoldSmall';
import InterMedium from '../Text/InterMedium';
import InterBoldLabel from '../Text/InterBoldLabel';

const colorsType = ['Red', 'Blue', 'Green'];
const sizes = ['S', 'M', 'L'];

const StoreOrderComponent: React.FC = props => {
  const navigation = useNavigation();
  const productItem = props?.productItem;
  // console.log('====================================');
  // console.log(productItem, 'Frommm propssssss ');
  // console.log('====================================');
  const [selectedColor, setSelectedColor] = useState<string | null>('Red');
  const [selectedSize, setSelectedSize] = useState<string | null>('L');
  const user = useSelector(selectUserProfile);

  const handleIncrement = (index: number) => {
    // Implement increment logic here
    console.log('Increment item at index:', index);
    index + 1;
  };

  const handleDecrement = (index: number) => {
    // Implement decrement logic here
    console.log('Decrement item at index:', index);
    index - 1;
  };

  const handleAddToCart = async () => {
    try {
      const res = await addProductToCart(productItem?.id);
      console.log('response from addtocartttt ====>', res?.data?.message);
      Toast.success(getMessage(res?.data?.message));
    } catch (error) {
      Toast.error(getMessage(error?.message));
      console.log('Fromm add tocartt erro', error);
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
          <CustomButton style={styles.checkoutButton} onPress={handleAddToCart}>
            Add to Cart
          </CustomButton>

          <QunatityControls
            quantity={1}
            onIncrement={() => handleIncrement(1)}
            onDecrement={() => handleDecrement(1)}
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
