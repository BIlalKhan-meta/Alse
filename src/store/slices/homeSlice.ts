import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  createPost,
  fetchMyPost,
  fetchProfileById,
  newsFeed,
  postLike,
} from '../../api/home';

interface HomeState {
  posts: [];
  loading: boolean;
  error: string | null;
}

const initialState: HomeState = {
  posts: [],
  loading: false,
  error: null,
};

export const GetNewsFeed = createAsyncThunk(
  'user/NewsFeed',
  async (_, {rejectWithValue}) => {
    console.log('comii frommm newsFeedd sliceee');

    try {
      const response = await newsFeed();
      console.log(response, 'Responseee frommm newsFeedd sliceee');
      return response.data;
    } catch (error: any) {
      console.log(error, 'errrorrr && type');
      return rejectWithValue(error.response.data || 'newsFeedd failed');
    }
  },
);

export const getProfileById = createAsyncThunk(
  'user/profile/id',
  async (id: number) => {
    const response = await fetchProfileById(id);
    return response;
  },
);

export const likePost = createAsyncThunk(
  'post/likePost',
  async (id: number) => {
    const response = await postLike(id);
    return response;
  },
);

export const postCreate = createAsyncThunk(
  'user/postCreate',
  async (data: FormData) => {
    const response = await createPost(data);
    return response;
  },
);

export const getMyPost = createAsyncThunk('user/MyPost', async (id: number) => {
  const response = await fetchMyPost(id);
  return response;
});

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(GetNewsFeed.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetNewsFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload?.data?.data;
      })
      .addCase(GetNewsFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default homeSlice.reducer;
