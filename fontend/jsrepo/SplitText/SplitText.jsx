import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

const SplitText = ({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const splitterRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || animationCompletedRef.current) return;

    const initAnimation = () => {
      const absoluteLines = splitType === "lines";
      if (absoluteLines) el.style.position = "relative";

      splitterRef.current = new GSAPSplitText(el, {
        type: splitType,
        absolute: absoluteLines,
        linesClass: "split-line",
      });

      let targets;
      switch (splitType) {
        case "lines":
          targets = splitterRef.current.lines;
          break;
        case "words":
          targets = splitterRef.current.words;
          break;
        case "words, chars":
          targets = [...splitterRef.current.words, ...splitterRef.current.chars];
          break;
        default:
          targets = splitterRef.current.chars;
      }

      targets.forEach((t) => {
        t.style.willChange = "transform, opacity";
      });

      const startPct = (1 - threshold) * 100;
      const m = /^(-?\d+)px$/.exec(rootMargin);
      const raw = m ? parseInt(m[1], 10) : 0;
      const sign = raw < 0 ? `-=${Math.abs(raw)}px` : `+=${raw}px`;
      const start = `top ${startPct}%${sign}`;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none none",
          once: true,
        },
        smoothChildTiming: true,
        onComplete: () => {
          animationCompletedRef.current = true;
          gsap.set(targets, {
            ...to,
            clearProps: "willChange",
            immediateRender: true,
          });
          onLetterAnimationComplete?.();
        },
      });

      tl.set(targets, { ...from, immediateRender: false, force3D: true });
      tl.to(targets, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        force3D: true,
      });
    };

    const cleanup = () => {
      if (splitterRef.current) {
        splitterRef.current.revert();
        splitterRef.current = null;
      }
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.killTweensOf("*");
    };

    // Check if fonts are loaded
    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready
        .then(initAnimation)
        .catch((error) => {
          console.error('Font loading failed:', error);
          // Fallback to initialize without waiting for fonts
          initAnimation();
        });
    } else {
      initAnimation();
    }

    return cleanup;
  }, [
    text,
    delay,
    duration,
    ease,
    splitType,
    from,
    to,
    threshold,
    rootMargin,
    onLetterAnimationComplete,
  ]);

  return (
    <p
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: "hidden",
        display: "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
      }}
    >
      {text}
    </p>
  );
};

export default SplitText;