import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import socket from "../socket/socket.js";

const chatStore = (set, get) => ({
  selectedChat: null,
  panelMode: null,
  pendingOpen: false,
  chatList: [],
  showSidebar: window.innerWidth < 768 ? true : true,

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
    const { handleConversationUpdated } = get();

    socket.off("conversationUpdated", handleConversationUpdated);
    socket.on("conversationUpdated", handleConversationUpdated);
  },

  cleanupConversationListeners: () => {
    const { handleConversationUpdated } = get();
    socket.off("conversationUpdated", handleConversationUpdated);
  },
});

const useChatStore = create(
  persist(chatStore, {
    name: "chat-store",
    storage: createJSONStorage(() => sessionStorage),
  }),
);

export default useChatStore;
