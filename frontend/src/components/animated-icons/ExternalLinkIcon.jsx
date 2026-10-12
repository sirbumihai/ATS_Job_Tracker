import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const ExternalLinkIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <motion.path
          d="m21 3-11 11"
          animate={isHovered ? { x: [0, 2, 0], y: [0, -2, 0] } : { x: 0, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
});

ExternalLinkIcon.displayName = 'ExternalLinkIcon';
export default ExternalLinkIcon;
