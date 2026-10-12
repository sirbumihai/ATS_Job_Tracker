import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const CheckIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
          d="M20 6 9 17l-5-5"
          animate={isHovered ? { pathLength: [0, 1], opacity: [0.4, 1] } : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
});

CheckIcon.displayName = 'CheckIcon';
export default CheckIcon;
