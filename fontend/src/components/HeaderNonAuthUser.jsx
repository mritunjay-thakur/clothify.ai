import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Menu,
  X,
  UserPlus,
  LogIn,
  MessageCircle,
  HelpCircle,
  Settings,
  Code,
  Heart,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import GlassSurface from "../../jsrepo/GlassSurface/GlassSurface";

const navLinks = {
  auth: [
    { path: "/clothify", label: "Back to Chat", icon: MessageCircle },
    { path: "/edit-profile", label: "Edit Profile", icon: Settings },
    { path: "/developer", label: "Developer", icon: Code },
  ],
  nonAuth: [
    { path: "/signup", label: "Sign Up", icon: UserPlus },
    { path: "/login", label: "Login", icon: LogIn },
  ],
};

const supportLink = { path: "/support", label: "Support", icon: Heart };

const Header = ({ isAuthenticated = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();
  const { pathname: path } = location;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const getFilteredLinks = () => {
    const currentLinks = isAuthenticated ? navLinks.auth : navLinks.nonAuth;
    return currentLinks.filter((link) => link.path !== path);
  };

  const filteredLinks = [...getFilteredLinks(), supportLink];

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] px-4 pt-4">
      <GlassSurface
        width="100%"
        height="68px"
        borderRadius={50}
        backgroundOpacity={isHovered ? 0.08 : 0.05}
        blur={12}
        displace={0.5}
        borderWidth={0.07}
        className="mx-auto max-w-6xl transition-all duration-500 group"
        style={{
          boxShadow: isScrolled ? "0 0 20px rgba(128, 0, 128, 0.1)" : "none",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <header
          ref={headerRef}
          className="flex items-center justify-between w-full px-6 py-3"
        >
          <Link to="/" className="flex items-center gap-3 group/logo">
            <div className="relative">
              <Sparkles className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover/logo:opacity-30 blur-lg transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl leading-tight">
                Clothify.AI
              </span>
              <span className="text-white/50 text-xs font-medium">
                Fashion Assistant
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {filteredLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group/nav flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium text-sm ${
                    path === link.path ? "bg-white/10 text-white" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <IconComponent className="w-4 h-4 group-hover/nav:scale-110 transition-transform duration-200" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 group/menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                  menuOpen ? "rotate-180 opacity-0" : "rotate-0 opacity-100"
                }`}
              />
              <X
                className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${
                  menuOpen ? "rotate-0 opacity-100" : "-rotate-180 opacity-0"
                }`}
              />
            </div>
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover/menu:opacity-10 transition-opacity duration-300" />
          </button>
        </header>
      </GlassSurface>

      <div
        className={`md:hidden absolute left-4 right-4 mt-2 transition-all duration-300 origin-top ${
          menuOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl shadow-purple-500/20">
          <div className="space-y-1">
            {filteredLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium ${
                    path === link.path ? "bg-white/10 text-white" : ""
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: menuOpen
                      ? "slideInUp 0.3s ease-out forwards"
                      : "none",
                  }}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/10 backdrop-blur-sm -z-10 transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <style>{`
            @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
                }
              }
      `}</style>
    </div>
  );
};

export default Header;
