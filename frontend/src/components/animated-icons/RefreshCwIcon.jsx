import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const RefreshCwIcon = forwardRef(({ className = '', size = 16, isSpinning = false, ...props }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={ref}
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <motion.svg
        fill="none"
        height={size}
        width={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        animate={isSpinning ? { rotate: 360 } : isHovered ? { rotate: 180 } : { rotate: 0 }}
        transition={isSpinning ? { repeat: Infinity, duration: 0.9, ease: 'linear' } : { duration: 0.45, ease: 'easeInOut' }}
      >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </motion.svg>
    </div>
  );
});

RefreshCwIcon.displayName = 'RefreshCwIcon';
export const RefreshIcon = RefreshCwIcon;
export default RefreshCwIcon;
