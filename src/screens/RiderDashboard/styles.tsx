import {StyleSheet} from 'react-native';
import {vh, vw} from '../../constant';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    // paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    width: vw * 20,
    height: vh * 5,
    resizeMode: 'contain',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0C959B',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  earningsCard: {
    backgroundColor: '#0C959B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  earningsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  earningsPercentage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  earningsSubtitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  earningsDescription: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 16,
  },
  deliveryCount: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 16,
    textAlign: 'right',
  },
  chartContainer: {
    height: 100,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  routeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    backgroundColor: '#e8f4f8',
    position: 'relative',
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapWebView: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  mapDots: {
    flexDirection: 'row',
  },
  mapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginLeft: 4,
  },
  deliveriesSection: {
    marginBottom: 100,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deliveryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  deliveryInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: '#666666',
  },
  deliveryCenter: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  deliveryRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  categoryText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  moreButton: {
    padding: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  activeNavItem: {
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
  },
  navIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
  },
  profileDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
  },
});
