import ChatHeader from "./ChatHeader.jsx";
import MessageList from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";
import { useState } from "react";
import useChatStore from "../../../store/chatStore.js";
import { useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../../api/axios.js";
import MediaPreview from "../Media_components/MediaPreview.jsx";
import Loading from "../../LoadingScreen/Loading.jsx";

function RightSide() {
  const { selectedChat, setSelectedChat, selectedFiles, setSelectedFiles } =
    useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (selectedChat === null || !selectedChat.conversationId) return;

    const fetchMessages = async () => {
      try {
        const conversationId = selectedChat.conversationId;
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
    if (!selectedChat || !selectedChat.user) return;
    if (!newMessage.trim() && !selectedFiles.length) return;
    try {
      if (selectedFiles.length > 10) {
        toast.error("You can send maximum 10 images at once");
      }
      if (selectedFiles.length) setUploading(true);
      const receiverId = selectedChat.user._id;
      const conversationId = selectedChat.conversationId
        ? selectedChat.conversationId
        : "";

      const formData = new FormData();

      formData.append("conversationId", conversationId);
      formData.append("messageContent", newMessage);
      if (selectedFiles.length) {
        selectedFiles.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await api.post(`/message/${receiverId}/send`, formData);

      if (response.data.success) {
        const newConversationId = response.data.conversationId;
        if (!selectedChat.conversationId) {
          setSelectedChat({
            user: selectedChat.user,
            conversationId: newConversationId,
          });
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setUploading(false);
      setNewMessage("");
      setSelectedFiles([]);
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
    <div className="flex-1 flex flex-col bg-[#0b141a] relative">
      <ChatHeader />

      {selectedFiles.length !== 0 && (
        <div className="absolute inset-x-0 top-18 bottom-0 z-5">
          {uploading && (
            <Loading message={"Please wait, files are uploading..."} />
          )}
          {!uploading && <MediaPreview handleSend={handleSend} />}
        </div>
      )}

      <MessageList
        messages={messages}
        setMessages={setMessages}
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
      />

      {selectedFiles.length === 0 && (
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSend={handleSend}
          selectionMode={selectionMode}
        />
      )}
    </div>
  );
}

export default RightSide;
