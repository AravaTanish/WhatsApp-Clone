import ChatHeader from "../Chat_components/ChatHeader.jsx";
import MessageList from "../Chat_components/MessageList.jsx";
import MessageInput from "../Chat_components/MessageInput.jsx";
import { useState } from "react";
import useChatStore from "../../store/chatStore.js";
import { useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

function RightSide() {
  const { selectedChat } = useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedChat === null || !selectedChat.conversation) return;

    const fetchMessages = async () => {
      try {
        const conversationId = selectedChat.conversation._id;
        const response = await api.get(`/message/${conversationId}`);
        if (response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        toast.error(error.response?.data?.message);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  const handleSend = async () => {
    if (!selectedChat || !selectedChat.user || !newMessage.trim()) return;
    try {
      const receiverId = selectedChat.user._id;
      const response = await api.post(`/message/${receiverId}/send`, {
        messageContent: newMessage,
      });

      if (response.data.success) {
        const sentMessage = response.data.sentMessage;
        setMessages((prev) => [...prev, sentMessage]);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setNewMessage("");
    }
  };

  if (selectedChat === null) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-300">
            No Chat Selected
          </h2>
          <p className="text-gray-500 mt-2">
            Choose a conversation from the sidebar to start chatting.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col bg-[#0b141a]">
      <ChatHeader />
      <MessageList messages={messages} />
      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSend={handleSend}
      />
    </div>
  );
}

export default RightSide;
