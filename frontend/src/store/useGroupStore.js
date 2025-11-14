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
  processedNotifications: new Set(), // Track processed notification IDs
  isSubscribed: false, // Track subscription state
  activeGroupTab: "my-groups", // Current active tab in GroupList

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

      await Promise.all([get().getMyGroups(), get().getAvailableGroups()]);

      const { setActiveTab } = useChatStore.getState();

      get().setSelectedGroup(null);

      setActiveTab("groups");

      set({ activeGroupTab: "my-groups" });

      setTimeout(() => {
        get().setSelectedGroup(res.data);
      }, 100);

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

      await Promise.all([get().getMyGroups(), get().getAvailableGroups()]);

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

  sendGroupMessage: async (groupId, text) => {
    try {
      const { messages, groupMessageCooldowns } = get();
      const socket = useAuthStore.getState().socket;
      const authUser = useAuthStore.getState().authUser;
      const now = Date.now();

      const groupCooldown = groupMessageCooldowns[groupId];
      const canSend = !groupCooldown || groupCooldown.canSend;
      const lastSentTime = groupCooldown?.lastSentTime || 0;

      if (!canSend || now - lastSentTime < 1000) {
        console.log(`Frontend rate limit: Message queued for group ${groupId}`);
        return false;
      }

      const message = {
        sender: authUser,
        groupId: groupId,
        text: text,
        readBy: [],
        createdAt: new Date(),
      };

      socket.emit("sendGroupMessage", message);

      set({
        messages: [...messages, message],
        groupMessageCooldowns: {
          ...groupMessageCooldowns,
          [groupId]: {
            canSend: false,
            lastSentTime: now,
          },
        },
      });

      setTimeout(() => {
        set((state) => ({
          groupMessageCooldowns: {
            ...state.groupMessageCooldowns,
            [groupId]: {
              ...state.groupMessageCooldowns[groupId],
              canSend: true,
            },
          },
        }));
      }, 1000);

      get().getMyGroupsSilent();
      get().saveGroupMessage(groupId, text);

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

  saveGroupMessage: async (groupId, text) => {
    try {
      await axiosInstance.post(`/groups/${groupId}/save`, { text });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  },

  subscribeToGroups: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { isSubscribed } = get();
    if (isSubscribed) {
      console.log("Groups already subscribed, skipping...");
      return;
    }

    socket.off("newGroup");
    socket.off("groupUpdated");
    socket.off("newGroupMessageNotification");

    set({ isSubscribed: true });

    socket.on("newGroup", (newGroup) => {
      const { authUser } = useAuthStore.getState();
      const currentGroups = get().allGroups;
      const groupExists = currentGroups.some((g) => g._id === newGroup._id);

      if (!groupExists) {
        set({ allGroups: [...currentGroups, newGroup] });

        const isUserMember = newGroup.members.some(
          (member) => member._id === authUser._id
        );
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

    socket.on("newGroupMessageNotification", (data) => {
      const { selectedGroup, processedNotifications } = get();
      const { authUser } = useAuthStore.getState();

      const notificationId = `${data._id || "no-id"}-${data.groupId}-${
        data.senderId
      }-${data.createdAt || Date.now()}`;

      if (processedNotifications.has(notificationId)) return;

      get().getMyGroupsSilent();

      if (data.senderId && data.senderId === authUser._id) return;

      if (!selectedGroup || selectedGroup._id !== data.groupId) {
        set((state) => {
          const newProcessedNotifications = new Set(
            state.processedNotifications
          );
          newProcessedNotifications.add(notificationId);

          if (newProcessedNotifications.size > 100) {
            const entries = Array.from(newProcessedNotifications);
            entries
              .slice(0, 50)
              .forEach((id) => newProcessedNotifications.delete(id));
          }

          const newGroupUnreadCounts = { ...state.groupUnreadCounts };
          const groupId = data.groupId;
          newGroupUnreadCounts[groupId] =
            (newGroupUnreadCounts[groupId] || 0) + 1;

          return {
            groupUnreadCounts: newGroupUnreadCounts,
            processedNotifications: newProcessedNotifications,
          };
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

    set({ isSubscribed: false });
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newGroupMessage");
    socket.off("groupUserTyping");
    socket.off("groupUserStopTyping");
    socket.off("groupMessagesRead");

    socket.on("newGroupMessage", (newMessage) => {
      const { selectedGroup } = get();
      const isMessageForCurrentGroup = newMessage.groupId === selectedGroup._id;
      get().getMyGroupsSilent();

      if (!isMessageForCurrentGroup) return;

      const currentMessages = get().messages;

      const messageExists = currentMessages.some(
        (msg) => msg._id === newMessage._id
      );
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
          messages: messages.map((msg) => {
            const senderId = msg.sender?._id || msg.sender;
            const readBy = msg.readBy || [];
            const isAlreadyRead = readBy.some((r) => (r._id || r) === userId);

            if (senderId === userId || isAlreadyRead) return msg;

            return { ...msg, readBy: [...readBy, userId] };
          }),
        });
      }
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
    socket.off("groupMessagesRead");
  },
}));
