// // CardComponent.tsx
// import React, {useState} from 'react';
// import {
//   View,
//   TextInput,
//   StyleSheet,
//   Image,
//   Text,
//   TouchableOpacity,
//   ImageBackground,
// } from 'react-native';
// import {images} from '../../utils/images';
// import {colors} from '../../utils/theme';
// import Card from '../Card';
// import RegularTextInput from '../TextInput/RegularTextInput';
// import DropDownPicker from 'react-native-dropdown-picker';
// import {vh, vw} from '../../constant';
// import {useSelector} from 'react-redux';
// import {selectUserProfile} from '../../store/slices/authSlice';

// interface CardComponentProps {
//   onTextInput: () => void;
//   // notifiVisible: boolean;
//   // chatVisible: boolean;
//   // searchVisible: boolean;
//   // back: boolean;
//   onVideoPress: () => void;
//   onImagePress: () => void;
//   onCameraPress: () => void;
//   value: string;
//   ListOptions?: any;
//   privacy?: string;
//   setPrivacy?: () => void;
//   handleOnChangeText: () => void;
//   removeMedia: () => void;
//   image?: object | null;
//   // dots: boolean;
// }
// const CardComponent: React.FC<CardComponentProps> = ({
//   handleOnChangeText,
//   onImagePress,
//   onVideoPress,
//   onCameraPress,
//   ListOptions,
//   value,
//   setPrivacy,
//   privacy,
//   image,
//   removeMedia,
// }) => {
//   const [open, setOpen] = useState(false);

//   const user = useSelector(selectUserProfile);

//   // console.log('USERRRRRRRRRRRRRRRRRRRRR', user);

//   return (
//     <Card>
//       <View style={styles.card}>
//         <Image
//           source={user ? {uri: user?.avatar} : images.user}
//           style={styles.avatar}
//         />

//         <TextInput
//           // onPress={() => onTextInput()}
//           style={styles.input}
//           placeholder="What's on your mind?"
//           placeholderTextColor={colors.inputText}
//           onChangeText={handleOnChangeText}
//           multiline
//           value={value}
//         />
//       </View>
//       {ListOptions && privacy && setPrivacy && (
//         <View style={{marginVertical: vh * 4, zIndex: 10}}>
//           <DropDownPicker
//             open={open}
//             setOpen={setOpen}
//             placeholder="Select"
//             items={ListOptions}
//             containerStyle={{height: vh * 3}}
//             style={{
//               borderWidth: 0,
//               width: vw * 30,
//               height: vh * 3,
//               borderRadius: vh,
//               backgroundColor: colors.redShadeLight,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}
//             labelStyle={{color: colors.redStatus}}
//             textStyle={{color: colors.redStatus}}
//             dropDownContainerStyle={{
//               width: vw * 30,
//               backgroundColor: colors.redShadeLight,
//               borderWidth: 0,
//             }}
//             value={privacy}
//             setValue={setPrivacy}
//           />
//         </View>
//       )}
//       <View style={styles.uploadOptions}>
//         <TouchableOpacity style={styles.button} onPress={onVideoPress}>
//           <Image source={images.video} style={styles.buttonIcon} />
//           <Text style={styles.buttonText}> Video</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.button} onPress={onImagePress}>
//           <Image source={images.media} style={styles.buttonIcon2} />
//           <Text style={styles.buttonText}> Image</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.button} onPress={onCameraPress}>
//           <Image
//             source={images.camera}
//             resizeMode="contain"
//             style={styles.buttonIcon2}
//           />
//           <Text style={styles.buttonText}> Camera</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.media_main}>
//         {image && (
//           <View style={styles.media_box}>
//             <TouchableOpacity
//               onPress={() => removeMedia()}
//               style={styles.cross_box}>
//               <Image source={images.cross} style={styles.cross_icon} />
//             </TouchableOpacity>
//             <Image
//               source={image?.uri ? {uri: image?.uri} : {uri: image}}
//               style={styles.media_style}
//             />
//           </View>
//         )}
//       </View>
//     </Card>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   cross_box: {
//     width: vh * 2.5,
//     height: vh * 2.5,
//     borderRadius: vh * 2.5,
//     borderWidth: 2,
//     backgroundColor: 'transparent',
//     zIndex: 99,
//     position: 'absolute',
//     right: vw * 1.5,
//     top: vh * 0.5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderColor: colors.white,
//   },
//   cross_icon: {
//     width: '60%',
//     height: '60%',
//     resizeMode: 'contain',
//   },
//   media_main: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     // justifyContent: 'space-between',
//   },
//   media_box: {
//     width: '100%',
//     height: vh * 20,
//     borderRadius: vh,
//     overflow: 'hidden',
//     marginTop: vh * 2,
//     marginRight: vw * 2.8,
//   },
//   media_style: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//     // zIndex : 98,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     backgroundColor: colors.inputcolor,
//     padding: 10,
//     borderRadius: 10,
//   },
//   uploadOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.inputcolor,
//     borderRadius: 10,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   buttonIcon: {
//     width: 17,
//     height: 10,
//   },
//   buttonIcon2: {
//     width: 17,
//     height: 15,
//   },
//   buttonText: {
//     color: colors.inputText,
//     fontSize: 16,
//     marginLeft: 5,
//   },
// });

// export default CardComponent;

import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {images} from '../../utils/images';
import {colors} from '../../utils/theme';
import {vh, vw} from '../../constant';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {ArrowRight} from 'lucide-react-native';

interface CardComponentProps {
  onTextInput?: () => void;
  onVideoPress?: () => void;
  onImagePress?: () => void;
  onCameraPress?: () => void;
  onCancel?: () => void;
  value: string;
  handleOnChangeText: (text: string) => void;
  removeMedia: () => void;
  image?: object | null;
  onTagPeople?: () => void;
  onAddLocation?: () => void;
  onSubmit?: () => void;
}

const CardComponent: React.FC<CardComponentProps> = ({
  handleOnChangeText,
  onImagePress,
  value,
  image,
  removeMedia,
  onCancel,
  onTagPeople,
  onAddLocation,
  onSubmit,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Alse</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={images.bellIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={images.settingsIcon} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image source={images.smsIcon} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Post Header */}
      <View style={styles.postHeader}>
        <Text style={styles.postHeaderText}>Upload a post</Text>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Image and Description */}
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image
              source={image?.uri ? {uri: image?.uri} : {uri: image}}
              style={styles.image}
            />
          ) : (
            <TouchableOpacity
              style={styles.addImageContainer}
              onPress={onImagePress}>
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
          )}
          <View style={styles.descriptionOverlay}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add a description..."
              placeholderTextColor="#888888"
              multiline
              value={value}
              onChangeText={handleOnChangeText}
            />
          </View>
        </View>
      </View>

      {/* Tag People */}
      <TouchableOpacity style={styles.optionItem} onPress={onTagPeople}>
        <View style={styles.optionIconContainer}>
          <Text style={styles.optionIconText}>@</Text>
        </View>
        <Text style={styles.optionText}>Tag People</Text>
        <Text style={styles.chevronRight}>›</Text>
      </TouchableOpacity>

      {/* Add Location */}
      <TouchableOpacity style={styles.optionItem} onPress={onAddLocation}>
        <View style={styles.optionIconContainer}>
          <Text style={styles.optionIconText}>📍</Text>
        </View>
        <Text style={styles.optionText}>Add Location</Text>
        <Text style={styles.chevronRight}>›</Text>
      </TouchableOpacity>

      {/* Submit FAB */}
      <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
        {/* <Image
          source={images.arrowRight || require('../../assets/arrow-right.png')}
          style={styles.submitIcon}
        /> */}
        <ArrowRight style={styles.submitIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00A8A8', // Teal color as in screenshot
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: '#888888',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  cancelText: {
    fontSize: 14,
    color: '#666666',
  },
  contentContainer: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  imageContainer: {
    width: '100%',
    height: vh * 20,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#888888',
    fontSize: 16,
  },
  descriptionOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
    padding: 8,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    textAlignVertical: 'top',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 16,
    color: '#888888',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
  },
  chevronRight: {
    fontSize: 20,
    color: '#CCCCCC',
  },
  submitButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A8A8', // Teal color as in screenshot
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default CardComponent;
