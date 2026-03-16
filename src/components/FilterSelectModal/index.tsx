import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import {X} from 'lucide-react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface FilterItem {
  label: string;
  value: string;
}

interface FilterSelectModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: FilterItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const FilterSelectModal: React.FC<FilterSelectModalProps> = ({
  visible,
  onClose,
  title,
  items,
  selectedValue,
  onSelect,
}) => {
  const handleSelect = (item: FilterItem) => {
    onSelect(item.value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
              style={styles.closeButton}>
              <X size={22} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={item => item.value}
            style={styles.list}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedValue === item.value && styles.listItemSelected,
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.listItemLabel,
                    selectedValue === item.value && styles.listItemLabelSelected,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.88,
    maxHeight: SCREEN_HEIGHT * 0.5,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    maxHeight: SCREEN_HEIGHT * 0.4,
    backgroundColor: '#ffffff',
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    backgroundColor: '#ffffff',
  },
  listItemSelected: {
    backgroundColor: '#f0f8ff',
  },
  listItemLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  listItemLabelSelected: {
    color: '#00A19D',
    fontWeight: '600',
  },
});

export default FilterSelectModal;
