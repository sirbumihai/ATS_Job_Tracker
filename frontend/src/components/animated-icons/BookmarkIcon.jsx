import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const BookmarkIcon = forwardRef(({ className = '', size = 16, isSaved = false, ...props }, ref) => {
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
        fill={isSaved ? 'currentColor' : 'none'}
        height={size}
        width={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        animate={isHovered ? { y: [0, -2, 0], scale: [1, 1.08, 1] } : { y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </motion.svg>
    </div>
  );
});

BookmarkIcon.displayName = 'BookmarkIcon';
export default BookmarkIcon;
