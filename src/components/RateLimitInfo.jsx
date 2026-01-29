import { Info, Clock, MessageSquare, FileText, Lock } from 'lucide-react';

export default function RateLimitInfo() {
    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Rate Limits
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                        To ensure platform stability and prevent abuse, we have the following limits:
                    </p>

                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span><strong>Posts:</strong> 50 per day</span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span><strong>Comments:</strong> 100 per day</span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span><strong>Login attempts:</strong> 5 per minute</span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span><strong>Registrations:</strong> 3 per hour</span>
                        </div>
                    </div>

                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                        These limits reset automatically. If you reach a limit, please wait for the specified time period.
                    </p>
                </div>
            </div>
        </div>
    );
}
