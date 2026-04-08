import React from "react";

/**
 * PageLoader — lightweight Suspense fallback for lazy-loaded routes.
 * Sits in the content area (below header/nav) rather than taking the full screen.
 */
export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center py-32">
    <svg
      className="animate-spin h-7 w-7 text-primary-300 dark:text-night-500"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
);

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
