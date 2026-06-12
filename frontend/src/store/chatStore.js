import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import socket from "../socket/socket.js";

const chatStore = (set, get) => ({
  selectedChat: null,
  panelMode: null,
  pendingOpen: false,
  chatList: [],
  showSidebar: window.innerWidth < 768 ? true : true,
  typingUsersByConversation: {},
  selectedImages: [],

  setSelectedChat: function (chat) {
    set({ selectedChat: chat });
  },

  setPanelMode: function (mode) {
    set({ panelMode: mode });
  },

  setPendingOpen: function (value) {
    set({ pendingOpen: value });
  },

  setChatList: function (chat) {
    set({ chatList: chat });
  },

  setShowSidebar: function (value) {
    set({ showSidebar: value });
  },

  setSelectedImages: function (value) {
    set({ selectedImages: value });
  },

  handleUserTyping: ({ conversationId, id }) => {
    if (!conversationId || !id) return;

    set((state) => ({
      typingUsersByConversation: {
        ...state.typingUsersByConversation,
        [conversationId]: {
          ...(state.typingUsersByConversation[conversationId] || {}),
          [id]: true,
        },
      },
    }));
  },

  handleUserStoppedTyping: ({ conversationId, id }) => {
    if (!conversationId || !id) return;

    set((state) => {
      const currentConversationTyping =
        state.typingUsersByConversation[conversationId] || {};

      const updatedConversationTyping = { ...currentConversationTyping };
      delete updatedConversationTyping[id];

      const updatedTypingUsersByConversation = {
        ...state.typingUsersByConversation,
        [conversationId]: updatedConversationTyping,
      };

      if (Object.keys(updatedConversationTyping).length === 0) {
        delete updatedTypingUsersByConversation[conversationId];
      }

      return {
        typingUsersByConversation: updatedTypingUsersByConversation,
      };
    });
  },

  clearConversationTyping: (conversationId) => {
    if (!conversationId) return;

    set((state) => {
      const updated = { ...state.typingUsersByConversation };
      delete updated[conversationId];

      return {
        typingUsersByConversation: updated,
      };
    });
  },

  isUserTypingInConversation: ({ conversationId, id }) => {
    if (!conversationId || !id) return false;

    return !!get().typingUsersByConversation?.[conversationId]?.[id];
  },

  handleConversationUpdated: ({ conversation }) => {
    if (!conversation) return;

    set((state) => {
      const exists = state.chatList.some(
        (chat) => chat._id?.toString() === conversation._id.toString(),
      );

      if (exists) {
        const updatedChatList = state.chatList.map((chat) =>
          chat._id?.toString() === conversation._id.toString()
            ? conversation
            : chat,
        );

        return {
          chatList: [
            conversation,
            ...updatedChatList.filter(
              (chat) => chat._id?.toString() !== conversation._id.toString(),
            ),
          ],
          selectedChat:
            state.selectedChat?._id?.toString() === conversation._id.toString()
              ? conversation
              : state.selectedChat,
        };
      }

      return {
        chatList: [conversation, ...state.chatList],
      };
    });
  },

  initConversationListeners: () => {
    const {
      handleConversationUpdated,
      handleUserTyping,
      handleUserStoppedTyping,
    } = get();

    socket.off("conversationUpdated", handleConversationUpdated);
    socket.on("conversationUpdated", handleConversationUpdated);

    socket.off("userTyping", handleUserTyping);
    socket.on("userTyping", handleUserTyping);

    socket.off("userStoppedTyping", handleUserStoppedTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);
  },

  cleanupConversationListeners: () => {
    const {
      handleConversationUpdated,
      handleUserTyping,
      handleUserStoppedTyping,
    } = get();

    socket.off("conversationUpdated", handleConversationUpdated);
    socket.off("userTyping", handleUserTyping);
    socket.off("userStoppedTyping", handleUserStoppedTyping);
  },
});

const useChatStore = create(
  persist(chatStore, {
    name: "chat-store",
    storage: createJSONStorage(() => sessionStorage),
    partialize: (state) => ({
      selectedChat: state.selectedChat,
      panelMode: state.panelMode,
      pendingOpen: state.pendingOpen,
      chatList: state.chatList,
      showSidebar: state.showSidebar,
    }),
  }),
);

export default useChatStore;
