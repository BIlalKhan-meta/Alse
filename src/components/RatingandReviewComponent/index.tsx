import React, {useEffect, useState} from 'react';
import {FlatList, Image, View, StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import {images} from '../../utils/images';
import HorizontalSeparator from '../HorizontalSeparator';
import InterBoldLabel from '../Text/InterBoldLabel';
import InterRegularSmallest from '../Text/InterRegularSmallest';
import {productRating} from '../../api/product';
import {EmptyComponent} from '../EmptyComponent';
import Loader from '../Loader';

type RatingandReviewComponentProps = {
  id?: number | string;
  embedded?: boolean;
};

const RatingandReviewComponent: React.FC<RatingandReviewComponentProps> = ({
  id,
  embedded = false,
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const getData = async () => {
      setLoading(true);
      try {
        const res = await productRating(id);
        if (!cancelled && res?.data) {
          setReviews(res?.data?.data?.data ?? []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const renderReviewItem = (item: any) => (
    <View style={styles.mainContainer} key={String(item.id)}>
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

  if (reviews.length === 0) {
    return <EmptyComponent text={'No Reviews Available'} />;
  }

  if (embedded) {
    return <View style={styles.container}>{reviews.map(renderReviewItem)}</View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={({item}) => renderReviewItem(item)}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<EmptyComponent text={'No Reviews Available'} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: vh * 1,
    paddingHorizontal: vw * 2,
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
});

export default RatingandReviewComponent;
