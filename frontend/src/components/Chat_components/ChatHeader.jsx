import {
  FiSearch,
  FiMoreVertical,
  FiPhone,
  FiVideo,
  FiArrowLeft,
} from "react-icons/fi";

export default function ChatHeader({ selectedChat, setShowSidebar }) {
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
          src={selectedChat.avatar}
          alt=""
          className="w-10 h-10 rounded-full"
        />

        <div>
          <p className="font-medium">{selectedChat.name}</p>
          <p className="text-xs text-gray-400">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-gray-400">
        <FiVideo size={20} className="cursor-pointer hover:text-white" />
        <FiPhone size={20} className="cursor-pointer hover:text-white" />
        <FiSearch size={20} className="cursor-pointer hover:text-white" />
        <FiMoreVertical size={20} className="cursor-pointer hover:text-white" />
      </div>
    </div>
  );
}
