

// Home.tsx
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { images } from '../../utils/images';
import CardComponent from '../../components/CardComponent';
import { colors } from '../../utils/theme';
import { fontSizes, vh, vw } from '../../constant';
import Card from '../../components/Card';
import PostComponent from '../../components/PostComponent';
import InterBold from '../../components/Text/InterBold';
import CommentsModal from '../../components/CommentsModal';
import { useNavigation } from '@react-navigation/native';
import HeaderComponent from '../../components/HeaderComponent';
import styles from './styles';
import WishlistScreen from '../../components/WishList';
import SearchComponent from '../../components/SearchComponent';
import CustomButton from '../../components/CustomButton';
import { getAllShop } from '../../api/shop';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../store/slices/authSlice';
import Loader from '../../components/Loader';

const posts = [
  {
    avatar: `${images.user}`,
    name: 'John Doe',
    country: 'Newyork, USA',
    time: '12:30 AM',
    postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
    postImage: `${images.postImage1}`,
    likes: 120,
    comments: 45,
    share: 25,
    account: "public"
  },
  {
    avatar: `${images.user}`,
    name: 'Jane Smith',
    country: 'UK',
    time: '5h ago',
    postText: 'Haters will say what they want, but their hate will never stop you from casting your dreams just believe in yourself ...Read More',
    postImage: `${images.postImage2}`,
    likes: 80,
    comments: 20,
    share: 10,
    account: "private"

  },
  // Add more posts as needed
];


const dummyComments = [
  {
    id: 1,
    userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    userName: 'John Doe',
    userImage: 'https://via.placeholder.com/150',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 2,
    userAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    userName: 'Jane Smith',
    userImage: 'https://via.placeholder.com/150',
    comment: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: 3,
    userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    userName: 'Mike Johnson',
    userImage: 'https://via.placeholder.com/150',
    comment: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];
const dummyShops = [
  {
    id: '1',
    name: 'Shop Name',
    imageUrl: `${images.shop1}`,
  },
  {
    id: '2',
    name: 'Shop Name',
    imageUrl: `${images.shop2}`,

  },
  {
    id: '3',
    name: 'Shop Name',
    imageUrl: `${images.shop3}`,

  },
  {
    id: '4',
    name: 'Shop Name',
    imageUrl: `${images.shop4}`,

  },
  {
    id: '5',
    name: 'Shop Name',
    imageUrl: `${images.shop5}`,

  },
  {
    id: '6',
    name: 'Shop Name',
    imageUrl: `${images.shop6}`,

  },
];

const Marketplace: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUserProfile);

  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [shops, setShops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    console.log(`Searching for shops with query: ${query}`);
    // Simulated search results for demonstration
    setSearchResults([`Shop 1 - ${query}`, `Shop 2 - ${query}`, `Shop 3 - ${query}`]);
  };

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    setLoading(true)

    const res = await getAllShop()
    setLoading(false)

    setShops(res.data?.data?.data)
    console.log('====================================');
    console.log(res.data?.data?.data, "====ressss");
    console.log('====================================');
  }

  if (loading) {
    return (<Loader />)
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>

        {/* <HeaderComponent
          label={'Shops'}
          onBackPress={() => navigation.goBack()}
        /> */}

        <Card>
          <SearchComponent onSearch={handleSearch} placeholder="Find shop" />
          <WishlistScreen
            wishlist={shops}
            onPress={(shopId, userId) => {
              console.log('====================================');
              console.log(user, "User", "iddddddddd", userId);
              console.log('====================================');

              if (user.id == userId) {
                navigation.navigate("MyShop", { shopId })

              } else {
                navigation.navigate("Shop", { shopId })

              }
            }}
          />

          <CustomButton style={styles.button}
            onPress={() => navigation.navigate("AddStore")}
          >
            Create Shop/My Shop
          </CustomButton>
        </Card>


      </View>
    </ScrollView>
  );
};



export default Marketplace;

