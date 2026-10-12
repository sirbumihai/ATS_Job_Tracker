import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const FileSignatureIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
        <path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L20 7.5V11" />
        <path d="M14 2v6h6" />
        <motion.path
          d="m18 19-5-5"
          animate={isHovered ? { x: [0, 2, -1, 0], y: [0, -2, 1, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.45 }}
        />
        <motion.path
          d="m14 17 2 2"
          animate={isHovered ? { x: [0, 2, -1, 0], y: [0, -2, 1, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.45 }}
        />
      </svg>
    </div>
  );
});

FileSignatureIcon.displayName = 'FileSignatureIcon';
export default FileSignatureIcon;
