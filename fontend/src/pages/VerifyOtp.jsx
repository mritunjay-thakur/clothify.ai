import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Silk from "../../jsrepo/Silk/Silk";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import OTPInput from "../components/OTPInput";
import ErrorMessage from "../components/ErrorMessage";
import AuthFormContainer from "../components/AuthFormContainer";

const VerifyOtp = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email] = useState(location.state?.email || "");
  const [userId] = useState(location.state?.userId || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(120);
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const otpInputRef = useRef(null);

  const silkBackground = useMemo(() => (
    <div className="absolute inset-0 z-0">
      <Silk speed={5} scale={1} color="#8E44AD" noiseIntensity={0.5} rotation={0} />
    </div>
  ), []);

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      document.cookie = `jwt=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=None; Secure`;
      navigate("/clothify", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!email || !userId) navigate("/signup");
  }, [email, userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyOtp({ userId, otp });
      navigate("/clothify");
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      otpInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      await resendOtp({ userId, context: "signup" });
      setTimeLeft(600);
      setResendCooldown(120);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInfo = () => {
    navigate("/signup", { state: { email } });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-black overflow-hidden text-white px-4">
      {silkBackground}
      <div className="fixed top-0 left-0 mt-4 right-0 z-[1000] w-full">
        <HeaderNonAuthUser />
      </div>
      <AuthFormContainer
        title="Verify Your Email"
        subtitle={
          <>
            We've sent a 6-digit code to <span className="font-medium text-white">{email}</span>
          </>
        }
        animationPlayed={animationPlayed}
        onAnimationComplete={() => setAnimationPlayed(true)}
      >
        <div className="mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full">
            <span className="text-white/80 mr-2">Code expires in:</span>
            <span className={timeLeft <= 60 ? "text-red-400" : "text-green-400 font-bold"}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        {error && <ErrorMessage message={error} type="error" />}
        <form onSubmit={handleSubmit} className="space-y-6">
          <OTPInput
            name="otp"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              if (e.target.value.length === 6) setError("");
            }}
            error={error}
            disabled={loading}
            length={6}
            ref={otpInputRef}
          />
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${loading || otp.length !== 6 ? "bg-white/30 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200"
              }`}
            aria-busy={loading}
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Verify"
            )}
          </button>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleEditInfo}
              className="px-4 py-2 text-white/80 hover:text-white transition underline text-sm"
              disabled={loading}
            >
              Edit signup info
            </button>
            <button
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
              className={`px-4 py-2 rounded-lg transition text-sm ${resendCooldown === 0 && !loading
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              aria-label={
                resendCooldown > 0 ? `Resend available in ${formatTime(resendCooldown)}` : "Resend verification code"
              }
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></span>
              ) : resendCooldown > 0 ? (
                `Resend (${formatTime(resendCooldown)})`
              ) : (
                "Resend code"
              )}
            </button>
          </div>
        </form>
      </AuthFormContainer>
    </div>
  );
};

export default VerifyOtp;