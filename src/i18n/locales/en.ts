import {create} from 'lodash';

export default {
  // Language Selection Page
  selectLanguage: 'Select Language',
  allLanguages: 'All Languages',

  // Language Names
  english: 'English',
  chinese: 'Chinese',
  french: 'French',
  hindi: 'Hindi',
  portuguese: 'Portuguese',
  spanish: 'Spanish',
  swahili: 'Swahili',

  // Language Native Names
  englishNative: 'English',
  chineseNative: '中国人',
  frenchNative: 'Français',
  hindiNative: 'हिंदी',
  portugueseNative: 'Português',
  spanishNative: 'Español',
  swahiliNative: 'Kiswahili',

  // Language Codes
  en: 'US',
  zh: '中',
  fr: 'FR',
  hi: 'हि',
  pt: 'PO',
  es: 'ES',
  sw: 'KI',

  // Header
  appName: 'Alse',

  // Bottom Navigation
  home: 'Home',
  search: 'Search',
  store: 'Store',
  calendar: 'Calendar',
  profile: 'Profile',

  // Common
  cancel: 'Cancel',
  done: 'Done',
  or: 'Or',
  noPosts: 'No posts to show',
  public: 'Public',
  private: 'Private',
  followers: 'Followers',
  everyone: 'Everyone',
  off: 'Off',
  retry: 'Retry',
  save: 'Save',
  success: 'Success',
  error: 'Error',
  followed: 'Followed',
  unfollowed: 'Unfollowed',
  galleryUpload: 'Upload from gallery',
  camera: 'camera',
  cameraUpload: 'Open Camera',
  checkInternet: 'Please check your internet connection',
  loadingText: 'Please wait...',
  invalid: 'Invalid',
  size: 'Size',
  color: 'Color',
  image: 'Image',
  video: 'Video',
  upload: 'Upload',
  uploadImage: 'Upload image',
  uploadImages: 'Upload images',
  uploadMedia: 'Upload media',
  uploadVideo: 'Upload video',
  category: 'Category',
  status: 'Status',
  description: 'Description',
  add: 'Add',
  update: 'update',

  // Dropdown placeholders
  selectCountry: 'Select country',
  selectCity: 'Select city',
  selectState: 'Select state',
  newPassword: 'Enter new password',
  confirmPassword: 'Enter confirm password',
  selectCategory: 'Select category',
  selectStatus: 'Select status',

  // input placeholders
  enterContent: 'Enter content',
  enterTitle: 'Enter title',

  // Toasts
  toast: {
    // errors
    somethingWentWrong: 'Something went wrong. Please try again later.',
    currentPassword: 'Please enter your current password',
    newPassword: 'Please enter a new password',
    newPasswordLength: 'New password must be at least 6 characters long',
    passwordMatch: 'New password and confirm password do not match',
    samePassword: 'New password must be different from current password',
    confirmPassword: 'Please confirm your password',
    incorrectPassword: 'Current password is incorrect',
    invalidFormat: 'Invalid password format',
    failedToChangePassword:
      'Failed to change password. Please try again later.',
    cantBeEmpty: 'Please fill in at least one field to update',
    failedProfileUpdate: 'Failed to update profile',
    failedGoogleAuth: 'Failed to sign in with Google',
    enterGroupName: 'Please enter a group name',
    selectGroupImage: 'Please upload profile picture',
    selectGroupMembers: 'Please select group members',
    followReqFailed: 'Failed to send follow request',
    unfollowFailed: 'Failed to unfollow user',
    storyRefreshFailed: 'Failed to refresh stories',
    livestreamRefreshFailed: 'Failed to refresh livestreams',
    storyUploadFailed: 'Failed to upload story',
    // success
    passwordChanged: 'Password changed successfully!',
    biddingSettingsChanged: 'Bidding settings updated successfully!',
    followReqSencc: 'Follow Request Sent',
    storyUploadSuccess: 'Story updated successfully',
    addedToCart: 'Product added to cart',
    // progress
    uploadingStory: 'Uploading Story',
  },

  // input fields:
  emailOrPhone: 'Email/Phone Number',
  password: 'Enter Password',

  signIn: {
    title: 'Sign In',
    subTitle: 'Let your ideas travel across the world',
    login: 'Log in',
    forgotPassword: 'Forgot Password',
    rememberMe: 'Remember me',
    createAccount: 'Create Account',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    appleAuth: 'Sign in with Apple',
  },

  signUp: {
    title: 'Sign Up',
    subTitle: 'Welcome to Alse, The opportunity is on your fingertips',
    policy: 'I agree to the terms and conditions and Privacy Policy',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Do you have an account?',
    signIn: 'Sign in',
  },

  searchScr: {
    noResults: 'No results found',
    recent: 'Recent Searches',
  },

  streamingScr: {
    loading: 'Preparing Livestream...',
    start: 'Start Stream',
    live: 'Live',
  },

  reels: {
    loading: 'Preparing reels...',
    noReels: 'No reels to show',
    checkLater: 'Check back later for new content',
  },

  profileScr: {
    posts: 'Posts',
    followers: 'Followers',
    following: 'Following',
    noPosts: 'No posts to show',
    edit: 'Edit Profile',
    share: 'Share Profile',
    loading: 'Loading posts...',
  },

  marketplace: {
    featuredStores: 'Featured Stores',
    noStores: 'No stores available',
    recommendedProds: 'Socially recommended products',
    noProds: 'No products available right now',
    createShop: 'Create Shop/My Shop',
  },

  blogs: {
    forChildren: 'For Children',
    forAdult: 'For Adult',
    forAll: 'For All',
    myBlogs: 'My Blogs',
    addBlog: 'Add Blog',
    updateBlog: 'Update Blog',
    addVideos: 'Add Videos',
    addArticle: 'Add Article',
    blogTitle: 'Blog Title',
    articleTitle: 'Article Title',
    title: 'Title',
  },

  // Settings Screen
  settings: {
    firstName: 'First Name',
    lastName: 'Last Name',
    userName: 'User Name',
    pronouns: 'Pronouns',
    pronounsPlaceholder: 'e.g., they/them, she/her, he/him',
    location: 'Location',
    bio: 'Bio',
    bioPlaceholder: 'Tell us about yourself',
    storeName: 'Store Name',
    storeNamePlaceholder: 'Your store name',
    storeDescription: 'Store Description',
    storeDescriptionPlaceholder: 'Describe your store',
    notification: 'Notification',
    language: 'Language',
    profileSetting: 'Profile Setting',
    socialActivity: 'Social Activity',
    advanceProtection: 'Advance protection',
    biddingAuctionSetting: 'Bidding & Auction Setting',
    marketplaceActivity: 'Marketplace Activity',
    securityPrivacy: 'Security & Privacy',
    save: 'Save',
  },

  // Social Activity
  socialActivity: {
    postVisibility: 'Post visibility',
    allowTags: 'Allow tags',
    filterOffensive: 'Auto filter offensive words',
    messageAllowed: 'Who can send a message',
    commentAllowed: 'Who can comment',
    storyVisibility: 'Story Visibility',
    storyReply: 'Who can reply to your story',
    blockedUsers: 'Blocked users',
  },

  marketplaceActivity: {
    title: 'Marketplace activity',
    purchaseHistory: 'View purchase history',
    savedAuctions: 'Saved actions',
    shippingAddress: 'Shipping address',
    paymentMethods: 'Linked payment methods',
  },

  purchaseHistory: {
    title: 'Purchase history',
    noData: 'No purchase history found',
  },

  savedAuctions: {
    title: 'Saved actions',
    noData: 'No saved actions found',
  },

  securiyPrivacy: {
    title: 'Security And Privacy',
    deviceInfo: 'Device & Login Activity',
    changePassword: 'Change password',
    deleteAccount: 'Disable or Delete Account',
  },

  shippingAddress: {
    title: 'Shipping address',
    name: 'Enter full name',
    address: 'Address (Area and Street)',
    phoneNumber: 'Enter phone number',
    //
    country: 'Country',
    countryCode: 'Select country code',
    postalCode: 'Postal code',
    landmark: 'Landmark',
    city: 'City',
    state: 'State',
  },

  deleteAccount: {
    title: 'Disable Or Delete Account',
    deleteAccount: 'Delete Account',
    deleteYourAccount: 'Delete Your Account',
    deleteConfirmation:
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed',
    disableAccount: 'Disable Account',
    disableYourAccount: 'Disable Your Account',
    disableConfirmation:
      'Are you sure you want to disable your account? You can reactivate it later by logging in',
  },

  changePassword: {
    title: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
  },

  biddingAuction: {
    title: 'Bidding & Auction Settings',
    autoBid: 'Auto Bid Configuration',
    defaultBidIncrement: 'Default Bid Increment',
    bidConfirmation: 'Bid Confirmation prompts',
  },

  stories: {
    addStory: 'Add Story',
  },
};
