import { useState, useEffect } from "react";
import LeftRail from "../components/Chat_components/LeftRail.jsx";
import Sidebar from "../components/Chat_components/Sidebar.jsx";
import ChatHeader from "../components/Chat_components/ChatHeader.jsx";
import MessageList from "../components/Chat_components/MessageList.jsx";
import MessageInput from "../components/Chat_components/MessageInput.jsx";

const chatList = [
  {
    id: 1,
    name: "Bob",
    message: "Wow!",
    time: "Yesterday",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 2,
    name: "Alex",
    message: "Dear students...",
    time: "Yesterday",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(chatList[0]);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello 👋", sender: "other" },
    { id: 2, text: "Hi", sender: "me" },
  ]);

  const [panelMode, setPanelMode] = useState(null);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(() => {
    const saved = localStorage.getItem("sidebar");
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebar", JSON.stringify(showSidebar));
  }, [showSidebar]);
  const handleSend = () => {
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: newMessage,
        sender: "me",
      },
    ]);

    setNewMessage("");
  };

  return (
    <div className="h-screen flex bg-auth-gradient text-white">
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      {/* GLOBAL OVERLAY FOR PANELS */}
      {(showSidebar || panelMode !== null) && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 z-10"
          onClick={() => {
            setShowSidebar(false);
            setPanelMode(null);
          }}
        />
      )}

      {/* LEFT DRAWER (LeftRail + Sidebar together) */}
      <div
        className={`fixed md:static z-20 top-0 left-0 h-full flex
  w-[384px] md:w-auto
  transform ${showSidebar ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <LeftRail
          panelMode={panelMode}
          setPanelMode={setPanelMode}
          pendingOpen={pendingOpen}
          setPendingOpen={setPendingOpen}
        />
        <Sidebar
          chatList={chatList}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
      </div>

      <div className="flex-1 flex flex-col bg-[#0b141a]">
        <ChatHeader
          selectedChat={selectedChat}
          setShowSidebar={setShowSidebar}
        />

        <MessageList messages={messages} />

        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSend={handleSend}
        />
      </div>
    </div>
  );
}
