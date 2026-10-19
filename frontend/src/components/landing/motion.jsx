import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';

// Ease partajat de toate animatiile din landing.
export const EASE = [0.22, 1, 0.36, 1];

// Aparitie moale: opacitate + translatie mica + blur usor care dispare.
const REVEAL_DURATION = 0.9;
const HIDDEN_BLUR = 'blur(8px)';
const SHOWN_BLUR = 'blur(0px)';

/**
 * Drives a 0..1 progress value in a loop, but only while `ref` is in the
 * viewport. Stays at 1 (final static state) with reduced motion.
 */
export function useLoopProgress(ref, { duration = 3.2, hold = 2.2 } = {}) {
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: '-10% 0px -10% 0px' });
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setP(1);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(0, 1, {
      duration,
      ease: EASE,
      repeat: Infinity,
      repeatDelay: hold,
      onUpdate: setP,
    });
    return () => controls.stop();
  }, [inView, reduced, duration, hold]);

  return p;
}

/**
 * Fade/slide-in on scroll. Renders static and fully visible with reduced motion.
 */
export function Reveal({ as = 'div', delay = 0, y = 20, className, children, ...rest }) {
  const reduced = useReducedMotion();
  const Tag = motion[as] || motion.div;

  if (reduced) {
    return <Tag className={className} {...rest}>{children}</Tag>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: HIDDEN_BLUR }}
      whileInView={{ opacity: 1, y: 0, filter: SHOWN_BLUR }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: REVEAL_DURATION, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Children appear one after another once the container enters the viewport.
 */
export function RevealStagger({ className, stagger = 0.15, children }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ className, y = 16, children }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: HIDDEN_BLUR },
        shown: { opacity: 1, y: 0, filter: SHOWN_BLUR, transition: { duration: REVEAL_DURATION, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

const NUMBER_RE = /^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/;

/**
 * Counts from 0 up to the number inside `value` ("94.2%", "3.4x", "500+") the
 * first time it enters the viewport, keeping prefix/suffix/decimals. Shows the
 * final value directly with reduced motion or when `value` has no number.
 */
export function CountUp({ value, duration = 1.6, className }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
  const match = NUMBER_RE.exec(value);
  const [prefix, numStr, suffix] = match ? [match[1], match[2], match[3]] : ['', '', ''];
  const target = match ? parseFloat(numStr) : 0;
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
  const format = (n) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  const [display, setDisplay] = useState(match && !reduced ? format(0) : value);

  useEffect(() => {
    if (!match || reduced) {
      setDisplay(value);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: (latest) => setDisplay(format(latest)),
      onComplete: () => setDisplay(value),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className} aria-label={value} style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums' }}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
