import { useState } from "react";
import AuthInput from "../components/Login_components/AuthInput/AuthInput.jsx";
import OTPVerify from "../components/Login_components/OTPVerify/OTPVerify.jsx";
import useAuthStore from "../store/authStore.js";
import useUserStore from "../store/userStore.js";
import api from "../api/axios.js";
import Loading from "../components/LoadingScreen/Loading.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Login() {
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [step, setStep] = useState("INPUT");

  const { email } = useAuthStore();
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  // SEND OTP
  const handelSendOTP = async () => {
    try {
      setSendOtpLoading(true);

      const response = await api.post("/login", { email });

      if (response.data.success) {
        setStep("OTP");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSendOtpLoading(false);
    }
  };

  // VERIFY OTP
  const handelVerify = async (otp) => {
    try {
      setVerifyLoading(true);

      const response = await api.post("/login/verify", { email, otp });

      if (response.data.success) {
        const { accessToken, userId, id, email, isCompleted } = response.data;

        localStorage.setItem("token", accessToken);

        setUser({
          userId,
          id,
          email,
          isCompleted,
        });

        navigate(isCompleted ? "/chat" : "/profile-setup", {
          replace: true,
        });

        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  // RESEND OTP
  const handelResend = async () => {
    try {
      setSendOtpLoading(true);

      const response = await api.put("/login/resend-otp", { email });

      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setSendOtpLoading(false);
    }
  };

  // LOADING STATES
  if (sendOtpLoading) {
    return (
      <Loading message="We’re sending your verification code. Please wait..." />
    );
  }

  if (verifyLoading) {
    return <Loading message="Verifying your code. Please wait..." />;
  }

  // RENDER
  return (
    <>
      {step === "INPUT" && <AuthInput handelSendOTP={handelSendOTP} />}
      {step === "OTP" && (
        <OTPVerify handelVerify={handelVerify} handelResend={handelResend} />
      )}
    </>
  );
}

export default Login;
