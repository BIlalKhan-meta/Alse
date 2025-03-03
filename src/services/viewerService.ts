import firestore from '@react-native-firebase/firestore';

/**
 * Service for managing real-time livestream viewer statistics
 */

const STATS_COLLECTION = 'liveStreamStats';

/**
 * Initialize viewer tracking for a channel
 * This is called by the host when a stream starts
 * 
 * @param channelId The channel ID
 * @returns Cleanup function
 */
export const initializeViewerTracking = (channelId: string): (() => void) => {
  if (!channelId) {
    console.error('No channel ID provided for viewer tracking');
    return () => {};
  }
  
  console.log(`Initializing viewer tracking for channel: ${channelId}`);
  
  // Create initial document
  firestore()
    .collection(STATS_COLLECTION)
    .doc(channelId)
    .set({
      channelId,
      viewerCount: 0, // Start with 0 viewers
      lastUpdated: firestore.FieldValue.serverTimestamp(),
      viewerPeak: 0,
      trackingStarted: firestore.FieldValue.serverTimestamp(),
      active: true
    }, { merge: true })
    .catch(err => console.error('Error initializing viewer stats:', err));
  
  // Set up periodic cleanup to ensure accuracy - remove disconnected viewers
  const intervalId = setInterval(async () => {
    try {
      // Get all viewers and check their timestamps
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      const viewersRef = firestore()
        .collection(STATS_COLLECTION)
        .doc(channelId)
        .collection('viewers');
      
      // Get viewers who haven't updated in 5 minutes (likely disconnected)
      const staleViewers = await viewersRef
        .where('lastActive', '<', fiveMinutesAgo)
        .get();
        
      // Count how many we're removing
      const staleCount = staleViewers.size;
      
      if (staleCount > 0) {
        console.log(`Removing ${staleCount} stale viewers from ${channelId}`);
        
        // Create a batch for efficient updates
        const batch = firestore().batch();
        
        // Add all deletions to batch
        staleViewers.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Decrement the viewer count
        const statsRef = firestore().collection(STATS_COLLECTION).doc(channelId);
        batch.update(statsRef, {
          viewerCount: firestore.FieldValue.increment(-staleCount),
          lastUpdated: firestore.FieldValue.serverTimestamp()
        });
        
        // Commit the batch
        await batch.commit();
      }
    } catch (error) {
      console.error('Error cleaning up stale viewers:', error);
    }
  }, 60000); // Check every minute
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log(`Stopped viewer tracking for channel: ${channelId}`);
    
    // Mark the stream as inactive
    firestore()
      .collection(STATS_COLLECTION)
      .doc(channelId)
      .update({
        active: false,
        lastUpdated: firestore.FieldValue.serverTimestamp()
      })
      .catch(err => console.error('Error marking stream inactive:', err));
  };
};

/**
 * Update a user's "last active" timestamp to prevent being counted as stale
 * Call this periodically from viewers to maintain accurate counts
 * 
 * @param channelId The channel ID
 * @param userId The user ID
 */
export const updateViewerActivity = async (channelId: string, userId: string | number): Promise<void> => {
  if (!channelId || !userId) return;
  
  try {
    await firestore()
      .collection(STATS_COLLECTION)
      .doc(channelId)
      .collection('viewers')
      .doc(userId.toString())
      .update({
        lastActive: firestore.FieldValue.serverTimestamp()
      });
  } catch (error) {
    console.error('Error updating viewer activity:', error);
  }
};

/**
 * Archive stream statistics when a stream ends
 * 
 * @param channelId The channel ID
 * @param hostId ID of the stream host
 */
export const archiveStreamStats = async (channelId: string, hostId: string | number): Promise<void> => {
  if (!channelId) return;
  
  try {
    // Get current stats document
    const statsDoc = await firestore()
      .collection(STATS_COLLECTION)
      .doc(channelId)
      .get();
    
    if (statsDoc.exists) {
      const statsData = statsDoc.data() || {};
      
      // Get current viewer count by counting viewers collection
      const viewersSnapshot = await firestore()
        .collection(STATS_COLLECTION)
        .doc(channelId)
        .collection('viewers')
        .get();
      
      const currentViewerCount = viewersSnapshot.size;
      
      // Create an archive record
      await firestore()
        .collection('streamArchives')
        .add({
          channelId,
          hostId,
          archivedAt: firestore.FieldValue.serverTimestamp(),
          stats: {
            ...statsData,
            finalViewerCount: currentViewerCount,
            peakViewerCount: Math.max(statsData.viewerPeak || 0, currentViewerCount)
          }
        });
      
      // Reset the live stats document
      await firestore()
        .collection(STATS_COLLECTION)
        .doc(channelId)
        .update({
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