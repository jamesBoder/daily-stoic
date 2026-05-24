import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;  // kept for API compat; replaced by inline SVG
  eager?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src, alt, className = '', eager = false,
}) => {
  const [imageSrc, setImageSrc] = useState(eager ? src : '');
  const [isLoaded, setIsLoaded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager) return;
    setIsLoaded(false);

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

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, [src, eager]);

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <svg
          viewBox="0 0 400 300"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect fill="var(--color-surface)" width="400" height="300" />
        </svg>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
        />
      )}
    </div>
  );
};
