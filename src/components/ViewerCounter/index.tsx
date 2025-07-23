import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import {selectUserProfile} from '../../store/slices/authSlice';

/**
 * ViewerCounter component that displays real-time viewer count
 * Uses Firestore to track viewers with host exclusion
 *
 * @param {boolean} isLive - Whether the stream is currently live
 * @param {string} channelId - The channel ID of the livestream
 * @param {object} style - Additional styles for the container
 */
const ViewerCounter = ({
  isLive,
  channelId,
  style,
}: {
  isLive: boolean;
  channelId: string;
  style?: object;
}) => {
  // State to track viewer count
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Reference to the Firestore listener for cleanup
  const viewerListener = useRef<(() => void) | null>(null);

  // Get current user to determine if they're the host
  const user = useSelector(selectUserProfile);

  // Set up listener for viewer count changes in Firestore
  useEffect(() => {
    if (!isLive || !channelId) {
      setViewerCount(0);
      setIsLoading(false);
      return () => {};
    }

    setIsLoading(true);

    try {
      // Reference to the stats document in Firestore
      const statsRef = firestore().collection('liveStreamStats').doc(channelId);

      // Set up real-time listener for viewer count
      const unsubscribe = statsRef.onSnapshot(
        doc => {
          if (doc.exists) {
            const data = doc.data();
            // Use the viewerCount field from Firestore
            if (data && typeof data.viewerCount === 'number') {
              setViewerCount(data.viewerCount);
            } else {
              setViewerCount(0);
            }
          } else {
            setViewerCount(0);
          }
          setIsLoading(false);
          setError(null);
        },
        err => {
          console.error('Error in viewer count listener:', err);
          setError('Could not load viewer count');
          setIsLoading(false);
        },
      );

      // If this is an audience member (not the host), increment the count
      const addViewerToCount = async () => {
        try {
          // Check if this is the channel host
          const streamDoc = await firestore()
            .collection('liveStreamChats')
            .doc(channelId)
            .get();

          // Do not increment if this user is the host
          const streamData = streamDoc.data();
          const isHost = streamData?.hostId === user.id;

          if (!isHost) {
            // Add this viewer to the count
            await statsRef.update({
              viewerCount: firestore.FieldValue.increment(1),
              lastUpdated: firestore.FieldValue.serverTimestamp(),
            });

            // Also add this user to a "viewers" subcollection for tracking
            await statsRef.collection('viewers').doc(user.id.toString()).set({
              userId: user.id,
              username: user.full_name,
              joinedAt: firestore.FieldValue.serverTimestamp(),
            });
          }
        } catch (err) {
          console.error('Error adding viewer:', err);
        }
      };

      // Call once when the component mounts to increment count
      addViewerToCount();

      // Store the unsubscribe function for cleanup
      viewerListener.current = unsubscribe;

      // When component unmounts, decrement the viewer count
      return () => {
        if (viewerListener.current) {
          viewerListener.current();
        }

        // Decrement viewer count if this is not the host
        const removeViewer = async () => {
          try {
            // Check if this is the channel host
            const streamDoc = await firestore()
              .collection('liveStreamChats')
              .doc(channelId)
              .get();

            const streamData = streamDoc.data();
            const isHost = streamData?.hostId === user.id;

            if (!isHost) {
              // Remove this viewer's entry
              await statsRef
                .collection('viewers')
                .doc(user.id.toString())
                .delete();

              // Decrement the count
              await statsRef.update({
                viewerCount: firestore.FieldValue.increment(-1),
                lastUpdated: firestore.FieldValue.serverTimestamp(),
              });
            }
          } catch (err) {
            console.error('Error removing viewer:', err);
          }
        };

        // Only remove if the component was fully mounted
        if (!isLoading && isLive && channelId) {
          removeViewer();
        }
      };
    } catch (err) {
      console.error('Error setting up viewer counter:', err);
      setIsLoading(false);
      setError('Unable to track viewers');
      return () => {};
    }
  }, [isLive, channelId, user.id]);

  // Don't render anything if stream is not live
  if (!isLive) return null;

  return (
    <View style={[styles.container, style]}>
      <FontAwesome6 name="eye" size={12} color="#fff" iconStyle="solid" />

      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.viewerCount}>--</Text>
      ) : (
        <Text style={styles.viewerCount}>{viewerCount}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  viewerCount: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  loader: {
    marginLeft: 5,
  },
});

export default ViewerCounter;
