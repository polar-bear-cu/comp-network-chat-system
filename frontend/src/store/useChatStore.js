import axiosInstance from "@/lib/axios";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { useGroupStore } from "./useGroupStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {},
  unreadCounts: {},
  canSendMessage: true,
  lastSentTime: 0,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => {
    const current = get().selectedUser;
    if (current?._id === selectedUser?._id) return;

    if (current) {
      set((state) => {
        const newTypingUsers = { ...state.typingUsers };
        delete newTypingUsers[current._id];
        return { typingUsers: newTypingUsers };
      });
    }

    set({ selectedUser });

    if (selectedUser !== null) {
      useGroupStore.getState().setSelectedGroup(null);
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getChatPartnersSilent: async () => {
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      console.error("Error fetching chats silently:", error);
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      set((state) => {
        const newUnreadCounts = { ...state.unreadCounts };
        delete newUnreadCounts[userId];
        return { unreadCounts: newUnreadCounts };
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/messages/unread-counts");
      set({ unreadCounts: res.data });
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  },

  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/mark-read/${userId}`);

      set((state) => {
        const newUnreadCounts = { ...state.unreadCounts };
        delete newUnreadCounts[userId];
        return { unreadCounts: newUnreadCounts };
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  emitTyping: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }

    socket.emit("typing", { receiverId: selectedUser._id });
  },

  emitStopTyping: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) {
      console.warn("Socket not connected");
      return;
    }

    socket.emit("stopTyping", { receiverId: selectedUser._id });
  },

  setTypingUser: (userId, isTyping) => {
    set((state) => {
      const newTypingUsers = { ...state.typingUsers };
      if (isTyping) {
        newTypingUsers[userId] = true;
      } else {
        delete newTypingUsers[userId];
      }
      return { typingUsers: newTypingUsers };
    });
  },

  sendMessage: (userId, text) => {
    const { selectedUser, messages, canSendMessage, lastSentTime } = get();
    const now = Date.now();
    const socket = useAuthStore.getState().socket;

    if (!canSendMessage || now - lastSentTime < 1000) {
      console.log("Frontend rate limit: Message queued");
      return false;
    }

    const message = {
      senderId: userId,
      receiverId: selectedUser._id,
      text: text,
      createdAt: new Date(),
    };

    socket.emit("sendMessage", message);

    set({
      messages: [...messages, message],
      canSendMessage: false,
      lastSentTime: now,
    });

    setTimeout(() => {
      set({ canSendMessage: true });
    }, 1000);

    get().getChatPartnersSilent();

    get().saveMessage(selectedUser._id, text);

    return true;
  },

  saveMessage: async (selectedUserId, text) => {
    await axiosInstance.post(`/api/messages/save/${selectedUserId}`, {
      text,
    });
  },

  resetChat: () =>
    set({
      selectedUser: null,
      messages: [],
      activeTab: "chats",
      typingUsers: {},
      unreadCounts: {},
    }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      get().markMessagesAsRead(selectedUser._id);
    });

    socket.on("userTyping", ({ senderId }) => {
      console.log("User typing:", senderId);
      get().setTypingUser(senderId, true);
    });

    socket.on("userStopTyping", ({ senderId }) => {
      console.log("User stop typing:", senderId);
      get().setTypingUser(senderId, false);
    });

    socket.on("messagesRead", ({ readerId, senderId }) => {
      const { selectedUser } = get();
      if (selectedUser && selectedUser._id === readerId) {
        set((state) => ({
          messages: state.messages.map((msg) => ({
            ...msg,
            hasRead: msg.senderId === senderId ? true : msg.hasRead,
          })),
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStopTyping");
    socket.off("messagesRead");
  },

  subscribeToUsers: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newUser", (newUser) => {
      const currentContacts = get().allContacts;
      const userExists = currentContacts.some((c) => c._id === newUser._id);

      if (!userExists) {
        set({ allContacts: [newUser, ...currentContacts] });
      }
    });

    socket.on("newMessageNotification", (newMessage) => {
      const { selectedUser } = get();

      get().getChatPartnersSilent();

      if (!selectedUser || selectedUser._id !== newMessage.senderId) {
        set((state) => {
          const newUnreadCounts = { ...state.unreadCounts };
          const senderId = newMessage.senderId;
          newUnreadCounts[senderId] = (newUnreadCounts[senderId] || 0) + 1;
          return { unreadCounts: newUnreadCounts };
        });
      }
    });
  },

  unsubscribeFromUsers: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newUser");
    socket.off("newMessageNotification");
  },
}));
