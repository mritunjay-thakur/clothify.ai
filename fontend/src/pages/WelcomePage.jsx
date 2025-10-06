import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Zap, Heart } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import GlowButton from "../components/GlowStartButton";
import Balatro from "../../jsrepo/Balatro/Balatro";

const WelcomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);

    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(featureInterval);
    };
  }, []);

  const FloatingElement = ({ children, delay = 0, duration = 15 }) => {
    return (
      <div
        className="absolute opacity-30"
        style={{
          animation: `float ${duration}s ease-in-out ${delay}s infinite`,
        }}
      >
        {children}
      </div>
    );
  };

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Style",
      description: "Get personalized recommendations based on your preferences",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Outfits",
      description:
        "Create complete looks in seconds with our advanced algorithms",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Tailored For You",
      description: "Outfits that match your body type, skin tone, and occasion",
    },
  ];

  return (
    <div>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes textShine {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.5); }
            50% { box-shadow: 0 0 40px rgba(255,255,255,0.8); }
          }
          
          .animate-text-shine {
            background: linear-gradient(
              to right,
              #ffffff 20%,
              #c2e9fb 30%,
              #a1c4fd 70%,
              #ffffff 80%
            );
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textShine 3s linear infinite;
          }
          
          .feature-transition {
            transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}
      </style>

      <div className="relative w-full bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Balatro
            spinRotation={-0.1}
            spinSpeed={1.0}
            offset={[0.1, -0.05]}
            color1="#6a0dad"
            color2="#7f00ff"
            color3="#000000"
            contrast={4.0}
            lighting={0.6}
            spinAmount={0.35}
            pixelFilter={3000}
            spinEase={0.8}
            isRotate={true}
            mouseInteraction={true}
          />
        </div>{" "}
        <HeaderNonAuthUser isAuthenticated={!isAuthenticated} />
        <div className="relative z-20 flex flex-col">
          <main className="flex-1 flex items-start justify-center px-6 md:px-8 pb-20">
            <div
              className={`max-w-5xl mx-auto text-center transform transition-all duration-1000 ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div className="mb-8 mt-24">
                <h1
                  ref={titleRef}
                  className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-white mb-6 leading-[1.2] pb-4 relative"
                >
                  <span className="">Clothify.Ai</span>
                </h1>

                <div
                  className={`flex flex-col md:flex-row gap-4 items-center justify-center transform transition-all duration-1000 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-20 opacity-0"
                  }`}
                  style={{ transitionDelay: "800ms" }}
                >
                  <div className="text-2xl -mt-2 md:text-4xl lg:text-5xl mb-4 leading-relaxed text-white font-bold">
                    Dress Like a Snack, Feel Like a Whole Meal!
                  </div>
                </div>

                <p className="text-lg md:text-xl font-thin mt-5 text-white max-w-3xl mx-auto leading-relaxed">
                  Your ultimate AI fashion assistant, delivering personalized
                  style recommendations and expertly curated outfit suggestions
                  tailored for every occasion. Experience the future of fashion
                  where artificial intelligence meets style expertise to
                  transform your wardrobe into a seamless and sophisticated
                  collection.
                </p>
              </div>

              <div
                className={`flex flex-col md:flex-row gap-4 items-center -mb-4 justify-center transform transition-all duration-1000 ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-20 opacity-0"
                }`}
                style={{ transitionDelay: "800ms" }}
              >
                <div
                  onMouseEnter={() => setHoveredButton(true)}
                  onMouseLeave={() => setHoveredButton(false)}
                  className="relative"
                >
                  <GlowButton onClick={() => navigate("/clothify")} />
                </div>
              </div>

              <p className="text-white -mb-[4rem] text-xl mt-9 flex items-center justify-center">
                <span className="flex items-center">
                  Made with ❤️ by Mritunjay Thakur
                </span>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
