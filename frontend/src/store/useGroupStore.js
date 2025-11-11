import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { useChatStore } from "./useChatStore";
import { useAuthStore } from "./useAuthStore";

export const useGroupStore = create((set, get) => ({
  allGroups: [], // Keep for backward compatibility
  myGroups: [], // Groups user has joined
  availableGroups: [], // Groups user can join
  messages: [],
  isMessagesLoading: false,
  selectedGroup: null,
  isGroupsLoading: false,
  isMyGroupsLoading: false,
  isAvailableGroupsLoading: false,
  openCreateGroupPopup: false,
  groupTypingUsers: {},
  groupMessageCooldowns: {},
  groupUnreadCounts: {},

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
      
      get().markGroupMessagesAsRead(group._id);
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

  getMyGroups: async () => {
    set({ isMyGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ myGroups: res.data });
    } catch (error) {
      console.error("Error fetching my groups:", error);
    } finally {
      set({ isMyGroupsLoading: false });
    }
  },

  getAvailableGroups: async () => {
    set({ isAvailableGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/available");
      set({ availableGroups: res.data });
    } catch (error) {
      console.error("Error fetching available groups:", error);
    } finally {
      set({ isAvailableGroupsLoading: false });
    }
  },

  getMyGroupsSilent: async () => {
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ myGroups: res.data });
    } catch (error) {
      console.error("Error fetching my groups silently:", error);
    }
  },

  createGroup: async (name) => {
    try {
      const res = await axiosInstance.post("/groups", { name });
      
      await get().getMyGroups();
      
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
      
      await Promise.all([
        get().getMyGroups(),
        get().getAvailableGroups()
      ]);
      
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
      
      await Promise.all([
        get().getMyGroups(),
        get().getAvailableGroups()
      ]);

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

  getGroupUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/groups/unread-counts");
      set({ groupUnreadCounts: res.data });
    } catch (error) {
      console.error("Error fetching group unread counts:", error);
    }
  },

  markGroupMessagesAsRead: async (groupId) => {
    try {
      await axiosInstance.put(`/groups/${groupId}/mark-read`);
      
      set((state) => {
        const newGroupUnreadCounts = { ...state.groupUnreadCounts };
        delete newGroupUnreadCounts[groupId];
        return { groupUnreadCounts: newGroupUnreadCounts };
      });
    } catch (error) {
      console.error("Error marking group messages as read:", error);
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
      const { selectedGroup, messages, groupMessageCooldowns } = get();
      const groupId = selectedGroup._id;
      const now = Date.now();
      
      const groupCooldown = groupMessageCooldowns[groupId];
      const canSend = !groupCooldown || groupCooldown.canSend;
      const lastSentTime = groupCooldown?.lastSentTime || 0;
      
      if (!canSend || (now - lastSentTime) < 1000) {
        console.log(`Frontend rate limit: Message queued for group ${groupId}`);
        return false;
      }
      
      const res = await axiosInstance.post(
        `/groups/${selectedGroup._id}/send`,
        { text }
      );
      
      // Add message locally for immediate feedback, socket will handle for others
      set({ 
        messages: [...messages, res.data],
        groupMessageCooldowns: {
          ...groupMessageCooldowns,
          [groupId]: {
            canSend: false,
            lastSentTime: now
          }
        }
      });
      
      setTimeout(() => {
        set((state) => ({
          groupMessageCooldowns: {
            ...state.groupMessageCooldowns,
            [groupId]: {
              ...state.groupMessageCooldowns[groupId],
              canSend: true
            }
          }
        }));
      }, 1000);

      get().getMyGroupsSilent();
      return true;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log("Backend rate limit: Group message queued");
        return false;
      }
      
      console.error("Error sending group message:", error);
      return false;
    }
  },

  subscribeToGroups: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newGroup", (newGroup) => {
      const { authUser } = useAuthStore.getState();
      const currentGroups = get().allGroups;
      const groupExists = currentGroups.some((g) => g._id === newGroup._id);

      if (!groupExists) {
        set({ allGroups: [...currentGroups, newGroup] });
        
        const isUserMember = newGroup.members.some(member => member._id === authUser._id);
        if (!isUserMember) {
          const currentAvailableGroups = get().availableGroups;
          set({ availableGroups: [...currentAvailableGroups, newGroup] });
        }
      }
    });

    socket.on("groupUpdated", (updatedGroup) => {
      get().getMyGroupsSilent();
      get().getAvailableGroups();
      
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

    socket.on("newGroupMessageNotification", (newMessage) => {
      const { selectedGroup } = get();
      const { authUser } = useAuthStore.getState();
      
      get().getMyGroupsSilent();
      
      // Don't increment unread count for messages sent by the current user
      if (newMessage.senderId && newMessage.senderId === authUser._id) {
        return;
      }

      // Don't increment unread count if user is currently viewing this group
      if (!selectedGroup || selectedGroup._id !== newMessage.groupId) {
        set((state) => {
          const newGroupUnreadCounts = { ...state.groupUnreadCounts };
          const groupId = newMessage.groupId;
          newGroupUnreadCounts[groupId] = (newGroupUnreadCounts[groupId] || 0) + 1;
          return { groupUnreadCounts: newGroupUnreadCounts };
        });
      }
    });
  },

  unsubscribeFromGroups: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroup");
    socket.off("groupUpdated");
    socket.off("newGroupMessageNotification");
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newGroupMessage", (newMessage) => {
      const { selectedGroup } = get();
      const isMessageForCurrentGroup = newMessage.groupId === selectedGroup._id;
      
      get().getMyGroupsSilent();
      
      if (!isMessageForCurrentGroup) return;

      const currentMessages = get().messages;
      
      // Check if message already exists to prevent duplicates
      const messageExists = currentMessages.some(msg => msg._id === newMessage._id);
      if (!messageExists) {
        set({ messages: [...currentMessages, newMessage] });
      }
      
      get().markGroupMessagesAsRead(selectedGroup._id);
    });

    socket.on("groupUserTyping", ({ groupId, userId, username }) => {
      console.log("Group user typing:", groupId, userId, username);
      get().setGroupTypingUser(groupId, userId, username, true);
    });

    socket.on("groupUserStopTyping", ({ groupId, userId }) => {
      console.log("Group user stop typing:", groupId, userId);
      get().setGroupTypingUser(groupId, userId, null, false);
    });

    socket.on("groupMessagesRead", ({ groupId, userId }) => {
      const { selectedGroup, messages } = get();
      
      if (selectedGroup && selectedGroup._id === groupId) {
        set({
          messages: messages.map(msg => ({
            ...msg,
            readBy: msg.readBy && !msg.readBy.includes(userId) 
              ? [...msg.readBy, userId] 
              : msg.readBy || [userId]
          }))
        });
      }
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroupMessage");
    socket.off("groupUserTyping");
    socket.off("groupUserStopTyping");
    socket.off("groupMessagesRead");
  },
}));
