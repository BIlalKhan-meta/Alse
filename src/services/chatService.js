import firestore from '@react-native-firebase/firestore';

/**
 * Service module for handling chat-related Firestore operations
 */

const CHAT_COLLECTION = 'liveStreamChats';
const MESSAGE_LIMIT = 50;

/**
 * Archives chat messages when a stream ends
 * @param {string} channelId - The ID of the channel to archive
 * @param {string} userId - The ID of the host user
 * @returns {Promise<void>}
 */
export const archiveChatMessages = async (channelId, userId) => {
  if (!channelId) return;
  
  try {
    // Set a flag in the channel document to mark it as archived
    await firestore()
      .collection(CHAT_COLLECTION)
      .doc(channelId)
      .set({ 
        archived: true,
        archivedAt: firestore.FieldValue.serverTimestamp(),
        hostId: userId
      }, { merge: true });
    
    console.log("Chat archive completed for channel:", channelId);
  } catch (error) {
    console.error("Error archiving chat:", error);
    throw error;
  }
};

/**
 * Deletes a specific message from the chat
 * Only the message author or host can delete messages
 * @param {string} channelId - The channel ID
 * @param {string} messageId - The message ID to delete
 * @param {string} userId - The current user's ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteChatMessage = async (channelId, messageId, userId) => {
  if (!channelId || !messageId || !userId) return false;
  
  try {
    const messageRef = firestore()
      .collection(CHAT_COLLECTION)
      .doc(channelId)
      .collection('messages')
      .doc(messageId);
    
    const messageDoc = await messageRef.get();
    
    // Only allow deletion if user is the message author
    if (messageDoc.exists && messageDoc.data().userId === userId) {
      await messageRef.delete();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

/**
 * Batch updates channel messages that match a condition
 * Useful for admin operations like banning users
 * @param {string} channelId - The channel ID
 * @param {Function} condition - Function that takes a message and returns true if it should be updated
 * @param {Object} updates - The updates to apply to matching messages
 * @returns {Promise<number>} - Number of messages updated
 */
export const batchUpdateMessages = async (channelId, condition, updates) => {
  if (!channelId || !condition || !updates) return 0;
  
  try {
    const messagesRef = firestore()
      .collection(CHAT_COLLECTION)
      .doc(channelId)
      .collection('messages');
    
    const snapshot = await messagesRef.get();
    
    const batch = firestore().batch();
    let count = 0;
    
    snapshot.forEach(doc => {
      const message = doc.data();
      if (condition(message)) {
        batch.update(doc.ref, updates);
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
    }
    
    return count;
  } catch (error) {
    console.error('Error batch updating messages:', error);
    return 0;
  }
};