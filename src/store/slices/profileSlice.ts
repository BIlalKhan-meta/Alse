import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {editProfile} from '../../api/profile';

export const postCreate = createAsyncThunk(
  'user/postCreate',
  async (data: FormData) => {
    const response = await editProfile(data);
    return response;
  },
);
