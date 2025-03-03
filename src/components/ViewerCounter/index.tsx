import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { GetLiveStreamUsers } from '../../api/liveStream';

/**
 * ViewerCounter component to display the number of viewers in a livestream
 * Uses Agora API to fetch real-time viewer counts
 * 
 * @param {Object} props
 * @param {boolean} props.isLive - Whether the stream is currently live
 * @param {string} props.channelId - Agora channel ID for the livestream
 * @param {Object} props.style - Additional styles for the container
 */
const ViewerCounter = ({ 
  isLive,
  channelId,
  style
}: { 
  isLive: boolean; 
  channelId: string;
  style?: object; 
}) => {
  // State to track viewer count
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Effect to set up listener for user count changes
  useEffect(() => {
    if (!isLive || !channelId) return;
    
    let intervalId: NodeJS.Timeout;

    const setupViewerCountTracking = async () => {
      try {
        setIsLoading(true);
        
        // Initial fetch of user count
        const {data} = await GetLiveStreamUsers(channelId);
        if (data?.data?.audience_total) {
          // Subtract 1 to exclude the broadcaster (if needed)
          setViewerCount(Math.max(0, data.data.audience_total));
        }
        
        // Set up interval to periodically update the count (every 10 seconds)
        intervalId = setInterval(async () => {
          try {
            const {data} = await GetLiveStreamUsers(channelId);
            if (data?.data?.audience_total) {
              setViewerCount(Math.max(0, data.data.audience_total));
            }
          } catch (refreshError) {
            console.error('Error refreshing viewer count:', refreshError);
            // Don't set error state for refresh failures to avoid UI flicker
          }
        }, 1 * 1000);
        
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error setting up viewer count tracking:', err);
        setIsLoading(false);
        setError('Unable to fetch viewer count');
        setViewerCount(0);
      }
    };

    setupViewerCountTracking();

    // Clean up interval and listeners when component unmounts or channel changes
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLive, channelId]);

  // Don't render anything if stream is not live
  if (!isLive) return null;

  return (
    <View style={[styles.container, style]}>
      <FontAwesome6 name="eye" size={12} color="#fff" iconStyle='solid' />
      
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
  }
});

export default ViewerCounter;