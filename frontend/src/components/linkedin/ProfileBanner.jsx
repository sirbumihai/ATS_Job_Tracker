import React, { useEffect, useRef } from 'react';
import { drawBanner, loadBannerFonts, BANNER_SIZE } from './bannerCanvas';

/** Previzualizarea bannerului: acelasi desen ca exportul PNG, scalat la latimea containerului. */
export default function ProfileBanner({ template, headline, stack, className = '' }) {
  const canvasRef = useRef(null);
  const stackKey = (stack || []).join('|');

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      if (!cancelled && canvasRef.current) drawBanner(canvasRef.current, { template, headline, stack });
    };
    paint();
    // Redesenare dupa incarcarea fonturilor web, daca nu erau gata la primul desen.
    loadBannerFonts().then(paint);
    return () => {
      cancelled = true;
    };
    // `stack` e comparat prin continut (stackKey), nu prin referinta.
  }, [template, headline, stackKey]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="banner-preview"
      data-template={template}
      width={BANNER_SIZE.width}
      height={BANNER_SIZE.height}
      role="img"
      aria-label={`Banner LinkedIn: ${headline}${stackKey ? `, ${(stack || []).join(', ')}` : ''}`}
      className={`block w-full h-auto ${className}`}
    />
  );
}
