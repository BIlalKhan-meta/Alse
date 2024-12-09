import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {colors} from '../../../utils/theme';

interface Category {
  id: number;
  title: string;
  status: number;
  total_videos_count: number;
}

interface CategoryDropdownComponentProps {
  categories: [];
  placeholder: string;
  defaultValue?: number;
  onChangeCategory?: (id: number | null) => void;
  style?: StyleProp<ViewStyle>;
}

const CategoryDropdownComponent: React.FC<CategoryDropdownComponentProps> = ({
  categories,
  placeholder,
  defaultValue = null,
  onChangeCategory,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(defaultValue);
  const [categoryItems, setCategoryItems] = useState<
    {label: string; value: number}[]
  >([]);

  useEffect(() => {
    // Initialize categoryItems when categories change
    const formattedItems = categories.map(category => ({
      label: category.title,
      value: category.id,
    }));
    setCategoryItems(formattedItems);

    if (categories.length > 0) {
      setValue(categories[0].id);
    }
  }, [categories]);

  return (
    <DropDownPicker
      open={open}
      value={defaultValue ? defaultValue : value}
      items={categoryItems}
      setOpen={setOpen}
      setValue={val => {
        setValue(val);
        if (onChangeCategory) {
          onChangeCategory(val);
        }
      }}
      setItems={setCategoryItems}
      placeholder={placeholder}
      style={[styles.dropdown, style]}
      iconContainerStyle={{backgroundColor: colors.pattenBlue}}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#C7EEFF',
    borderRadius: 10,
    // opacity: 0.3,
    color: 'red',
  },
});

export default CategoryDropdownComponent;
