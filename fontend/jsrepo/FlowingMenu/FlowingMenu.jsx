// FlowingMenu.jsx
import React, { useEffect } from "react";
import { gsap } from "gsap";

function FlowingMenu({ items = [] }) {
  return (
    <div className="w-full h-full overflow-hidden">
      <nav className="flex flex-col h-full m-0 p-0">
        {items.map((item, idx) => (
          <MenuItem key={idx} index={idx} {...item} />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({ index, url, text, image, isActive }) {
  const itemRef = React.useRef(null);
  const marqueeRef = React.useRef(null);
  const marqueeInnerRef = React.useRef(null);
  const [tapped, setTapped] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const animationDefaults = { duration: 0.6, ease: "expo.out" };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = Math.abs(mouseY);
    const bottomEdgeDist = Math.abs(mouseY - height);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  useEffect(() => {
    const keyframes = `
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    const style = document.createElement("style");
    style.textContent = keyframes;
    document.head.appendChild(style);

    // Initialize marquee as hidden
    gsap.set(marqueeRef.current, { y: "101%" });
    gsap.set(marqueeInnerRef.current, { y: "-101%" });

    return () => document.head.removeChild(style);
  }, []);

  const handleMouseEnter = (ev) => {
    setIsHovered(true);
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" })
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" })
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" });
  };

  const handleMouseLeave = (ev) => {
    setIsHovered(false);
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" })
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" });
  };

  const handleClick = (e) => {
    if (window.innerWidth < 768 && !tapped) {
      e.preventDefault();
      handleMouseEnter(e);
      setTapped(true);
      setTimeout(() => setTapped(false), 3000);
    } else if (window.innerWidth < 768 && tapped) {
      setTapped(false);
    } else {
      // Open link in new tab for desktop
      window.open(url, "_blank");
    }
  };

  const repeatedMarqueeContent = Array.from({ length: 8 }).map((_, idx) => (
    <React.Fragment key={idx}>
      <span className="text-[#060010] uppercase font-medium text-xl md:text-2xl px-4 py-2 hover:font-light transition-all duration-300">
        {text}
      </span>
      <img
        src={image}
        alt=""
        className="w-16 h-16 p-1 md:w-16 md:h-16 rounded-full object-cover mx-4"
      />
    </React.Fragment>
  ));

  return (
    <div
      className={`flex-1 relative overflow-hidden text-center border-b border-white/30 ${
        isActive ? "bg-white" : ""
      }`}
      ref={itemRef}
    >
      <a
        className={`flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-white text-xl md:text-2xl hover:text-[#060010] hover:font-light transition-all duration-300 focus:text-white focus-visible:text-[#060010]`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </a>
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none bg-white z-10"
        ref={marqueeRef}
      >
        <div className="h-full w-[200%] flex" ref={marqueeInnerRef}>
          <div
            className="flex items-center relative h-full w-[200%] min-h-[60px]"
            style={{
              animation: isHovered ? "marquee 15s linear infinite" : "none",
            }}
          >
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
