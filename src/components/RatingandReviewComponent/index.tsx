import React from 'react';
import { FlatList, Image, View, StyleSheet, Text } from 'react-native';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';

import { images } from '../../utils/images';
import HorizontalSeparator from '../HorizontalSeparator';
import { reviews } from '../../dummyData';
import InterBoldLabel from '../Text/InterBoldLabel';
import InterRegularSmallest from '../Text/InterRegularSmallest';

interface Review {
  id: number;
  userAvatar: string;
  userName: string;
  rating: number;
  reviewText: string;
  date: string;
}



const RatingandReviewComponent: React.FC = () => {
  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.mainContainer} key={item.id}>
      <View style={styles.ratingPersonInfoContainer}>
        <Image source={images.user} style={styles.avatar} />
        <View style={styles.nameContainer}>
          <InterBoldLabel style={styles.name}>{item.userName}</InterBoldLabel>
          <View style={styles.starCon}>
            <Image source={images.ratingstaricon} style={styles.starIcon} />
            <InterRegularSmallest style={styles.rating}>{item.rating}</InterRegularSmallest>
          </View>
        </View>
      </View>
      <InterRegularSmallest style={styles.reviewText}>{item.reviewText}</InterRegularSmallest>
      <InterRegularSmallest style={styles.date}>{item.date}</InterRegularSmallest>
      <HorizontalSeparator />
    </View>
  );


  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        style={styles.flatList} 
      />
   </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: vh * 1,
    paddingHorizontal: vw * 2,
    flex: 1,
    
  },
  listContainer: {
    paddingBottom: vh * 2,
  },
  mainContainer: {
    width: vw * 94,
    paddingHorizontal: vw * 2,
    paddingTop: vh * 1,
  },
  ratingPersonInfoContainer: {
    flexDirection: 'row',
  },
  name: {
    marginLeft: vw * 1,
  },
  nameContainer: {
    marginLeft: vw * 1,
  },
  date: {
    marginTop: vh * 0.6,
    color: colors.veryLightGray,
  },
  reviewText: {
    color: colors.veryLightGray,
  },
  avatar: {
    width: vw * 10,
    height: vh * 5,
  },
  starCon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    width: vw * 3,
    height: vh * 1.5,
  },
  rating: {
    marginLeft: vw * 0.5,
  },
  flatList: {
    flex: 1,
  }
});

export default RatingandReviewComponent;
