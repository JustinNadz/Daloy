import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { toast } from 'sonner';

export default function EmailVerificationBanner() {
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    // Don't show banner if email is verified
    if (!user || user.email_verified_at) {
        return null;
    }

    const handleResend = async () => {
        try {
            setSending(true);
            const response = await api.post('/auth/email/resend');

            toast.success(response.data.data.message || 'Verification email sent!');
            setSent(true);

            // Reset "sent" state after 30 seconds
            setTimeout(() => setSent(false), 30000);
        } catch (error) {
            console.error('Resend error:', error);
            toast.error(error.response?.data?.message || 'Failed to resend email');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Please verify your email address
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                Check your inbox for a verification link to access all features              </p>
                        </div>
                    </div>

                    <button
                        onClick={handleResend}
                        disabled={sending || sent}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-900 dark:text-yellow-100 bg-yellow-100 dark:bg-yellow-800 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {sent ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Email Sent!</span>
                            </>
                        ) : (
                            <span>Resend Email</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
