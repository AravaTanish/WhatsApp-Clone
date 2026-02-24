import { FiSearch, FiMoreVertical } from "react-icons/fi";

export default function Sidebar({
  chatList,
  selectedChat,
  setSelectedChat,
  setShowSidebar,
}) {
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
        {chatList.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              setSelectedChat(chat);
              setShowSidebar(false);
            }}
            className={`flex items-center gap-3 px-4 py-4 cursor-pointer border-b border-[#1f2c33]
            ${
              selectedChat.id === chat.id
                ? "bg-[#1f2c33]"
                : "hover:bg-[#1f2c33]"
            }`}
          >
            <img
              src={chat.avatar}
              alt=""
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-medium">{chat.name}</span>
                <span className="text-xs text-gray-400">
                  {chat.time}
                </span>
              </div>
              <div className="text-sm text-gray-400 truncate">
                {chat.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}