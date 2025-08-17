import React, {useEffect, useRef} from 'react';
import {View, Animated, Easing} from 'react-native';
import {vw, vh} from '../../constant';
import styles from './styles';

const PostSkeleton = () => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnimatedValue]);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-vw * 100, vw * 100],
  });

  const SkeletonItem = ({width, height, borderRadius = 4, style = {}}) => (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: '#E1E9EE',
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}>
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.5)',
          transform: [{translateX}],
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonItem width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <SkeletonItem width={120} height={14} />
          <SkeletonItem width={80} height={12} style={{marginTop: 4}} />
        </View>
        <View style={{marginLeft: 'auto'}}>
          <SkeletonItem width={20} height={20} />
        </View>
      </View>

      {/* Post Image/Video */}
      <View style={{flexDirection: 'row'}}>
        <SkeletonItem
          width="100%"
          height={250}
          borderRadius={8}
          style={{marginTop: vh * 1, position: 'relative'}}
        />
        <View style={styles.engagementBar}>
          <SkeletonItem
            width={30}
            height={30}
            borderRadius={15}
            style={{backgroundColor: '#d2d5d6'}}
          />
          <SkeletonItem
            width={30}
            height={30}
            borderRadius={15}
            style={{backgroundColor: '#d2d5d6'}}
          />
          <SkeletonItem
            width={30}
            height={30}
            borderRadius={15}
            style={{backgroundColor: '#d2d5d6'}}
          />
        </View>
      </View>
      {/* Post Text */}
      <View style={styles.postText}>
        <SkeletonItem width="100%" height={12} />
        <SkeletonItem width="80%" height={12} style={{marginTop: 4}} />
        <SkeletonItem width="60%" height={12} style={{marginTop: 4}} />
      </View>
    </View>
  );
};

export default PostSkeleton;
