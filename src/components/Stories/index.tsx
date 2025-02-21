import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import InstagramStories, { InstagramStoriesProps } from '@birdwingo/react-native-instagram-stories';
import { launchImageLibrary } from 'react-native-image-picker';
import AddStoryIcon from './AddStoryIcon';
import { AddStory, GetStories } from '../../api/stories';
import { useNavigation } from '@react-navigation/native';
import * as DropdownMenu from 'zeego/dropdown-menu'

import Toast from 'react-native-toast-message';

const Stories = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [stories, setStories] = useState<InstagramStoriesProps['stories']>([]);

    useEffect(() => {
        // getStories()
    }, []);

    // Helper functions
    const getFileExtension = (uri: string) => {
        return uri.split('.').pop()?.toLowerCase();
    };

    const getMimeType = (uri: string) => {
        const ext = getFileExtension(uri);
        return ext === 'mp4' ? 'video/mp4' : 'image/jpeg';
    };

    const openImagePicker = () => {
        const options = {
            mediaType: 'mixed',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            selectionLimit: 1,
        };

        launchImageLibrary(options, async ({ didCancel, errorMessage, assets }) => {
            if (didCancel) {
                console.log('User cancelled image picker');
            } else if (errorMessage) {
                console.log('Image picker error: ', errorMessage);
            } else {
                Toast.show({
                    type: 'info',
                    text1: 'Uploading story',
                });

                const file = {
                    uri: assets?.[0]?.uri,
                    name: assets?.[0]?.fileName || `story_${Date.now()}${getFileExtension(assets?.[0]?.uri)}`, 
                    type: assets?.[0]?.type || getMimeType(assets?.[0]?.uri),
                  };
                  
                try {
                    console.log(await AddStory( file ))
                } catch (err) {
                    console.log("ERROR IN STORY:::", err);
                }

                Toast.show({
                    type: 'success',
                    text1: "Story uploaded successfully!"
                });

            }
        });
    };


    const onPressNewStory = (event: "upload" | "camera") => {
        if (event === "upload") {
            return openImagePicker();
        }

    }

    const resetStories = () => {
        setStories([
            {
                id: "0",
                name: "Add Story",
                avatarSource: { uri: "" },
                stories: [],
                // renderAvatar: () => {
                //     return (
                //         // <DropdownMenu.Root>
                //         //     <DropdownMenu.Trigger>
                //         //         <AddStoryIcon />
                //         //         <Text>Add Story</Text>
                //         //     </DropdownMenu.Trigger>
                //         //     <DropdownMenu.Content>
                //         //         <DropdownMenu.Item key="upload" onSelect={()=> onPressNewStory("upload")}>
                //         //             <DropdownMenu.ItemTitle>Upload from gallery</DropdownMenu.ItemTitle>
                //         //         </DropdownMenu.Item>
                //         //         <DropdownMenu.Item key="camera">
                //         //             <DropdownMenu.ItemTitle>Open Camera</DropdownMenu.ItemTitle>
                //         //         </DropdownMenu.Item>
                //         //     </DropdownMenu.Content>
                //         // </DropdownMenu.Root>
                //     )
                // }
            }
        ])
    }

    const formatStories = (stories: any[]): InstagramStoriesProps['stories'] => {
        return stories.map(story => ({
          id: String(story.user.id),
          name: story.user.full_name || "Unknown User",
          avatarSource: { 
            uri: `https://randomuser.me/api/portraits/men/${story.user.id}.jpg` 
          },
          stories: [{
            id: String(story.id),
            source: { uri: story.media_url },
          }]
        }));
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