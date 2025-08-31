import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import styles from './styles';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';
import {useAppTranslation} from '../../i18n/hooks/useAppTranslation';
import GlobalHeader from '../../components/GlobalHeader';

const BiddingAuctionSetting = () => {
  const user = useSelector(selectUserProfile);
  const {t} = useAppTranslation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Language Selection Header */}
      </ScrollView>
    </View>
  );
};

export default BiddingAuctionSetting;
