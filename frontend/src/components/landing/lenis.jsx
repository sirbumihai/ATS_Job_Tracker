import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useReducedMotion } from 'framer-motion';

// Instanta activa, ca ancorele din meniu sa deruleze prin Lenis.
let active = null;

/** Deruleaza lin la `target` (selector sau numar). Fara Lenis intoarce false si ramane scroll-ul nativ. */
export function smoothScrollTo(target, options) {
  if (!active) return false;
  active.scrollTo(target, { duration: 1.4, ...options });
  return true;
}

/**
 * Scroll lin cu inertie, doar cat timp componenta e montata (landing).
 * Dezactivat cu prefers-reduced-motion. La demontare Lenis e distrus, deci
 * scroll-ul redevine nativ in celelalte tab-uri.
 */
export default function useLenis() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const lenis = new Lenis({ duration: 1.2 });
    active = lenis;
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      if (active === lenis) active = null;
    };
  }, [reduced]);
}
