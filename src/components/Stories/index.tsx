import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import InstagramStories, { InstagramStoriesProps } from '@birdwingo/react-native-instagram-stories';
import { launchImageLibrary } from 'react-native-image-picker';
import AddStoryIcon from './AddStoryIcon';
import { AddStory, GetStories } from '../../api/stories';
import { useNavigation } from '@react-navigation/native';

import Toast from 'react-native-toast-message';

const Stories = () => {
    const [stories, setStories] = useState<InstagramStoriesProps['stories']>([]);

    useEffect(() => {
        getStories()
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
                    await AddStory({ file: file })
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

    const addStoryActions = [
        {
            title: "Open camera",
            event: "OPEN_CAMERA",
        },
        {
            title: "Upload a Photo/video",
            event: "UPLOAD"
        }
    ]


    const onPressNewStory = (event: { title: string, event: string }) => {
        if (event.event === addStoryActions[1].event) {
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
                renderAvatar: () => {
                    return (
                        <View
                            actions={ addStoryActions }
                            dropdownMenuMode
                            onPress={ (e) => {
                                onPressNewStory(addStoryActions[e.nativeEvent.index])
                            } }
                        >
                            <AddStoryIcon />
                            <Text>Add Story</Text>
                        </View>
                    )
                }
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

    // const groupStoriesByUser = (stories: any[]) => {
    //     return stories.reduce((grouped, story) => {
    //         const userId = story.user_id;

    //         if (!grouped[userId]) {
    //             grouped[userId] = {
    //                 user: { ...story.user, id: userId },
    //                 stories: []
    //             };
    //         }

    //         grouped[userId].stories.push({
    //             id: story.id,
    //             source: { uri: story.media_url },
    //             media_type: story.media_type,
    //             expires_at: story.expires_at,
    //             created_at: story.created_at
    //         });

    //         return grouped;
    //     }, {});
    // };
      

    const getStories = async () => {
        try {
            resetStories();

            const { data } = await GetStories();

            if (data?.data?.stories) {
                console.log("STORIES", data.data.stories);

                const { stories } = data.data;

                // const groupedByUsers = groupStoriesByUser(stories);

                // console.log(groupedByUsers);

                let formattedStories = formatStories(stories);

                console.log(formattedStories[0].stories)

                setStories(prevStories => [...prevStories, ...formattedStories]);
            }
        }
        catch (err) {
            console.log("ERROR:: STORIES", err);
        }

    }
    const navigation = useNavigation();

    const storiesData: InstagramStoriesProps['stories'] = [
        {
            id: "0",
            name: "Add Story",
            avatarSource: { uri: "" },
            stories: [],
            renderAvatar: () => {
                return (
                    <ContextMenu
                        actions={ [{ title: "Title 1" }, { title: "Title 2" }] }
                        dropdownMenuMode
                        onPress={ (e) => {
                            console.warn(
                                `Pressed ${ e.nativeEvent.name } at index ${ e.nativeEvent.index }`
                            );
                        } }
                    >
                        <AddStoryIcon />
                        <Text>Add Story</Text>
                    </ContextMenu>
                )
            }
        },
        {
            id: "1",
            name: "Samera",
            avatarSource: { uri: "https://randomuser.me/api/portraits/men/1.jpg" },
            stories: [
                {
                    id: "101",
                    source: { uri: "https://i.pinimg.com/236x/ec/95/3b/ec953ba650751238064420db52b660f8.jpg" }, // Story media URL
                },
            ]
        },
        {
            id: "2",
            name: "Samera",
            avatarSource: { uri: "https://randomuser.me/api/portraits/men/1.jpg" },
            stories: [
                {
                    id: "102",
                    source: { uri: "https://i.pinimg.com/236x/ec/95/3b/ec953ba650751238064420db52b660f8.jpg" }, // Story media URL
                },
            ],
        },
        {
            id: "3",
            name: "Samera",
            avatarSource: { uri: "https://randomuser.me/api/portraits/men/1.jpg" },
            stories: [
                {
                    id: "103",
                    source: { uri: "https://i.pinimg.com/236x/ec/95/3b/ec953ba650751238064420db52b660f8.jpg" }, // Story media URL
                },
            ],
        },
    ];

    if (!stories || !stories.length) {
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