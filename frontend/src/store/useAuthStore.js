import axiosInstance from "@/lib/axios";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (username, password) => {
    try {
      const res = await axiosInstance.post("/auth/signup", {
        username,
        password,
      });
      set({ authUser: res.data });
    } catch (err) {
      throw err;
    }
  },
}));
