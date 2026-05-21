import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-warning text-accent-text px-4 py-2 text-center">
      <p className="text-sm font-medium">
        ⚠️ You're offline. Some features may not be available.
      </p>
    </div>
  );
};
