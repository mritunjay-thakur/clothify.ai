import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const SignUpPage = () => {
  const navigate = useNavigate();
  const { signup, loading, error: authError } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

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

  const debouncedFullName = useDebounce(formData.fullName, 300);
  const debouncedEmail = useDebounce(formData.email, 300);
  const debouncedPassword = useDebounce(formData.password, 300);
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 300);

  useEffect(
    () => validateField("fullName", debouncedFullName),
    [debouncedFullName]
  );
  useEffect(() => validateField("email", debouncedEmail), [debouncedEmail]);
  useEffect(
    () => validateField("password", debouncedPassword),
    [debouncedPassword]
  );
  useEffect(
    () => validateField("confirmPassword", debouncedConfirmPassword),
    [debouncedConfirmPassword]
  );

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case "fullName":
        newErrors.fullName = !value
          ? "Full name required"
          : !/^[a-zA-Z ]{2,30}$/.test(value)
          ? "Invalid name"
          : "";
        break;
      case "email":
        newErrors.email = !value
          ? "Email required"
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Invalid email"
          : "";
        break;
      case "password":
        newErrors.password = !value
          ? "Password required"
          : value.length < 6
          ? "Minimum 6 characters"
          : "";
        break;
      case "confirmPassword":
        newErrors.confirmPassword = !value
          ? "Confirm password"
          : value !== formData.password
          ? "Passwords don't match"
          : "";
        break;
    }
    if (!newErrors[name]) delete newErrors[name];
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
      await signup({
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      // Redirect directly to clothify after successful signup
      navigate("/clothify", { replace: true });
    } catch (err) {
      setGlobalError(
        err.message.includes("already exists")
          ? "Email already registered"
          : err.message.includes("Invalid email")
          ? "Please enter a valid email address"
          : "Registration failed. Please try again."
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
          color="#9B30FF"
          noiseIntensity={0.5}
          rotation={0}
        />
      </div>

      <div className="fixed top-0 left-0 mt-4 right-0 z-[1000] w-full">
        <HeaderNonAuthUser />
      </div>

      <AuthFormContainer
        title="Create Account with Us"
        subtitle="Join us to get personalized fashion recommendations"
      >
        {globalError && <ErrorMessage message={globalError} type="error" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <MemoizedFormInput
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            error={errors.fullName}
            autoComplete="name"
            disabled={loading}
          />

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
            autoComplete="new-password"
            disabled={loading}
          />

          <MemoizedPasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={loading}
            confirm
          />

          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Sign Up"
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
                <span>Sign up with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-white hover:text-white/80 underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthFormContainer>
    </div>
  );
};

export default SignUpPage;
