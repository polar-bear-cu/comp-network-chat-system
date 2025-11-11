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
      
      // Remove the unread count for this user since we've read the messages
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
      
      // Remove the unread count for this user
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
      
      // Mark the new message as read since the user is viewing the chat
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
      // Only update if we're currently viewing the conversation where messages were read
      if (selectedUser && selectedUser._id === readerId) {
        // Mark all messages sent by the current user to this recipient as read
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

    // Global listener for unread count updates - works independent of selected user
    socket.on("newMessageNotification", (newMessage) => {
      const { selectedUser } = get();
      
      // Only increment unread count if message is NOT from currently selected user
      if (!selectedUser || selectedUser._id !== newMessage.senderId) {
        set((state) => {
          const newUnreadCounts = { ...state.unreadCounts };
          const senderId = newMessage.senderId;
          newUnreadCounts[senderId] = (newUnreadCounts[senderId] || 0) + 1;
          return { unreadCounts: newUnreadCounts };
        });
        
        // Refresh chat partners to update order
        get().getChatPartners();
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
