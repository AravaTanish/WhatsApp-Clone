import { useState } from "react";
import AuthInput from "../components/Login_components/AuthInput/AuthInput.jsx";
import OTPVerify from "../components/Login_components/OTPVerify/OTPVerify.jsx";
import ProfileSetup from "../components/Login_components/ProfileSetup/ProfileSetup.jsx";
import useAuthStore from "../store/authStore.js";
import api from "../api/axios.js";
import Loading from "../components/LoadingScreen/Loading.jsx";
import toast from "react-hot-toast";

function Login() {
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [step, setStep] = useState("INPUT");
  const { email } = useAuthStore();

  const handelSendOTP = async () => {
    setSendOtpLoading(true);
    try {
      const response = await api.post("/login", { email });
      if (response.data.success) {
        setStep("OTP");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setSendOtpLoading(false);
    }
  };

  if (sendOtpLoading) {
    return (
      <Loading
        message={
          "We’re sending your verification code. Please wait a moment..."
        }
      />
    );
  }

  const handelVerify = async (otp) => {
    try {
      setVerifyLoading(true);
      const response = await api.post("/login/verify", { email, otp });
      if (response.data.success === true) {
        const accessToken = response.data.accessToken;
        localStorage.setItem("token", accessToken);
        setStep("PROFILE");
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  if (verifyLoading) {
    return <Loading message={"Verifying your code. Please wait a moment..."} />;
  }

  const handelResend = async () => {
    try {
      setSendOtpLoading(true);
      const response = await api.put("/login/resend-otp", { email });
      if (response.data.success === true) {
        setStep("OTP");
        setSendOtpLoading(false);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setSendOtpLoading(false);
    }
  };

  return (
    <>
      {step === "INPUT" && <AuthInput handelSendOTP={handelSendOTP} />}
      {step === "OTP" && (
        <OTPVerify handelVerify={handelVerify} handelResend={handelResend} />
      )}
      {step === "PROFILE" && <ProfileSetup />}
    </>
  );
}

export default Login;
