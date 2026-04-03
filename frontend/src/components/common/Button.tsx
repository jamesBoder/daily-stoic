import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  size = "medium",
  ...props
}) => {
  const baseStyles =
    "rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:brightness-90";

  const variantStyles = {
    primary:
      "bg-stoic-stone-600 dark:bg-stoic-stone-500 text-stoic-surface-base hover:bg-stoic-stone-700 dark:hover:bg-stoic-stone-600 shadow-paper hover:shadow-paper-lg",
    secondary:
      "bg-stoic-surface-raised dark:bg-stoic-dark-surface-raised text-stoic-text-primary dark:text-stoic-dark-text-primary hover:bg-stoic-surface-overlay dark:hover:bg-stoic-dark-surface-overlay border border-stoic-stone-200 dark:border-stoic-stone-700",
    danger: "bg-stoic-accent-ember text-white hover:bg-red-700 dark:hover:bg-red-500 shadow-paper hover:shadow-paper-lg",
  };

  const sizeClasses = {
  small: 'px-4 py-2 text-sm min-h-[44px]',
  medium: 'px-6 py-3 text-base min-h-[44px]',
  large: 'px-8 py-4 text-lg min-h-[48px]',
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${sizeClasses[size]}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
