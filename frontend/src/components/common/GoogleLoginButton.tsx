// GoogleLoginButton

// A button component for Google OAuth login

// features. -Beautiful google-branded button -loading state - error handling - redirects to Google OAuth login URL -dark mode support

// imports

import React, { useState } from 'react';
import { oauthService } from '../../services/api/oauth';
import { BRAND } from '../../styles/brand-colors';



// props
interface GoogleLoginButtonProps {
    mode: 'login' | 'signup' | 'link';
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

// GoogleLoginButton component
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ mode, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const loginUrl = oauthService.getGoogleLoginUrl();
            window.location.href = loginUrl;
            onSuccess && onSuccess();
        } catch (error) {
            onError && onError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleClick} 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-primary-200 rounded-stone bg-surface-elevated font-sans text-sm text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors disabled:opacity-50"
        >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
        <title>Google Logo</title>
        <clipPath id="g">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
        </clipPath>
        <g className="colors" clipPath="url(#g)">
            <path fill={BRAND.googleYellow} d="M0 37V11l17 13z"/>
            <path fill={BRAND.googleRed}    d="M0 11l17 13 7-6.1L48 14V0H0z"/>
            <path fill={BRAND.googleGreen}  d="M0 37l30-23 7.9 1L48 0v48H0z"/>
            <path fill={BRAND.googleBlue}   d="M48 48L17 24l-4-3 35-10z"/>
        </g>
        </svg>
            Continue with Google
            
        </button>
    );
};

export default GoogleLoginButton;