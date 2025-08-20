import React, { useEffect, useState, useRef } from "react";
import Iridescence from "../../jsrepo/Iridescence/Iridescence";
import Ballpit from "../../jsrepo/Ballpit/Ballpit";
import TextPressure from "../../jsrepo/TextPressure/TextPressure";
import GlassSurface from "../../jsrepo/GlassSurface/GlassSurface";
import HeaderNonAuthUser from "../components/HeaderNonAuthUser";
import { useAuth } from "../hooks/useAuth";
import LiquidChrome from "../../jsrepo/LiquidChrome/LiquidChrome";
import SplitText from "../../jsrepo/SplitText/SplitText";
import ProfileCard from "../../jsrepo/ProfileCard/ProfileCard";
import GridDistortion from "../../jsrepo/GridDistortion/GridDistortion";
import Silk from "../../jsrepo/Silk/Silk";
import Balatro from "../../jsrepo/Balatro/Balatro";
import { sendSupportMessage } from "../lib/api";
import ShinyText from "../../jsrepo/ShinyText/ShinyText";
import { FaGithub, FaLinkedin, FaInstagram, FaGoogle } from "react-icons/fa";
import {
  SiReact,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiOpenai,
  SiVite,
  SiFastapi,
} from "react-icons/si";
import { MdEmail } from "react-icons/md";
import FlowingMenu from "../../jsrepo/FlowingMenu/FlowingMenu";

function CreatorInfo() {
  const [ballSettings, setBallSettings] = useState({ count: 300, size: 16 });
  const [minFontSize, setMinFontSize] = useState(36);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [activeSocial, setActiveSocial] = useState(null);
  const contactSectionRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setBallSettings({
        count: mobile ? 30 : 200,
        size: mobile ? 6 : 16,
      });
      setMinFontSize(mobile ? 28 : 36);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const {
    authUser
  } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const message = formData.get("message");

    try {
      await sendSupportMessage({
        email,
        subject: "Message from Portfolio Contact Form",
        message,
      });
      setMessageSent(true);
      e.target.reset();

      setTimeout(() => {
        setShowMessageForm(false);
        setMessageSent(false);
      }, 3000);
    } catch (error) {
      alert(error.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSocialClick = (index) => {
    if (isMobile) {
      if (activeSocial === index) {
        setActiveSocial(null);
      } else {
        setActiveSocial(index);
      }
    }
  };

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
      icon: <FaGithub />,
      name: "GitHub",
      url: "https://github.com/mritunjay-thakur/mritunjay-thakur",
      image: "https://cdn-icons-png.flaticon.com/512/25/25231.png",
    },
    {
      icon: <FaLinkedin />,
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/mritunjay-thakur-jay/",
      image: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
    },
    {
      icon: <FaInstagram />,
      name: "Instagram",
      url: "https://www.instagram.com/___jaythakur___/#",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png",
    },
    {
      icon: <MdEmail />,
      name: "Email",
      url: "mailto:mritunjaythakur903@gmail.com",
      image: "https://cdn-icons-png.flaticon.com/512/732/732200.png",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden overflow-y-auto bg-black">
      <div className="relative w-full h-[50vh] sm:h-[100vh] md:h-screen overflow-hidden">
        <HeaderNonAuthUser isAuthenticated={!!authUser} />
        <Iridescence
          color={[1, 1, 1]}
          mouseReact={true}
          amplitude={0.08}
          speed={0.9}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
          }}
        />
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ width: "100%", height: "100%" }}
        >
          <Ballpit
            count={ballSettings.count}
            gravity={0.1}
            friction={0.89}
            wallBounce={0.9}
            followCursor={true}
            radius={ballSettings.size}
            colors={["#6a0dad", "#7f00ff", "#ffffff", "#9370DB", "#0000ff"]}
          />
        </div>
        <div className="relative z-20 flex flex-col justify-center items-center h-full text-center px-4 sm:px-6">
          <div className="w-full max-w-4xl mb-4">
            {isMobile ? (
              <ShinyText
                text="Mritunjay Thakur"
                className="text-4xl font-bold"
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
                textColor="#ffffff"
                className="w-full"
              />
            )}
          </div>
          <div className="text-white text-base sm:text-lg md:text-xl max-w-2xl drop-shadow-md mb-6 px-2">
            <ShinyText
              text="Full Stack Web Developer ✦ AI Integrator ✦ Next.js Alchemist ✦ UI/UX Enthusiast"
              speed={4}
              baseColor="text-white"
            />
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
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
                className="font-medium text-base sm:text-lg"
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
          <LiquidChrome
            baseColor={[0.1, 0.1, 0.2]}
            speed={0.2}
            amplitude={0.6}
            frequencyX={3}
            frequencyY={2}
            interactive={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="relative z-10 px-4 md:px-6 py-10 md:py-16 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12">
            <div className="w-full max-w-md flex justify-center order-1 lg:order-1 mt-0 lg:mt-0">
              <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px]">
                <ProfileCard
                  avatarUrl="https://i.postimg.cc/m2Dyv9T7/1706869125805-removebg-preview.png"
                  name="Mritunjay Thakur"
                  title="Full Stack Web Dev"
                  handle="jaythakur.x"
                  status="Online"
                  contactText="Contact"
                  showUserInfo={false}
                  className="profile-card-natural"
                />
              </div>
            </div>
            <div className="w-full lg:w-2/3 text-center lg:text-left order-2 lg:order-2">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 lg:mb-8">
                <ShinyText text="About me" speed={6} baseColor="text-white" />
              </div>
              <div className="text-base sm:text-xl md:text-2xl lg:text-4xl text-white mb-8 max-w-4xl mx-auto lg:mx-0">
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
        </div>
      </div>

      <div className="relative w-full bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Balatro
            spinRotation={-3.0}
            spinSpeed={5.0}
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
        <div className="relative z-10 px-4 py-4 sm:py-24 max-w-7xl mx-auto min-h-0 sm:min-h-screen flex flex-col justify-center">
          <p className="text-center text-lg sm:text-xl md:text-4xl font-bold sm:mb-16 text-white">
            <ShinyText
              text="Skills & Services I provides"
              speed={3}
              baseColor="text-white"
            />
          </p>
          <div className="flex flex-col items-center space-y-4 sm:space-y-10">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2 sm:gap-4 whitespace-nowrap"
              >
                <p className="text-3xl sm:text-7xl md:text-8xl font-bold text-white">
                  {skill.left}
                </p>
                <div className="rounded-2xl border-2 border-white overflow-hidden w-[40px] h-[30px] sm:w-[90px] sm:h-[60px] md:w-[120px] md:h-[75px] flex items-center justify-center">
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
                <p className="text-3xl sm:text-7xl md:text-8xl font-bold text-white">
                  {skill.right}
                </p>
              </div>
            ))}
          </div>
        </div>


      </div>


      <div
        id="project"
        className="relative w-full min-h-screen overflow-hidden bg-black"
      >
        <div className="absolute inset-0 z-0">
          <Silk
            speed={20}
            scale={1}
            color="#CE53E0"
            noiseIntensity={1}
            rotation={0}
          />
        </div>
        <div className="relative z-10 px-4 sm:px-6 py-12 max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-12">
            <div className="w-full lg:w-2/3">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 lg:mb-8 text-center lg:text-left">
                <ShinyText
                  text="How I Made Clothify.ai"
                  speed={6}
                  baseColor="text-white"
                />
              </div>
              <div className="text-base sm:text-xl md:text-2xl lg:text-4xl text-white mb-8 lg:mb-12 max-w-4xl mx-auto lg:mx-0">
                <SplitText
                  text="Clothify.ai is an AI-powered fashion assistant that helps users choose outfits, provides skincare advice, and acts as a personal style companion. Named Taara, this intelligent assistant combines fashion expertise with friendly conversation. Built with React and Tailwind CSS for the responsive frontend, powered by Node.js and Express on the backend. Uses MongoDB for data storage, Google Auth for secure authentication, and Google Gemini AI for the intelligent assistant functionality."
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
            <div className="w-full lg:w-1/3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-center md:mb-20">
                <ShinyText text="Tech Stack" speed={6} baseColor="text-white" />
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {techStack.map((tech, index) => (
                  <a
                    key={index}
                    href={tech.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center"
                  >
                    <GlassSurface
                      width={isMobile ? "100%" : 100}
                      height={isMobile ? 90 : 100}
                      borderRadius={16}
                      backgroundOpacity={0.1}
                      blur={12}
                      className="flex flex-col items-center justify-center p-2 sm:p-4 hover:scale-105 transition-transform duration-300"
                    >
                      <div
                        style={{
                          width: "3rem",
                          height: "3rem",
                          color: "white",
                          marginBottom: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.cloneElement(tech.icon, {
                          style: {
                            fontSize: "2rem",
                            width: "2rem",
                            height: "2rem",
                          },
                        })}
                      </div>
                      <span
                        style={{
                          color: "white",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          textAlign: "center",
                        }}
                      >
                        {tech.name}
                      </span>
                    </GlassSurface>
                  </a>
                ))}
              </div>
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
          <GridDistortion
            imageSrc="https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            grid={60}
            mouse={0.2}
            strength={0.15}
            relaxation={0.9}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div className="relative z-10 px-4 sm:px-6 py-16 max-w-6xl mx-auto min-h-screen flex flex-col justify-center items-center">
          <div className="w-full text-center mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-2">
              <ShinyText
                text="Let's Connect"
                speed={6}
                baseColor="text-white"
              />
            </h2>
            <p className="text-white/80 text-base max-w-lg mx-auto">
              Have a project in mind, want to collab or just want to say hi?
            </p>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-8 items-stretch">
            <div className="w-full h-96 md:w-1/2 flex">
              <div className="w-full h-full p-6 border border-white/10 rounded-2xl bg-white/10 backdrop-blur-lg flex flex-col">
                <form
                  onSubmit={handleSubmit}
                  className="flex-1 flex flex-col gap-4"
                >
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      <ShinyText
                        text="Send Me a Message"
                        speed={4}
                        baseColor="text-white"
                      />
                    </h3>
                    <p className="text-white/70 text-base">
                      I'll get back to you within 24 hours
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="email"
                      className="text-lg font-medium text-white/80"
                    >
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 text-lg bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-white/50"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1 min-h-[100px]">
                    <label
                      htmlFor="message"
                      className="text-lg font-medium text-white/80"
                    >
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      className="flex-1 w-full px-4 py-2 text-lg bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-white/50 resize-none"
                      placeholder="Hello there! I'd like to connect about..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 flex items-center justify-center hover:scale-[1.02] active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="text-white text-lg">Sending...</span>
                    ) : (
                      <ShinyText
                        text="Send Message"
                        className="font-medium text-lg"
                        speed={5}
                        baseColor="text-white"
                        loop={true}
                      />
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="w-full md:w-1/2 flex">
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

        {isMobile && showMessageForm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="w-full p-6 border border-white/10 rounded-2xl bg-black/20 backdrop-blur-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    <ShinyText
                      text="Send Message"
                      speed={4}
                      baseColor="text-white"
                    />
                  </h3>
                  <button
                    onClick={() => {
                      setShowMessageForm(false);
                      setMessageSent(false);
                    }}
                    className="text-white text-xl"
                  >
                    ✕
                  </button>
                </div>

                {messageSent ? (
                  <div className="text-center py-8">
                    <div className="text-2xl text-green-400 mb-4">✓</div>
                    <p className="text-white text-xl font-bold">
                      Message Sent!
                    </p>
                    <p className="text-white/80 mt-2">
                      I'll get back to you soon
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label
                        htmlFor="mobile-email"
                        className="block text-lg font-medium text-white/80 mb-2"
                      >
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="mobile-email"
                        name="email"
                        required
                        className="w-full px-4 py-3 text-lg bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-white/50"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mobile-message"
                        className="block text-lg font-medium text-white/80 mb-2"
                      >
                        Your Message
                      </label>
                      <textarea
                        id="mobile-message"
                        name="message"
                        rows={5}
                        required
                        className="w-full px-4 py-3 text-lg bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-white/50"
                        placeholder="Hello there! I'd like to connect about..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 flex items-center justify-center hover:scale-[1.02] active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                      {isSubmitting ? (
                        <span className="text-white text-lg">Sending...</span>
                      ) : (
                        <ShinyText
                          text="Send Message"
                          className="font-medium text-lg"
                          speed={5}
                          baseColor="text-white"
                          loop={true}
                        />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="w-full flex -mt-16 justify-center py-8 px-4 sm:px-6 z-[999] relative">
          <ShinyText
            text="Made with extra ❤️ by Mritunjay Thakur"
            speed={8}
            baseColor="text-white"
            className="text-xl sm:text-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default CreatorInfo;