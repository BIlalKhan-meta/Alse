import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../../constant';
import {colors} from '../../../utils/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingTop: vh * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //   alignItems: 'center',
    marginBottom: 20,
  },

  gridContainer: {
    padding: 2,
    marginTop: vh * 2,
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  smallImagesColumn: {
    flexDirection: 'column',
  },
  smallGridItem: {
    width: (vw * 100 - 12) / 3,
    height: (vw * 100 - 12) / 3,
    margin: 1,
    overflow: 'hidden',
    borderRadius: 10,
  },
  largeGridItem: {
    width: ((vw * 100 - 12) / 3) * 2,
    height: ((vw * 100 - 8) / 3) * 2,
    margin: 1,
    overflow: 'hidden',
    borderRadius: 10,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0', // Placeholder color while loading
    borderRadius: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  profile: {
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  name: {
    fontSize: fontSizes.f24,
    color: colors.black,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: fontSizes.f12,
    color: colors.inputText,
    textAlign: 'center',
    marginBottom: vh * 4,
  },
  stats: {
    fontSize: fontSizes.f12,
    color: colors.black,
    marginBottom: vh & 2,
  },
  followButton: {
    width: vw * 80,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  threeDots: {
    width: 4,
    height: 19,
  },
  lockContainer: {
    marginVertical: vh * 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vh * 2,
  },
  lockTxt: {
    fontSize: fontSizes.f20,
    color: colors.black,
  },
});

export default styles;
