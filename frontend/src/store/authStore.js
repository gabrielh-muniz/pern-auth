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
}));
