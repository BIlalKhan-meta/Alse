import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {editProfile, getUserPosts} from '../../api/profile';
import {getProfileGridMedia} from '../../utils/helpers';

interface PostItem {
  id: string;
  uri: string;
  /** Fullscreen playback URL (video file or original image). */
  playbackUrl: string;
  title?: string;
  isVideo?: boolean;
  userName?: string;
  date?: string;
}

interface MediaItem {
  id: number;
  post_id: number;
  file: string;
  type: 'image' | 'video';
  path: string;
  date: string;
  thumbnail_path?: string;
  medium_path?: string;
  thumbnail_file?: string;
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

const mapApiPostsToGridItems = (apiPosts: ApiPost[]): PostItem[] =>
  (apiPosts || [])
    .filter((post: ApiPost) => post.media && post.media.length > 0)
    .map((post: ApiPost) => {
      const grid = getProfileGridMedia(post.media);
      return {
        id: post.id.toString(),
        uri: grid?.uri || '',
        playbackUrl: grid?.playbackUrl || grid?.uri || '',
        title: post.description,
        isVideo: !!grid?.isVideo,
        userName: post.fullname || post.name || post.username || '',
        date: post.date,
      };
    });

export const fetchUserPosts = createAsyncThunk(
  'profile/fetchUserPosts',
  async (userId: string, {rejectWithValue}) => {
    try {
      const response = await getUserPosts(userId);
      // Paginated: data.data.data | non-paginated: data.data (array)
      const payload = response.data?.data;
      const apiPosts: ApiPost[] = Array.isArray(payload)
        ? payload
        : payload?.data || [];

      return mapApiPostsToGridItems(apiPosts);
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
    /** Seed grid from `/profile` (or similar) when that payload already includes posts. */
    setPostsFromProfile: (state, action: PayloadAction<ApiPost[]>) => {
      state.posts = mapApiPostsToGridItems(action.payload || []);
      state.loading = false;
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
        // Keep previously seeded profile posts if the posts endpoint returned nothing
        if (action.payload?.length) {
          state.posts = action.payload;
        }
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearPosts, clearError, setPostsFromProfile} = profileSlice.actions;
export const selectUserPosts = (state: any) => state.profile.posts;
export const selectPostsLoading = (state: any) => state.profile.loading;
export const selectPostsError = (state: any) => state.profile.error;

export default profileSlice.reducer;
