import { FiSearch, FiMoreVertical } from "react-icons/fi";
import useChatStore from "../../store/chatStore.js";
import useUserStore from "../../store/userStore.js";

export default function Sidebar() {
  const { chatList, selectedChat, setSelectedChat, setShowSidebar } =
    useChatStore();
  const { user } = useUserStore();

  const handelSelectChat = (chat, otherUser) => {
    setSelectedChat({
      user: {
        _id: otherUser._id,
        userId: otherUser.userId,
        about: otherUser.about,
        profilePicture: otherUser.profilePicture.url,
      },
      conversation: chat,
    });
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };
  return (
    <div className="w-80 bg-[#111b21] border-r border-gray-800 h-full">
      {/* Header */}
      <div className="p-5 text-xl font-semibold flex justify-between items-center">
        Chats
        <FiMoreVertical className="text-gray-400 cursor-pointer" />
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="flex items-center bg-[#1f2c33] px-3 py-2 rounded-full">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent ml-3 outline-none text-sm w-full placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto">
        {chatList.map((chat) => {
          const otherUser = chat.participants.find((p) => p._id !== user.id);

          const time = chat.lastMessage?.createdAt
            ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={chat._id}
              onClick={() => {
                handelSelectChat(chat, otherUser);
              }}
              className={`flex items-center gap-3 px-4 py-4 cursor-pointer border-b border-[#1f2c33]
      ${
        selectedChat?.conversation?._id === chat._id
          ? "bg-[#1f2c33]"
          : "hover:bg-[#1f2c33]"
      }`}
            >
              <img
                src={otherUser?.profilePicture?.url}
                alt="photo"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{otherUser?.userId}</span>

                  <span className="text-xs text-gray-400">{time}</span>
                </div>

                <div className="text-sm text-gray-400 truncate">
                  {chat.lastMessage?.text || "No messages yet"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
