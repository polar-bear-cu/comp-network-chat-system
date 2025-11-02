import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { useChatStore } from "./useChatStore";

export const useGroupStore = create((set, get) => ({
  allGroups: [],
  messages: [],
  isMessagesLoading: false,
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
      await get().getAllGroups();
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

  joinGroup: async (groupId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/join`);
      await get().getAllGroups();

      return { success: true, group: res.data };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to join group",
      };
    }
  },

  getMessagesByGroupId: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ messages: res.data });
    } catch (error) {
      throw error;
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendGroupMessage: async (text) => {
    try {
      const { selectedGroup, messages } = get();
      const res = await axiosInstance.post(
        `/groups/${selectedGroup._id}/send`,
        {
          text,
        }
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      throw error;
    }
  },
}));
