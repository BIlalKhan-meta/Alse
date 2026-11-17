import {ChevronDown, ChevronRight} from 'lucide-react-native';
import React, {useMemo, useState} from 'react';
import {
  View,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import InterLight from '../../../components/Text/InterLight';
import {colors} from '../../../utils/theme';
import styles from '../styles';
import InterBold from '../../../components/Text/InterBold';
import FilterSelectModal from '../../../components/FilterSelectModal';

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
  const [selectOpen, setSelectOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const match = options.find(opt => opt.value === value);
    return match?.label ?? String(value ?? '');
  }, [options, value]);

  if (type === 'navigation' || showChevron) {
    return (
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
    );
  }

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
                value={Boolean(value)}
                onValueChange={onToggle}
                trackColor={{false: '#E5E7EB', true: colors.themeColor}}
                thumbColor="#ffffff"
                ios_backgroundColor="#E5E7EB"
              />
            )}
          </View>
        )}

        {type === 'select' && (
          <TouchableOpacity
            style={styles.selectWrapper}
            activeOpacity={0.7}
            disabled={loading}
            onPress={() => setSelectOpen(true)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.themeColor} />
            ) : (
              <>
                <InterBold style={styles.selectButtonText}>
                  {selectedLabel}
                </InterBold>
                <ChevronDown size={16} color={colors.lightGrey} />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {type === 'select' ? (
        <FilterSelectModal
          visible={selectOpen}
          onClose={() => setSelectOpen(false)}
          title={title}
          items={options}
          selectedValue={String(value ?? '')}
          onSelect={next => onValueChange?.(next)}
        />
      ) : null}
    </>
  );
};

export default SettingsItem;
