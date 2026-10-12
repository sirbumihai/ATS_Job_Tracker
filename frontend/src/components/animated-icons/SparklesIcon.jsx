import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const SparklesIcon = forwardRef(({ className = '', size = 18, ...props }, ref) => {
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
        <motion.path
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
          animate={isHovered ? { scale: [1, 1.18, 0.92, 1], rotate: [0, 8, -8, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{ originX: '12px', originY: '12px' }}
        />
        <motion.g
          animate={isHovered ? { opacity: [1, 0.2, 1], scale: [1, 1.25, 1] } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          style={{ originX: '20px', originY: '5px' }}
        >
          <path d="M20 3v4" />
          <path d="M22 5h-4" />
        </motion.g>
        <motion.g
          animate={isHovered ? { opacity: [1, 0.2, 1], scale: [1, 1.25, 1] } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          style={{ originX: '4px', originY: '18px' }}
        >
          <path d="M4 17v2" />
          <path d="M5 18H3" />
        </motion.g>
      </svg>
    </div>
  );
});

SparklesIcon.displayName = 'SparklesIcon';
export default SparklesIcon;
