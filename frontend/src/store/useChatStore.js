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

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      set({ isMessagesLoading: false });
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

  sendMessage: async (text) => {
    try {
      const { selectedUser, messages } = get();
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        { text }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  },

  resetChat: () =>
    set({
      selectedUser: null,
      messages: [],
      activeTab: "chats",
      typingUsers: {},
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
    });

    socket.on("userTyping", ({ senderId }) => {
      console.log("User typing:", senderId);
      get().setTypingUser(senderId, true);
    });

    socket.on("userStopTyping", ({ senderId }) => {
      console.log("User stop typing:", senderId);
      get().setTypingUser(senderId, false);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStopTyping");
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
  },

  unsubscribeFromUsers: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newUser");
  },
}));
