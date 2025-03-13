import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Image, PermissionsAndroid, Platform, Text, TouchableOpacity, View, Modal, StyleSheet } from 'react-native';
import InstagramStories, { InstagramStoriesProps } from '@birdwingo/react-native-instagram-stories';
import AddStoryIcon from './AddStoryIcon';
import { AddStory, GetStories } from '../../api/stories';
import * as DropdownMenu from 'zeego/dropdown-menu';
import Toast from 'react-native-toast-message';
import useImagePicker from '../../hooks/useImagePicker-story';
import { isAxiosError } from 'axios';
import Loader from '../Loader';
import { GetLiveStreams } from '../../api/liveStream';
import { GradientBorderView } from '@good-react-native/gradient-border';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';

// Constants
const POLLING_INTERVAL = 30000; // 30 seconds
const MAX_RETRY_COUNT = 3;

interface LiveStream {
    user_id: number;
    stream_key: string;
    user_name: string;
}

const Stories = () => {
    // State management
    const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [stories, setStories] = useState<InstagramStoriesProps['stories']>([]);
    const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
    const {
        imageData, 
        captureImage, 
        chooseImageFromLibrary, 
        previewMode, 
        pendingMedia, 
        confirmMedia, 
        cancelMedia
    } = useImagePicker();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [pollingEnabled, setPollingEnabled] = useState<boolean>(true);
    
    // Refs for polling management
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef<number>(0);
    
    const navigation = useNavigation();

    // Fetch stories with ability to control loading indicator
    const getStories = useCallback(async (showLoadingIndicator = true) => {
        try {
            if (showLoadingIndicator) {
                setIsInitialLoading(true);
            } else {
                setIsRefreshing(true);
            }

            // Get stories first before clearing state
            const { data } = await GetStories();

            if (data?.data?.stories) {
                // Only reset and update stories after we have the new data
                const { stories } = data.data;
                const formattedStories = formatStories(stories);
                
                // Now reset and update with the new data
                resetStories();
                setStories(prevStories => [...prevStories, ...formattedStories]);
            } else {
                // If no stories returned, just reset
                resetStories();
            }
            
            // Reset retry count on success
            retryCountRef.current = 0;
        }
        catch (err) {
            console.log("ERROR:: STORIES", err);
            retryCountRef.current += 1;
            
            // Show error toast on excessive retries
            if (retryCountRef.current >= MAX_RETRY_COUNT) {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to refresh stories',
                    text2: 'Please check your connection'
                });
                
                // Temporarily disable polling on excessive failures
                if (pollingEnabled) {
                    stopPolling();
                    setTimeout(() => {
                        startPolling();
                    }, POLLING_INTERVAL * 2); // Retry after double the interval
                }
            }
        }
        finally {
            if (showLoadingIndicator) {
                setIsInitialLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    }, []);

    // Fetch live streams with ability to control loading indicator
    const getLiveStreams = useCallback(async (showLoadingIndicator = true) => {
        try {
            const { data } = await GetLiveStreams();

            const streams = data?.live_streams?.map((stream) => ({ 
                stream_key: stream.stream_key, 
                user_id: stream.user_id, 
                user_name: stream.user.full_name 
            }));

            setLiveStreams(streams);
            
            // Reset retry count on success
            retryCountRef.current = 0;
        } catch (err) {
            console.error("ERROR:: LIVE STREAMS", err);
            retryCountRef.current += 1;
            
            if (retryCountRef.current >= MAX_RETRY_COUNT) {
                Toast.show({
                    type: 'error',
                    text1: 'Failed to refresh live streams',
                    text2: 'Please check your connection'
                });
            }
        }
    }, []);

    // Combined data fetching function
    const fetchData = useCallback(async (showLoadingIndicator = true) => {
        try {
            // First get stories
            await getStories(showLoadingIndicator);
            // Then get live streams after stories are loaded
            await getLiveStreams(showLoadingIndicator);
        } catch (error) {
            console.error("Error in fetchData:", error);
        }
    }, [getStories, getLiveStreams]);

    // Start polling mechanism
    const startPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        
        pollingIntervalRef.current = setInterval(() => {
            fetchData(false); // Don't show loading indicator during refresh
        }, POLLING_INTERVAL);
        
        setPollingEnabled(true);
    }, [fetchData]);

    // Stop polling mechanism
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        
        setPollingEnabled(false);
    }, []);

    // Initialize data fetch and polling
    useEffect(() => {
        fetchData(true); // Initial load with loading indicator
        startPolling();
        
        // Cleanup on unmount
        return () => {
            stopPolling();
        };
    }, []);

    // Update stories when live streams change
    useEffect(() => {
        if (liveStreams.length > 0) {
            // Check if we already have live streams in the stories to prevent duplicates during polling
            const existingLiveIds = new Set(
                stories
                    .filter(story => story.stories.length === 0 && story.id !== "0") // Likely live streams
                    .map(story => story.id)
            );
            
            // Only add new live streams that aren't already in the stories
            const newLiveStreams = formattedLives().filter(
                liveStory => !existingLiveIds.has(liveStory.id)
            );
            
            if (newLiveStreams.length > 0) {
                setStories(prevStories => [...prevStories, ...newLiveStreams]);
            }
        }
    }, [liveStreams, stories]);

    const uploadFile = async (file: any) => {
        setIsUploading(true);
        Toast.show({
            type: 'info',
            text1: 'Uploading Story',
            text2: 'Please wait...'
        });

        const formData = new FormData();

        formData.append('file', file);

        try {
            await AddStory(formData);

            Toast.show({
                type: 'success',
                text1: 'Successfully uploaded story!'
            });

            // Refresh stories after successful upload
            await getStories(false);
        } catch(err) {
            console.error("Upload error:", err);
            if (isAxiosError(err)) {
                Toast.show({
                    type: 'error',
                    text1: err.response?.data.message || 'Failed to upload story'
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Network error while uploading story'
                });
            }
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (imageData) {
            uploadFile({ uri: imageData?.uri, name: imageData?.fileName, type: imageData?.type });
        }
    }, [imageData]);

    const requestCameraAndAudioPermission = async () => {
        if (Platform.OS === 'android') {
          try {
            const granted = await PermissionsAndroid.requestMultiple([
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            ]);
  
            if (
              granted[PermissionsAndroid.PERMISSIONS.CAMERA] !==
                PermissionsAndroid.RESULTS.GRANTED ||
              granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !==
                PermissionsAndroid.RESULTS.GRANTED
            ) {
              console.warn('Camera or Microphone permission denied');
              return;
            }
  
            console.log('Permissions granted');
          } catch (err) {
            console.warn(err);
          }
        }
    };

    const onPressNewStory = async (event: "upload" | "camera") => {
        if (event === "upload") {
            return chooseImageFromLibrary('mixed', true); // Enable preview
        }

        await requestCameraAndAudioPermission();
        
        return captureImage('mixed', true); // Enable preview
    };

    // Handle confirmation of media after preview
    const handleConfirmMedia = () => {
        confirmMedia(); // This will trigger the useEffect with imageData
    };

    const resetStories = () => {
        setStories([
            {
                id: "0",
                name: "Add Story",
                avatarSource: { uri: "" },
                stories: [],
                renderAvatar: () => {
                    if (isUploading) {
                        return <Loader />;
                    }

                    return (
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                                <AddStoryIcon />
                                <Text>Add Story</Text>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Content>
                                <DropdownMenu.Item key="upload" onSelect={()=> onPressNewStory("upload")}>
                                    <DropdownMenu.ItemTitle>Upload from gallery</DropdownMenu.ItemTitle>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item key="camera" onSelect={() => onPressNewStory("camera")}>
                                    <DropdownMenu.ItemTitle>Open Camera</DropdownMenu.ItemTitle>
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Root>
                    );
                }
            }
        ]);
    };

    const formatStories = (stories: any[]): InstagramStoriesProps['stories'] => {
        // First group stories by user ID
        const groupedStories = stories.reduce((acc, story) => {
            const userId = String(story.user.id);
            if (!acc[userId]) {
                acc[userId] = {
                    id: userId,
                    name: story.user.full_name || "Unknown User",
                    avatarSource: {
                        uri: `https://randomuser.me/api/portraits/men/${ story.user.id }.jpg`
                    },
                    stories: []
                };
            }
            acc[userId].stories.push({
                id: String(story.id),
                source: { uri: story.media_url },
                // Add other story properties here if needed
            });
            return acc;
        }, {});

        // Convert the grouped object to array
        return Object.values(groupedStories);
    };

    const onPressLive = (stream: LiveStream) => {
        return navigation.navigate('LiveStreamScreen', {
            isHost: false,
            channel: `agora.${ stream.stream_key }`,
            streamerName: stream.user_name,
            streamerAvatar: `https://randomuser.me/api/portraits/men/${ stream.user_id }.jpg`
        });
    };

    const formattedLives = (): InstagramStoriesProps['stories'] => {
        return liveStreams.map((stream) => ({
            id: `live-${ stream.stream_key }`, // Prefix with 'live-' to make it unique from regular stories
            avatarSource: {
                uri: `https://randomuser.me/api/portraits/men/${ stream.user_id }.jpg`
            },
            renderAvatar: () => (
                <TouchableOpacity style={ { display: 'flex', justifyContent: 'center', alignItems: 'center' } } onPress={ () => onPressLive(stream) }>
                    <GradientBorderView
                        gradientProps={ {
                            colors: ['white', 'red']
                        } }
                        style={ {
                            borderWidth: 5,
                            borderRadius: 100,
                            height: 70,
                            width: 70,
                        } }
                    >
                        <Image
                            source={ { uri: `https://randomuser.me/api/portraits/men/${ stream.user_id }.jpg` } }
                            width={ 60 }
                            height={ 60 }
                            style={ { borderRadius: 100 } }
                        />
                    </GradientBorderView>
                    <View style={ { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' } }>
                        <Text>{ stream.user_name }  </Text><Text style={ { color: '#FF5125' } }>Live</Text>
                    </View>
                </TouchableOpacity>
            ),
            stories: []
        }));
    };

    // Render the media preview UI
    const renderMediaPreview = () => {
        if (!pendingMedia) return null;
        
        const isVideo = pendingMedia.type?.startsWith('video/');
        
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={previewMode}
                onRequestClose={cancelMedia}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.previewContainer}>
                        <Text style={styles.previewTitle}>Preview</Text>
                        
                        {isVideo ?(
                            <Video 
                                source={{uri: pendingMedia.uri}}
                                style={styles.mediaPreview}
                                resizeMode="contain"
                                controls={true}
                            />
                        ) : (
                            <Image
                                source={{uri: pendingMedia.uri}}
                                style={styles.mediaPreview}
                                resizeMode="contain"
                            />
                        )}
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={[styles.button, styles.cancelButton]} 
                                onPress={cancelMedia}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.button, styles.confirmButton]} 
                                onPress={handleConfirmMedia}
                            >
                                <Text style={[styles.buttonText, styles.confirmText]}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    if (!stories || !stories.length || isInitialLoading) {
        return <Loader />;
    }

    return (
        <View>
            {isRefreshing && (
                <View style={{ position: 'absolute', top: 0, right: 10, zIndex: 10 }}>
                    <Loader size="small" />
                </View>
            )}
            
            {/* Media Preview Modal */}
            {renderMediaPreview()}
            
            <InstagramStories
                stories={ stories }
                avatarBorderColors={['#FF7A51', '#FFDB5C']}
                saveProgress
                avatarListContainerStyle={{
                    marginHorizontal: 5,
                    marginVertical: 5,
                    gap: 10
                }}
                showName
                nameTextStyle={{
                    paddingHorizontal: 10
                }}
            />
        </View>
    );
};

// Styles for the preview modal
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    mediaPreview: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        marginBottom: 20,
    },
    videoPlaceholder: {
        width: '100%',
        height: 300,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    mediaPath: {
        fontSize: 12,
        color: '#666',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#FF7A51',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    confirmText: {
        color: 'white',
    },
});

export default Stories;