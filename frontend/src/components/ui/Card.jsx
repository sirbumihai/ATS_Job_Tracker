import React from 'react';

/**
 * Card simplu: un singur chenar subtire, colturi rotunjite, fundal alb.
 * `data-card` marcheaza cardul pentru teste (ex: niciun card in alt card).
 */
export default function Card({ as: Tag = 'div', padding = 'p-5', className = '', children, ...rest }) {
  return (
    <Tag data-card="" className={`rounded-2xl border border-neutral-200 bg-white ${padding} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
