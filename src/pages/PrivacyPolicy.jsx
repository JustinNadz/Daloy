import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Privacy Policy
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last updated: January 28, 2026
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300">
                        At Daloy, we take your privacy seriously. This Privacy Policy explains how we collect,
                        use, disclose, and safeguard your information when you use our social platform.
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">

                    {/* 1. Information We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            1. Information We Collect
                        </h2>

                        <div className="space-y-4 text-gray-600 dark:text-gray-300">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Account Information
                                </h3>
                                <p>
                                    When you create an account, we collect your username, email address, and password.
                                    Your password is encrypted and never stored in plain text.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Profile Information
                                </h3>
                                <p>
                                    You may choose to provide additional information such as a bio, profile picture,
                                    cover photo, location, website, and birthday. This information is optional.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Content You Create
                                </h3>
                                <p>
                                    We store all content you create on the platform, including posts, comments,
                                    messages, photos, videos, and other media you upload.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Usage Data
                                </h3>
                                <p>
                                    We collect information about how you use Daloy, including your interactions
                                    (likes, shares, follows), login times, IP addresses, device information, and
                                    browser type.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    Cookies and Tracking
                                </h3>
                                <p>
                                    We use essential cookies to maintain your login session. We do not use third-party
                                    advertising or tracking cookies.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 2. How We Use Your Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            2. How We Use Your Information
                        </h2>

                        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Personalize your experience on the platform</li>
                            <li>Communicate with you about updates, security alerts, and support</li>
                            <li>Detect, prevent, and address fraud, abuse, and security issues</li>
                            <li>Comply with legal obligations</li>
                            <li>Analyze usage patterns to improve our platform</li>
                        </ul>
                    </section>

                    {/* 3. Third-Party Services */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            3. Third-Party Services
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>We use the following third-party services:</p>

                            <div className="pl-4 border-l-2 border-blue-500 space-y-2">
                                <div>
                                    <strong>Sentry</strong> - Error tracking and monitoring. Sentry may receive
                                    technical information about errors but does not receive personal data unless
                                    an error occurs while you're logged in.
                                </div>
                                <div>
                                    <strong>Email Service Provider</strong> - For sending transactional emails
                                    (verification, password reset, notifications). Your email address is shared
                                    only for delivery purposes.
                                </div>
                            </div>

                            <p className="text-sm">
                                We do not sell your personal information to third parties.
                            </p>
                        </div>
                    </section>

                    {/* 4. Data Retention */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            4. Data Retention
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>
                                <strong>Active Accounts:</strong> We retain your data for as long as your account
                                is active or as needed to provide you services.
                            </p>
                            <p>
                                <strong>Deleted Accounts:</strong> When you request account deletion, you have a
                                30-day grace period to change your mind. After 30 days, your account and associated
                                data are permanently deleted.
                            </p>
                            <p>
                                <strong>Legal Requirements:</strong> We may retain certain information as required
                                by law or for legitimate business purposes (e.g., preventing fraud).
                            </p>
                        </div>
                    </section>

                    {/* 5. Your Rights (GDPR) */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            5. Your Rights (GDPR)
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>If you are in the European Union, you have the following rights:</p>

                            <ul className="list-disc list-inside space-y-2">
                                <li>
                                    <strong>Right to Access:</strong> You can request a copy of all data we have
                                    about you.
                                </li>
                                <li>
                                    <strong>Right to Rectification:</strong> You can update your information in
                                    your account settings.
                                </li>
                                <li>
                                    <strong>Right to Erasure:</strong> You can request deletion of your account
                                    and all associated data.
                                </li>
                                <li>
                                    <strong>Right to Data Portability:</strong> You can download all your data
                                    in JSON format from your settings.
                                </li>
                                <li>
                                    <strong>Right to Object:</strong> You can object to certain processing of
                                    your data.
                                </li>
                                <li>
                                    <strong>Right to Restrict Processing:</strong> You can request that we limit
                                    how we use your data.
                                </li>
                            </ul>

                            <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                                To exercise these rights, visit your Settings page or contact us at{' '}
                                <a href="mailto:privacy@daloy.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                                    privacy@daloy.com
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* 6. Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            6. Cookies
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>We use the following types of cookies:</p>

                            <div className="space-y-2">
                                <div>
                                    <strong>Essential Cookies:</strong> Required for authentication and security.
                                    These cannot be disabled.
                                </div>
                                <div>
                                    <strong>Preference Cookies:</strong> Remember your settings like dark mode
                                    and language preferences.
                                </div>
                            </div>

                            <p>
                                We do not use advertising cookies or third-party tracking cookies.
                            </p>
                        </div>
                    </section>

                    {/* 7. Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            7. Data Security
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>We implement industry-standard security measures:</p>

                            <ul className="list-disc list-inside space-y-2">
                                <li>All data transmitted over HTTPS (SSL/TLS encryption)</li>
                                <li>Passwords are hashed using bcrypt with salt</li>
                                <li>Regular security audits and monitoring</li>
                                <li>Automated daily database backups</li>
                                <li>Access controls and authentication</li>
                                <li>Real-time error monitoring to detect issues</li>
                            </ul>

                            <p className="text-sm">
                                While we strive to protect your data, no method of transmission over the internet
                                is 100% secure. We cannot guarantee absolute security.
                            </p>
                        </div>
                    </section>

                    {/* 8. Children's Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            8. Children's Privacy
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            Daloy is not intended for children under 13 years of age. We do not knowingly
                            collect personal information from children under 13. If you are a parent or guardian
                            and believe your child has provided us with personal information, please contact us.
                        </p>
                    </section>

                    {/* 9. Changes to This Policy */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            9. Changes to This Privacy Policy
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            We may update this Privacy Policy from time to time. We will notify you of any
                            changes by posting the new Privacy Policy on this page and updating the "Last updated"
                            date. We encourage you to review this Privacy Policy periodically.
                        </p>
                    </section>

                    {/* 10. Contact Us */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            10. Contact Us
                        </h2>

                        <div className="text-gray-600 dark:text-gray-300 space-y-2">
                            <p>If you have questions about this Privacy Policy, please contact us:</p>

                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded space-y-1">
                                <p><strong>Email:</strong> privacy@daloy.com</p>
                                <p><strong>Website:</strong> <a href="https://daloy.com" className="text-blue-600 dark:text-blue-400 hover:underline">daloy.com</a></p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="flex justify-center gap-4 text-sm">
                        <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Terms of Service
                        </Link>
                        <span className="text-gray-400">•</span>
                        <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
