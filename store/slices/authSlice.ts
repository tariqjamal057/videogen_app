import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  credits: number;
  authId: string;
}

export interface Plan {
  id: string;
  name: string;
  bulletPoints: string[];
  credits: number;
  amount: number;
  mostPopular: boolean;
  bestValue: boolean;
  playStorePlanId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      if (user) state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Note: We'll use the matcher or individual cases if we import the apiSlice.
    // For now, adding a manual updateUser is safer to avoid circular dependencies if any.
  },
});

export const { setCredentials, setToken, logout, setInitializing, updateUser } =
  authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.token;
export const selectIsInitializing = (state: { auth: AuthState }) =>
  state.auth.isInitializing;
