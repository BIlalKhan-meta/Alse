// import {configureStore} from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import homeReducer from './slices/homeSlice';
// const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     home: homeReducer,
//     // comments: commentsReducer,
//     // users: usersReducer,
//   },
// });

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch;

// export default store;

import {configureStore, combineReducers} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import homeReducer from './slices/homeSlice';
import generalReducer from './slices/generalSlice';
import profileReducer from './slices/profileSlice';
import settingsReducer from './slices/settingsSlice';
import callReducer from './slices/callSlice';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import {persistReducer, persistStore} from 'redux-persist';
import {FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a persist config
const persistConfig = {
  key: 'root', // Key to identify the persisted data in storage
  storage: AsyncStorage, // Specify the storage engine (localStorage or AsyncStorage for mobile)
  whitelist: ['auth'], // Only persist the auth reducer
};

// Combine reducers for the store
const rootReducer = combineReducers({
  auth: authReducer,
  home: homeReducer,
  general: generalReducer,
  profile: profileReducer,
  settings: settingsReducer,
  call: callReducer,
});

// Persist the combined reducers
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store with persisted reducer
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Export the persistor along with the store
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
