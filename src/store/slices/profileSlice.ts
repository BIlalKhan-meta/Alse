import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {editProfile, getUserPosts, getUserVideos} from '../../api/profile';
import {getProfileGridMedia, resolvePlayableMediaUrl} from '../../utils/helpers';

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

interface ApiVideo {
  id: number;
  title?: string;
  content?: string;
  video?: string;
  date?: string;
  fullname?: string;
  username?: string;
  created_at?: string;
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

const extractPaginatedList = (response: any): any[] => {
  const payload = response?.data?.data;
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const mapApiPostsToGridItems = (apiPosts: ApiPost[]): PostItem[] =>
  (apiPosts || [])
    .filter((post: ApiPost) => post.media && post.media.length > 0)
    .map((post: ApiPost) => {
      const grid = getProfileGridMedia(post.media);
      const uri = resolvePlayableMediaUrl(grid?.uri || '');
      const playbackUrl = resolvePlayableMediaUrl(
        grid?.playbackUrl || grid?.uri || '',
      );
      return {
        id: `post-${post.id}`,
        uri,
        playbackUrl: playbackUrl || uri,
        title: post.description,
        isVideo: !!grid?.isVideo,
        userName: post.fullname || post.name || post.username || '',
        date: post.date,
      };
    });

const mapApiVideosToGridItems = (apiVideos: ApiVideo[]): PostItem[] =>
  (apiVideos || [])
    .map(video => {
      const raw =
        video.video ||
        (video as any).video_url ||
        (video as any).url ||
        (video as any).media_url ||
        (video as any).file;
      const url = resolvePlayableMediaUrl(raw);
      if (!url) {
        return null;
      }
      return {
        id: `reel-${video.id}`,
        uri: url,
        playbackUrl: url,
        title: video.title || video.content || '',
        isVideo: true,
        userName: video.fullname || video.username || '',
        date: video.date || video.created_at,
      };
    })
    .filter(Boolean) as PostItem[];

const sortByDateDesc = (items: PostItem[]): PostItem[] =>
  [...items].sort((a, b) => {
    const da = a.date ? Date.parse(a.date) : 0;
    const db = b.date ? Date.parse(b.date) : 0;
    return db - da;
  });

export const fetchUserPosts = createAsyncThunk(
  'profile/fetchUserPosts',
  async (userId: string, {rejectWithValue}) => {
    try {
      const [postsRes, videosRes] = await Promise.all([
        getUserPosts(userId).catch(err => {
          console.error('Fetch posts error:', err);
          return null;
        }),
        getUserVideos(userId).catch(err => {
          console.error('Fetch profile videos error:', err);
          return null;
        }),
      ]);

      const apiPosts: ApiPost[] = postsRes
        ? extractPaginatedList(postsRes)
        : [];
      const apiVideos: ApiVideo[] = videosRes
        ? extractPaginatedList(videosRes)
        : [];

      const merged = sortByDateDesc([
        ...mapApiPostsToGridItems(apiPosts),
        ...mapApiVideosToGridItems(apiVideos),
      ]);

      if (!postsRes && !videosRes) {
        return rejectWithValue('Failed to fetch posts');
      }

      return merged;
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
