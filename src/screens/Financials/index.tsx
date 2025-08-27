import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {colors} from '../../utils/theme';
import {useNavigation} from '@react-navigation/native';
import {
  MessageCircle,
  Settings,
  Mail,
  Download,
  ChevronDown,
  Info,
} from 'lucide-react-native';
import GlobalHeader from '../../components/GlobalHeader';

const {width} = Dimensions.get('window');

const Financials: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPeriod] = useState('Weekly');

  // Dummy data for the graphs
  const graphData = [65, 45, 80, 60, 75, 85, 70, 90, 65, 55, 80, 75];

  const renderBarChart = () => {
    // Realistic financial data points
    const dataPoints = [45, 52, 48, 65, 58, 72, 68, 85, 78, 92, 88, 95, 98];
    const maxValue = Math.max(...dataPoints);
    const graphWidth = width - 120;
    const graphHeight = 140;
    const barWidth = graphWidth / dataPoints.length - 4; // Space between bars

    return (
      <View style={styles.lineGraphContainer}>
        <View style={styles.lineGraph}>
          {/* Background area */}
          <View style={styles.lineGraphArea} />

          {/* Horizontal grid lines */}
          <View style={styles.chartLines}>
            {[0, 1, 2, 3, 4].map((line, index) => (
              <View
                key={`horizontal-${index}`}
                style={[
                  styles.gridLine,
                  {
                    top: (graphHeight / 4) * index,
                    width: '100%',
                  },
                ]}
              />
            ))}
          </View>

          {/* Bar chart */}
          <View style={styles.barChartContainer}>
            {dataPoints.map((value, index) => {
              const barHeight = (value / maxValue) * graphHeight;
              const barX = (graphWidth / dataPoints.length) * index + 2;

              return (
                <View
                  key={index}
                  style={[
                    styles.bar,
                    {
                      left: barX,
                      bottom: 0,
                      width: barWidth,
                      height: barHeight,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>R</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.dateText}>Wed 23 March</Text>
            <Text style={styles.userName}>Razor</Text>
          </View>
        </View>

        {/* Account Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Account Balance</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Info size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>$420,000.452</Text>
          <TouchableOpacity
            style={styles.withdrawalButton}
            onPress={() => navigation.navigate('Withdrawal')}>
            <Text style={styles.withdrawalButtonText}>Withdrawal Amount</Text>
          </TouchableOpacity>
        </View>

        {/* Total Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <View style={styles.earningsTitleSection}>
              <Text style={styles.earningsTitle}>Total Earnings</Text>
              <Text style={styles.earningsAmount}>$420,000</Text>
            </View>
            <View style={styles.earningsActions}>
              <TouchableOpacity style={styles.exportButton}>
                <Download size={14} color="white" />
                <Text style={styles.exportButtonText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.periodButton}>
                <Text style={styles.periodButtonText}>{selectedPeriod}</Text>
                <ChevronDown size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.graphSection}>
            {renderBarChart()}
            <View style={styles.graphLabels}>
              <Text style={styles.graphLabel}>M</Text>
              <Text style={styles.graphLabel}>T</Text>
              <Text style={styles.graphLabel}>W</Text>
              <Text style={styles.graphLabel}>T</Text>
              <Text style={styles.graphLabel}>F</Text>
              <Text style={styles.graphLabel}>S</Text>
              <Text style={styles.graphLabel}>S</Text>
            </View>
            <View style={styles.xAxisLabels}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(num => (
                <Text key={num} style={styles.xAxisLabel}>
                  {num}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Net Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <View style={styles.earningsTitleSection}>
              <Text style={styles.earningsTitle}>Net Earnings</Text>
              <Text style={styles.earningsAmount}>$420,000</Text>
            </View>
            <View style={styles.earningsActions}>
              <TouchableOpacity style={styles.exportButton}>
                <Download size={14} color="white" />
                <Text style={styles.exportButtonText}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.periodButton}>
                <Text style={styles.periodButtonText}>{selectedPeriod}</Text>
                <ChevronDown size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.graphSection}>
            {renderBarChart()}
            <View style={styles.graphLabels}>
              <Text style={styles.graphLabel}>M</Text>
              <Text style={styles.graphLabel}>T</Text>
              <Text style={styles.graphLabel}>W</Text>
              <Text style={styles.graphLabel}>T</Text>
              <Text style={styles.graphLabel}>F</Text>
              <Text style={styles.graphLabel}>S</Text>
              <Text style={styles.graphLabel}>S</Text>
            </View>
            <View style={styles.xAxisLabels}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(num => (
                <Text key={num} style={styles.xAxisLabel}>
                  {num}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    // backgroundColor: colors.themeColor,
    paddingTop: 3,
    paddingBottom: 10,
    paddingHorizontal: 10,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceCard: {
    backgroundColor: colors.themeColor,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  balanceTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  infoButton: {
    padding: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  withdrawalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  earningsCard: {
    backgroundColor: colors.themeColor,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  earningsTitleSection: {
    flex: 1,
  },
  earningsTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    marginBottom: 5,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  earningsActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  exportButtonText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonText: {
    fontSize: 12,
    color: 'white',
    marginRight: 4,
    fontWeight: '500',
  },
  graphSection: {
    height: 240,
    position: 'relative',
  },
  lineGraphContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineGraph: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  lineGraphArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  chartLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dataLineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dataPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
    zIndex: 10,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
    zIndex: 5,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
  },
  barChartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  graphLabels: {
    position: 'absolute',
    left: 10,
    top: 0,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 15,
    width: 60,
  },
  graphLabel: {
    fontSize: 10,
    color: 'white',
    transform: [{rotate: '-90deg'}],
    textAlign: 'center',
    width: 40,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  xAxisLabel: {
    fontSize: 10,
    color: 'white',
  },
});

export default Financials;
