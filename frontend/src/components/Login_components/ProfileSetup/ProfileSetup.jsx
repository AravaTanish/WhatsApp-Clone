import { useState, useRef, useEffect } from "react";
import api from "../../../api/axios.js";
import { TfiReload } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ProfileSetup() {
  const DEFAULT_AVATAR = import.meta.env.VITE_DEFAULT_AVATAR;
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [userId, setUserId] = useState("");
  const [generateUsername, setGenerateUsername] = useState(false);
  const [canChange, setCanChange] = useState(false);
  const [message, setMessage] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [about, setAbout] = useState("");
  const [photoURL, setPhotoURL] = useState(DEFAULT_AVATAR);
  const navigate = useNavigate();

  // For userId generation
  useEffect(() => {
    const handleGenerateUsername = async () => {
      try {
        const response = await api.post("/login/userId-generation", {});

        if (response.data.success && response.data.userId) {
          setUserId(response.data.userId);
          if (response.data.change === true) {
            setCanChange(true);
            toast.success(response.data.message);
          } else {
            setImageFile();
            setCanChange(false);
            setPhotoURL(response.data.photoURL);
            setPreview(response.data.photoURL);
            setAbout(response.data.about);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    handleGenerateUsername();
  }, [generateUsername]);

  // For userId checking
  useEffect(() => {
    const handelChecking = async () => {
      try {
        const response = await api.post("/login/check-userId", {
          userId: userId,
        });

        if (response.data.success === true) {
          setMessage(response.data.message);
          if (response.data.valid === true) {
            setIsValid(true);
          } else setIsValid(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    handelChecking();
  }, [userId]);

  //For profile photo upload in cloudinary
  useEffect(() => {
    if (!imageFile) return;
    const handelUploadPhoto = async () => {
      try {
        const formData = new FormData();
        if (imageFile) {
          formData.append("photo", imageFile);
        }
        formData.append("defaultPhoto", DEFAULT_AVATAR);

        const response = await api.post("/user/profile-photo", formData);
        if (response.data.success && response.data.photoURL) {
          setPhotoURL(response.data.photoURL);
          console.log("Uploaded");
          toast.success(response.data.message);
        } else {
          setPhotoURL(DEFAULT_AVATAR);
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    handelUploadPhoto();
  }, [imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = async () => {
    setImageFile(null);
    setPreview(null);
    setPhotoURL(null);

    //if we upload 1.img and removed it again upload 1.img it doesnot show because ref not cleared so remove ref thats why this condition
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    try {
      const response = await api.delete("/user/profile-photo", {});
      if (response.data.success) {
        console.log("Removed");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await api.post("/login/complete", {
        photoURL,
        userId,
        about,
      });
      if (response.data.success) {
        console.log("User login completed");
        navigate("/chat");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-gradient px-4">
      <div
        className="w-full max-w-md sm:max-w-lg rounded-xl bg-[#2a2f32]
             px-4 py-6 sm:p-8 mx-4 shadow-2xl"
      >
        {/* Avatar Preview + Upload */}
        <div className="flex items-center gap-4 sm:gap-6 rounded-lg border border-gray-600 p-4">
          {/* Avatar Preview */}
          <div
            className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center
               rounded-full border border-gray-500 overflow-hidden"
          >
            <img
              src={preview || photoURL || DEFAULT_AVATAR}
              alt="profile preview"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Actions */}
          <div className="flex-1">
            <label
              className="block cursor-pointer rounded-lg border border-gray-500 px-4 py-3
                 text-xs sm:text-sm text-gray-300 text-center
                 hover:border-green-400 hover:text-green-400 transition"
            >
              Choose from device
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </label>

            {preview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="mt-2 w-full text-xs sm:text-sm text-red-400
                   hover:text-red-300 transition"
              >
                Remove profile photo
              </button>
            )}
          </div>
        </div>

        {/* Username */}
        <div className="mt-6">
          <label className="mb-2 block text-sm text-gray-300">Username</label>
          <div className="flex gap-3">
            <input
              type="text"
              onChange={(e) => setUserId(e.target.value)}
              value={userId}
              readOnly={!canChange}
              placeholder="Username"
              className={`flex-1 rounded-lg bg-[#111b21] px-4 py-3 ${!canChange ? "cursor-not-allowed opacity-50" : "focus:ring-green-500"} text-sm text-white outline-none ring-1 ring-gray-700 focus:ring-2 `}
            />

            <button
              disabled={!canChange}
              type="button"
              onClick={() => {
                setGenerateUsername(!generateUsername);
              }}
              className={`rounded-lg text-[#111b21] px-4 py-3
                ${!canChange ? "cursor-not-allowed opacity-80" : "hover:bg-green-500 transition"} text-sm ring-1 ring-gray-700 bg-green-600 `}
            >
              <TfiReload />
            </button>
          </div>

          <p
            className={`mt-1 text-xs ${isValid ? "text-green-400" : "text-red-400"}`}
          >
            {canChange
              ? message
              : "User already exists, you cannot change your username now"}
          </p>
        </div>

        {/* About */}
        <textarea
          rows={3}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="About"
          className="mt-4 w-full resize-none rounded-lg bg-[#111b21] px-4 py-3
                     text-sm text-white outline-none
                     ring-1 ring-gray-700 focus:ring-2 focus:ring-green-500"
        />

        {/* Complete */}
        <button
          onClick={handleComplete}
          className="mt-6 w-full rounded-lg bg-green-600 py-3
                     text-sm sm:text-base font-medium text-black
                     hover:bg-green-500 transition"
        >
          Complete
        </button>
      </div>
    </div>
  );
}

export default ProfileSetup;
