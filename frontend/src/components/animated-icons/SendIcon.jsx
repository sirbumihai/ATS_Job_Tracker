import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const SendIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
        className="overflow-visible"
      >
        <motion.g
          animate={isHovered ? { x: 3, y: -3, scale: 0.95 } : { x: 0, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </motion.g>
      </svg>
    </div>
  );
});

SendIcon.displayName = 'SendIcon';
export default SendIcon;
