import { LuX } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { BsSendFill } from "react-icons/bs";
import { useState } from "react";
import useChatStore from "../../../store/chatStore.js";
import Loading from "../../LoadingScreen/Loading.jsx";

export default function MediaPreview({ handleSend }) {
  const { selectedFiles, setSelectedFiles } = useChatStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const [caption, setCaption] = useState("");

  const handleAdddMedia = (e) => {
    const file = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...file]);
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = selectedFiles.filter(
      (_, index) => index !== indexToRemove,
    );

    setSelectedFiles(updatedImages);

    if (selectedIndex >= updatedImages.length) {
      setSelectedIndex(updatedImages.length - 1);
    }
  };

  const handleClosePreview = () => {
    setSelectedFiles([]);
  };

  return (
    <div className=" bg-[#111b21] z-5 flex flex-col h-full py-5">
      {/* TOP BAR */}
      <div className="px-5 flex items-center justify-between">
        {/* CLOSE BUTTON */}
        <button
          className="text-gray-300 hover:text-white transition"
          onClick={handleClosePreview}
        >
          <LuX size={24} />
        </button>
      </div>

      {/* MAIN PREVIEW */}
      <div className="flex-1 flex items-center justify-center px-10 overflow-hidden">
        {selectedFiles[selectedIndex]?.type.startsWith("image/") ? (
          <img
            src={URL.createObjectURL(selectedFiles[selectedIndex])}
            alt="preview"
            className="max-h-[55vh] max-w-[55%] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <video
            src={URL.createObjectURL(selectedFiles[selectedIndex])}
            controls
            className="max-h-[55vh] max-w-[55%] rounded-lg shadow-2xl"
          />
        )}
      </div>

      {/* BOTTOM SECTION */}
      <div className="border-t border-white/10 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {/* LEFT SIDE */}
          <div className="flex-1 w-1">
            {/* CAPTION INPUT
            <div className="bg-[#2a3942] rounded-xl px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-transparent flex-1 outline-none text-white placeholder:text-gray-400"
              />
            </div> */}

            {/* THUMBNAILS */}
            <div className="flex items-center gap-3 mt-4  overflow-x-scroll pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {selectedFiles.map((image, index) => (
                <div
                  key={index}
                  className={`relative group w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 ${
                    selectedIndex === index
                      ? "border-green-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  {image.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="thumb"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(image)}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-100 transition"
                  >
                    <LuX size={14} className="text-white" />
                  </button>
                </div>
              ))}

              {/* ADD MORE IMAGE BUTTON */}
              <label className="w-20 h-20 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center cursor-pointer hover:border-white transition shrink-0">
                <FaPlus className="text-gray-300" />

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  hidden
                  onChange={handleAdddMedia}
                />
              </label>
            </div>
          </div>

          {/* SEND BUTTON */}
          <button
            onClick={handleSend}
            className="w-14 h-14 rounded-full bg-[#22c55e] transition flex items-center justify-center shrink-0"
          >
            <BsSendFill size={22} className="text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
