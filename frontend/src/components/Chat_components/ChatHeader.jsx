import {
  FiSearch,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiArrowLeft,
} from "react-icons/fi";
import { useEffect, useState } from "react";
import socket from "../../socket/socket.js";
import useChatStore from "../../store/chatStore";

export default function ChatHeader() {
  const [isOnline, setIsOnline] = useState(false);
  const { selectedChat, setShowSidebar } = useChatStore();

  useEffect(() => {
    if (selectedChat?.user?._id) {
      socket.emit("checkUserOnline", selectedChat.user._id);
    }

    const handleUserOnlineStatus = (data) => {
      if (data.id === selectedChat?.user?._id) {
        setIsOnline(data.isOnline);
      }
    };

    const handleUserOnline = (id) => {
      if (id === selectedChat?.user?._id) {
        setIsOnline(true);
      }
    };

    const handleUserOffline = (id) => {
      if (id === selectedChat?.user?._id) {
        setIsOnline(false);
      }
    };

    socket.on("userOnlineStatus", handleUserOnlineStatus);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("userOnlineStatus", handleUserOnlineStatus);
    };
  }, [selectedChat]);

  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-[#111b21] border-b border-gray-800">
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          className="md:hidden text-xl"
          onClick={() => setShowSidebar(true)}
        >
          <FiArrowLeft />
        </button>

        <img
          src={selectedChat.user.profilePicture}
          alt=""
          className="w-10 h-10 rounded-full"
        />

        <div className="overflow-x-hidden">
          <p className="font-medium">{selectedChat.user.userId}</p>
          <p className="text-xs text-gray-400">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-gray-400">
        <FiVideo size={20} className="cursor-pointer hover:text-white" />
        <FiPhone size={20} className="cursor-pointer hover:text-white" />
        <FiMoreVertical size={20} className="cursor-pointer hover:text-white" />
      </div>
    </div>
  );
}
