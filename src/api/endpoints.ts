const endpoints = {
  auth: {
    login: '/login',
    signup: '/signup',
    forgotPassword: '/forget-password',
    verifyOtp: '/verify-code',
    resetPassword: '/set-password',
    logout: '/logout',
  },
  home: {
    feedPost: '/get-newsfeed',
    profileById: '/get-user',
    createPost: '/post/create',
    updatePost: '/post/update',
    deletePost: '/post/delete',
    reportPost: '/report/create',
    myPost: '/get-user',
    getBlockedUser: 'get-blocked-users',
    block: '/block-user',
    unBlock: '/unblock-user',
    followRequest: '/get-follow-requests',
    followers: '/get-followers',
    following: '/get-following',
    follow: '/follow-user',
    unFollow: '/unfollow-user',
    acceptFollow: '/accept-follow-request',
    rejectFollow: '/reject-follow-request',
  },
  profile: {
    editProfile: '/edit-profile',
    getProfile: '/profile',
    changePassword: '/change-password',
  },
  subscription: {
    getSubscription: '/get-subscription-plans',
    getSubscriptionLogs: '/get-subscription-logs',
    subscribe: '/subscribe',
  },
  shop: {
    allShop: '/shops',
    createShop: '/shop/create',
    shopDetail: '/shop',
  },
  education: {
    getArticles: '/articles',
    getBlogs: '/blogs',
    getVideos: '/videos',
    getBlog: '/blog',
    getArticle: '/article',
  },
};

export default endpoints;
