import { useEffect, useRef } from "react";
import { BsSendFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import useChatStore from "../../../store/chatStore.js";
import socket from "../../../socket/socket.js";

export default function MessageInput({
  newMessage,
  setNewMessage,
  handleSend,
  selectionMode,
}) {
  const { selectedChat, setSelectedFiles } = useChatStore();
  const otherUserId = selectedChat.user._id;

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const conversationId = selectedChat?.conversationId;

  const emitTypingStart = () => {
    if (!conversationId || isTypingRef.current) return;

    socket.emit("typingStart", { conversationId, receiverId: otherUserId });
    isTypingRef.current = true;
  };

  const emitTypingStop = () => {
    if (!conversationId || !isTypingRef.current) return;

    socket.emit("typingStop", { conversationId, receiverId: otherUserId });
    isTypingRef.current = false;
  };

  const resetTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 1500);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!conversationId) return;

    if (value.trim()) {
      emitTypingStart();
      resetTypingTimeout();
    } else {
      emitTypingStop();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      emitTypingStop();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      handleSend();
    }
  };

  const handleSendClick = () => {
    emitTypingStop();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    handleSend();
  };

  useEffect(() => {
    return () => {
      emitTypingStop();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);

  const handleSelectedFiles = (e) => {
    const file = Array.from(e.target.files);
    setSelectedFiles(file);
  };

  if (selectionMode) return null;

  return (
    <div className="flex items-center gap-4 px-4 md:px-6 py-4 bg-[#111b21] border-t border-gray-800">
      <label htmlFor="media-input">
        <FaPlus />
      </label>
      <input
        id="media-input"
        type="file"
        multiple
        accept="image/*,video/*"
        hidden
        onChange={handleSelectedFiles}
      />

      <input
        type="text"
        placeholder="Type a message"
        value={newMessage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-[#1f2c33] px-5 py-3 rounded-full outline-none text-sm placeholder-gray-400"
      />

      <button
        onClick={handleSendClick}
        className="bg-[#22c55e] p-3 rounded-full hover:scale-105 transition"
      >
        <BsSendFill size={16} className="text-black" />
      </button>
    </div>
  );
}
