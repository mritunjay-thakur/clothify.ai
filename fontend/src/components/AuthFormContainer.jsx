import { useEffect, useState, useMemo } from "react";
import SplitText from "../../jsrepo/SplitText/SplitText";

const AuthFormContainer = ({
  title,
  subtitle,
  children,
  animationPlayed,
  onAnimationComplete,
  support,
}) => {
  const fromAnim = useMemo(() => ({ opacity: 0, y: 40 }), []);
  const toAnim = useMemo(() => ({ opacity: 1, y: 0 }), []);

  return (
    <div className="z-10 mt-[84px] md:mt-[100px] mb-6 p-4 sm:p-8 text-center w-full max-w-md mx-auto">
      <SplitText
        text={title}
        className="text-4xl sm:text-5xl font-bold mb-6"
        delay={100}
        duration={0.6}
        ease="elastic.out(1, 0.3)"
        splitType="chars"
        from={fromAnim}
        to={toAnim}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
        play={!animationPlayed}
        onComplete={onAnimationComplete}
      />

      <p className="mb-6 text-white/80 text-sm sm:text-base">{subtitle}</p>

      {children}
    </div>
  );
};

export default AuthFormContainer;