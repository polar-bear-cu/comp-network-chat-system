import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { useChatStore } from "./useChatStore";
import { io } from "socket.io-client";
import { useGroupStore } from "./useGroupStore";

const BASE_URL =
  import.meta.env.MODE === "production"
    ? window.location.origin
    : "http://localhost:3000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (username, password) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", {
        username,
        password,
      });
      set({ authUser: res.data });
      get().connectSocket();
    } catch (err) {
      throw err;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (username, password) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", {
        username,
        password,
      });
      set({ authUser: res.data });
      get().connectSocket();
    } catch (err) {
      throw err;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });

    useChatStore.getState().resetChat?.();
    useGroupStore.getState().resetGroup?.();

    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
    } catch (err) {
      throw err;
    } finally {
      set({ isLoggingOut: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, { withCredentials: true });
    set({ socket: newSocket });

    newSocket.on("connect", () => console.log("Socket connected"));
    newSocket.on("getOnlineUsers", (userIds) => set({ onlineUsers: userIds }));
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));
