import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Silk from "../../jsrepo/Silk/Silk";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import ErrorMessage from "../components/ErrorMessage";
import OTPInput from "../components/OTPInput";
import PasswordInput from "../components/PasswordInput";
import AuthFormContainer from "../components/AuthFormContainer";

const ResetPasswordPage = () => {
  const { resetPassword, resendOtp, forgotPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => {
    return (
      sessionStorage.getItem("resetPwEmail") || location.state?.email || ""
    );
  });
  const [userId, setUserId] = useState(() => {
    return (
      sessionStorage.getItem("resetPwUserId") || location.state?.userId || ""
    );
  });
  const [otp, setOtp] = useState(
    () => sessionStorage.getItem("resetPwOtp") || ""
  );
  const [newPassword, setNewPassword] = useState(
    () => sessionStorage.getItem("resetPwNewPassword") || ""
  );
  const [confirmPassword, setConfirmPassword] = useState(
    () => sessionStorage.getItem("resetPwConfirmPassword") || ""
  );
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(120);
  const hasRedirected = useRef(false);
  const [animationPlayed, setAnimationPlayed] = useState(() => {
    return sessionStorage.getItem("resetPwAnimationPlayed") === "true";
  });

  useEffect(() => {
    if (location.state?.email && location.state?.userId) {
      setEmail(location.state.email);
      setUserId(location.state.userId);
      sessionStorage.setItem("resetPwEmail", location.state.email);
      sessionStorage.setItem("resetPwUserId", location.state.userId);
    }
  }, [location.state]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          sessionStorage.setItem("resetPwTimeLeft", newTime.toString());
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && !error) {
      setError("Code has expired. Please request a new one.");
    }
    return () => clearInterval(timer);
  }, [timeLeft, error]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          const newTime = Math.max(0, prev - 1);
          sessionStorage.setItem("resetPwResendCooldown", newTime.toString());
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const savedTimeLeft = sessionStorage.getItem("resetPwTimeLeft");
    const savedCooldown = sessionStorage.getItem("resetPwResendCooldown");

    if (savedTimeLeft) setTimeLeft(parseInt(savedTimeLeft, 10));
    if (savedCooldown) setResendCooldown(parseInt(savedCooldown, 10));
  }, []);


  useEffect(() => {
    if ((!email || !userId) && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/forgot-password", { state: { sessionExpired: true } });
    }
  }, [email, userId, navigate]);

  useEffect(() => {
    return () => {
      if (!loading && !error) {
        sessionStorage.removeItem("resetPwOtp");
        sessionStorage.removeItem("resetPwNewPassword");
        sessionStorage.removeItem("resetPwConfirmPassword");
      }
    };
  }, [loading, error]);

  const validateForm = () => {
    const errors = {};
    if (otp.length !== 6) errors.otp = "Please enter a 6-digit code";
    if (!newPassword) errors.newPassword = "New password is required";
    else if (newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword)
      errors.confirmPassword = "Confirm password is required";
    else if (newPassword !== confirmPassword)
      errors.confirmPassword = "Passwords don't match";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      if (!userId) {
        throw new Error("Session expired. Please request a new reset code.");
      }

      await resetPassword({ userId, otp, newPassword });

      sessionStorage.removeItem("resetPwEmail");
      sessionStorage.removeItem("resetPwUserId");
      sessionStorage.removeItem("resetPwOtp");
      sessionStorage.removeItem("resetPwNewPassword");
      sessionStorage.removeItem("resetPwConfirmPassword");
      sessionStorage.removeItem("resetPwTimeLeft");
      sessionStorage.removeItem("resetPwResendCooldown");

      navigate("/login", {
        state: {
          resetSuccess: true,
          message:
            "Password reset successfully! Please login with your new password.",
        },
      });
    } catch (err) {
      let errorMessage = err.message || "Password reset failed";

      if (
        errorMessage.includes("401") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("User data not found") ||
        errorMessage.includes("Session expired")
      ) {
        errorMessage = "Session expired. Please request a new reset code.";
        sessionStorage.removeItem("resetPwUserId");
        sessionStorage.removeItem("resetPwEmail");
      } else if (errorMessage.includes("Invalid or expired OTP")) {
        errorMessage =
          "Invalid or expired code. Please try again or request a new code.";
      } else if (errorMessage.includes("Too many requests")) {
        errorMessage = "Too many attempts. Please wait and try again later.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");

    try {
      if (!userId || !email) {
        throw new Error(
          "Session data missing. Please request a new reset link."
        );
      }

      try {
        await resendOtp({ userId, context: "password-reset" });
      } catch (resendError) {
        if (
          resendError.message.includes("Session expired") ||
          resendError.message.includes("User not found") ||
          resendError.message.includes("404")
        ) {
          await forgotPassword(email);
          throw new Error(
            "New reset link sent to your email. Please check your inbox."
          );
        }
        throw resendError;
      }

      setTimeLeft(600);
      setResendCooldown(120);

      sessionStorage.setItem("resetPwTimeLeft", "600");
      sessionStorage.setItem("resetPwResendCooldown", "120");

      setError("New code sent to your email!");
    } catch (err) {
      let errorMessage = err.message || "Failed to resend code";

      if (errorMessage.includes("Too many requests")) {
        errorMessage = "Please wait before requesting a new code.";
        setResendCooldown(120);
      } else if (
        errorMessage.includes("User not found") ||
        errorMessage.includes("Session expired")
      ) {
        errorMessage = "Session expired. Please request a new reset code.";
        sessionStorage.removeItem("resetPwUserId");
        sessionStorage.removeItem("resetPwEmail");
      }

      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    setLoading(true);
    setError("");
    try {
      if (!email) {
        throw new Error(
          "Email not found. Please start the reset process again."
        );
      }

      await forgotPassword(email);

      sessionStorage.removeItem("resetPwOtp");
      sessionStorage.removeItem("resetPwNewPassword");
      sessionStorage.removeItem("resetPwConfirmPassword");
      sessionStorage.removeItem("resetPwTimeLeft");
      sessionStorage.removeItem("resetPwResendCooldown");

      setError("New reset link sent to your email. Please check your inbox.");

      navigate("/forgot-password", {
        state: {
          email,
          message: "New reset link sent. Check your email.",
        },
      });
    } catch (err) {
      setError(err.message || "Failed to request new reset code");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    setOtp(value);
    sessionStorage.setItem("resetPwOtp", value);
    setFormErrors((prev) => ({ ...prev, otp: "" }));
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    sessionStorage.setItem("resetPwNewPassword", value);
    setFormErrors((prev) => ({ ...prev, newPassword: "" }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    sessionStorage.setItem("resetPwConfirmPassword", value);
    setFormErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-black overflow-hidden text-white px-4">
      <div className="absolute inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#40E0D0"
          noiseIntensity={1}
          rotation={0}
        />
      </div>

      <div className="fixed top-0 left-0 mt-4 right-0 z-[1000] w-full">
        <HeaderNonAuthUser />
      </div>

      <AuthFormContainer
        title="Reset Password"
        subtitle={
          <>
            We've sent a 6-digit code to{" "}
            <span className="font-medium text-white">{email}</span>
          </>
        }
        animationPlayed={animationPlayed}
        onAnimationComplete={() => {
          setAnimationPlayed(true);
          sessionStorage.setItem("resetPwAnimationPlayed", "true");
        }}
      >
        <div className="mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full">
            <span className="text-white/80 mr-2">Code expires in:</span>
            <span
              className={
                timeLeft <= 60 ? "text-red-400" : "text-green-400 font-bold"
              }
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            type={
              error.includes("sent") || error.includes("success")
                ? "success"
                : "error"
            }
            onRetry={
              error.includes("Session expired") || error.includes("missing")
                ? handleRequestNewCode
                : null
            }
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <OTPInput
            value={otp}
            onChange={handleOtpChange}
            error={formErrors.otp}
            disabled={loading}
          />

          <PasswordInput
            name="newPassword"
            value={newPassword}
            onChange={handleNewPasswordChange}
            placeholder="New Password"
            error={formErrors.newPassword}
            autoComplete="new-password"
            disabled={loading}
          />

          <PasswordInput
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm Password"
            error={formErrors.confirmPassword}
            autoComplete="new-password"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || timeLeft === 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${loading || otp.length !== 6 || timeLeft === 0
              ? "bg-white/30 cursor-not-allowed"
              : "bg-white text-black hover:bg-gray-200"
              }`}
            aria-busy={loading}
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-white/80 hover:text-white transition underline text-sm"
            disabled={loading || resendLoading}
          >
            Back to login
          </button>

          {error &&
            (error.includes("Session expired") || error.includes("missing")) ? (
            <button
              onClick={handleRequestNewCode}
              disabled={loading || resendLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></span>
              ) : (
                "Request New Reset Code"
              )}
            </button>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={
                resendCooldown > 0 || loading || resendLoading || timeLeft === 0
              }
              className={`px-4 py-2 rounded-lg transition text-sm ${resendCooldown === 0 &&
                !loading &&
                !resendLoading &&
                timeLeft > 0
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
            >
              {resendLoading ? (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></span>
              ) : resendCooldown > 0 ? (
                `Resend (${formatTime(resendCooldown)})`
              ) : (
                "Resend code"
              )}
            </button>
          )}
        </div>
      </AuthFormContainer>
    </div>
  );
};

export default ResetPasswordPage;
