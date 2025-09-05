import {
  FlatList,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import styles from './styles';
import {BlurView} from '@react-native-community/blur';
import {useState} from 'react';
import {images} from '../../utils/images';
import InterMedium from '../Text/InterMedium';
import InterBold from '../Text/InterBold';
import HorizontalSeparator from '../HorizontalSeparator';
import React from 'react';
import {useTranslation} from 'react-i18next';

interface Reaction {
  id: number;
  userAvatar: string;
  userName: string;
  reactionType: 'all' | 'heart' | 'like'; // New property to distinguish reaction types
}

interface ReactModalProps {
  visible: boolean;
  closeModal: () => void;
  reactions: Reaction[];
}

const ReactModal: React.FC<ReactModalProps> = props => {
  const {visible, closeModal, reactions} = props;

  const [selectedTab, setSelectedTab] = useState<'all' | 'heart' | 'like'>(
    'all',
  );

  const {t} = useTranslation();

  // Example counts (replace with actual data)
  const allCount = reactions.length;
  const heartCount = reactions.filter(
    reaction => reaction.reactionType === 'heart',
  ).length;
  const likeCount = reactions.filter(
    reaction => reaction.reactionType === 'like',
  ).length;

  // Function to filter reactions based on selected tab
  const filteredReactions = () => {
    if (selectedTab === 'heart') {
      return reactions.filter(reaction => reaction.reactionType === 'heart');
    } else if (selectedTab === 'like') {
      return reactions.filter(reaction => reaction.reactionType === 'like');
    } else {
      return reactions; // Default to showing all reactions
    }
  };

  // Function to render a single reaction item
  const renderReactionItem = ({item}: {item: Reaction}) => (
    <>
      <View style={styles.reactionItem} key={item.id}>
        <View>
          <Image source={images.user} style={styles.reactionAvatar} />
          {item.reactionType === 'heart' && (
            <View style={styles.reactionIconCon}>
              <Image source={images.heartIcon} style={styles.reactionIcon} />
            </View>
          )}
          {item.reactionType === 'like' && (
            <View style={styles.reactionIconCon}>
              <Image source={images.likeFill} style={styles.reactionIcon} />
            </View>
          )}
        </View>
        <InterMedium style={styles.reactionUserName}>
          {item.userName}
        </InterMedium>
      </View>
      <HorizontalSeparator />
    </>
  );

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
          <InterBold style={styles.heading}>
            {t('reactionModel.whoReacted')}
          </InterBold>
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'all' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('all')}>
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'all' && styles.activeTabTxt,
                ]}>
                {t('reactionModel.all')} ({allCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'heart' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('heart')}>
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'heart' && styles.activeTabTxt,
                ]}>
                {t('reactionModel.heart')} ({heartCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                selectedTab === 'like' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('like')}>
              <Text
                style={[
                  styles.tabButtonText,
                  selectedTab === 'like' && styles.activeTabTxt,
                ]}>
                {t('reactionModel.like')} ({likeCount})
              </Text>
            </TouchableOpacity>
          </View>

          <HorizontalSeparator />

          <FlatList
            data={filteredReactions()}
            renderItem={renderReactionItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.reactionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
};

export default ReactModal;
