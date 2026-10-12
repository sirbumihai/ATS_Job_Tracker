import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const PlusIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
        animate={isHovered ? { rotate: [0, 90] } : { rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </motion.svg>
    </div>
  );
});

PlusIcon.displayName = 'PlusIcon';
export default PlusIcon;
