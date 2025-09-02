import {Picker} from '@react-native-picker/picker';
import {ChevronDown, ChevronRight} from 'lucide-react-native';
import React, {useState} from 'react';
import {
  View,
  Switch,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import InterLight from '../../../components/Text/InterLight';
import InterRegular from '../../../components/Text/InterRegular';
import {colors} from '../../../utils/theme';
import styles from '../styles';
import InterBold from '../../../components/Text/InterBold';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: any;
  value?: any;
  onToggle?: (value: any) => void;
  onValueChange?: (value: string) => void;
  type?: string; // 'switch', 'select', 'navigation'
  options?: {label: string; value: string}[];
  onPress?: () => void;
  showChevron?: boolean;
  loading?: boolean;
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
  loading = false,
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
              <InterBold style={styles.settingsItemText}>{title}</InterBold>
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
            <InterBold style={styles.settingsItemText}>{title}</InterBold>
            {subtitle && (
              <InterLight style={styles.settingsItemSubtitle}>
                {subtitle}
              </InterLight>
            )}
          </View>
        </View>

        {type === 'switch' && (
          <View style={styles.switchContainer}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.themeColor} />
            ) : (
              <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor={value ? '#ffffff' : '#ffffff'}
                ios_backgroundColor="#E5E7EB"
              />
            )}
          </View>
        )}

        {type === 'select' && (
          <View style={styles.selectWrapper}>
            <Picker
              selectedValue={value}
              onValueChange={onValueChange}
              mode="dropdown"
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor={colors.lightGrey}>
              {options.map(opt => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
            </Picker>
          </View>
        )}
      </View>
    </>
  );
};

export default SettingsItem;
