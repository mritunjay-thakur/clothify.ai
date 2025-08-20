const FormInput = ({
  name,
  type,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  disabled,
}) => (
  <div>
    <input
      type={type}
      name={name}
      required
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 bg-black/30 border ${
        error ? "border-red-500" : "border-white/20"
      } rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition placeholder:text-white/60 text-sm sm:text-base`}
      placeholder={placeholder}
      aria-label={placeholder}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      autoComplete={autoComplete}
      disabled={disabled}
    />
    {error && (
      <p id={`${name}-error`} className="text-red-400 text-xs mt-1 text-left">
        {error}
      </p>
    )}
  </div>
);

export default FormInput;
