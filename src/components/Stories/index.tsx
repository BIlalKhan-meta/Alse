import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import InstagramStories, { InstagramStoriesProps } from '@birdwingo/react-native-instagram-stories';
import { launchImageLibrary } from 'react-native-image-picker';
import AddStoryIcon from './AddStoryIcon';
import { AddStory, GetStories } from '../../api/stories';
import { useNavigation } from '@react-navigation/native';
import * as DropdownMenu from 'zeego/dropdown-menu'

import Toast from 'react-native-toast-message';
import useImagePicker from '../../hooks/useImagePicker';
import { isAxiosError } from 'axios';
import Loader from '../Loader';

const Stories = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [stories, setStories] = useState<InstagramStoriesProps['stories']>([]);
    const {imageData, captureImage, chooseImageFromLibrary} = useImagePicker();
    const [isUploading, setIsUploading] = useState<boolean>(false);

    useEffect(() => {
        getStories()
    }, []);

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

    const onPressNewStory = (event: "upload" | "camera") => {
        if (event === "upload") {
            return chooseImageFromLibrary('mixed');
        }
        
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
                uri: `https://randomuser.me/api/portraits/men/${story.user.id}.jpg` 
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
      
      

    const getStories = async () => {
        try {
            resetStories();

            const { data } = await GetStories();

            if (data?.data?.stories) {
                const { stories } = data.data;

                const formattedStories = formatStories(stories);
                setStories(prevStories => [...prevStories, ...formattedStories]);

                setIsLoading(false);
            }
        }
        catch (err) {
            console.log("ERROR:: STORIES", err);
        }

    }

    if (!stories || !stories.length || isLoading) {
        return;
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