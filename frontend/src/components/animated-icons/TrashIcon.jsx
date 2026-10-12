import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export const Trash2Icon = forwardRef(({ className = '', size = 16, ...props }, ref) => {
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
          animate={isHovered ? { y: -2, rotate: -14 } : { y: 0, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          style={{ originX: '18px', originY: '6px' }}
        >
          <path d="M3 6h18" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </motion.g>
        <motion.path
          d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
          animate={isHovered ? { scale: 0.98 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </div>
  );
});

Trash2Icon.displayName = 'Trash2Icon';
export const TrashIcon = Trash2Icon;
export default Trash2Icon;
