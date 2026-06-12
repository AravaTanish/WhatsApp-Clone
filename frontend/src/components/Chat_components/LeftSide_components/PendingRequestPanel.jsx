import { useEffect, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import Loading from "../../LoadingScreen/Loading.jsx";
import api from "../../../api/axios.js";
import PendingRequestModal from "./PendingRequestModal.jsx";
import toast from "react-hot-toast";

export default function PendingRequestsPanel({ isOpen, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // Close on ESC
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fetch pending requests
  useEffect(() => {
    if (!isOpen) return;

    async function fetchRequests() {
      try {
        setLoading(true);
        const response = await api.get("/friends/pending-requests");
        if (response.data.success) {
          setRequests(response.data.requests);
        }
      } catch (error) {
        toast.error(error.response?.data?.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [isOpen]);

  const handleAccept = async (requestId) => {
    try {
      const response = await api.post("/friends/accept", { requestId });
      if (response.data.success) {
        toast.success(response.data.message);
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await api.post("/friends/reject", { requestId });
      if (response.data.success) {
        toast.success(response.data.message);
        setRequests((prev) => prev.filter((r) => r._id !== requestId));
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#0f1c21] border-r border-[#1f2c33] z-50 
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f2c33]">
          <h2 className="text-lg font-semibold text-white">Pending Requests</h2>
          <FiX
            size={22}
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          />
        </div>

        {/* Content */}
        <div className="px-4 overflow-y-auto">
          {loading && <Loading message="Loading..." />}

          {!loading && requests.length === 0 && (
            <p className="text-center text-gray-400 mt-4">
              No pending requests
            </p>
          )}

          {requests.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between px-3 py-2 rounded-lg 
    hover:bg-[#202c33] transition group"
            >
              {/* LEFT SIDE (click opens modal) */}
              <div
                onClick={() => {
                  setSelectedRequest(req);
                  setOpenModal(true);
                }}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <img
                  src={req.sender.profilePicture}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-white font-medium">
                  {req.sender.userId}
                </span>
              </div>

              {/* RIGHT SIDE BUTTONS */}
              <div className="flex items-center gap-3 transition">
                {/* Accept */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept(req._id);
                  }}
                  className="text-green-500 hover:text-green-400 transition border-green-500 border-2 rounded-md"
                >
                  <FiCheck size={20} />
                </button>

                {/* Reject */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(req._id);
                  }}
                  className="text-red-500 hover:text-red-400 transition border-red-500 border-2 rounded-md"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PendingRequestModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        request={selectedRequest}
      />
    </>
  );
}
