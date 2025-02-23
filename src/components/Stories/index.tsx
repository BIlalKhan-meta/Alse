import React, { useEffect, useState } from 'react';
import { Image, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import InstagramStories, { InstagramStoriesProps } from '@birdwingo/react-native-instagram-stories';
import AddStoryIcon from './AddStoryIcon';
import { AddStory, GetStories } from '../../api/stories';
import * as DropdownMenu from 'zeego/dropdown-menu'
import Toast from 'react-native-toast-message';
import useImagePicker from '../../hooks/useImagePicker';
import { isAxiosError } from 'axios';
import Loader from '../Loader';
import { GetLiveStreams } from '../../api/liveStream';
import { GradientBorderView } from '@good-react-native/gradient-border'
import { useNavigation } from '@react-navigation/native';

interface LiveStream {
    user_id: number;
    stream_key: string;
    user_name: string;
}

const Stories = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [stories, setStories] = useState<InstagramStoriesProps['stories']>([]);
    const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
    const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const navigation = useNavigation()

    useEffect(() => {
        getStories()
        getLiveStreams();
    }, []);

    const getLiveStreams = async () => {
        try {
            const { data } = await GetLiveStreams();

            const streams = data?.live_streams?.map((stream) => ({ stream_key: stream.stream_key, user_id: stream.user_id, user_name: stream.user.full_name }))

            console.log("STREAMS::", streams);

            setLiveStreams(streams);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (liveStreams.length > 0) {
            setStories((prevStories) => [...prevStories, ...formattedLives()]);
        }
    }, [liveStreams]);

    const uploadFile = async (file: any) => {
        setIsUploading(true);
        Toast.show({
            type: 'info',
            text1: 'Uploading Image'
        });

        const formData = new FormData();

        formData.append('file', file);

        try {

        await AddStory(formData);

        Toast.show({
            type: 'success',
            text1: 'Successfully uploaded story!'
        })

        await getStories();
        }catch(err) {
            if (isAxiosError(err)) {
                Toast.show({
                    type: 'error',
                    text1: err.response?.data.message
                })
            }
        }
        finally{
            setIsUploading(false);
        }
    }

    useEffect(() => {
        if (imageData) {
            uploadFile({ uri: imageData?.uri, name: imageData?.fileName, type: imageData?.type })
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
            return chooseImageFromLibrary('mixed');
        }

        await requestCameraAndAudioPermission();
        
        return captureImage('mixed');
    }

    const resetStories = () => {
        setStories([
            {
                id: "0",
                name: "Add Story",
                avatarSource: { uri: "" },
                stories: [],
                renderAvatar: () => {
                    if (isUploading) {
                        return <Loader />
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
                    )
                }
            }
        ])
    }

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

    const onPressLive = (stream: string) => {
        return navigation.navigate('LiveStreamNavigation', {
            isHost: false,
            channel: `agora.${stream}`
        })
    }

    const formattedLives = (): InstagramStoriesProps['stories'] => {
        return liveStreams.map((stream) => ({
            // Creates a random number from 1000 to 5000
            id: Number(Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000).toString(),
            avatarSource: {
                uri: `https://randomuser.me/api/portraits/men/${ stream.user_id }.jpg`
            },
            renderAvatar: () => (
                <TouchableOpacity style={ { display: 'flex', justifyContent: 'center', alignItems: 'center' } } onPress={() => onPressLive(stream.stream_key)}>
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
        }))
    }

      

    const getStories = async () => {
        try {
            setIsLoading(true);

            resetStories();

            const { data } = await GetStories();

            if (data?.data?.stories) {
                const { stories } = data.data;

                const formattedStories = formatStories(stories);
                setStories(prevStories => [...prevStories, ...formattedStories]);
            }
        }
        catch (err) {
            console.log("ERROR:: STORIES", err);
        }
        finally {
            setIsLoading(false);
        }

    }

    if (!stories || !stories.length || isLoading) {
        return <Loader />
    }

    return (
        <View>
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

export default Stories;