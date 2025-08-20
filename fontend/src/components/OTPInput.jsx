import { useState, useRef, useEffect } from "react";

const OTPInput = ({
  name = "otp",
  value,
  onChange,
  error,
  disabled,
  length = 6,
}) => {
  const inputRefs = useRef([]);

  const handleInputChange = (index, e) => {
    const newValue = e.target.value;
    if (/^\d?$/.test(newValue)) {
      const newOtp = value.split("");
      newOtp[index] = newValue;
      onChange({ target: { name, value: newOtp.join("") } });

      if (newValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length <= length) {
      onChange({ target: { name, value: pastedData.padEnd(length, "") } });
      inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [length]);

  return (
    <div className="space-y-3">
      <div
        className="flex justify-center gap-2 sm:gap-3"
        role="group"
        aria-label={`${name} input group`}
      >
        {Array.from({ length }).map((_, index) => (
          <div key={index} className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={value[index] || ""}
              onChange={(e) => handleInputChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => (inputRefs.current[index] = el)}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl sm:text-3xl font-bold
                bg-white border-2 rounded-xl focus:outline-none transition-all
                shadow-sm focus:ring-4 focus:ring-blue-200 focus:border-blue-500
                ${
                  error
                    ? "border-red-500 ring-4 ring-red-200"
                    : "border-gray-200 hover:border-blue-300"
                }
                ${disabled ? "bg-gray-100 cursor-not-allowed opacity-80" : ""}
                caret-transparent
                text-gray-700
              `}
              aria-label={`Digit ${index + 1} of ${length}`}
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : undefined}
              disabled={disabled}
            />

            {index === 2 && (
              <div className="absolute top-1/2 right-0 translate-x-3 -translate-y-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p
          id={`${name}-error`}
          className="text-red-500 text-sm mt-1 text-center font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput;
