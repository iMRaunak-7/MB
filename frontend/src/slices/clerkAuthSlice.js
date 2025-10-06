import { createSlice } from '@reduxjs/toolkit';

// Create a slice with initial state being null
const initialState = {
  userInfo: null
};

const clerkAuthSlice = createSlice({
  name: 'clerkAuth',
  initialState,
  reducers: {
    setClerkUser: (state, action) => {
      state.userInfo = action.payload;
    },
    clearClerkUser: (state) => {
      state.userInfo = null;
    }
  }
});

export const { setClerkUser, clearClerkUser } = clerkAuthSlice.actions;

export default clerkAuthSlice.reducer;