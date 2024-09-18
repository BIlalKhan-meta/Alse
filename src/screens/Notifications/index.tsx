import { FlatList, Image, SectionList, Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";
// import ProfilePicture1 from '../../assets/images/profilepicture1.png'
// import ProfilePicture2 from '../../assets/images/profilepicture2.png'
// import ProfilePicture3 from '../../assets/images/profilepicture3.png'
// import ProfilePicture4 from '../../assets/images/profilepicture4.png'
// import ProfilePicture5 from '../../assets/images/profilepicture5.png'
// import ProfilePicture6 from '../../assets/images/profilepicture6.png'
// import ProfilePicture7 from '../../assets/images/profilepicture7.png'
// import AventaRegularSmallest from "../../components/Text/QanelasRegularSmallest";
import HeaderComponent from "../../components/HeaderComponent";
import { useNavigation } from "@react-navigation/native";
import InterBold from "../../components/Text/InterBold";
import { colors } from "../../utils/theme";
import DropDownTextInput from "../../components/TextInput/DropDownTextInput";
import Card from "../../components/Card";
import { images } from "../../utils/images";
import { vh, vw } from "../../constant";
import InterMedium from "../../components/Text/InterMedium";
import HorizontalSeparator from "../../components/HorizontalSeparator";
import { useLayoutEffect } from "react";

const NotificationsData = [
    {
        profilePicture: images.noti,
        notification: 'You received a payment of $780.1 from A.A. Justin Westervelt',
        time: '9:01 AM',
        date: '04/04/2024',
        read: false,
    },
    {
        profilePicture: images.noti,
        notification: 'You received a payment of $780.1 from A.A. Justin Westervelt',
        time: '9:01 AM',
        date: '04/04/2024',
        read: true,
    },
    {
        profilePicture: images.noti,
        notification: 'You received a payment of $780.1 from A.A. Justin Westervelt',
        time: '9:01 AM',
        date: '04/04/2024',
        read: true,
    },
    {
        profilePicture: images.noti,
        notification: 'You received a payment of $780.1 from A.A. Justin Westervelt',
        time: '9:01 AM',
        date: '04/04/2024',
        read: true,
    },
    {
        profilePicture: images.noti,
        notification: 'You received a payment of $780.1 from A.A. Justin Westervelt',
        time: '9:01 AM',
        date: '04/04/2024',
        read: true,
    },
    {
        profilePicture: images.noti,
        notification: 'You received a payment of $780.1 from A.A. Justin Westervelt',
        time: '9:01 AM',
        date: '04/04/2024',
        read: true,
    },
    // Add more items as needed
];
const Notifications: React.FC = () => {
    const navigation = useNavigation()
    const items = [
        { label: 'All', value: 'all' },
        { label: 'Read', value: 'read' },
        { label: 'Unread', value: 'unread' },
    ];
    const handleDropdownChange = (value: string | null) => {
        console.log('Selected value:', value);
    };
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={[styles.readBtn, { borderColor: colors.themeColor, marginBottom: 10 }]}>
                    <InterBold style={[styles.readTxt, { color: colors.themeColor }]}>Mark As All Read</InterBold>

                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const renderItem = ({ item }) => {
        console.log(item, "Itemsss")
        return (
            <>

                <View style={styles.container}>

                    <View style={styles.notiIcon}>
                        <Image source={item.profilePicture} style={{ width: "100%", height: "100%" }} />
                    </View>
                    <View style={styles.innercontainer}>
                        <InterMedium style={!item.read ? styles.readNoti : styles.notification}>{item.notification}</InterMedium>
                        <View style={styles.unreadContainer}>
                            <InterMedium style={styles.time}>{item.time}</InterMedium>
                            <InterMedium style={styles.time}>{item.date}</InterMedium>
                            {!item.read ? (
                                <TouchableOpacity style={styles.readBtn}>
                                    <InterBold style={styles.readTxt}>Mark As Read</InterBold>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.unreadBtn}>
                                    <InterBold style={[styles.unreadTxt, { color: colors.black }]}>Mark As Unread</InterBold>
                                </TouchableOpacity>
                            )}

                        </View>
                    </View>
                </View>
                <HorizontalSeparator />
            </>
        )

    }
    return (

        <View style={styles.contentCOntainer}>


            <Card style={styles.cardContainer}>

                <FlatList
                    data={NotificationsData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                />
            </Card>
        </View>


    )
}

export default Notifications;
