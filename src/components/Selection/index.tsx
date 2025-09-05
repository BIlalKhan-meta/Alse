import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../../utils/theme';
import {fontSizes, vh, vw} from '../../constant';
import {useTranslation} from 'react-i18next';

interface SelectionProps {
  options: string[];
  selectedOption: string | null;
  setSelectedOption: (option: string) => void;
  mode: 'color' | 'size';
}

const Selection: React.FC<SelectionProps> = ({
  options,
  selectedOption,
  setSelectedOption,
  mode,
}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {mode === 'color' ? t('color') : t('size')}:{' '}
      </Text>
      <View style={styles.buttonRow}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.button,
              selectedOption === option && styles.selectedButton,
            ]}
            onPress={() => setSelectedOption(option)}>
            <Text
              style={[
                styles.optionText,
                // mode === 'color' && { color: option },
                selectedOption === option && styles.selectedText,
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 20,
    flexDirection: 'row',
    marginVertical: vh * 1,
  },
  heading: {
    fontSize: fontSizes.f14,
    color: colors.black,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    // padding: 10,
    // borderRadius: 5,
    // borderWidth: 2,
    // borderColor: 'transparent',
  },
  selectedButton: {
    // borderColor: 'black',
    // borderWidth: 2,
  },
  optionText: {
    fontSize: fontSizes.f14,
    color: colors.black,
    paddingLeft: vw * 2,
  },
  selectedText: {
    color: colors.themeColor,
  },
});

export default Selection;
