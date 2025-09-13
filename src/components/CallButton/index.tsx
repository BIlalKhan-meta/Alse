import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {Phone, Video, Mic} from 'lucide-react-native';
import {colors} from '../../utils/theme';
import {vw, vh} from '../../constant';

interface CallButtonProps {
  onPress: () => void;
  callType: 'video' | 'audio' | 'phone';
  disabled?: boolean;
  size?: number;
}

const CallButton: React.FC<CallButtonProps> = ({
  onPress,
  callType,
  disabled = false,
  size = 20,
}) => {
  const getIcon = () => {
    switch (callType) {
      case 'video':
        return <Video size={size} color={disabled ? '#999' : colors.white} />;
      case 'audio':
        return <Mic size={size} color={disabled ? '#999' : colors.white} />;
      case 'phone':
        return <Phone size={size} color={disabled ? '#999' : colors.white} />;
      default:
        return <Phone size={size} color={disabled ? '#999' : colors.white} />;
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return '#E0E0E0';
    switch (callType) {
      case 'video':
        return '#4CAF50';
      case 'audio':
        return '#2196F3';
      case 'phone':
        return '#FF9800';
      default:
        return colors.themeColor;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}>
      {getIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: vw * 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default CallButton;
