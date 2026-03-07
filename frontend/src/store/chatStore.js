import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const chatStore = (set) => ({
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
});

const useChatStore = create(
  persist(chatStore, {
    name: "chat-store",
    storage: createJSONStorage(() => sessionStorage),
  }),
);

export default useChatStore;
