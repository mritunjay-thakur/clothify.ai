import React, { useEffect } from "react";

const GlowButton = ({
  text = "Let's Start, Shall we?",
  onClick,
  className = "",
  style = {},
}) => {
  useEffect(() => {
    if (!document.getElementById("glow-button-styles")) {
      const styleTag = document.createElement("style");
      styleTag.id = "glow-button-styles";
      styleTag.innerHTML = `
        .glow-on-hover {
          width: 260px;
          height: 60px;
          border: none;
          outline: none;
          color: rgb(94, 0, 166);
          background: #000000;
          cursor: pointer;
          position: relative;
          z-index: 0;
          border-radius: 50px !important;
          font-weight: bold;
          font-size: 20px;
        }
        
        .glow-on-hover:before {
          content: '';
          background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #5b98f3, #002bff, #7a00ff, #ff00c8, #ff0000);
          position: absolute;
          top: -2px;
          left: -2px;
          background-size: 400%;
          z-index: -1;
          filter: blur(5px);
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          animation: glowing 20s linear infinite;
          opacity: 0;
          transition: opacity .3s ease-in-out;
          border-radius: 30px;
        }
        
        .glow-on-hover:active {
          color: #ffffff;
        }
        
        .glow-on-hover:active:after {
          background: transparent;
        }
        
        .glow-on-hover:hover:before {
          opacity: 1;
        }
        
        .glow-on-hover:after {
          z-index: -1;
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: #ffffff;
          left: 0;
          top: 0;
          border-radius: 30px;
        }
        
        @keyframes glowing {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
        
        @media (max-width: 768px) {
          .glow-on-hover {
            width: 220px !important;
            height: 50px !important;
            font-size: 18px !important;
          }
        }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

  return (
    <button
      className={`glow-on-hover hero ${className}`}
      onClick={onClick}
      z
      style={style}
    >
      {text}
    </button>
  );
};

export default GlowButton;
