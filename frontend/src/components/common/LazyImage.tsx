import React, { useState, useEffect, useRef } from 'react';

// Parchment-tinted placeholder — matches surface-card (#e4e0d5) to avoid grey flash
const PARCHMENT_PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e4e0d5" width="400" height="300"/%3E%3C/svg%3E'

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  /** Skip IntersectionObserver and load immediately — use for above-the-fold images */
  eager?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = PARCHMENT_PLACEHOLDER,
  eager = false,
}) => {
  const [imageSrc, setImageSrc] = useState(eager ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (eager) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, eager]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={() => setIsLoaded(true)}
      loading={eager ? 'eager' : 'lazy'}
    />
  );
};
