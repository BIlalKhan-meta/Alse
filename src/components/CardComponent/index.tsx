// CardComponent.tsx
import React from 'react';
import { View, TextInput, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { images } from '../../utils/images';
import { colors } from '../../utils/theme';
import Card from '../Card';
import RegularTextInput from '../TextInput/RegularTextInput';

const CardComponent: React.FC = () => {
  return (
    <Card>
    <View style={styles.card}>
      <Image
        source={images.user}
        style={styles.avatar}
      />
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor={colors.inputText}
      />


    </View>
     <View style={styles.uploadOptions}>
     <TouchableOpacity style={styles.button}>
       <Image
         source={images.video}
         style={styles.buttonIcon}
       />
       <Text style={styles.buttonText}> Video</Text>
     </TouchableOpacity>
     <TouchableOpacity style={styles.button}>
       <Image
         source={images.media}
         style={styles.buttonIcon2}
       />
       <Text style={styles.buttonText}> Image</Text>
     </TouchableOpacity>
   </View>
   </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputcolor,
    padding: 10,
    borderRadius: 10,
 
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputcolor,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonIcon: {
    width: 17,
    height: 10,
  },
  buttonIcon2: {
    width: 16,
    height: 15,
  },
  buttonText: {
    color: colors.inputText,
    fontSize: 16,
    marginLeft: 5,
  },
});

export default CardComponent;
