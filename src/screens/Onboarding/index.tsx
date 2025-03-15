import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  ScrollView,
  SafeAreaView
} from 'react-native';
import Welcome_1 from './Welcome_1';
import Welcome_2 from './Welcome_2';
import { setUser } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../hooks/storeHooks';
const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef(null);
  const { user } = route.params;
  const dispatch = useAppDispatch();

  // Handle "Next" button press
  const handleNext = async () => {
    if (currentPage < 1) {
      // Use ScrollView's built-in animation for smoother transitions
      scrollViewRef.current?.scrollTo({ x: width * (currentPage + 1), animated: true });
      setCurrentPage(currentPage + 1);
    } else {
      if (user) {
        return dispatch(setUser(user));
      }

      // This is the last screen, mark as completed
      navigation.replace('Login');
    }
  };

  // Onboarding screens content
  const screens = [
    // First screen
    {
      title: false,
      subtitle: false,
      description: false,
    },
    // Second screen
    {
      title: "Your World, Your Rules 🔑",
      subtitle: "",
      description: "Discover, engage, and express yourself freely—because your voice matters."
    }
  ];

  return (
    <SafeAreaView style={ styles.safeArea }>
      <StatusBar barStyle="light-content" backgroundColor="#004D40" />

      <ScrollView
        ref={ scrollViewRef }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={ false }
        scrollEnabled={ true } // Enable swipe gestures
        onMomentumScrollEnd={ (event) => {
          // Update current page based on scroll position
          const newPage = Math.floor(event.nativeEvent.contentOffset.x / width + 0.5);
          setCurrentPage(newPage);
        } }
        contentContainerStyle={ styles.scrollContent }
      >
        { screens.map((screen, index) => (
          <View
            key={ index }
            style={ styles.screenContainer }
          >
            { index === 0 ? (
              // First screen with social media icons
              <View style={ styles.furnitureContainer }>
                <Image source={require('./Welcome_1.png')} style={styles.welcome1Image} />
              </View>
            ) : (
              // Second screen with furniture illustration
              <View style={ styles.furnitureContainer }>
                <Welcome_2 />
              </View>
            ) }

            {/* Text Content */ }
            { screen.title && <View style={ styles.textContainer }>
              <Text style={ styles.heading }>{ screen.title }</Text>
              <Text style={ styles.description }>{ screen.description }</Text>
            </View>
            }
          </View>
        )) }
      </ScrollView>

      {/* Pagination Dots */ }
      <View style={ styles.paginationContainer }>
        <View style={ [
          styles.paginationDot,
          currentPage === 0 ? styles.activeDot : {}
        ] } />
        <View style={ [
          styles.paginationDot,
          currentPage === 1 ? styles.activeDot : {}
        ] } />
      </View>

      {/* Next Button */ }
      <View style={ styles.buttonContainer }>
        <TouchableOpacity style={ styles.button } onPress={ handleNext }>
          <Text style={ styles.buttonText }>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#005255', // Deep teal color
  },
  scrollContent: {
    flexGrow: 1,
  },
  screenContainer: {
    width,
    height: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  furnitureContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Make this take available space
    paddingTop: 20,
  },
  welcome1Image: {
    width: 350,
    height: 350,
  },
  furnitureImage: {
    width: 180,
    height: 180,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: '#fff',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 100, // Increased to make room for pagination and next button
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subheadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 20,
    color: 'white',
    marginRight: 5,
  },
  emoji: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    color: '#B0BEC5',
    textAlign: 'center',
    lineHeight: 22,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 35,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 10,
    height: 3,
    backgroundColor: '#80CBC4',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    width: 30,
    backgroundColor: '#00BFA5',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default OnboardingScreen;