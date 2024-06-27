import React, { useState } from 'react';
import { TouchableOpacity, Platform, PermissionsAndroid, Alert, Text } from 'react-native';
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { request as requestCameraPermission } from 'react-native-permissions';
import { PERMISSIONS, request } from "react-native-permissions";
interface ImagePickerProps {
    onPress: () => void; // Specify the type of media to pick
    onSelectMedia: (mediaUri: string) => void;
    mediaType: 'photo' | 'video';
}
interface ImageItem {
    value: {
        uri: string;
        type: string;
        name: string;
    };
}
const ImagePickerComponent: React.FC<ImagePickerProps> = ({ mediaType, onSelectMedia, onPress }) => {
    const [filepath, setFilepath] = useState();
    const [imageArray, setImageArray] = useState<ImageItem[]>([]);
    const [videoArray, setVideoArray] = useState([]);
    const [vidfilePath, setVidFilePath] = useState("");




    const captureImage = async (type) => {
        let options = {
            mediaType: type,
            maxWidth: 300,
            maxHeight: 550,
            quality: 1,
            videoQuality: "low",
            durationLimit: 30, //Video max duration in seconds
            saveToPhotos: true,
        };


        if (true && true) {
            console.log("Coming captureeee Innn")

            launchCamera(options, (response) => {
                if (response.didCancel) {
                    alert("User cancelled camera picker");
                    return;
                } else if (response.errorCode == "camera_unavailable") {
                    alert("Camera not available on device");
                    return;
                } else if (response.errorCode == "permission") {
                    alert("Permission not satisfied");
                    return;
                } else if (response.errorCode == "others") {
                    alert(response.errorMessage);
                    return;
                }

                setFilepath(response.assets[0].uri);
                onSelectMedia(response.assets[0].uri)
                // setFileType(response.assets[0].type);
                setImageArray([
                    ...imageArray,
                    {
                        value: {
                            uri: response.assets[0].uri,
                            type: response.assets[0].type,
                            name: response.assets[0].fileName,
                        },
                    },
                ]);
            });
        }
    };


    return (
        <TouchableOpacity onPress={captureImage}>
            {/* Render your custom button or UI for image/video picker */}
            {/* For example, you could render an icon or text */}
            {/* <Text>Select Media</Text> */}

        </TouchableOpacity>
    );
};

export default ImagePickerComponent;
