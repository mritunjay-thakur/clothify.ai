import { CheckCircle, AlertCircle, X } from "lucide-react";
import { useState } from "react";

const ErrorMessage = ({ message, type = "error" }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getIcon = () => {
    if (type === "success") {
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />;
    }
    return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />;
  };

  const getStyles = () => {
    if (type === "success") {
      return {
        container:
          "bg-gradient-to-r from-emerald-900/40 via-green-900/30 to-emerald-900/40 text-emerald-200 border-emerald-500/60 shadow-emerald-500/20",
        glow: "from-emerald-500/20 to-green-500/20",
      };
    }
    return {
      container:
        "bg-gradient-to-r from-red-900/40 via-rose-900/30 to-red-900/40 text-red-200 border-red-500/60 shadow-red-500/20",
      glow: "from-red-500/20 to-rose-500/20",
    };
  };

  const styles = getStyles();

  return (
    <div className="relative mb-4 md:mb-6">
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${styles.glow} rounded-xl blur-sm opacity-60`}
      />

      <div
        className={`relative p-3 sm:p-4 rounded-xl text-xs sm:text-sm md:text-base border backdrop-blur-sm shadow-lg ${styles.container} transform hover:scale-[1.02] transition-all duration-300`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getIcon()}</div>

          <div className="flex-1 font-medium leading-relaxed">{message}</div>

          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200 group flex-shrink-0"
            aria-label="Close message"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 w-full rounded-full" />
      </div>
    </div>
  );
};

export default ErrorMessage;
