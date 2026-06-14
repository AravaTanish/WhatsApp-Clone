import { useEffect } from "react";
import { FiSearch, FiMoreVertical } from "react-icons/fi";
import useChatStore from "../../../store/chatStore.js";
import useUserStore from "../../../store/userStore.js";

export default function Sidebar() {
  const {
    chatList,
    selectedChat,
    setSelectedChat,
    setShowSidebar,
    setSelectedFiles,
    initConversationListeners,
    cleanupConversationListeners,
    isUserTypingInConversation,
  } = useChatStore();

  const { user } = useUserStore();

  useEffect(() => {
    initConversationListeners();

    return () => {
      cleanupConversationListeners();
    };
  }, [initConversationListeners, cleanupConversationListeners]);

  const handelSelectChat = (chat, otherUser) => {
    setSelectedChat({
      user: {
        _id: otherUser._id,
        userId: otherUser.userId,
        about: otherUser.about,
        profilePicture: otherUser.profilePicture,
      },
      conversationId: chat._id,
    });
    
    setSelectedFiles([]);

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
        {console.log("ChatList: ",chatList)}
        {chatList.map((chat) => {
          const otherUser = chat.participants.find((p) => p._id !== user.id);
          const isTyping = isUserTypingInConversation({
            conversationId: chat._id,
            id: otherUser?._id,
          });
          const myLastMessageEntry = chat.lastMessagePerUser?.find(
            (entry) => entry.user.toString() === user.id,
          );

          const lastMsg = myLastMessageEntry?.message;
          const unread =
            chat.unreadCounts?.find(
              (u) => u.user === user.id || u.user?._id === user.id,
            )?.count || 0;

          const time = lastMsg?.createdAt
            ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
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
                            selectedChat?.conversationId === chat._id
                              ? "bg-[#1f2c33]"
                              : "hover:bg-[#1f2c33]"
                          }`
                        }
            >
              <img
                src={otherUser?.profilePicture}
                alt="photo"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex-1 min-w-0 flex justify-between">
                {/* Left side */}
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {otherUser?.userId}
                  </div>
                  <div
                    className={`text-sm truncate max-w-45 ${
                      isTyping ? "text-[#22c55e] font-medium" : "text-gray-400"
                    }`}
                  >
                    {isTyping
                      ? "Typing..."
                      : !lastMsg
                        ? "No messages yet"
                        : lastMsg.deletedForEveryone
                          ? lastMsg.sender === user.id
                            ? "You deleted this message"
                            : "This message was deleted"
                          : lastMsg.contentType === "text"
                            ? lastMsg.text
                            : lastMsg.contentType === "image"
                              ? "Photo"
                              : lastMsg.contentType === "video"
                                ? "Video"
                                : lastMsg.contentType === "audio"
                                  ? "Audio"
                                  : "Document"}
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col items-end ml-2">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {time}
                  </span>

                  {unread > 0 && (
                    <span className="mt-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
