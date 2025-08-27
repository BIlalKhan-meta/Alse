import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../utils/theme';
import {
  ChevronLeft,
  X,
  Handshake,
  ArrowLeft,
  ArrowRight,
  Download,
} from 'lucide-react-native';

const WithdrawalSuccess: React.FC = () => {
  const navigation = useNavigation();

  const handleDownload = () => {
    // Handle download receipt
    console.log('Downloading receipt...');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <X size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <View style={styles.successIcon}>
            <Handshake size={32} color="#FFD700" />
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.successMessageContainer}>
          <Text style={styles.congratulationsText}>Congratulations</Text>
          <Text style={styles.successText}>Withdrawal Successful</Text>
        </View>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>$420,000</Text>
        </View>

        {/* Withdrawal Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>12 July 25</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>10:00 AM</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Comrade's name:</Text>
            <Text style={styles.detailValueHighlighted}>Alse</Text>
          </View>
        </View>

        {/* Separator Line */}
        <View style={styles.separatorContainer}>
          <ArrowLeft size={16} color={colors.themeColor} />
          <View style={styles.dashedLine} />
          <ArrowRight size={16} color={colors.themeColor} />
        </View>

        {/* Barcode */}
        <View style={styles.barcodeContainer}>
          <View style={styles.barcode}>
            {/* Barcode representation */}
            <View style={styles.barcodeLines}>
              {[
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20,
              ].map((line, index) => (
                <View
                  key={index}
                  style={[styles.barcodeLine, {width: Math.random() * 3 + 1}]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Receipt ID */}
        <View style={styles.receiptContainer}>
          <Text style={styles.receiptLabel}>Receipt ID:</Text>
          <Text style={styles.receiptValue}>83EBYBY:ALSE&NELDEVF70</Text>
        </View>

        {/* Download Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownload}>
          <Download size={20} color="white" style={styles.downloadIcon} />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.themeColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMessageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  congratulationsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#666',
  },
  amountContainer: {
    backgroundColor: 'rgba(12, 149, 155, 0.1)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.themeColor,
  },
  detailsContainer: {
    marginTop: 30,
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailValueHighlighted: {
    fontSize: 16,
    color: colors.themeColor,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.themeColor,
    marginHorizontal: 10,
    borderStyle: 'dashed',
  },
  barcodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  barcode: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  barcodeLine: {
    height: '100%',
    backgroundColor: '#000',
    marginHorizontal: 1,
  },
  receiptContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  receiptValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  downloadButton: {
    backgroundColor: colors.themeColor,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  downloadIcon: {
    marginRight: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WithdrawalSuccess;
