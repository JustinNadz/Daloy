import React from 'react';
import { FaFacebook } from 'react-icons/fa';

const FacebookLoginButton = ({ mode = 'login' }) => {
    const handleFacebookLogin = () => {
        // Redirect to backend Facebook OAuth endpoint
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/facebook/redirect`;
    };

    return (
        <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-[#1877F2] text-white hover:bg-[#166FE5] transition duration-150"
        >
            <FaFacebook className="w-5 h-5" />
            <span className="text-sm font-medium">
                {mode === 'signup' ? 'Sign up with Facebook' : 'Sign in with Facebook'}
            </span>
        </button>
    );
};

export default FacebookLoginButton;
