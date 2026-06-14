import { useEffect, useRef, useState } from "react";
import useUserStore from "../../../store/userStore.js";
import DeleteModal from "./DeleteModal.jsx";
import SelectionBar from "./SelectionBar.jsx";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { FiArrowLeft } from "react-icons/fi";
import useChatStore from "../../../store/chatStore.js";
import socket from "../../../socket/socket.js";

const now = Date.now();

export default function MessageList({
  messages,
  setMessages,
  selectionMode,
  setSelectionMode,
}) {
  const messagesEndRef = useRef(null);
  const { user } = useUserStore();
  const { selectedChat, isUserTypingInConversation } = useChatStore();

  const conversationId = selectedChat?.conversationId;
  const otherUserId = selectedChat?.user?._id;

  const isOtherUserTyping = isUserTypingInConversation({
    conversationId,
    id: otherUserId,
  });
  console.log("Typing:", isOtherUserTyping);

  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping]);

  useEffect(() => {
    const conversationId = selectedChat?.conversationId;
    if (!conversationId) return;

    socket.emit("joinConversation", {
      conversationId,
      receiverId: otherUserId,
    });
    socket.emit("markMessagesAsRead", { conversationId });

    return () => {
      socket.emit("leaveConversation", conversationId);
    };
  }, [selectedChat?.conversationId, otherUserId]);

  useEffect(() => {
    const handleNewMessages = (messages) => {
      setMessages((prev) => [...prev, ...messages]);
    };

    const handleDeleteForMe = ({ messageIds, id }) => {
      if (id === user.id) {
        setMessages((prev) =>
          prev.filter((msg) => !messageIds.includes(msg._id)),
        );
      }
    };

    const handleDeleteForEveryone = ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg._id)
            ? { ...msg, deletedForEveryone: true }
            : msg,
        ),
      );
    };

    const handleMessagesDeliveredUpdate = ({ updates }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const update = updates.find(
            (item) => item.messageId.toString() === msg._id.toString(),
          );

          if (!update) return msg;

          const alreadyDelivered = (msg.deliveredTo || []).some(
            (entry) => entry.user === update.id,
          );

          if (alreadyDelivered) return msg;

          return {
            ...msg,
            deliveredTo: [
              ...(msg.deliveredTo || []),
              {
                user: update.id,
                deliveredAt: update.deliveredAt,
              },
            ],
          };
        }),
      );
    };

    const handleMessagesReadUpdate = ({ messageIds, id, readAt }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          const isTarget = messageIds.some(
            (id) => id.toString() === msg._id.toString(),
          );

          if (!isTarget) return msg;

          const alreadyRead = (msg.readBy || []).some(
            (entry) => entry.user.toString() === id.toString(),
          );

          const alreadyDelivered = (msg.deliveredTo || []).some(
            (entry) => entry.user.toString() === id.toString(),
          );

          return {
            ...msg,
            readBy: alreadyRead
              ? msg.readBy
              : [...(msg.readBy || []), { user: id, readAt }],
            deliveredTo: alreadyDelivered
              ? msg.deliveredTo
              : [...(msg.deliveredTo || []), { user: id, deliveredAt: readAt }],
          };
        }),
      );
    };

    socket.on("newMessages", handleNewMessages);
    socket.on("messagesDeletedForMe", handleDeleteForMe);
    socket.on("messagesDeletedForEveryone", handleDeleteForEveryone);
    socket.on("messagesDeliveredUpdate", handleMessagesDeliveredUpdate);
    socket.on("messagesReadUpdate", handleMessagesReadUpdate);

    return () => {
      socket.off("newMessages", handleNewMessages);
      socket.off("messagesDeletedForMe", handleDeleteForMe);
      socket.off("messagesDeletedForEveryone", handleDeleteForEveryone);
      socket.off("messagesDeliveredUpdate", handleMessagesDeliveredUpdate);
      socket.off("messagesReadUpdate", handleMessagesReadUpdate);
    };
  }, [user.id, setMessages]);

  const toggleMessage = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleRightClick = (e, msg) => {
    e.preventDefault();
    setSelectionMode(true);
    setSelectedMessages([msg._id]);
  };

  const resetSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
    setShowDeleteModal(false);
  };

  const allValidForEveryone = selectedMessages.every((id) => {
    const msg = messages.find((m) => m._id === id);
    if (!msg) return false;
    const diff = now - new Date(msg.createdAt);
    return (
      msg.sender === user.id &&
      diff <= 24 * 60 * 60 * 1000 &&
      !msg.deletedForEveryone
    );
  });

  const getMessageStatus = (msg) => {
    if (msg.sender !== user.id) return null;

    const otherUserId = selectedChat?.user?._id;
    if (!otherUserId) return "sent";

    const isRead = (msg.readBy || []).some(
      (entry) => entry.user.toString() === otherUserId.toString(),
    );

    if (isRead) return "read";

    const isDelivered = (msg.deliveredTo || []).some(
      (entry) => entry.user.toString() === otherUserId.toString(),
    );

    if (isDelivered) return "delivered";

    return "sent";
  };

  const renderMessageTicks = (msg) => {
    if (msg.sender !== user.id) return null;

    const status = getMessageStatus(msg);

    if (status === "sent") {
      return <IoCheckmark className="text-xs" />;
    }

    if (status === "delivered") {
      return <IoCheckmarkDone className="text-xs" />;
    }

    if (status === "read") {
      return <IoCheckmarkDone className="text-blue-500 text-xs" />;
    }

    return null;
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {messages.map((msg) => {
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const isSelected = selectedMessages.includes(msg._id);

          return (
            <div
              key={msg._id}
              onContextMenu={(e) => handleRightClick(e, msg)}
              onClick={() => {
                if (selectionMode) toggleMessage(msg._id);
              }}
              className={`flex ${
                msg.sender === user.id ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-center gap-2">
                {selectionMode && (
                  <div
                    className={`w-4.5 h-4.5 flex items-center justify-center border-2 rounded cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "bg-green-500 border-green-500"
                          : "border-gray-400 bg-transparent"
                      }
                    `}
                  >
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 00-1.408 0L8.25 12.336 4.704 8.79a1 1 0 10-1.408 1.42l4.25 4.25a1 1 0 001.408 0l7.75-7.75a1 1 0 000-1.42z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                )}

                <div
                  className={`relative px-4 py-2 rounded-2xl text-sm max-w-xs md:max-w-md shadow flex flex-col wrap-break-word whitespace-pre-wrap
                  ${
                    msg.sender === user.id
                      ? "bg-[#22c55e] text-black rounded-br-sm"
                      : "bg-[#1f2c33] rounded-bl-sm"
                  }`}
                >
                  {msg.deletedForEveryone ? (
                    <p>
                      {msg.sender === user.id
                        ? "You deleted this message"
                        : "This message was deleted"}
                    </p>
                  ) : (
                    <>
                      {msg.contentType === "text" && <p>{msg.text}</p>}

                      {msg.contentType === "image" && (
                        <img
                          src={msg.mediaUrl}
                          alt="Image"
                          className="max-w-[250px] rounded-lg object-cover cursor-pointer"
                          onClick={() => setFullscreenImage(msg.mediaUrl)}
                        />
                      )}

                      {msg.contentType === "video" && (
                        <video
                          src={msg.mediaUrl}
                          controls
                          className="max-w-[250px] rounded-lg"
                        />
                      )}

                      {fullscreenImage && (
                        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                          {/* Back button */}
                          <button
                            className="absolute top-5 left-5 text-white text-3xl font-bold"
                            onClick={() => setFullscreenImage(null)}
                          >
                            <FiArrowLeft />
                          </button>

                          <img
                            src={fullscreenImage}
                            alt="Fullscreen"
                            className="max-h-screen max-w-screen object-contain"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center justify-end gap-1 text-[10px] mt-1 opacity-70">
                    <span>{time}</span>
                    {renderMessageTicks(msg)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isOtherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1f2c33] rounded-2xl rounded-bl-sm px-4 py-3 shadow max-w-20">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]"></span>
                <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]"></span>
                <span className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectionMode && (
        <SelectionBar
          count={selectedMessages.length}
          onDelete={() => setShowDeleteModal(true)}
          onCancel={resetSelection}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          allValidForEveryone={allValidForEveryone}
          selectedMessages={selectedMessages}
          resetSelection={resetSelection}
        />
      )}
    </>
  );
}
