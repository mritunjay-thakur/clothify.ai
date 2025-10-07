import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FcGoogle } from "react-icons/fc";
import Silk from "../../jsrepo/Silk/Silk";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import AuthFormContainer from "../components/AuthFormContainer";
import ErrorMessage from "../components/ErrorMessage";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  }, []);

  const debouncedEmail = useDebounce(formData.email, 300);
  const debouncedPassword = useDebounce(formData.password, 300);

  useEffect(() => {
    if (location.state?.resetSuccess) {
      setGlobalError("Password reset successfully! Please log in.");
    }
  }, [location.state]);

  useEffect(() => {
    validateField("email", debouncedEmail);
  }, [debouncedEmail]);

  useEffect(() => {
    validateField("password", debouncedPassword);
  }, [debouncedPassword]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case "email":
        newErrors.email = !value
          ? "Email is required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Invalid email"
          : "";
        if (!newErrors.email) delete newErrors.email;
        break;
      case "password":
        newErrors.password = !value
          ? "Password is required"
          : value.length < 6
          ? "Minimum 6 characters"
          : "";
        if (!newErrors.password) delete newErrors.password;
        break;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGlobalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    try {
      await login({ email: formData.email, password: formData.password });
      navigate("/clothify", { replace: true });
    } catch (err) {
      setGlobalError(
        err.message.includes("Invalid credentials")
          ? "Invalid email or password"
          : "Login failed. Please try again."
      );
    }
  };

  const handleGoogleAuth = () => {
    setGoogleLoading(true);
    const baseUrl = process.env.VITE_API_BASE_URL;
    window.location.href = `${baseUrl}/auth/google?mobile=${isMobile}`;
  };

  const MemoizedFormInput = useMemo(() => FormInput, []);
  const MemoizedPasswordInput = useMemo(() => PasswordInput, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden text-white px-4">
      <div className="absolute inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#5227ff"
          noiseIntensity={0.5}
          rotation={0}
        />
      </div>

      <div className="fixed top-0 left-0 mt-4 right-0 z-[1000] w-full">
        <HeaderNonAuthUser />
      </div>

      <AuthFormContainer
        title="Welcome Back"
        subtitle="Sign in to access your personalized recommendations"
      >
        {globalError && (
          <ErrorMessage
            message={globalError}
            type={location.state?.resetSuccess ? "success" : "error"}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <MemoizedFormInput
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            error={errors.email}
            autoComplete="email"
            disabled={loading}
          />

          <MemoizedPasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            error={errors.password}
            autoComplete="current-password"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center my-4">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="mx-2 text-sm text-white/60">Or continue with</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 px-4 rounded-3xl font-medium hover:bg-gray-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="inline-block h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <FcGoogle size={20} />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-white hover:text-white/80 underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </AuthFormContainer>
    </div>
  );
};

export default LoginPage;
