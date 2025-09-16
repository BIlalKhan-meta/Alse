import {StyleSheet} from 'react-native';
import {fontSizes, vh, vw} from '../../constant';
import {colors} from '../../utils/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    marginHorizontal: vw * 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eef2f3',
    marginRight: 10,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  main: {
    flex: 1,
  },
  title: {
    color: colors.black,
    fontSize: fontSizes.f12,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    color: colors.darkGray,
    fontSize: fontSizes.f11,
  },
  status: {
    fontSize: fontSizes.f11,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7C7',
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});

export default styles;
