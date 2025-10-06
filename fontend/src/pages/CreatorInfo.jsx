import React, { useEffect, useState, useRef } from "react";
import TextPressure from "../../jsrepo/TextPressure/TextPressure";
import GlassSurface from "../../jsrepo/GlassSurface/GlassSurface";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import { useAuth } from "../hooks/useAuth";
import SplitText from "../../jsrepo/SplitText/SplitText";
import Balatro from "../../jsrepo/Balatro/Balatro";
import ShinyText from "../../jsrepo/ShinyText/ShinyText";
import FlowingMenu from "../../jsrepo/FlowingMenu/FlowingMenu";
import { FaGithub, FaHeart, FaLinkedin, FaGoogle } from "react-icons/fa";
import {
  SiReact,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiOpenai,
  SiVite,
  SiFastapi,
  SiNextui,
} from "react-icons/si";
import { MdEmail } from "react-icons/md";

function CreatorInfo() {
  const [minFontSize, setMinFontSize] = useState(36);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSocial, setActiveSocial] = useState(0);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSectionRef = useRef(null);
  const { authUser } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const skills = [
    {
      left: "Web",
      videoSrc: "https://davidhaz.com/videos/web_develop.mp4",
      poster: "https://davidhaz.com/images/web_development_placeholder.webp",
      right: "development",
    },
    {
      left: "Interface",
      videoSrc: "https://davidhaz.com/videos/interface_design.mp4",
      poster: "https://davidhaz.com/images/interface_design_placeholder.webp",
      right: "design",
    },
    {
      left: "3D web",
      videoSrc: "https://davidhaz.com/videos/3d_web_experiences.mp4",
      poster: "https://davidhaz.com/images/3d_web_experiences_placeholder.webp",
      right: "experiences",
    },
    {
      left: "Creative",
      videoSrc: "https://davidhaz.com/videos/creative_coding.mp4",
      poster: "https://davidhaz.com/images/creative_coding_placeholder.webp",
      right: "coding",
    },
    {
      left: "Solid",
      videoSrc: "https://davidhaz.com/videos/solid_engineering.mp4",
      poster: "https://davidhaz.com/images/solid_engineering_placeholder.webp",
      right: "engineering",
    },
  ];

  const techStack = [
    {
      icon: <SiReact />,
      name: "React",
      url: "https://react.dev/",
    },
    {
      icon: <SiTailwindcss />,
      name: "Tailwind CSS",
      url: "https://tailwindcss.com/",
    },
    {
      icon: <SiNodedotjs />,
      name: "Node.js",
      url: "https://nodejs.org/",
    },
    {
      icon: <SiExpress />,
      name: "Express",
      url: "https://expressjs.com/",
    },
    {
      icon: <SiNextui />,
      name: "UI Library",
      url: "https://ui.shadcn.com/",
    },
    {
      icon: <SiMongodb />,
      name: "MongoDB",
      url: "https://www.mongodb.com/",
    },
    {
      icon: <FaGoogle />,
      name: "Google Auth",
      url: "https://developers.google.com/identity",
    },
    {
      icon: <SiOpenai />,
      name: "OpenAI",
      url: "https://openai.com/",
    },
    {
      icon: <SiVite />,
      name: "Vite",
      url: "https://vitejs.dev/",
    },
    {
      icon: <SiFastapi />,
      name: "APIs",
      url: "https://fastapi.tiangolo.com/",
    },
  ];

  const socialLinks = [
    {
      icon: <FaHeart />,
      name: "Portfolio",
      url: "https://mritunjay-thakur.vercel.app/",
      image: "",
    },
    {
      icon: <FaGithub />,
      name: "GitHub",
      url: "https://github.com/mritunjay-thakur/mritunjay-thakur",
      image: "",
    },
    {
      icon: <FaLinkedin />,
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/mritunjay-thakur-jay/",
      image: "",
    },

    {
      icon: <MdEmail />,
      name: "Email",
      url: "mailto:mritunjaythakur903@gmail.com",
      image: "",
    },
  ];

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 right-0 z-[1000] w-full">
        <HeaderNonAuthUser isAuthenticated={!!authUser} />
      </div>

      <div className="relative w-full min-h-screen overflow-hidden bg-black pt-16">
        <div className="absolute inset-0 z-0">
          <Balatro
            spinRotation={-0.0}
            spinSpeed={2.0}
            offset={[0.1, -0.05]}
            color1="#6a0dad"
            color2="#7f00ff"
            color3="#000000"
            contrast={4.0}
            lighting={0.6}
            spinAmount={0.35}
            pixelFilter={2000}
            spinEase={0.8}
            isRotate={true}
            mouseInteraction={true}
          />
        </div>
        <div className="relative h-[50vh] sm:h-[70vh] md:h-screen z-[1000] flex flex-col justify-center items-center text-center px-4 sm:px-6">
          <div className="w-full max-w-4xl mb-4 sm:mb-6">
            {isMobile ? (
              <ShinyText
                text="Mritunjay Thakur"
                className="text-4xl sm:text-5xl font-bold"
                speed={3}
                baseColor="text-white"
              />
            ) : (
              <TextPressure
                text="Mritunjay Thakur"
                minFontSize={minFontSize}
                width={true}
                weight={true}
                italic={false}
                textColor="#FFFFFF"
                className="w-full"
              />
            )}
          </div>
          <div className="text-white text-base sm:text-lg md:text-xl max-w-2xl drop-shadow-md mb-6 sm:mb-8 px-2">
            <ShinyText
              text="Full Stack Web Developer ✦ AI Integrator ✦ Next.js Alchemist ✦ UI/UX Enthusiast"
              speed={4}
              baseColor="text-white"
            />
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            <GlassSurface
              width={isMobile ? 140 : 160}
              height={isMobile ? 44 : 52}
              borderRadius={50}
              backgroundOpacity={0.1}
              blur={12}
              className="hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <ShinyText
                text="✦ Scroll Down ✦"
                className="font-medium text-sm sm:text-base"
                speed={5}
                baseColor="text-white"
              />
            </GlassSurface>
          </div>
        </div>
      </div>

      <div
        id="about"
        className="relative w-full min-h-screen overflow-hidden bg-black"
      >
        <div className="absolute inset-0 z-0">
          <Balatro
            spinRotation={-0.0}
            spinSpeed={2.0}
            offset={[0.1, -0.05]}
            color1="#6a0dad"
            color2="#7f00ff"
            color3="#000000"
            contrast={4.0}
            lighting={0.6}
            spinAmount={0.35}
            pixelFilter={2000}
            spinEase={0.8}
            isRotate={true}
            mouseInteraction={true}
          />
        </div>

        <div className="relative z-10 px-4 md:px-6 py-6 md:py-10 max-w-7xl mx-auto">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center  sm:mt-10 font-bold text-white mb-6 lg:mb-8">
            <ShinyText text="About me" speed={6} baseColor="text-white" />
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2">
              <div className="relative z-10 px-2 py-2 sm:py-4 lg:-mt-10 lg:ml-4">
                <p className="text-left text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">
                  <ShinyText
                    text="Skills & Services I provide:"
                    speed={3}
                    baseColor="text-white"
                  />
                </p>
                <div className="flex flex-col items-start space-y-3 sm:space-y-4">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-start gap-2 sm:gap-3 md:gap-4 whitespace-nowrap w-full"
                    >
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white flex-shrink-0">
                        {skill.left}
                      </p>
                      <div className="rounded-xl border-2 border-white overflow-hidden w-[30px] h-[20px] sm:w-[40px] sm:h-[25px] md:w-[60px] md:h-[35px] lg:w-[80px] lg:h-[50px] flex items-center justify-center flex-shrink-0">
                        <video
                          src={skill.videoSrc}
                          poster={skill.poster}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="none"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white flex-shrink-0">
                        {skill.right}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white max-w-4xl leading-relaxed sm:leading-loose">
                <SplitText
                  text="I'm a Full-Stack Web Developer & Designer based in New Delhi, specializing in building robust, scalable, and intelligent web applications. I craft seamless user experiences using React, Next.js, and Tailwind CSS on the frontend, while architecting secure and high-performance backends with Express, MongoDB, and PostgreSQL. I actively integrate AI features via OpenAI to deliver smart, adaptive experiences — blending creativity with powerful engineering."
                  className=""
                  delay={100}
                  duration={0.6}
                  ease="power3.out"
                  splitType="words"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 md:mt-20">
            <div className="text-2xl sm:text-3xl md:text-4xl text-center font-bold text-white mb-8 sm:mb-12">
              <ShinyText text="Tech Stack" speed={4} baseColor="text-white" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {techStack.map((tech, index) => (
                <a
                  key={index}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <GlassSurface
                    width="100%"
                    height={80}
                    borderRadius={16}
                    backgroundOpacity={0.1}
                    blur={8}
                    className="hover:scale-105 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center p-4"
                  >
                    <div className="text-2xl sm:text-3xl text-white mb-2 group-hover:scale-110 transition-transform">
                      {tech.icon}
                    </div>
                    <span className="text-white text-sm sm:text-base font-medium text-center">
                      {tech.name}
                    </span>
                  </GlassSurface>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        id="contact"
        ref={contactSectionRef}
        className="relative w-full min-h-screen overflow-hidden bg-black"
      >
        <div className="absolute inset-0 z-0">
          <Balatro
            spinRotation={-0.0}
            spinSpeed={2.0}
            offset={[0.1, -0.05]}
            color1="#6a0dad"
            color2="#7f00ff"
            color3="#000000"
            contrast={4.0}
            lighting={0.6}
            spinAmount={0.35}
            pixelFilter={2000}
            spinEase={0.8}
            isRotate={true}
            mouseInteraction={true}
          />
        </div>

        <div className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 max-w-6xl mx-auto min-h-screen flex flex-col justify-center items-center">
          <div className="w-full text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-3 sm:mb-4">
              <ShinyText
                text="Let's Connect"
                speed={6}
                baseColor="text-white"
              />
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-lg mx-auto">
              Have a project in mind, want to collab or just want to say hi?
            </p>
          </div>

          <div className="w-full flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch justify-center">
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="w-full h-96 border border-white/20 bg-white/10 backdrop-blur-lg  rounded-2xl overflow-hidden flex">
                <FlowingMenu
                  items={socialLinks.map((social, index) => ({
                    ...social,
                    text: social.name,
                    isActive: activeSocial === index,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center py-6 sm:py-8 px-4 sm:px-6 z-[999] relative">
          <ShinyText
            text="Made with extra ❤️ by Mritunjay Thakur"
            speed={8}
            baseColor="text-white"
            className="text-md sm:text-lg md:text-xl lg:text-2xl font-bold text-white"
          />
        </div>
      </div>
    </div>
  );
}

export default CreatorInfo;
