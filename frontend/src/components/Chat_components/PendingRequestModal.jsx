import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
import api from "../../api/axios.js";
import toast from "react-hot-toast";

export default function PendingRequestModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  async function handleAccept() {
    try {
      const response = await api.post("/friends/accept", {
        requestId: request._id,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        onClose();
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    }
  }

  async function handleReject() {
    try {
      const response = await api.post("/friends/reject", {
        requestId: request._id,
      });
      if (response.data.success) {
        toast.success(response.data.message);
        onClose();
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    }
  }

  return createPortal(
    <>
      {/* Blur Background */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-black/40 z-999"
        onClick={onClose}
      />

      {/* Modal Centered */}
      <div className="fixed inset-0 flex items-center justify-center z-1000">
        <div className="bg-[#0f1c21] w-96 rounded-xl shadow-2xl p-6 relative">
          {/* Close */}
          <FiX
            size={22}
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
          />

          <div className="flex flex-col items-center mt-4">
            <img
              src={request.sender.profilePicture?.url || "/default-avatar.png"}
              className="w-24 h-24 rounded-full object-cover border border-[#1f2c33]"
            />

            <h2 className="text-xl text-white mt-4 font-semibold">
              {request.sender.userId}
            </h2>

            <p className="text-gray-400 text-sm mt-2 text-center">
              {request.sender.about || "No about provided"}
            </p>

            <div className="mt-4 text-gray-300 text-sm text-center">
              {request.message || "No message provided"}
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleAccept}
              className="px-5 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white transition"
            >
              Accept
            </button>

            <button
              onClick={handleReject}
              className="px-5 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
