import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  verifyOtp as verifyOtpApi,
  forgotPassword as forgotPasswordApi,
  login as loginAPI,
  signup as signupAPI,
  resetPassword as resetPasswordAPI,
  logout as logoutApi,
} from '../../api/auth'; // Import the login function from the API file
import {getProfile} from '../../api/profile';

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Thunk for login using the imported login API function
export const login = createAsyncThunk(
  'auth/login',
  async (
    credentials: {email: string; password: string; token: string},
    {rejectWithValue},
  ) => {
    try {
      const response = await loginAPI(credentials);
      console.log(response, 'Responseee frommm loginnn sliceee');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'Login failed');
    }
  },
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (
    signupData: {
      full_name: string;
      last_name: string;
      username: string;
      email: string;
      password: string;
      dialing_code: string;
      phone_number: string;
      gender: string;
      dob: string;
    },
    {rejectWithValue},
  ) => {
    try {
      const response = await signupAPI(signupData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'Signup failed');
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forget-password',
  async (forgetData: {email: string}, {rejectWithValue}) => {
    try {
      const response = await forgotPasswordApi(forgetData);
      return response.data;
    } catch (error) {
      console.log(typeof error, 'Typee off error fromm sliceee ');
      return rejectWithValue(error.response.data || 'Request failed');
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (apiData: {email: string; code: number}) => {
    try {
      const response = await verifyOtpApi(apiData);
      return response.data;
    } catch (error) {}
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    data: {email: string; password: string; confirmPassword: string},
    {rejectWithValue},
  ) => {
    try {
      const response = await resetPasswordAPI(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'Request failed');
    }
  },
);

export const LogoutUser = createAsyncThunk(
  'auth/resetPassword',
  async (
    // data: {email: string; password: string; confirmPassword: string},
    {rejectWithValue},
  ) => {
    try {
      const response = await logoutApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'Request failed');
    }
  },
);

// export const LogoutUser = createAsyncThunk('auth/logoutuser', async () => {
//   const response = await logout();
//   return response;
// });

export const GetUserProfile = createAsyncThunk(
  'user/profile',
  async (_, {rejectWithValue}) => {
    // console.log('comii frommm newsFeedd sliceee');

    try {
      const response = await getProfile();
      console.log(response.data, 'Responseee frommm newsFeedd sliceee');
      return response.data;
    } catch (error: any) {
      console.log(error, 'errrorrr && type');
      return rejectWithValue(error.response.data || 'newsFeedd failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.token = null;
      state.user = null;
    },
    setUser: (state, action) => {
      state.token = action.payload?.access_token;
      state.user = action.payload?.user;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(GetUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        // console.log('====================================');
        // console.log(
        //   'action.payload Profileeee =================>',
        //   action.payload,
        // );
        // console.log('====================================');
        state.user = action.payload?.data;
      })
      .addCase(GetUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(LogoutUser.fulfilled, (state, action) => {
        state.user = null;
        state.token = null;
      });
  },
});
export const selectBearerToken = state => state.auth.token;
export const selectUserProfile = state => state.auth.user;
export const {logout, setUser} = authSlice.actions;
export default authSlice.reducer;
