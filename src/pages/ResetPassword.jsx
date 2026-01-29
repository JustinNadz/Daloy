import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Get token and email from URL
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (tokenParam) setToken(tokenParam);
        if (emailParam) setEmail(decodeURIComponent(emailParam));

        if (!tokenParam || !emailParam) {
            toast.error('Invalid password reset link');
        }
    }, [searchParams]);

    const validatePassword = (pwd) => {
        const minLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);

        return minLength && hasUpper && hasLower && hasNumber;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token || !email) {
            toast.error('Invalid password reset link');
            return;
        }

        if (!validatePassword(password)) {
            toast.error('Password must be at least 8 characters with uppercase, lowercase, and numbers');
            return;
        }

        if (password !== passwordConfirmation) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/password/reset', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            toast.success(response.data.data.message || 'Password reset successfully!');
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (error) {
            console.error('Reset password error:', error);

            if (error.response?.status === 400) {
                toast.error('Invalid or expired reset token. Please request a new password reset link.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Password Reset Complete!
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your password has been reset successfully. You can now log in with your new password.
                        </p>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Redirecting to login in 3 seconds...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Reset Your Password
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter your new password below
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email (read-only) */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white cursor-not-allowed"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Password Requirements */}
                        <div className="mt-2 space-y-1">
                            <p className={`text-xs ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                • At least 8 characters
                            </p>
                            <p className={`text-xs ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                                • Both uppercase and lowercase letters
                            </p>
                            <p className={`text-xs ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                                • At least one number
                            </p>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                id="password_confirmation"
                                type={showConfirmation ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(!showConfirmation)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showConfirmation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {passwordConfirmation && password !== passwordConfirmation && (
                            <p className="mt-1 text-xs text-red-600">
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token || !email}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Resetting...</span>
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                <span>Reset Password</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
