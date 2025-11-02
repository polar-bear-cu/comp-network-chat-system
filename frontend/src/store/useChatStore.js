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

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    const current = get().selectedUser;
    if (current?._id === selectedUser?._id) return;

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
      throw error;
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
      throw error;
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
      throw error;
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (text) => {
    try {
      const { selectedUser, messages } = get();
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        {
          text,
        }
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      throw error;
    }
  },

  resetChat: () =>
    set({
      selectedUser: null,
      messages: [],
      activeTab: "chats",
    }),

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
