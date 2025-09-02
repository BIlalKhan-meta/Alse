import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {editProfile, getUserPosts} from '../../api/profile';

interface PostItem {
  id: string;
  uri: string;
  title?: string;
}

interface MediaItem {
  id: number;
  post_id: number;
  file: string;
  type: 'image' | 'video';
  path: string;
  date: string;
}

interface ApiPost {
  id: number;
  user_id: number;
  name: string;
  fullname: string;
  username: string;
  avatar: string;
  description: string;
  privacy: number;
  date: string;
  total_likes: number;
  total_comments: number;
  is_liked: boolean;
  is_saved: boolean;
  media: MediaItem[];
  likes: any[];
  comments: any[];
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
      // Extract posts from nested response structure: response.data.data.data
      const apiPosts: ApiPost[] = response.data?.data?.data || [];

      // Filter posts that have media (disregard posts without media) and transform to PostItem format
      const postsWithMedia = apiPosts
        .filter((post: ApiPost) => post.media && post.media.length > 0)
        .map((post: ApiPost) => ({
          id: post.id.toString(),
          uri: post.media[0].path, // Use first media item's path for grid display
          title: post.description,
        }));

      return postsWithMedia;
    } catch (error: any) {
      console.error('Fetch posts error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch posts',
      );
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearPosts: state => {
      state.posts = [];
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload || [];
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
