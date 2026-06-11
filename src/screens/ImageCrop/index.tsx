import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ImageCropRouteParams} from '../../types/mediaEditor';
import {openNativeImageCropper} from '../../utils/mediaEditor';
import styles from './styles';

const ImageCropScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {t} = useTranslation();
  const {imageUri, editorParams} = (route.params ?? {}) as ImageCropRouteParams;
  const hasOpened = useRef(false);

  useEffect(() => {
    if (hasOpened.current || !imageUri) {
      return;
    }
    hasOpened.current = true;

    const run = async () => {
      const croppedUri = await openNativeImageCropper(imageUri);
      if (croppedUri) {
        navigation.navigate({
          name: 'MediaEditor',
          params: {
            ...editorParams,
            croppedUri,
            workingUri: croppedUri,
          },
          merge: true,
        });
        return;
      }
      navigation.goBack();
    };

    void run();
  }, [editorParams, imageUri, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#20B2AA" />
      <Text style={styles.message}>{t('openingCropper')}</Text>
    </View>
  );
};

export default ImageCropScreen;
