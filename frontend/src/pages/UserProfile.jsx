import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { TiUserAdd, TiUserDelete } from "react-icons/ti";
import api from "../api/axios.js";
import Loading from "../components/LoadingScreen/Loading.jsx";
import toast from "react-hot-toast";
import useChatStore from "../store/chatStore.js";

export default function UserProfile() {
  const [user, setUser] = useState({});
  const [friendshipStatus, setFriendshipStatus] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSelectedChat, setPanelMode, setPendingOpen, setShowSidebar } =
    useChatStore();
  const navigate = useNavigate();

  const { userId } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/friends/profile/${userId}`);
        if (response.data.success) {
          setFriendshipStatus(response.data.friendshipStatus);
          const userDetails = response.data.user;
          setUser(userDetails);
          if (response.data.requestId) {
            setRequestId(response.data.requestId);
            setRequestMessage(response.data.requestMessage);
          }
          if (response.data.message !== "No relation") {
            toast.success(response.data.message);
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message);
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [userId]);

  const handelSendRequest = async () => {
    try {
      setLoading(true);
      let finalMessage = requestMessage;
      if (finalMessage.trim() === "") {
        finalMessage = "Hi! I'd like to connect with you.";
      }
      const response = await api.post("/friends/add", {
        receiverId: user._id,
        message: finalMessage,
      });
      if (response.data.success) {
        setFriendshipStatus("pending_sent");
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handelRemoveFriend = async () => {
    try {
      setLoading(true);
      console.log(user);
      const response = await api.delete(`/friends/remove/${user._id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setFriendshipStatus("none");
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setLoading(true);
      const response = await api.post("/friends/accept", { requestId });
      if (response.data.success) {
        toast.success(response.data.message);
        setRequestMessage("");
        setFriendshipStatus("accepted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await api.post("/friends/reject", { requestId });
      if (response.data.success) {
        toast.success(response.data.message);
        setRequestMessage("");
        setFriendshipStatus("none");
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handelChat = async () => {
    try {
      const response = await api.get(`/conversations/${user._id}`);
      if (response.data.success) {
        if (response.data.conversation) {
          setSelectedChat({
            user: user,
            conversation: response.data.conversation,
          });
        } else {
          setSelectedChat({ user: user });
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setShowSidebar(false);
      setPanelMode(null);
      setPendingOpen(false);
      navigate("/chat");
    }
  };

  // limit to 100 chars
  const handleChange = (e) => {
    if (e.target.value.length <= 100) {
      setRequestMessage(e.target.value);
    }
  };

  if (loading) {
    return <Loading message={"Please wait..."} />;
  }

  return (
    <div className="min-h-screen bg-auth-gradient text-white p-6">
      <div className="max-w-3xl mx-auto bg-[#2a2f32] rounded-2xl shadow-lg p-8 border border-[#1f2c33]">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={user.profilePicture}
            alt="profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#1f2c33]"
          />

          <h2 className="text-2xl font-semibold mt-4">{user.userId}</h2>

          <p className="text-gray-400 mt-1">{user.about}</p>
        </div>

        {/* Action Section */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {/* NOT FRIEND */}
          {friendshipStatus === "none" && (
            <div className="w-full max-w-md">
              {/* Textarea */}
              <textarea
                value={requestMessage}
                onChange={handleChange}
                placeholder="Write a short message (optional)..."
                className="w-full bg-[#1f2c33] text-white p-3 rounded-lg outline-none resize-none border border-[#2a3942] focus:border-green-500 transition"
                rows={3}
              />

              {/* Word Counter */}
              <div className="text-right text-sm text-gray-400 mt-1">
                {requestMessage.length}/100 characters
              </div>

              {/* Add Friend Button */}
              <button
                onClick={handelSendRequest}
                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-green-500 text-black hover:opacity-90 transition"
              >
                <TiUserAdd size={24} />
                Send Friend Request
              </button>
            </div>
          )}

          {/* REQUEST SENT */}
          {friendshipStatus === "pending_sent" && (
            <p className="text-yellow-500">Request Sent</p>
          )}

          {/* REQUEST RECEIVED */}
          {friendshipStatus === "pending_received" && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              {/* Request Message Card */}
              {requestMessage && (
                <div className="w-full bg-[#1f2c33] border border-[#2a3942] rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Request Message:</p>
                  <p className="text-white wrap-break">{requestMessage}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 hover:opacity-90 transition"
                >
                  Accept
                </button>

                <button
                  onClick={handleReject}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 hover:opacity-90 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* ALREADY FRIEND */}
          {friendshipStatus === "accepted" && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handelChat}
                className="flex justify-center items-center gap-2 px-6 py-2 rounded-lg text-green-400 border-2 border-green-500 bg-[#1f2c33] hover:bg-[#2a3942] transition"
              >
                <FiMessageCircle />
                Chat
              </button>

              <button
                onClick={handelRemoveFriend}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 hover:opacity-90 transition"
              >
                <TiUserDelete size={24} />
                Remove Friend
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
