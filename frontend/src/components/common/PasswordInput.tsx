// imports
import React, { useState, useEffect } from 'react';


interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

interface PasswordInputProps {
  label: string;
  value: string;
  name?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showRequirements?: boolean;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}


export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  showRequirements = false,
  error,
  required,
    ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      label: 'At least 8 characters',
      test: (pw) => pw.length >= 8,
      met: false,
    },
    {
      label: 'Contains uppercase letter',
      test: (pw) => /[A-Z]/.test(pw),
      met: false,
    },
    {
      label: 'Contains lowercase letter',
      test: (pw) => /[a-z]/.test(pw),
      met: false,
    },
    {
      label: 'Contains number',
      test: (pw) => /[0-9]/.test(pw),
      met: false,
    },
    {
      label: 'Contains special character',
      test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
      met: false,
    },
  ]);

  useEffect(() => {
    const updatedRequirements = requirements.map((req) => ({
      ...req,
      met: req.test(value),
    }));
    setRequirements(updatedRequirements);
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          name={props.name}
          placeholder={props.placeholder}
          required={required}
          autoComplete={props.autoComplete}
          className={`block w-full px-3 py-2 pr-10 border ${
            error
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {showRequirements && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password Requirements:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {requirements.map((req, index) => (
              <li
                key={index}
                className={`text-sm ${
                  req.met
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {req.met ? '✔️' : '❌'} {req.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

  