import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  dots: {
    padding: 10,
  },
  modalBackground: {
    alignItems: 'center',
    width: 120,
    position: 'absolute',
    right: 15,
    zIndex: 100,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingVertical: 10,
  },
  modalOption: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  optionText: {
    color: '#65676B',
    fontSize: 14,
  },
});

export default styles;
