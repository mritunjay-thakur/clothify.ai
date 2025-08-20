// ShinyText.jsx
const ShinyText = ({
  text,
  disabled = false,
  speed = 5,
  className = "",
  baseColor = "text-[#b5b5b5a4]",
  loop = false,
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span 
      className={`${baseColor} bg-clip-text inline-block ${
        disabled ? "" : "animate-shine"
      } ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animationDuration: animationDuration,
        animationIterationCount: loop ? "infinite" : "initial",
      }}
    >
      {text}
    </span> 
  );
};

export default ShinyText;