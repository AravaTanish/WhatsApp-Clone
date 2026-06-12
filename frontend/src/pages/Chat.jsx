import { useEffect } from "react";
import LeftSide from "../components/Chat_components/LeftSide_components/LeftSide.jsx";
import RightSide from "../components/Chat_components/RightSide_components/RightSide.jsx";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import useChatStore from "../store/chatStore.js";

export default function ChatPage() {
  const {
    panelMode,
    setPanelMode,
    pendingOpen,
    setPendingOpen,
    setChatList,
    showSidebar,
    setShowSidebar,
    selectedChat,
  } = useChatStore();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get("/conversations");
        if (response.data.success) {
          setChatList(response.data.conversations);
        }
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };
    fetchConversations();
  }, [setChatList]);

  return (
    <div className="h-screen flex bg-auth-gradient text-white">
      {/* GLOBAL OVERLAY FOR PANELS */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => {
            if (selectedChat) setShowSidebar(false);
          }}
        />
      )}

      {showSidebar && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            if (selectedChat) setShowSidebar(false);
          }}
        />
      )}

      {(panelMode !== null || pendingOpen) && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"
          onClick={() => {
            if (selectedChat) setShowSidebar(false);
            setPanelMode(null);
            setPendingOpen(false);
          }}
        />
      )}

      <LeftSide />
      <RightSide />
    </div>
  );
}
