import { useState } from "react";

const PasswordInput = ({
  name,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  disabled,
  confirm,
  onBlur,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    setTouched(true);
    onChange(e);
  };

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        required
        minLength="6"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-4 py-3 pr-10 bg-black/30 border ${
          error && touched ? "border-red-500" : "border-white/20"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition placeholder:text-white/60 text-sm sm:text-base`}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-invalid={!!(error && touched)}
        aria-describedby={error && touched ? `${name}-error` : undefined}
        autoComplete={autoComplete}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60 text-xs sm:text-sm"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? "Hide" : "Show"}
      </button>

      {touched && error && (
        <p id={`${name}-error`} className="text-red-400 text-xs mt-1 text-left">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
