import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Terms of Service
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last updated: January 28, 2026
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300">
                        Welcome to Daloy! These Terms of Service govern your use of our platform.
                        By using Daloy, you agree to these terms.
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">

                    {/* 1. Acceptance of Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            1. Acceptance of Terms
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            By accessing or using Daloy, you agree to be bound by these Terms of Service and our
                            Privacy Policy. If you do not agree to these terms, please do not use our platform.
                        </p>
                    </section>

                    {/* 2. Description of Service */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            2. Description of Service
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            Daloy is a social networking platform that allows users to create profiles, share
                            content, communicate with others, join groups, create events, and engage with a
                            community. We reserve the right to modify, suspend, or discontinue any part of the
                            service at any time.
                        </p>
                    </section>

                    {/* 3. User Responsibilities */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            3. User Responsibilities
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>By using Daloy, you agree to:</p>

                            <ul className="list-disc list-inside space-y-2">
                                <li>Provide accurate and complete registration information</li>
                                <li>Maintain the security of your account and password</li>
                                <li>Notify us immediately of any unauthorized use of your account</li>
                                <li>Be responsible for all activity under your account</li>
                                <li>Comply with all applicable local, state, and federal laws</li>
                                <li>Not use the service if you are under 13 years of age</li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. Prohibited Activities */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            4. Prohibited Activities
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>You may not use Daloy to:</p>

                            <ul className="list-disc list-inside space-y-2">
                                <li>Harass, threaten, or intimidate other users</li>
                                <li>Post hate speech, discriminatory content, or incite violence</li>
                                <li>Share sexually explicit content or content exploiting minors</li>
                                <li>Impersonate others or create fake accounts</li>
                                <li>Spam, advertise excessively, or send unsolicited messages</li>
                                <li>Share illegal content or engage in illegal activities</li>
                                <li>Violate others' intellectual property rights</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Use bots, scrapers, or automated tools without permission</li>
                                <li>Interfere with the proper functioning of the platform</li>
                            </ul>
                        </div>
                    </section>

                    {/* 5. Content Ownership */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            5. Content Ownership and License
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>
                                <strong>Your Content:</strong> You retain all ownership rights to content you
                                create and share on Daloy. However, by posting content, you grant Daloy a
                                worldwide, non-exclusive, royalty-free license to use, display, reproduce, and
                                distribute your content on the platform.
                            </p>

                            <p>
                                <strong>Our Content:</strong> All Daloy branding, logos, design, and platform
                                features are owned by Daloy and protected by intellectual property laws. You may
                                not use our intellectual property without permission.
                            </p>

                            <p>
                                <strong>User Content:</strong> You are solely responsible for the content you post.
                                We do not endorse or guarantee the accuracy of user-generated content.
                            </p>
                        </div>
                    </section>

                    {/* 6. Content Moderation */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            6. Content Moderation
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>
                                We reserve the right to remove or moderate any content that violates these Terms
                                or our Community Guidelines, without prior notice. This includes, but is not
                                limited to:
                            </p>

                            <ul className="list-disc list-inside space-y-2">
                                <li>Illegal content</li>
                                <li>Harassment or hate speech</li>
                                <li>Spam or misleading information</li>
                                <li>Sexually explicit content</li>
                                <li>Copyright infringement</li>
                            </ul>

                            <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
                                <strong>Note:</strong> We are not obligated to monitor all content but reserve
                                the right to do so.
                            </p>
                        </div>
                    </section>

                    {/* 7. Account Termination */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            7. Account Termination
                        </h2>

                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                            <p>
                                <strong>By You:</strong> You may delete your account at any time from your
                                Settings page. Account deletion is subject to a 30-day grace period.
                            </p>

                            <p>
                                <strong>By Us:</strong> We reserve the right to suspend or terminate your account
                                if you violate these Terms, engage in prohibited activities, or for any other
                                reason at our discretion. We will attempt to notify you, but are not obligated
                                to do so.
                            </p>

                            <p>
                                <strong>Effect of Termination:</strong> Upon termination, your right to use
                                Daloy immediately ceases. Your content may be deleted or anonymized.
                            </p>
                        </div>
                    </section>

                    {/* 8. Disclaimer of Warranties */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            8. Disclaimer of Warranties
                        </h2>

                        <div className="text-gray-600 dark:text-gray-300 space-y-3">
                            <p className="uppercase font-semibold">
                                Daloy is provided "as is" and "as available" without warranties of any kind,
                                either express or implied.
                            </p>

                            <p>
                                We do not warrant that:
                            </p>

                            <ul className="list-disc list-inside space-y-2">
                                <li>The service will be uninterrupted, secure, or error-free</li>
                                <li>Defects will be corrected</li>
                                <li>The service is free of viruses or harmful components</li>
                                <li>Results from using the service will be accurate or reliable</li>
                            </ul>
                        </div>
                    </section>

                    {/* 9. Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            9. Limitation of Liability
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300 uppercase font-semibold">
                            To the maximum extent permitted by law, Daloy shall not be liable for any indirect,
                            incidental, special, consequential, or punitive damages, including but not limited
                            to loss of profits, data, or other intangible losses arising from your use of the
                            service.
                        </p>
                    </section>

                    {/* 10. Indemnification */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            10. Indemnification
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            You agree to indemnify and hold harmless Daloy, its affiliates, officers, directors,
                            employees, and agents from any claims, damages, losses, liabilities, and expenses
                            (including legal fees) arising from your use of the service, your content, or your
                            violation of these Terms.
                        </p>
                    </section>

                    {/* 11. Governing Law */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            11. Governing Law
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            These Terms shall be governed by and construed in accordance with the laws of the
                            jurisdiction in which Daloy operates, without regard to its conflict of law
                            provisions.
                        </p>
                    </section>

                    {/* 12. Changes to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            12. Changes to These Terms
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            We reserve the right to modify these Terms at any time. We will notify users of
                            material changes by posting a notice on the platform or sending an email. Your
                            continued use of Daloy after changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    {/* 13. Contact */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            13. Contact Information
                        </h2>

                        <div className="text-gray-600 dark:text-gray-300 space-y-2">
                            <p>For questions about these Terms, contact us:</p>

                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded space-y-1">
                                <p><strong>Email:</strong> legal@daloy.com</p>
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
