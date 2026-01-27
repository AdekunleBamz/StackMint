'use client';

/**
 * useAnimation Hook
 * Animation utilities and spring physics
 * @module hooks/useAnimation
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  velocity?: number;
}

interface AnimationState {
  value: number;
  velocity: number;
  isAnimating: boolean;
}

const defaultSpringConfig: SpringConfig = {
  stiffness: 170,
  damping: 26,
  mass: 1,
  velocity: 0,
};

/**
 * Hook for spring physics animation
 */
export function useSpring(
  target: number,
  config: Partial<SpringConfig> = {}
): AnimationState & { set: (value: number) => void } {
  const [state, setState] = useState<AnimationState>({
    value: target,
    velocity: 0,
    isAnimating: false,
  });

  const targetRef = useRef(target);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const springConfig = { ...defaultSpringConfig, ...config };

  const animate = useCallback(() => {
    const { stiffness, damping, mass } = springConfig;

    setState((prev) => {
      const displacement = prev.value - targetRef.current;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * prev.velocity;
      const acceleration = (springForce + dampingForce) / mass;

      const dt = 1 / 60; // 60fps
      const newVelocity = prev.velocity + acceleration * dt;
      const newValue = prev.value + newVelocity * dt;

      // Check if animation is complete
      const isComplete =
        Math.abs(newValue - targetRef.current) < 0.001 &&
        Math.abs(newVelocity) < 0.001;

      if (isComplete) {
        return {
          value: targetRef.current,
          velocity: 0,
          isAnimating: false,
        };
      }

      return {
        value: newValue,
        velocity: newVelocity,
        isAnimating: true,
      };
    });
  }, [springConfig]);

  useEffect(() => {
    targetRef.current = target;

    if (state.value !== target || state.velocity !== 0) {
      setState((prev) => ({ ...prev, isAnimating: true }));
    }
  }, [target]);

  useEffect(() => {
    if (!state.isAnimating) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      return;
    }

    const loop = () => {
      animate();
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [state.isAnimating, animate]);

  const set = useCallback((value: number) => {
    targetRef.current = value;
    setState((prev) => ({ ...prev, isAnimating: true }));
  }, []);

  return { ...state, set };
}

/**
 * Hook for tweening between values
 */
export function useTween(
  from: number,
  to: number,
  duration: number,
  easing: (t: number) => number = (t) => t
) {
  const [value, setValue] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    setIsAnimating(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);

      setValue(from + (to - from) * easedProgress);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [from, to, duration, easing]);

  return { value, isAnimating };
}

/**
 * Common easing functions
 */
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/**
 * Hook for delayed animations
 */
export function useDelayedAnimation(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setHasAnimated(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const reset = useCallback(() => {
    setIsVisible(false);
    setHasAnimated(false);
  }, []);

  return { isVisible, hasAnimated, reset };
}

/**
 * Hook for staggered animations
 */
export function useStaggeredAnimation(
  itemCount: number,
  staggerDelay: number = 50,
  initialDelay: number = 0
) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => [...prev, i]);
      }, initialDelay + i * staggerDelay);
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [itemCount, staggerDelay, initialDelay]);

  const isVisible = (index: number) => visibleItems.includes(index);

  const reset = useCallback(() => {
    setVisibleItems([]);
  }, []);

  return { visibleItems, isVisible, reset };
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  threshold: number = 0.1,
  rootMargin: string = '0px'
) {
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasAnimated(true);
        } else {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isInView, hasAnimated };
}

/**
 * Hook for counter animation
 */
export function useCountUp(
  end: number,
  duration: number = 1000,
  start: number = 0
) {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easings.easeOutCubic(progress);

      setCount(Math.round(start + (end - start) * easedProgress));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  }, [end, duration, start]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return { count, isAnimating, start: startAnimation };
}

/**
 * Hook for typewriter effect
 */
export function useTypewriter(
  text: string,
  speed: number = 50,
  startDelay: number = 0
) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    const startTimer = setTimeout(() => {
      setIsTyping(true);
      let index = 0;

      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayText, isTyping, isComplete };
}

/**
 * Hook for pulsing animation
 */
export function usePulse(interval: number = 1000) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), interval / 2);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return isPulsing;
}

export default useSpring;
