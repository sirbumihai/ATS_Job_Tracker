import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const CheckCircle2Icon = forwardRef(({ className = '', size = 18, ...props }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <svg
        fill="none"
        height={size}
        width={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <motion.path
          d="m9 12 2 2 4-4"
          animate={isHovered ? { pathLength: [0, 1], opacity: [0.5, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
});

CheckCircle2Icon.displayName = 'CheckCircle2Icon';
export const CircleCheckIcon = CheckCircle2Icon;
export default CheckCircle2Icon;
