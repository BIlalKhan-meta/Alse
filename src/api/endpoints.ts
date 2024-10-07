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
    myPost: '/get-user',
    getBlockedUser: 'get-blocked-users',
    block: '/block-user',
    unBlock: '/unblock-user',
  },
};

export default endpoints;
