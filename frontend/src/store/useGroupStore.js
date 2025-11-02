import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { useChatStore } from "./useChatStore";

export const useGroupStore = create((set, get) => ({
  allGroups: [],
  selectedGroup: null,
  isGroupsLoading: false,
  openCreateGroupPopup: false,

  setOpenCreateGroupPopup: (open) => set({ openCreateGroupPopup: open }),
  setSelectedGroup: (group) => {
    const current = get().selectedGroup;
    if (current?._id === group?._id) return;

    set({ selectedGroup: group });

    if (group !== null) {
      useChatStore.getState().setSelectedUser(null);
    }
  },

  getAllGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ allGroups: res.data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (name) => {
    try {
      const res = await axiosInstance.post("/groups", { name });
      return { success: true, group: res.data };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Something went wrong",
      };
    }
  },

  resetGroup: () =>
    set({
      selectedGroup: null,
      allGroups: [],
      activeTab: "chats",
    }),

  joinGroup: (groupId) => {
    alert(`Join group ${groupId}`);
  },
}));
