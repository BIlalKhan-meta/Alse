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
    myPost: '/get-user',
  },
};

export default endpoints;
