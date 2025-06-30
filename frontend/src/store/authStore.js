import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isCheckingAuth: false,

  signup: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api
        .post("/signup", userData)
        .then((res) => res.data);

      set({ isLoading: false, user: response.user, isAuthenticated: true });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "An error occurred",
      });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api
        .post("/verify-email", { verificationToken: code })
        .then((res) => res.data);

      set({ isLoading: false, user: response.user, isAuthenticated: true });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "An error occurred",
      });
      throw error;
    }
  },

  /**
   * Function to log in a user
   * @param {Object} creds - The credentials object containing email and password
   * @return {Promise<void>}
   */
  login: async (creds) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api
        .post("/login", creds)
        .then((response) => response.data);

      // After successful login, immediately fetch user data
      const userData = await api.get("/check-auth").then((res) => res.data);

      set({
        isLoading: false,
        user: userData.user,
        isAuthenticated: true,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "An error occurred",
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await api.get("/check-auth").then((res) => res.data);
      if (!response.user) {
        set({
          isCheckingAuth: false,
          user: null,
          isAuthenticated: false,
        });
        return;
      }
      set({
        isCheckingAuth: false,
        user: response.user,
        isAuthenticated: true,
      });
    } catch (error) {
      // Don't set error state for auth check failures
      // This prevents the "Token is required" message from showing on login page
      set({
        isCheckingAuth: false,
        user: null,
        isAuthenticated: false,
        error: null, // Clear any previous errors
      });
      // Don't throw error for authentication checks
      // This silently fails when user is not logged in
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/logout");
      set({ isLoading: false, user: null, isAuthenticated: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "An error occurred",
      });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/forgot-password", { email });
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "An error occurred",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/reset-password", { token, password });
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "An error occurred",
      });
      throw error;
    }
  },
}));
