import { useState } from "react";
import AuthInput from "../components/Login_components/AuthInput/AuthInput.jsx";
import OTPVerify from "../components/Login_components/OTPVerify/OTPVerify.jsx";
import ProfileSetup from "../components/Login_components/ProfileSetup/ProfileSetup.jsx";
import useAuthStore from "../store/authStore.js";
import api from "../api/axios.js";
import Loading from "../components/LoadingScreen/Loading.jsx";

function Login() {
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [step, setStep] = useState("INPUT");
  const { email } = useAuthStore();

  const handelSendOTP = async () => {
    setSendOtpLoading(true);
    await api
      .post("/login", { email })
      .then((response) => {
        if (response.data.success === true) {
          setStep("OTP");
          setSendOtpLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
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
    setVerifyLoading(true);
    await api
      .post("/login/verify", { email, otp })
      .then((response) => {
        if (response.data.success === true) {
          const accessToken = response.data.accessToken;
          localStorage.setItem("token", accessToken);
          setStep("PROFILE");
          setVerifyLoading(false);
        }
      })
      .catch((error) => {
        console.log("no res");
        console.log(error);
      });
  };

  if (verifyLoading) {
    return <Loading message={"Verifying your code. Please wait a moment..."} />;
  }

  const handelResend = async () => {
    setSendOtpLoading(true);
    await api
      .put("/login/resend-otp", { email })
      .then((response) => {
        console.log(response);
        if (response.data.success === true) {
          setStep("OTP");
          setSendOtpLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const goInput = () => {
    setStep("INPUT");
  };

  return (
    <>
      {step === "INPUT" && <AuthInput handelSendOTP={handelSendOTP} />}
      {step === "OTP" && (
        <OTPVerify handelVerify={handelVerify} handelResend={handelResend} />
      )}
      {step === "PROFILE" && <ProfileSetup goInput={goInput} />}
    </>
  );
}

export default Login;
