// Home.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Button, } from 'react-native';
import { images } from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../../components/HeaderComponent';
import styles from './styles';
import BottomModal from '../../components/BottomModel';
import Video from 'react-native-video';
import ImagePickerComponent from '../../components/ImagePickerComponent';
import useImagePicker from '../../hooks/useImagePicker';

const CreatePost: React.FC = () => {
  const navigation = useNavigation();

  const [bottomVisible, setbottomVisible] = useState<boolean>(true)
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const { image, captureImage, chooseImageFromLibrary } = useImagePicker();
  const handleSelectMedia = (mediaUri: string) => {
    setSelectedMedia(mediaUri);
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>

        {/* <HeaderComponent
          label={'News Feed'}
          onBackPress={() => navigation.goBack()}
          notifiVisible={true}
          searchVisible={true}
        /> */}


        <CardComponent
          onImagePress={() => setbottomVisible(true)}
          onVideoPress={() => setbottomVisible(true)}
        />
        <BottomModal
          visible={bottomVisible}
          closeModal={() => setbottomVisible(false)}

          onPressImage={() => chooseImageFromLibrary()}
          onPress={() => captureImage('video')}


        />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        {/* <Button title="Capture Photo" onPress={() => captureImage('photo')} />
        <Button title="Capture Video" onPress={() => captureImage('video')} />
        <Button title="Choose from Library" onPress={() => chooseImageFromLibrary()} /> */}

        {/* <View
        // style={styles.container}
        >
          {selectedMedia && mediaType === 'photo' && (
            <Image source={{ uri: selectedMedia }} style={styles.media} />
          )}

          {selectedMedia && mediaType === 'video' && (
            <Video
              source={{ uri: selectedMedia }}
              style={styles.media}
              controls
              resizeMode="contain"
            />
          )}

          <ImagePickerComponent
            mediaType={mediaType}
            onSelectMedia={handleSelectMedia}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button2}
              onPress={() => setMediaType('photo')}
            >
              <Text>Choose Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button2}
              onPress={() => setMediaType('video')}
            >
              <Text>Choose Video</Text>
            </TouchableOpacity>
          </View>
        </View> */}

      </View>
    </ScrollView>
  );
};



export default CreatePost;
