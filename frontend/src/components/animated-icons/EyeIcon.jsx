import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const EyeIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <motion.circle
          cx="12"
          cy="12"
          r="3"
          animate={isHovered ? { scale: [1, 1.25, 1], x: [0, 1.2, -1.2, 0] } : { scale: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
});

EyeIcon.displayName = 'EyeIcon';
export default EyeIcon;
