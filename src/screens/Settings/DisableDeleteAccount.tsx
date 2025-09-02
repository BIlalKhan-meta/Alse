import React, {useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Text,
  ActivityIndicator,
} from 'react-native';
import styles from './styles';
import GlobalHeader from '../../components/GlobalHeader';
import InterBoldLabel from '../../components/Text/InterBoldLabel';
import InterRegular from '../../components/Text/InterRegular';
import {colors} from '../../utils/theme';
import {deleteAccount} from '../../api/settings';
import Toast from 'react-native-toast-message';

const DisableDeleteAccount = ({navigation}: any) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteAccount();

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Account deleted successfully',
        });

        // Close modal and navigate back
        setShowDeleteModal(false);

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Delete account error:', error);

      let errorMessage = 'Failed to delete account. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDisableAccount = () => {
    // TODO: Implement disable account API call
    console.log('Disabling account...');
    setShowDisableModal(false);
    // Navigate back or to login screen
    navigation.goBack();
  };

  const ConfirmationModal = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
  }: {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <InterBoldLabel style={styles.modalTitle}>{title}</InterBoldLabel>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={{fontSize: 24, color: colors.lightGrey}}>×</Text>
            </TouchableOpacity>
          </View>

          <InterRegular style={styles.modalMessage}>{message}</InterRegular>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}>
              <InterRegular style={styles.modalCancelButtonText}>
                Cancel
              </InterRegular>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={onConfirm}
              disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator color="white" />
              ) : (
                <InterRegular style={styles.modalConfirmButtonText}>
                  {confirmText}
                </InterRegular>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <GlobalHeader icon={true} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Screen Title */}
        <View style={styles.languageHeader}>
          <InterBoldLabel style={styles.languageTitle}>
            Disable or Delete Account
          </InterBoldLabel>
        </View>

        {/* Buttons Container */}
        <View style={styles.settingsContainer}>
          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={() => setShowDeleteModal(true)}>
            <InterRegular style={styles.deleteAccountButtonText}>
              Delete your account
            </InterRegular>
          </TouchableOpacity>

          {/* Disable Account Button */}
          <TouchableOpacity
            style={styles.disableAccountButton}
            onPress={() => setShowDisableModal(true)}>
            <InterRegular style={styles.disableAccountButtonText}>
              Disable your Account
            </InterRegular>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete Account"
      />

      {/* Disable Account Confirmation Modal */}
      <ConfirmationModal
        visible={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={handleDisableAccount}
        title="Disable Account"
        message="Are you sure you want to disable your account? You can reactivate it later by logging in."
        confirmText="Disable Account"
      />
    </View>
  );
};

export default DisableDeleteAccount;
