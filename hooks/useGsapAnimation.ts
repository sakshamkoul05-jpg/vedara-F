'use client';

import { useEffect, useRef, DependencyList } from 'react';
import gsap from 'gsap';

export function useGsapAnimation(
  ref: React.RefObject<HTMLElement | null>,
  animation: gsap.TweenVars,
  deps: DependencyList = []
) {
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    animationRef.current = gsap.to(ref.current, {
      ...animation,
      paused: true,
    });

    animationRef.current.play();

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, deps);
}
