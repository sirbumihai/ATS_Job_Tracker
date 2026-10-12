import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const CalendarIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
        <motion.circle
          cx="8"
          cy="15"
          r="1"
          fill="currentColor"
          animate={isHovered ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        />
        <motion.circle
          cx="12"
          cy="15"
          r="1"
          fill="currentColor"
          animate={isHovered ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        />
        <motion.circle
          cx="16"
          cy="15"
          r="1"
          fill="currentColor"
          animate={isHovered ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        />
      </svg>
    </div>
  );
});

CalendarIcon.displayName = 'CalendarIcon';
export default CalendarIcon;
