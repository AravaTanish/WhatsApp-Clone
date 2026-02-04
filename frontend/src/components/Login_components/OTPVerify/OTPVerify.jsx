import "./OTPVerify.css";
import { useEffect, useRef, useState } from "react";

function OTPVerify({ handelVerify, handelResend }) {
  const [otpArray, setOtpArray] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputsRef = useRef([]);
  let OTP = otpArray.join("");
  let disabled = OTP.length === 6 ? false : true;
  // Countdown timer
  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle input
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpArray[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-auth-gradient">
      <div
        className="w-full max-w-md sm:max-w-lg rounded-xl bg-[#2a2f32]
                      px-4 py-6 sm:p-8 mx-4 shadow-2xl"
      >
        <h2 className="text-center text-lg sm:text-xl font-semibold text-white">
          OTP Verification
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-gray-400">
          Enter OTP
        </p>

        <div className="mt-5 sm:mt-6 flex justify-center gap-2 sm:gap-4">
          {otpArray.map((value, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="otp-box"
            />
          ))}
        </div>

        <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div
            className="flex-1 rounded-lg border border-gray-600 py-2.5 sm:py-3
                          text-center text-xs sm:text-sm text-gray-300"
          >
            OTP expires in{" "}
            <span className="font-medium">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>

          <button
            disabled={timeLeft > 0}
            onClick={() => {
              handelResend();
              setTimeLeft(600);
            }}
            className="flex-1 rounded-lg border border-gray-600 py-2.5 sm:py-3
                       text-xs sm:text-sm text-green-400
                       disabled:opacity-40 hover:bg-[#1f2c25] transition"
          >
            Resend OTP
          </button>
        </div>

        <button
          disabled={disabled}
          onClick={() => {
            const finalOtp = otpArray.join("");
            handelVerify(finalOtp);
          }}
          className={`${disabled ? "cursor-not-allowed opacity-50" : ""} mt-5 sm:mt-6 w-full rounded-lg bg-green-600 py-2.5 sm:py-3 font-medium text-black hover:bg-green-500 transition`}
        >
          Verify
        </button>
      </div>
    </div>
  );
}

export default OTPVerify;
