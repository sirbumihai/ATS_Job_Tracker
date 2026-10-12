import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const MailIcon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <motion.path
          d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
          animate={isHovered ? { y: -1.5, scaleY: 0.9 } : { y: 0, scaleY: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 22 }}
          style={{ originX: '12px', originY: '7px' }}
        />
      </svg>
    </div>
  );
});

MailIcon.displayName = 'MailIcon';
export default MailIcon;
