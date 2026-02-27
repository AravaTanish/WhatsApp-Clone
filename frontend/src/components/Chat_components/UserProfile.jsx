import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function UserProfile({
  isOpen,
  onClose,
  user,
  friendshipStatus = "none", // none | pending_sent | pending_received | accepted | rejected
}) {
  const [status, setStatus] = useState(friendshipStatus);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSendRequest = () => {
    const finalMessage =
      message.trim() === "" ? "Hi, I'd like to connect with you!" : message;

    console.log("Friend request sent with message:", finalMessage);

    setStatus("pending_sent");
  };

  const handleAccept = () => {
    setStatus("accepted");
  };

  const handleReject = () => {
    setStatus("rejected");
  };

  const handleRemoveFriend = () => {
    setStatus("none");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40">
      <div className="w-100 h-full bg-[#0f1c21] text-white p-6 flex flex-col">
        {/* Close Button */}

        <FiX
          size={22}
          onClick={onClose}
          className="text-gray-400 hover:text-white cursor-pointer self-end"
        />

        {/* Profile Section */}
        <div className="flex flex-col items-center mt-6">
          <img
            src={user.profilePicture.url}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-green-500"
          />

          <h2 className="mt-4 text-xl font-semibold">{user.userId}</h2>

          <p className="mt-2 text-gray-400 text-center">
            {user.about || "No bio available"}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Friend Action Section */}
        <div className="flex-1 flex flex-col">
          {/* NONE */}
          {status === "none" && (
            <>
              <textarea
                placeholder="Write a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-[#1e293b] p-3 rounded-md resize-none text-sm outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                onClick={handleSendRequest}
                className="mt-4 bg-green-500 hover:bg-green-600 py-2 rounded-md font-medium"
              >
                Add Friend
              </button>
            </>
          )}

          {/* PENDING SENT */}
          {status === "pending_sent" && (
            <div className="text-yellow-400 text-center font-medium">
              Friend Request Pending
            </div>
          )}

          {/* PENDING RECEIVED */}
          {status === "pending_received" && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleAccept}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
              >
                Reject
              </button>
            </div>
          )}

          {/* ACCEPTED */}
          {status === "accepted" && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-green-400 font-medium">🟢 Friends</div>

              <div className="flex gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md">
                  Chat
                </button>

                <button
                  onClick={handleRemoveFriend}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
                >
                  Remove Friend
                </button>
              </div>
            </div>
          )}

          {/* REJECTED */}
          {status === "rejected" && (
            <div className="flex flex-col items-center gap-4">
              <div className="text-red-400 font-medium">
                🔴 Friend Request Rejected
              </div>

              <button
                onClick={() => setStatus("none")}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md"
              >
                Add Friend Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
