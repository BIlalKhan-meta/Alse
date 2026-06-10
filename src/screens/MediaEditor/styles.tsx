import {Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    opacity: 0.45,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  doneButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20B2AA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  previewCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    aspectRatio: 4 / 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  previewInner: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaFill: {
    ...StyleSheet.absoluteFillObject,
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  cropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  aspectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  aspectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8E8E8',
  },
  aspectChipActive: {
    backgroundColor: '#20B2AA',
  },
  aspectChipText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  aspectChipTextActive: {
    color: '#FFF',
  },
  textOverlayBox: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
    maxWidth: '90%',
  },
  textOverlayInput: {
    color: '#000',
    fontSize: 13,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  videoControls: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  videoControlText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 80,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    paddingTop: 24,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIconWrap: {
    marginBottom: 6,
  },
  toolLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  toolLabelActive: {
    color: '#20B2AA',
    fontWeight: '700',
  },
  serifA: {
    fontSize: 32,
    fontWeight: '400',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  serifAActive: {
    color: '#20B2AA',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  queueIndicator: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
});

export default styles;
