import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Silk from "../../jsrepo/Silk/Silk";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import ErrorMessage from "../components/ErrorMessage";
import AuthFormContainer from "../components/AuthFormContainer";
import { sendSupportMessage } from "../lib/api";

const SupportPage = () => {
  const navigate = useNavigate();
  const { authUser, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: isAuthenticated ? authUser.email : "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));


    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (showSuccess) setShowSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await sendSupportMessage({
        ...formData,
        userId: isAuthenticated ? authUser.id : null
      });

      setSuccessMessage("Your message has been sent successfully! We'll respond within 24 hours.");
      setShowSuccess(true);
      setFormData({
        email: isAuthenticated ? authUser.email : formData.email,
        subject: "",
        message: ""
      });

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setErrors({
        global: err.message || "Failed to send message. Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-black overflow-hidden text-white px-4 pb-10">
      <div className="absolute inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#40E0D0"
          noiseIntensity={0.8}
          rotation={30}
        />
      </div>

      <div className="fixed top-0 left-0 mt-4 right-0 z-[1000] w-full">

        <HeaderNonAuthUser isAuthenticated={isAuthenticated} />
      </div>

      <AuthFormContainer
        title="Support Center"
        subtitle="We're here to help with any questions or issues"
      >
        {errors.global && <ErrorMessage message={errors.global} type="error" />}

        {showSuccess && (
          <ErrorMessage
            message={successMessage}
            type="success"
            autoDismiss={5000}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isAuthenticated && (
            <div>
              <label htmlFor="email" className="block text-left text-white/80 mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-black/30 border ${errors.email ? "border-red-500" : "border-white/20"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition placeholder:text-white/60 text-sm`}
                placeholder="your@email.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 text-left">
                  {errors.email}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="subject" className="block text-left text-white/80 mb-2 text-sm">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-black/30 border ${errors.subject ? "border-red-500" : "border-white/20"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition placeholder:text-white/60 text-sm`}
              placeholder="What's this regarding?"
              disabled={loading}
            />
            {errors.subject && (
              <p className="text-red-400 text-xs mt-1 text-left">
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-left text-white/80 mb-2 text-sm">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-3 bg-black/30 border ${errors.message ? "border-red-500" : "border-white/20"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition placeholder:text-white/60 text-sm resize-none`}
              placeholder="Please describe your issue in detail..."
              disabled={loading}
            />
            {errors.message && (
              <p className="text-red-400 text-xs mt-1 text-left">
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${loading
              ? "bg-teal-600/70 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Send Message"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white transition underline text-sm"
          >
            ← Back to previous page
          </button>
        </div>
      </AuthFormContainer>
    </div>
  );
};

export default SupportPage;