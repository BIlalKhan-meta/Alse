// store/slices/videoSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {uploadVideo} from '../../api/reels';

interface VideoState {
  videos: any[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: VideoState = {
  videos: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

// Thunk for creating/uploading video
export const videoCreate = createAsyncThunk(
  'video/create',
  async ({formData, categoryId}: {formData: FormData; categoryId: number}) => {
    const response = await uploadVideo(formData, categoryId);
    return response.data;
  },
);

// You can add more thunks as needed
export const fetchVideos = createAsyncThunk('video/fetchAll', async () => {
  // Add your fetch videos API call here
  // const response = await getVideos();
  // return response.data;
});

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearVideoError: state => {
      state.error = null;
    },
    resetUploadProgress: state => {
      state.uploadProgress = 0;
    },
  },
  extraReducers: builder => {
    // Video Create
    builder
      .addCase(videoCreate.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(videoCreate.fulfilled, (state, action) => {
        state.loading = false;
        state.videos.unshift(action.payload);
        state.uploadProgress = 0;
      })
      .addCase(videoCreate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload video';
        state.uploadProgress = 0;
      });

    // Fetch Videos
    builder
      .addCase(fetchVideos.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch videos';
      });
  },
});

export const {setUploadProgress, clearVideoError, resetUploadProgress} =
  videoSlice.actions;

export default videoSlice.reducer;
