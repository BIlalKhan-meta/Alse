import {Picker} from '@react-native-picker/picker';
import {ChevronDown, ChevronRight} from 'lucide-react-native';
import React, {useState} from 'react';
import {View, Switch, TouchableOpacity} from 'react-native';
import InterLight from '../../../components/Text/InterLight';
import InterRegular from '../../../components/Text/InterRegular';
import {colors} from '../../../utils/theme';
import styles from '../styles';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: any;
  value?: any;
  onToggle?: (value: any) => void;
  onValueChange?: (value: string) => void;
  type?: string; // 'switch', 'select', 'navigation'
  options?: {label: string; value: string}[];
  onPress?: () => void;
  showChevron?: boolean;
}

const SettingsItem = ({
  title,
  subtitle,
  icon: IconComponent,
  value,
  onToggle,
  onValueChange,
  type = 'switch',
  options = [],
  onPress,
  showChevron = false,
}: SettingsItemProps) => {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // For navigation items, wrap the entire content in TouchableOpacity
  if (type === 'navigation' || showChevron) {
    return (
      <>
        <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
          <View style={styles.settingsItemLeft}>
            {IconComponent && (
              <View style={styles.settingsIcon}>
                <IconComponent size={20} color={colors.lightGrey} />
              </View>
            )}
            <View style={styles.settingsTextContainer}>
              <InterRegular style={styles.settingsItemText}>
                {title}
              </InterRegular>
              {subtitle && (
                <InterLight style={styles.settingsItemSubtitle}>
                  {subtitle}
                </InterLight>
              )}
            </View>
          </View>
          <ChevronRight size={20} color={colors.lightGrey} />
        </TouchableOpacity>
      </>
    );
  }

  // For other types (switch, select), use the original structure
  return (
    <>
      <View style={styles.settingsItem}>
        <View style={styles.settingsItemLeft}>
          {IconComponent && (
            <View style={styles.settingsIcon}>
              <IconComponent size={20} color={colors.lightGrey} />
            </View>
          )}
          <View style={styles.settingsTextContainer}>
            <InterRegular style={styles.settingsItemText}>{title}</InterRegular>
            {subtitle && (
              <InterLight style={styles.settingsItemSubtitle}>
                {subtitle}
              </InterLight>
            )}
          </View>
        </View>

        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{false: '#E5E7EB', true: colors.themeColor}}
            thumbColor={value ? '#ffffff' : '#ffffff'}
            ios_backgroundColor="#E5E7EB"
          />
        )}

        {type === 'select' && (
          <TouchableOpacity
            onPress={() => setIsPickerVisible(true)}
            style={styles.selectButton}>
            <InterRegular style={styles.selectButtonText}>
              {options.find(opt => opt.value === value)?.label || value}
            </InterRegular>
            <ChevronDown size={16} color={colors.lightGrey} />
          </TouchableOpacity>
        )}
      </View>

      {/* Picker Modal for Select Type */}
      {type === 'select' && isPickerVisible && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity
              onPress={() => setIsPickerVisible(false)}
              style={styles.cancelButton}>
              <InterRegular style={styles.cancelText}>Cancel</InterRegular>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsPickerVisible(false)}
              style={styles.doneButton}>
              <InterRegular style={styles.doneText}>Done</InterRegular>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={styles.picker}>
            {options.map(option => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
      )}
    </>
  );
};

export default SettingsItem;
