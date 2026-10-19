import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const WIDTHS = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

/**
 * Fereastra modala comuna: fundal estompat, card cu un singur chenar,
 * titlu Lora cu iconita optionala, inchidere la Escape, click pe fundal sau buton.
 * Blocheaza scroll-ul paginii cat timp e deschisa.
 */
export default function Modal({ isOpen, onClose, title, subtitle, icon: Icon, size = 'md', className = '', children }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-morphing-backdrop"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full ${WIDTHS[size]} my-auto rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-xl p-6 sm:p-7 animate-morphing-dialog ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Închide"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pr-10 mb-5">
          {Icon && (
            <span className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 id={titleId} className="font-serif text-xl font-medium text-neutral-950 leading-tight">{title}</h2>
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}
