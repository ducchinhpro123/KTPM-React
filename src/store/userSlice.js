import { createSlice } from '@reduxjs/toolkit';
import tokenService from '../services/tokenService';

// Helper to load user data from localStorage
const loadUserFromStorage = () => {
  try {
    const token = tokenService.getToken();
    const user = localStorage.getItem('user');
    return {
      token: token || null,
      user: user ? JSON.parse(user) : null
    };
  } catch (error) {
    console.error('Error loading user data from localStorage:', error);
    return { user: null, token: null };
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState: loadUserFromStorage(),
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      tokenService.setToken(action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      tokenService.removeToken();
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;