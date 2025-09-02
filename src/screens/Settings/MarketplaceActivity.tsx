import React from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import InterLightAverage from '../../components/Text/InterLightAverage';
import {ChevronRight} from 'lucide-react-native';
import {colors} from '../../utils/theme';

const MarketplaceActivity = ({navigation}: any) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Marketplace Activity Header */}
        <View style={styles.languageHeader}>
          <InterLightAverage style={styles.languageTitle}>
            Marketplace Activity
          </InterLightAverage>
        </View>

        {/* Navigation Items Container */}
        <View style={styles.settingsContainer}>
          {/* View Purchase History */}
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('PurchaseHistory')}>
            <InterLightAverage style={styles.navigationItemText}>
              View Purchase History
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>

          {/* Saved Auctions */}
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('SavedAuctions')}>
            <InterLightAverage style={styles.navigationItemText}>
              Saved Auctions
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>

          {/* Shipping address */}
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={() => navigation.navigate('ShippingAddress')}>
            <InterLightAverage style={styles.navigationItemText}>
              Shipping address
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>

          {/* Linked Payment Methods */}
          <TouchableOpacity style={styles.navigationItem}>
            <InterLightAverage style={styles.navigationItemText}>
              Linked Payment Methods
            </InterLightAverage>
            <View style={styles.navigationArrow}>
              <ChevronRight size={20} color={colors.lightGrey} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default MarketplaceActivity;
