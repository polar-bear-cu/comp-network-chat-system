import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { useChatStore } from "./useChatStore";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  allGroups: [],
  messages: [],
  isMessagesLoading: false,
  selectedGroup: null,
  isGroupsLoading: false,
  openCreateGroupPopup: false,
  groupTypingUsers: {},

  setOpenCreateGroupPopup: (open) => set({ openCreateGroupPopup: open }),

  setSelectedGroup: (group) => {
    const current = get().selectedGroup;
    if (current?._id === group?._id) return;

    if (current) {
      const socket = useAuthStore.getState().socket;
      if (socket && socket.connected) {
        socket.emit("leaveGroup", { groupId: current._id });
      }

      set((state) => {
        const newGroupTypingUsers = { ...state.groupTypingUsers };
        delete newGroupTypingUsers[current._id];
        return { groupTypingUsers: newGroupTypingUsers };
      });
    }

    set({ selectedGroup: group });

    if (group !== null) {
      useChatStore.getState().setSelectedUser(null);
      const socket = useAuthStore.getState().socket;
      if (socket && socket.connected) {
        socket.emit("joinGroup", { groupId: group._id });
      }
    }
  },

  getAllGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ allGroups: res.data });
    } catch (error) {
      console.error("Error fetching groups:", error);
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
      messages: [],
      groupTypingUsers: {},
    }),

  joinGroup: async (groupId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/join`);
      await get().getAllGroups();
      return { success: true, group: res.data };
    } catch (error) {
      console.error("Error joining group:", error);
      return {
        success: false,
        message: error?.response?.data?.message || "Failed to join group",
      };
    }
  },

  leaveGroup: async (groupId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/leave`);
      await get().getAllGroups();

      const currentSelected = get().selectedGroup;
      if (currentSelected?._id === groupId) {
        set({ selectedGroup: null, messages: [] });
      }
      return { success: true, group: res.data };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || "Fail to leave group",
      };
    }
  },

  getMessagesByGroupId: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching group messages:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  emitGroupTyping: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }

    socket.emit("groupTyping", { groupId: selectedGroup._id });
  },

  emitGroupStopTyping: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }

    socket.emit("groupStopTyping", { groupId: selectedGroup._id });
  },

  setGroupTypingUser: (groupId, userId, username, isTyping) => {
    set((state) => {
      const groupTyping = { ...state.groupTypingUsers };

      if (!groupTyping[groupId]) {
        groupTyping[groupId] = {};
      }

      if (isTyping && username) {
        groupTyping[groupId][userId] = username;
      } else {
        delete groupTyping[groupId][userId];

        if (Object.keys(groupTyping[groupId]).length === 0) {
          delete groupTyping[groupId];
        }
      }

      return { groupTypingUsers: groupTyping };
    });
  },

  sendGroupMessage: async (text) => {
    try {
      const { selectedGroup, messages } = get();
      const res = await axiosInstance.post(
        `/groups/${selectedGroup._id}/send`,
        { text }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Error sending group message:", error);
    }
  },

  subscribeToGroups: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newGroup", (newGroup) => {
      const currentGroups = get().allGroups;
      const groupExists = currentGroups.some((g) => g._id === newGroup._id);

      if (!groupExists) {
        set({ allGroups: [...currentGroups, newGroup] });
      }
    });

    socket.on("groupUpdated", (updatedGroup) => {
      const currentGroups = get().allGroups;
      const updatedGroups = currentGroups.map((g) =>
        g._id === updatedGroup._id ? updatedGroup : g
      );
      set({ allGroups: updatedGroups });

      const selectedGroup = get().selectedGroup;
      if (selectedGroup && selectedGroup._id === updatedGroup._id) {
        set({ selectedGroup: updatedGroup });
      }
    });
  },

  unsubscribeFromGroups: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroup");
    socket.off("groupUpdated");
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newGroupMessage", (newMessage) => {
      const isMessageForCurrentGroup = newMessage.groupId === selectedGroup._id;
      if (!isMessageForCurrentGroup) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });
    });

    socket.on("groupUserTyping", ({ groupId, userId, username }) => {
      console.log("Group user typing:", groupId, userId, username);
      get().setGroupTypingUser(groupId, userId, username, true);
    });

    socket.on("groupUserStopTyping", ({ groupId, userId }) => {
      console.log("Group user stop typing:", groupId, userId);
      get().setGroupTypingUser(groupId, userId, null, false);
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroupMessage");
    socket.off("groupUserTyping");
    socket.off("groupUserStopTyping");
  },
}));
