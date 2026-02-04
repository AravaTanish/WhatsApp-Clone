import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./AuthInput.css";
import useAuthStore from "../../../store/authStore.js";

function AuthInput({ handelSendOTP }) {
  const { email, setEmail } = useAuthStore();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const disabled = !isValidEmail;
  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-gradient">
      <div
        className="w-full max-w-md sm:max-w-lg rounded-xl bg-[#2a2f32]
                      px-4 py-6 sm:p-8 mx-4 shadow-2xl"
      >
        <h1 className="text-center text-2xl sm:text-3xl font-semibold text-green-500">
          WhatsApp
        </h1>
        <p className="mt-2 text-center text-xs sm:text-sm text-gray-400">
          Enter your details to continue
        </p>

        <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4">
          <input
            onChange={(e) => setEmail({ email: e.target.value })}
            value={email}
            type="email"
            placeholder="Email"
            className="auth-input"
          />
        </div>

        <button
          disabled={disabled}
          onClick={handelSendOTP}
          className={`${disabled ? "cursor-not-allowed opacity-50" : ""}
            mt-5 sm:mt-6 w-full rounded-lg bg-green-600
            py-2.5 sm:py-3 font-medium text-black
            hover:bg-green-500 transition`}
        >
          Send OTP
        </button>

        <p className="mt-3 sm:mt-4 text-center text-[11px] sm:text-xs text-gray-400">
          We'll send a verification code to confirm your account
        </p>
      </div>
    </div>
  );
}

export default AuthInput;
