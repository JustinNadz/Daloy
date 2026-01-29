import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error, already-verified
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Extract verification parameters from URL
                const id = searchParams.get('id');
                const hash = searchParams.get('hash');
                const expires = searchParams.get('expires');
                const signature = searchParams.get('signature');

                if (!id || !hash) {
                    setStatus('error');
                    setMessage('Invalid verification link. Please check your email and try again.');
                    return;
                }

                // Check if link is expired
                if (expires && parseInt(expires) < Math.floor(Date.now() / 1000)) {
                    setStatus('error');
                    setMessage('This verification link has expired. Please request a new one.');
                    return;
                }

                // Call backend verification endpoint
                const response = await api.get(`/auth/email/verify/${id}/${hash}`, {
                    params: { expires, signature },
                });

                if (response.data.data.message === 'Email already verified.') {
                    setStatus('already-verified');
                    setMessage('Your email is already verified! Redirecting...');
                } else {
                    setStatus('success');
                    setMessage('Email verified successfully! You can now use all features.');
                    toast.success('Email verified successfully!');

                    // Update user data in auth context if needed
                    if (response.data.data.user) {
                        localStorage.setItem('user', JSON.stringify(response.data.data.user));
                    }
                }

                // Redirect to home after 3 seconds
                setTimeout(() => {
                    navigate('/');
                }, 3000);

            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');

                if (error.response?.status === 403) {
                    setMessage('Invalid verification link. The link may have been tampered with.');
                } else {
                    setMessage(error.response?.data?.message || 'Failed to verify email. Please try again.');
                }
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        {status === 'verifying' && (
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                        )}
                        {status === 'success' && (
                            <CheckCircle className="w-16 h-16 text-green-600" />
                        )}
                        {status === 'already-verified' && (
                            <CheckCircle className="w-16 h-16 text-blue-600" />
                        )}
                        {status === 'error' && (
                            <XCircle className="w-16 h-16 text-red-600" />
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {status === 'verifying' && 'Verifying Your Email'}
                        {status === 'success' && 'Email Verified!'}
                        {status === 'already-verified' && 'Already Verified'}
                        {status === 'error' && 'Verification Failed'}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {message || 'Please wait while we verify your email address...'}
                    </p>

                    {/* Actions */}
                    {status === 'error' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/settings')}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Go to Settings to Resend
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Go to Home
                            </button>
                        </div>
                    )}

                    {(status === 'success' || status === 'already-verified') && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Redirecting to home in 3 seconds...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
