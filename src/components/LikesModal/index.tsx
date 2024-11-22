import {
  FlatList,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {colors} from '../../utils/theme';

import styles from './styles';
import {BlurView} from '@react-native-community/blur';

import {useEffect, useState} from 'react';
import {EmptyComponent} from '../EmptyComponent';
import InterBold from '../Text/InterBold';
import InterBoldLabel from '../Text/InterBoldLabel';
import InterRegularBold from '../Text/InterRegularBold';
import InterMediumAverage from '../Text/InterMediumAverage';
import {vh, vw} from '../../constant';
import Row from '../Row';
import InterMedium from '../Text/InterMedium';
import {images} from '../../utils/images';

interface LikessModalProps {
  visible: boolean;
  closeModal: () => void;
  likes: [];
}

const LikesModal: React.FC<LikessModalProps> = props => {
  const {visible, closeModal, likes} = props;
  const [likesData, setLikesData] = useState(likes);

  useEffect(() => {
    if (likes) {
      setLikesData(likes);
    }
  }, [likes]);

  const header = () => {
    return (
      <View>
        <InterBoldLabel>People Who Reacted</InterBoldLabel>
        <InterMediumAverage
          style={{marginVertical: vh * 2, color: colors.blue}}>
          All({likesData.length})
        </InterMediumAverage>
      </View>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        onRequestClose={closeModal}
        animationType="slide"
        transparent>
        <BlurView
          style={styles.absolute}
          blurType="dark"
          blurAmount={1}
          reducedTransparencyFallbackColor="white"
        />
        <TouchableOpacity style={styles.blurcontainer} onPress={closeModal} />
        <View style={styles.container}>
          <FlatList
            style={{flex: 1, width: '90%'}}
            showsVerticalScrollIndicator={false}
            data={likesData}
            keyExtractor={item => item?.id?.toString()}
            ListHeaderComponent={header}
            ListEmptyComponent={() => <EmptyComponent text={'No Likes'} />}
            renderItem={({item}) => {
              return (
                <View
                  style={{
                    borderTopWidth: 0.5,
                    borderBottomWidth: 0.5,
                    borderColor: colors.inputBorder,
                  }}>
                  <Row>
                    <View>
                      <Image
                        source={{uri: item?.user?.avatar}}
                        style={{
                          width: vh * 5,
                          height: vh * 5,
                          borderRadius: vh * 5,
                          resizeMode: 'cover',
                        }}
                      />
                      <View
                        style={{
                          width: vh * 2,
                          height: vh * 2,
                          borderRadius: vh * 2,
                          backgroundColor: colors.blue,
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                        }}>
                        <Image
                          source={images.likeFill}
                          style={{
                            width: '80%',
                            height: '80%',
                            tintColor: colors.white,
                          }}
                        />
                      </View>
                    </View>
                    <InterMedium
                      style={{marginHorizontal: vw * 3, color: colors.black}}>
                      {item?.user?.full_name ||
                        item?.user?.first_name + ' ' + item?.user?.last_name}
                    </InterMedium>
                  </Row>
                </View>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
};

export default LikesModal;
