import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Silk from "../../jsrepo/Silk/Silk";
import AuthFormContainer from "../components/AuthFormContainer";
import ErrorMessage from "../components/ErrorMessage";
import FormInput from "../components/FormInput";
import PasswordInput from "../components/PasswordInput";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";

const CompleteEditProfile = () => {
  const navigate = useNavigate();
  const {
    authUser,
    editProfile,
    loading: authLoading,
    error: authError,
    logout,
  } = useAuth();

  const [activeSection, setActiveSection] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
    deleteConfirm: false,
  });
  const [currentEmail, setCurrentEmail] = useState("");
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  const error = authError || localError;

  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: authUser.name || authUser.fullName || "",
        email: authUser.email || "",
      }));
      setCurrentEmail(authUser.email || "");
      setUserId(authUser._id || authUser.id);
    }
  }, [authUser]);

  useEffect(() => {
    setLocalError(null);
    setSuccessMessage(null);
  }, [formData]);

  const handleBackToProfile = () => {
    setActiveSection(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateName = () => {
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    if (!formData.fullName.trim()) {
      setLocalError("Name is required");
      return false;
    }
    if (!nameRegex.test(formData.fullName.trim())) {
      setLocalError(
        "Name must be 2-30 characters and contain only letters and spaces"
      );
      return false;
    }
    return true;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!emailRegex.test(formData.email.trim())) {
      setLocalError("Invalid email format");
      return false;
    }
    if (formData.email.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setLocalError("New email must be different from current email");
      return false;
    }
    return true;
  };

  const validatePasswordChange = () => {
    if (!formData.newPassword) {
      setLocalError("New password is required");
      return false;
    }
    if (formData.newPassword.length < 6) {
      setLocalError("New password must be at least 6 characters");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateDelete = () => {
    if (!formData.deleteConfirm) {
      setLocalError("Please confirm account deletion");
      return false;
    }
    return true;
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!validateName() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        newName: formData.fullName.trim(),
      });

      if (response?.success) {
        setSuccessMessage("Name updated successfully!");
        setTimeout(() => {
          setActiveSection(null);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setLocalError(response?.message || "Failed to update name");
      }
    } catch (err) {
      console.error("Name update failed:", err);
      setLocalError(err?.message || "Failed to update name");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        newEmail: formData.email.trim(),
      });

      if (response?.success) {
        setSuccessMessage("Email updated successfully!");
        setCurrentEmail(formData.email.trim());
        setTimeout(() => {
          setActiveSection(null);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setLocalError(response?.message || "Failed to update email");
      }
    } catch (err) {
      console.error("Email update failed:", err);
      setLocalError(err?.message || "Failed to update email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordChange() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        newPassword: formData.newPassword,
      });

      if (response?.success) {
        setSuccessMessage("Password updated successfully!");
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
        setTimeout(() => {
          setActiveSection(null);
          setSuccessMessage(null);
        }, 2000);
      } else {
        setLocalError(response?.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update failed:", err);
      setLocalError(err?.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!validateDelete() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);
    setSuccessMessage(null);

    try {
      const response = await editProfile({
        deleteAccount: true,
      });

      if (response?.success) {
        setSuccessMessage("Account deleted successfully. Redirecting...");
        await logout();
        navigate("/", { replace: true });
      } else {
        setLocalError(response?.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Account deletion failed:", err);
      setLocalError(err?.message || "Failed to delete account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMainProfile = () => (
    <div className="space-y-6">
      <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Your Profile
        </h3>
        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between items-center py-1">
            <span className="text-white/70">Name:</span>
            <span className="font-medium truncate max-w-[50%]">
              {authUser?.name || authUser?.fullName || "Not set"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-white/70">Email:</span>
            <span className="font-medium truncate max-w-[50%]">
              {currentEmail || "Not set"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveSection("name")}
          className="bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 text-sm sm:text-base flex items-center justify-center"
          aria-label="Change name"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
            />
          </svg>
          Change Name
        </button>

        <button
          onClick={() => setActiveSection("email")}
          className="bg-indigo-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-all duration-200 text-sm sm:text-base flex items-center justify-center"
          aria-label="Change email"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Change Email
        </button>

        <button
          onClick={() => setActiveSection("password")}
          className="bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-all duration-200 text-sm sm:text-base flex items-center justify-center"
          aria-label="Change password"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Change Password
        </button>

        <button
          onClick={() => setActiveSection("delete")}
          className="bg-rose-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-rose-700 transition-all duration-200 text-sm sm:text-base flex items-center justify-center"
          aria-label="Delete account"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderNameChange = () => (
    <form onSubmit={handleNameSubmit} className="space-y-5">
      <FormInput
        label="Full Name"
        name="fullName"
        type="text"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Enter your full name"
        required
        disabled={isSubmitting}
      />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="flex-1 bg-transparent border border-white/30 py-3 px-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 text-sm sm:text-base disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.fullName.trim()}
          className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg"
          aria-label={isSubmitting ? "Saving name" : "Save name"}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );

  const renderEmailChange = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-5">
      <FormInput
        label="New Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="name@example.com"
        required
        disabled={isSubmitting}
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="flex-1 bg-transparent border border-white/30 py-3 px-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 text-sm sm:text-base disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.email.trim()}
          className="flex-1 bg-indigo-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg"
          aria-label={isSubmitting ? "Updating email" : "Update email"}
        >
          {isSubmitting ? "Updating..." : "Update Email"}
        </button>
      </div>
    </form>
  );

  const renderPasswordChange = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-5">
      <PasswordInput
        label="New Password"
        name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
        placeholder="Enter a strong password"
        required
        disabled={isSubmitting}
      />
      <PasswordInput
        label="Confirm New Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Re-enter your password"
        required
        disabled={isSubmitting}
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="flex-1 bg-transparent border border-white/30 py-3 px-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 text-sm sm:text-base disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting || !formData.newPassword || !formData.confirmPassword
          }
          className="flex-1 bg-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg"
          aria-label={isSubmitting ? "Updating password" : "Update password"}
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );

  const renderDeleteAccount = () => (
    <form onSubmit={handleDeleteSubmit} className="space-y-5">
      <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-sm">
        ⚠️ This action is permanent and cannot be undone. All your data will be
        permanently deleted.
      </div>

      <label className="flex items-start gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          name="deleteConfirm"
          checked={formData.deleteConfirm}
          onChange={handleChange}
          disabled={isSubmitting}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 disabled:opacity-50"
        />
        <span className="text-white/90">
          I understand this action is permanent and I want to delete my account
          along with all associated data.
        </span>
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBackToProfile}
          disabled={isSubmitting}
          className="flex-1 bg-transparent border border-white/30 py-3 px-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200 text-sm sm:text-base disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.deleteConfirm}
          className="flex-1 bg-rose-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg"
          aria-label={isSubmitting ? "Deleting account" : "Delete account"}
        >
          {isSubmitting ? "Deleting..." : "Permanently Delete Account"}
        </button>
      </div>
    </form>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "name":
        return renderNameChange();
      case "email":
        return renderEmailChange();
      case "password":
        return renderPasswordChange();
      case "delete":
        return renderDeleteAccount();
      default:
        return renderMainProfile();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden text-white px-4">
      <div className="absolute inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#2ECC71"
          noiseIntensity={1}
          rotation={0}
          onNavigate={() => {}}
        />
      </div>

      <div className="fixed top-0 left-0 mt-4 right-0 z-[1000] w-full">
        <HeaderNonAuthUser isAuthenticated={!!authUser} />
      </div>

      <AuthFormContainer
        title={
          activeSection === "name"
            ? "Change Name"
            : activeSection === "email"
            ? "Change Email"
            : activeSection === "password"
            ? "Change Password"
            : activeSection === "delete"
            ? "Delete Account"
            : "Edit Profile"
        }
      >
        {(error || successMessage) && (
          <ErrorMessage
            message={successMessage || error}
            type={successMessage ? "success" : "error"}
          />
        )}

        {renderActiveSection()}

        {activeSection && (
          <button
            onClick={handleBackToProfile}
            disabled={isSubmitting}
            className="mt-6 text-blue-400 hover:text-blue-300 flex items-center justify-center mx-auto text-sm disabled:opacity-50 transition-colors"
            aria-label="Back to profile"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Profile
          </button>
        )}
      </AuthFormContainer>
    </div>
  );
};

export default CompleteEditProfile;
