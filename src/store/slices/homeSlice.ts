import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  commentLike,
  createPost,
  deletePost,
  editPost,
  fetchMyPost,
  fetchProfileById,
  getBlockedUsers,
  getFollowersList,
  getFollowingList,
  getPostComment,
  getRequestFollow,
  newsFeed,
  postComment,
  postLike,
  userBlock,
  userFollow,
  userFollowAccept,
  userFollowReject,
  userUnblock,
  userUnFollow,
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
    try {
      const response = await newsFeed({per_page: 100});

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
  async (formData: FormData, {rejectWithValue}) => {
    try {
      const response = await createPost(formData);
      return response;
    } catch (error: any) {
      const payload =
        error?.response != null ? error.response.data : error;
      return rejectWithValue(
        payload ?? {message: error?.message || 'Failed to create post'},
      );
    }
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

export const getFollowRequest = createAsyncThunk(
  'user/RequestFollow',
  async () => {
    const response = await getRequestFollow();
    return response;
  },
);

export const getFollowers = createAsyncThunk('user/Follower', async () => {
  const response = await getFollowersList();
  return response;
});

export const getFollowing = createAsyncThunk('user/Following', async () => {
  const response = await getFollowingList();
  return response;
});

export const followUser = createAsyncThunk(
  'user/followUser',
  async (id: number) => {
    const response = await userFollow(id);
    return response;
  },
);
export const unFollowUser = createAsyncThunk(
  'user/unFollowUser',
  async (id: number) => {
    const response = await userUnFollow(id);
    return response;
  },
);

export const acceptFollow = createAsyncThunk(
  'user/AcceptfollowUser',
  async (id: number) => {
    const response = await userFollowAccept(id);
    return response;
  },
);

export const rejectFollow = createAsyncThunk(
  'user/rejectfollowUser',
  async (id: number) => {
    const response = await userFollowReject(id);
    return response;
  },
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    updateLike: (state, action) => {
      let index = state.posts.findIndex(
        item => item?.id == action?.payload?.postid,
      );
      if (index != -1) {
        state.posts[index].is_liked = !state.posts[index].is_liked;
        const postFound = state.posts[index];

        const clone = JSON.parse(JSON.stringify(postFound?.likes));
        const find = clone.findIndex(
          val => val?.user?.id == action?.payload?.tempData?.user?.id,
        );
        console.log('findfindfindfind ====findfindfind>', find);
        if (find > -1) {
          clone.splice(find, 1);
        } else {
          clone.push(action?.payload?.tempData);
        }
        state.posts[index].likes = clone;
      }
    },
    updatePost: (state, action) => {
      console.log('ACTIONNNNNN', action?.payload);
      let index = state.posts.findIndex(
        item => item?.id == action?.payload?.id,
      );

      // console.log('INDEXXXXXXXX', state.posts[index]);
      if (index != -1) {
        state.posts[index] = action?.payload;
      }
    },
    postSave: (state, action) => {
      let index = state.posts.findIndex(item => item?.id == action?.payload);
      if (index! - 1) {
        state.posts[index].is_saved = !state.posts[index].is_saved;
      }
    },
  },
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
    // .addCase(likePost.fulfilled, (state, action) => {});
  },
});

export const {updateLike, postSave, updatePost} = homeSlice.actions;

export default homeSlice.reducer;
