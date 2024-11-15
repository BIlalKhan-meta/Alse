import React, {useEffect, useState} from 'react';
import {FlatList, Image, View, StyleSheet, Text} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';

import {images} from '../../utils/images';
import HorizontalSeparator from '../HorizontalSeparator';
import {reviews} from '../../dummyData';
import InterBoldLabel from '../Text/InterBoldLabel';
import InterRegularSmallest from '../Text/InterRegularSmallest';
import InterRegular from '../Text/InterRegular';
import {productRating} from '../../api/product';
import {EmptyComponent} from '../EmptyComponent';
import Loader from '../Loader';

interface Review {
  id: number;
  userAvatar: string;
  userName: string;
  rating: number;
  reviewText: string;
  date: string;
}

const RatingandReviewComponent: React.FC = ({id}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [id]);

  const getData = async () => {
    setLoading(true);
    await productRating(id).then(res => {
      if (res?.data) {
        setReviews(res?.data?.data?.data);
      }
    });
    setLoading(false);
  };

  const renderReviewItem = ({item}) => (
    <View style={styles.mainContainer} key={item.id}>
      <View style={styles.ratingPersonInfoContainer}>
        <Image
          source={item?.avatar ? {uri: item?.avatar} : images.user}
          style={styles.avatar}
        />
        <View style={styles.nameContainer}>
          <InterBoldLabel style={styles.name}>{item.username}</InterBoldLabel>
          <View style={styles.starCon}>
            <Image source={images.ratingstaricon} style={styles.starIcon} />
            <InterRegularSmallest style={styles.rating}>
              {item.rating}
            </InterRegularSmallest>
          </View>
        </View>
      </View>
      <InterRegularSmallest style={styles.reviewText}>
        {item.review}
      </InterRegularSmallest>
      <InterRegularSmallest style={styles.date}>
        {item.date}
      </InterRegularSmallest>
      <HorizontalSeparator />
    </View>
  );

  if (loading) {
    return <Loader />;
  }

  if (reviews.length == 0) {
    return <EmptyComponent text={'No Reviews Available'} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={props?.reviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: vh * 1,
    paddingHorizontal: vw * 2,
    // flex: 1,
    flexGrow: 1,
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
  },
});

export default RatingandReviewComponent;
