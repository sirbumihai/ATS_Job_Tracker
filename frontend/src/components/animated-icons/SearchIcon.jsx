import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const SearchIcon = forwardRef(({ className = '', size = 18, ...props }, ref) => {
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
        animate={isHovered ? { x: [0, -2, 1, 0], y: [0, -2, 1, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </motion.svg>
    </div>
  );
});

SearchIcon.displayName = 'SearchIcon';
export default SearchIcon;
