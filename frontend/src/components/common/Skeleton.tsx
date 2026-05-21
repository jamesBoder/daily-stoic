import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const baseClasses = 'animate-pulse bg-surface-hi';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Verse Card Skeleton
export const VerseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-lg shadow-md p-6 space-y-4">
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} />
      <Skeleton height={16} />
      <Skeleton height={16} width="80%" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-lg shadow p-4 space-y-2">
      <Skeleton height={20} width="40%" />
      <Skeleton height={16} />
      <Skeleton height={16} width="90%" />
    </div>
  );
};