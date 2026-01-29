import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Show banner after 1 second delay
            setTimeout(() => setShow(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShow(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'rejected');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg animate-slide-up">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Cookie className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                We use cookies
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                We use essential cookies for authentication and to remember your preferences.
                                We do not use tracking or advertising cookies.{' '}
                                <Link
                                    to="/privacy"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    Learn more in our Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            onClick={handleReject}
                            variant="ghost"
                            size="sm"
                            className="text-sm"
                        >
                            Reject Optional
                        </Button>
                        <Button
                            onClick={handleAccept}
                            size="sm"
                            className="text-sm"
                        >
                            Accept All
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
