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
  },
};

export default endpoints;
