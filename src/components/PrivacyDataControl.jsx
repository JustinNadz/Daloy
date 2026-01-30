import { useState } from 'react';
import { Download, Trash2, AlertTriangle, Loader2, Shield } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivacyDataControl() {
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleExportData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/privacy/export-data');

            // Create downloadable JSON file
            const dataStr = JSON.stringify(response.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `daloy_data_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Your data has been exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error(error.response?.data?.message || 'Failed to export data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmation !== 'DELETE MY ACCOUNT') {
            toast.error('Please type "DELETE MY ACCOUNT" to confirm');
            return;
        }

        if (!password) {
            toast.error('Please enter your password');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/privacy/delete-account', {
                password,
                confirmation,
            });

            toast.success('Account deletion scheduled. You have 30 days to cancel.');

            // Logout and redirect
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to schedule account deletion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Export Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Download Your Data
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Export all your data including posts, comments, messages, and account information in JSON format.
                        </p>
                        <button
                            onClick={handleExportData}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>Download My Data</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-2 border-red-200 dark:border-red-900">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Delete Account
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Permanently delete your account and all associated data. This action has a 30-day grace period before permanent deletion.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete My Account</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Delete Account?
                            </h2>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This will schedule your account for deletion in 30 days. You can cancel anytime before then.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Enter your password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    placeholder="Your password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type "DELETE MY ACCOUNT" to confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmation}
                                    onChange={(e) => setConfirmation(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                                    placeholder="DELETE MY ACCOUNT"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setPassword('');
                                    setConfirmation('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={loading || confirmation !== 'DELETE MY ACCOUNT' || !password}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
