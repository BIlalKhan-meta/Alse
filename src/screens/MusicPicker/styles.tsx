import {Platform, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20B2AA',
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
  doneTextDisabled: {
    color: '#999',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  previewSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  previewCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  hiddenAudio: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  content: {
    paddingHorizontal: 20,
  },
  pickButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    marginBottom: 16,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20B2AA',
    textAlign: 'center',
  },
  trackCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E6EB',
    marginBottom: 16,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  trackMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  controlValue: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  sliderTrack: {
    height: 44,
    justifyContent: 'center',
    marginBottom: 18,
  },
  sliderRail: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#20B2AA',
  },
  sliderThumb: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#20B2AA',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  playButton: {
    backgroundColor: '#20B2AA',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default styles;
