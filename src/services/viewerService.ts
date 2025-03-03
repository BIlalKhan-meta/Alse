import firestore from '@react-native-firebase/firestore';
import { GetLiveStreamUsers } from '../api/liveStream';

/**
 * Service for managing livestream viewer statistics
 */

const STATS_COLLECTION = 'liveStreamStats';

/**
 * Initialize viewer tracking for a channel
 * @param channelId The Agora channel ID
 * @returns Cleanup function
 */
export const initializeViewerTracking = (channelId: string): (() => void) => {
  if (!channelId) {
    console.error('No channel ID provided for viewer tracking');
    return () => {};
  }
  
  console.log(`Initializing viewer tracking for channel: ${channelId}`);
  
  // Create initial document if it doesn't exist
  firestore()
    .collection(STATS_COLLECTION)
    .doc(channelId)
    .set({
      channelId,
      viewerCount: 0,
      lastUpdated: firestore.FieldValue.serverTimestamp(),
      viewerPeak: 0,
      trackingStarted: firestore.FieldValue.serverTimestamp(),
    }, { merge: true })
    .catch(err => console.error('Error initializing viewer stats:', err));
  
  // Set up periodic polling of the Agora API to update viewer count
  const intervalId = setInterval(async () => {
    try {
      // Get current viewer count from Agora
      const { data } = await GetLiveStreamUsers(channelId);
      
      if (data?.data?.audience_total !== undefined) {
        const viewerCount = Math.max(0, data.data.audience_total);
        
        // Update viewer count in Firestore with transaction to ensure peak is calculated correctly
        const docRef = firestore().collection(STATS_COLLECTION).doc(channelId);
        
        await firestore().runTransaction(async (transaction) => {
          const doc = await transaction.get(docRef);
          if (!doc.exists) {
            // Create the document if it doesn't exist
            transaction.set(docRef, {
              channelId,
              viewerCount,
              viewerPeak: viewerCount,
              lastUpdated: firestore.FieldValue.serverTimestamp(),
              trackingStarted: firestore.FieldValue.serverTimestamp(),
            });
          } else {
            // Update existing document
            const currentData = doc.data() || {};
            const currentPeak = currentData.viewerPeak || 0;
            
            transaction.update(docRef, {
              viewerCount,
              viewerPeak: Math.max(currentPeak, viewerCount),
              lastUpdated: firestore.FieldValue.serverTimestamp(),
            });
          }
        });
        
        console.log(`Updated viewer count for channel ${channelId}: ${viewerCount}`);
      }
    } catch (error) {
      console.error('Error updating viewer count:', error);
    }
  }, 5000); // Update every 5 seconds
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log(`Stopped viewer tracking for channel: ${channelId}`);
  };
};

/**
 * Manually increment the viewer count (useful for joining events)
 * @param channelId The channel ID
 * @returns Promise resolving to the updated count
 */
export const incrementViewerCount = async (channelId: string): Promise<number> => {
  if (!channelId) return 0;
  
  try {
    const docRef = firestore().collection(STATS_COLLECTION).doc(channelId);
    
    const result = await firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (!doc.exists) {
        // Create document if it doesn't exist
        transaction.set(docRef, {
          channelId,
          viewerCount: 1,
          viewerPeak: 1,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
        return 1;
      } else {
        // Increment existing count
        const data = doc.data() || {};
        const newCount = (data.viewerCount || 0) + 1;
        const currentPeak = data.viewerPeak || 0;
        
        transaction.update(docRef, {
          viewerCount: newCount,
          viewerPeak: Math.max(currentPeak, newCount),
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
        
        return newCount;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error incrementing viewer count:', error);
    return 0;
  }
};

/**
 * Manually decrement the viewer count (useful for leave events)
 * @param channelId The channel ID
 * @returns Promise resolving to the updated count
 */
export const decrementViewerCount = async (channelId: string): Promise<number> => {
  if (!channelId) return 0;
  
  try {
    const docRef = firestore().collection(STATS_COLLECTION).doc(channelId);
    
    const result = await firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (!doc.exists) {
        // Document doesn't exist, nothing to decrement
        return 0;
      } else {
        // Decrement existing count, but don't go below 0
        const data = doc.data() || {};
        const newCount = Math.max(0, (data.viewerCount || 0) - 1);
        
        transaction.update(docRef, {
          viewerCount: newCount,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
        
        return newCount;
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error decrementing viewer count:', error);
    return 0;
  }
};

/**
 * Archive stream statistics when a stream ends
 * @param channelId The channel ID
 * @param hostId ID of the stream host
 */
export const archiveStreamStats = async (channelId: string, hostId: string): Promise<void> => {
  if (!channelId) return;
  
  try {
    // Get current stats document
    const statsDoc = await firestore().collection(STATS_COLLECTION).doc(channelId).get();
    
    if (statsDoc.exists) {
      const statsData = statsDoc.data() || {};
      
      // Create an archive record
      await firestore().collection('streamArchives').add({
        channelId,
        hostId,
        archivedAt: firestore.FieldValue.serverTimestamp(),
        stats: {
          ...statsData,
          finalViewerCount: statsData.viewerCount || 0,
          peakViewerCount: statsData.viewerPeak || 0,
        }
      });
      
      // Reset the live stats document
      await firestore().collection(STATS_COLLECTION).doc(channelId).update({
        viewerCount: 0,
        active: false,
        endedAt: firestore.FieldValue.serverTimestamp()
      });
      
      console.log('Archived stream stats for channel:', channelId);
    }
  } catch (error) {
    console.error('Error archiving stream stats:', error);
  }
};