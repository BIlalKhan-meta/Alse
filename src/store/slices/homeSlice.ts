import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  commentLike,
  createPost,
  deletePost,
  editPost,
  fetchMyPost,
  fetchProfileById,
  getBlockedUsers,
  getPostComment,
  newsFeed,
  postComment,
  postLike,
  userBlock,
  userUnblock,
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

export const likeComment = createAsyncThunk(
  'post/likePost',
  async ({id, commentId}: {id: number; commentId: number}) => {
    const response = await commentLike(id, commentId);
    return response;
  },
);

export const getCommentPost = createAsyncThunk(
  'post/likePost',
  async (id: number) => {
    const response = await getPostComment(id);
    return response;
  },
);

export const commentPost = createAsyncThunk(
  'post/likePost',
  async (
    {formData, id}: {formData: FormData; id: number},
    {rejectWithValue},
  ) => {
    try {
      const response = await postComment(formData, id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'post comments failed');
    }
  },
);

export const postCreate = createAsyncThunk(
  'user/postCreate',
  async (data: FormData) => {
    const response = await createPost(data);
    return response;
  },
);

export const postEdit = createAsyncThunk(
  'user/postEdit',
  async (
    {formData, id}: {formData: FormData; id: number},
    {rejectWithValue},
  ) => {
    console.log(formData, id, 'fromm sliceeee');
    try {
      const response = await editPost(formData, id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data || 'post update failed');
    }
  },
);

export const PostDelete = createAsyncThunk(
  'post/delete',
  async (id: number) => {
    const response = await deletePost(id);
    return response;
  },
);

export const getMyPost = createAsyncThunk('user/MyPost', async (id: number) => {
  const response = await fetchMyPost(id);
  return response;
});

export const getUserBlockList = createAsyncThunk('user/blocklist', async () => {
  const response = await getBlockedUsers();
  return response;
});

export const blockUser = createAsyncThunk(
  'user/blockUser',
  async (id: number) => {
    const response = await userBlock(id);
    return response;
  },
);
export const unBlockUser = createAsyncThunk(
  'user/unBlockUser',
  async (id: number) => {
    const response = await userUnblock(id);
    return response;
  },
);

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
