import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {editProfile, getUserPosts} from '../../api/profile';

interface PostItem {
  id: string;
  uri: string;
  title?: string;
}

interface ProfileState {
  posts: PostItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  posts: [],
  loading: false,
  error: null,
};

export const postCreate = createAsyncThunk(
  'user/postCreate',
  async (data: FormData) => {
    const response = await editProfile(data);
    return response;
  },
);

export const fetchUserPosts = createAsyncThunk(
  'profile/fetchUserPosts',
  async (userId: string, {rejectWithValue}) => {
    try {
      const response = await getUserPosts(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload?.data || [];
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearPosts, clearError} = profileSlice.actions;
export const selectUserPosts = (state: any) => state.profile.posts;
export const selectPostsLoading = (state: any) => state.profile.loading;
export const selectPostsError = (state: any) => state.profile.error;

export default profileSlice.reducer;
