import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-auth-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-4xl  bg-[#2a2f32] rounded-2xl shadow-2xl p-16 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold text-white mb-6">
          Welcome to WhatsApp Clone
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Simple, reliable and private. Message privately, make calls and share
          files with your friends, family and colleagues.
        </p>

        <button
          className="bg-green-500 hover:bg-green-600 active:scale-95 text-black font-medium px-10 py-3 rounded-full text-lg transition duration-300 shadow-lg"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    </div>
  );
}
