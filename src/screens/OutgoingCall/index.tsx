import {
    EventType,
    useZoom,
    VideoAspect,
    ZoomVideoSdkUser,
    ZoomVideoSdkUserType,
    ZoomView,
} from '@zoom/react-native-videosdk';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    EmitterSubscription,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { getSignature } from '../../api/chat';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../store/slices/authSlice';
import Toast from 'react-native-toast-message';
import { colors } from '../../utils/theme';
import { vh, vw } from '../../constant';
import InterRegular from '../../components/Text/InterRegular';
import { images } from '../../utils/images';
import Row from '../../components/Row';
import { useIsMounted } from '../../hooks/useIsMounted';

export const OutgoingCall = ({ navigation, route }) => {
    const zoom = useZoom();
    const { params } = route;

    const [users, setUsersInSession] = useState<ZoomVideoSdkUser[]>([]);
    const [me, setMe] = useState(null);
    const [isInSession, setIsInSession] = useState(false);
    const listeners = useRef<EmitterSubscription[]>([]);
    const [remoteUsers, setRemoteUsers] = useState<ZoomVideoSdkUser[]>([]);
    const [mute, setMute] = useState(false);

    const user = useSelector(selectUserProfile);
    const isMounted = useIsMounted();

    // Fetch Zoom Token
    const getZoomToken = async () => {
        try {
            const res = await getSignature(
                'Call',
                params.chat_id,
                parseInt(params.role, 10),
            );
            return res?.data?.data?.signature as string;
        } catch (error) {
            console.error('Error fetching Zoom token:', error);
            return null;
        }
    };

    // Start Call
    const startCall = async () => {
        const zoomToken = await getZoomToken();
        if (!zoomToken) {
            console.error('No Zoom token received. Cannot start session.');
            return;
        }
        console.log('Joining Zoom session...');
        createZoomSession(zoomToken);
    };

    // Set up event listeners
    const setSessionListener = () => {
        zoom.addListener(EventType.onError, e => console.log('Zoom Error:', e));

        const sessionJoin = zoom.addListener(EventType.onSessionJoin, async () => {
            console.log('Session joined!');
            setIsInSession(true);
            const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
            setMe(mySelf);
            const muted = await mySelf.audioStatus.isMuted();
            setMute(mute)
            const remoteUsers = await zoom.session.getRemoteUsers();
            setUsersInSession([mySelf, ...remoteUsers]);
        });
        listeners.current.push(sessionJoin);

        const userJoin = zoom.addListener(EventType.onUserJoin, async event => {
            const { remoteUsers } = event;
            const mySelf = await zoom.session.getMySelf();
            const remote = remoteUsers.map(user => new ZoomVideoSdkUser(user));
            setUsersInSession([mySelf, ...remote]);
        });
        listeners.current.push(userJoin);

        const userLeave = zoom.addListener(EventType.onUserLeave, async event => {
            const { remoteUsers } = event;
            const mySelf = await zoom.session.getMySelf();
            const remote = remoteUsers.map(user => new ZoomVideoSdkUser(user));
            setUsersInSession([mySelf, ...remote]);
        });
        listeners.current.push(userLeave);

        const sessionLeaveListener = zoom.addListener(
            EventType.onSessionLeave,
            async reason => {
                console.log(
                    'Session left. Reason:',
                    reason?.reason,
                    'Details:',
                    JSON.stringify(reason),
                );
                setIsInSession(false);
                setUsersInSession([]);
                navigation.goBack();
            },
        );
        listeners.current.push(sessionLeaveListener);

        const userAudioStatusChangedListener = zoom.addListener(
            EventType.onUserAudioStatusChanged,
            async ({ changedUsers }: { changedUsers: ZoomVideoSdkUserType[] }) => {
                const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(
                    await zoom.session.getMySelf(),
                );
                changedUsers.map((u: ZoomVideoSdkUserType) => {
                    if (mySelf.userId === u.userId) {
                        mySelf.audioStatus.isMuted().then(muted => setMute(muted));
                    }
                });
            },
        );
        listeners.current.push(userAudioStatusChangedListener);

        const userLeaveListener = zoom.addListener(
            EventType.onUserLeave,
            async ({
                remoteUsers,
                leftUsers,
            }: {
                remoteUsers: ZoomVideoSdkUserType[];
                leftUsers: ZoomVideoSdkUserType[];
            }) => {
                if (!isMounted()) return;
                leaveSession(true);
            },
        );

        listeners.current.push(userLeaveListener);
    };

    const leaveSession = async (endSession: boolean) => {
        await zoom.leaveSession(endSession);
    };

    // Create Zoom Session
    const createZoomSession = async (zoomToken: string) => {
        try {
            const zoomSession = await zoom.joinSession({
                sessionName: `Call`,
                sessionPassword: '',
                userName: user?.full_name,
                sessionIdleTimeoutMins: 10,
                token: zoomToken,
                audioOptions: {
                    connect: true,
                    mute: false,
                    autoAdjustSpeakerVolume: false,
                },
                videoOptions: { localVideoOn: true },
            });
            console.log('Zoom session joined:', zoomSession);
        } catch (err) {
            console.error('Error joining Zoom session:', err);
            if (err?.message) {
                Toast.show({
                    type: 'error',
                    text1: `Zoom error: ${ err.message }`,
                });
            }
        }
    };

    const onPressAudio = async () => {
        const mySelf = await zoom.session.getMySelf();
        const muted = await mySelf.audioStatus.isMuted();
        muted
            ? await zoom.audioHelper.unmuteAudio(mySelf.userId)
            : await zoom.audioHelper.muteAudio(mySelf.userId);
    };

    // Cleanup function
    const clean = async () => {
        listeners.current.forEach(listener => listener.remove());
        listeners.current = [];
        if (await zoom.isInSession()) {
            await zoom.leaveSession(false);
            await zoom.cleanup();
        }
    };
    useEffect(() => {
        const rejoinSession = async () => {
            if (await zoom.isInSession()) {
                console.log('Already in session, rejoining...');
                await clean();
                setIsInSession(true);
                startCall();
                return;
            }
            startCall();
        };
        setSessionListener();
        // rejoinSession();
        startCall();

        return () => {
            clean();
        };
    }, []);

    //  useEffect(() => {
    //    const unsubscribe = navigation.addListener('focus', () => {
    //      setUsersInSession([]);
    //      setRemoteUsers([]);
    //      setIsInSession(false);
    //      // startCall();
    //    });

    //    return unsubscribe;
    //  }, [navigation]);


    return (
        <View style={ styles.container }>
            { !isInSession ? (
                <ActivityIndicator size={ 'large' } color={ colors.themeColor } />
            ) : (
                <View style={ styles.content }>
                    <View>
                        { users?.map(item => (
                            <View key={ item.userId } style={ styles.userContainer }>
                                <Image source={ images.user } style={ styles.userImage } />
                                <InterRegular style={ styles.userName }>
                                    { item?.userName }
                                </InterRegular>
                            </View>
                        )) }
                    </View>
                    <Row style={ styles.controlRow } justify="space-around">
                        <TouchableOpacity onPress={ onPressAudio }>
                            <Image
                                source={ mute ? images.unmute : images.mute }
                                style={ styles.mic_icon }
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={ () => leaveSession(true) }>
                            <Image source={ images.endCall } style={ styles.endCallIcon } />
                        </TouchableOpacity>
                    </Row>
                </View>
            ) }
            { me && (
                <ZoomView
                    key={ me.userId }
                    userId={ me.userId }
                    fullScreen
                    videoAspect={ VideoAspect.PanAndScan }
                />
            ) }
            { remoteUsers.map(user => (
                <ZoomView
                    key={ user.userId }
                    userId={ user.userId }
                    fullScreen={ false }
                    videoAspect={ VideoAspect.PanAndScan }
                />
            )) }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    mic_icon: {
        width: vh * 2.5,
        height: vh * 2.5,
        resizeMode: 'contain',
        tintColor: colors.white,
    },
    userContainer: {
        width: vh * 20,
        height: vh * 20,
        alignItems: 'center',
        marginVertical: vh,
    },
    userImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain',
    },
    userName: {
        color: colors.black,
    },
    controlRow: {
        backgroundColor: colors.themeColor,
        padding: vh,
        width: vw * 40,
    },
    endCallIcon: {
        width: vh * 3,
        height: vh * 3,
        resizeMode: 'contain',
    },
});
