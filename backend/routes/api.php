<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminPostController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminGroupController;
use App\Http\Controllers\Admin\AdminEventController;
use App\Http\Controllers\Admin\AdminLogController;
use App\Http\Controllers\Admin\AdminNotificationController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\AdminManagementController;
use App\Http\Controllers\Admin\CommentModerationController;
use App\Http\Controllers\Admin\HashtagController;
use App\Http\Controllers\Admin\MediaLibraryController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\VerificationRequestController;
use App\Http\Controllers\Admin\AppealController;
use App\Http\Controllers\Admin\SystemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    // Rate limited: 3 registrations per hour to prevent spam
    // reCAPTCHA protected to prevent bots
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware(['throttle:3,60', 'recaptcha']);

    // Rate limited: 5 login attempts per minute to prevent brute force
    // reCAPTCHA protected to prevent bots
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware(['throttle:5,1', 'recaptcha']);

    // Google OAuth
    Route::get('/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
    Route::get('/facebook/redirect', [SocialAuthController::class, 'redirectToFacebook']);
    Route::get('/facebook/callback', [SocialAuthController::class, 'handleFacebookCallback']);

    // Email verification (public - uses signed URL for security)
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->name('verification.verify');

    // Password reset routes (public)
    Route::post('/password/email', [AuthController::class, 'sendResetLink'])
        ->name('password.email');
    Route::post('/password/reset', [AuthController::class, 'resetPassword'])
        ->name('password.reset');

    // Privacy & GDPR routes (require authentication)
    Route::middleware('auth:sanctum')->prefix('privacy')->group(function () {
        Route::get('/export-data', [\App\Http\Controllers\Api\PrivacyController::class, 'exportData']);
        Route::post('/delete-account', [\App\Http\Controllers\Api\PrivacyController::class, 'requestAccountDeletion']);
        Route::post('/cancel-deletion', [\App\Http\Controllers\Api\PrivacyController::class, 'cancelAccountDeletion']);
    });
});

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!', 'timestamp' => now()]);
});

// Search
Route::get('/search/trending', [SearchController::class, 'trending']);

// Public posts (explore/trending)
Route::get('/posts/public', [PostController::class, 'publicFeed']);
Route::get('/posts/{post}', [PostController::class, 'showPublic'])->name('posts.show.public');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::put('/privacy', [AuthController::class, 'updatePrivacy']);
        Route::post('/avatar', [AuthController::class, 'uploadAvatar']);
        Route::post('/cover-photo', [AuthController::class, 'uploadCoverPhoto']);

        // Two-Factor Authentication
        Route::prefix('2fa')->group(function () {
            Route::get('/status', [TwoFactorController::class, 'status']);
            Route::post('/enable', [TwoFactorController::class, 'enable']);
            Route::post('/confirm', [TwoFactorController::class, 'confirm']);
            Route::post('/disable', [TwoFactorController::class, 'disable']);
            Route::post('/verify', [TwoFactorController::class, 'verify']);
        });

        // Media Management
        Route::prefix('media')->name('media.')->group(function () {
            Route::get('/', [MediaController::class, 'index'])->name('index');
            Route::post('/images/upload', [MediaController::class, 'uploadImage'])->name('images.upload');
            Route::get('/images/{id}/resize', [MediaController::class, 'dynamicResize'])->name('images.resize');
            Route::get('/{id}', [MediaController::class, 'show'])->name('show');
            Route::delete('/{id}', [MediaController::class, 'destroy'])->name('destroy');
            Route::get('/stats/summary', [MediaController::class, 'stats'])->name('stats');
        });

        // Resend verification email (requires auth)
        Route::post('/email/resend', [AuthController::class, 'resendVerification'])
            ->name('verification.send');
    });

    // Posts
    Route::prefix('posts')->group(function () {
        Route::get('/feed', [PostController::class, 'feed']);
        Route::get('/explore', [PostController::class, 'explore']);

        // Rate limited: 50 posts per day to prevent spam
        Route::post('/', [PostController::class, 'store'])
            ->middleware('throttle:50,1440');
        Route::get('/{post}', [PostController::class, 'show']);
        Route::put('/{post}', [PostController::class, 'update']);
        Route::delete('/{post}', [PostController::class, 'destroy']);
        Route::get('/{post}/comments', [PostController::class, 'comments']);

        // Rate limited: 100 comments per day to prevent spam
        Route::post('/{post}/comments', [PostController::class, 'comment'])
            ->middleware('throttle:100,1440');
        Route::post('/{post}/repost', [PostController::class, 'repost']);
        Route::delete('/{post}/repost', [PostController::class, 'undoRepost']);
        Route::post('/{post}/quote', [PostController::class, 'quote']);

        // Reactions
        Route::post('/{post}/reactions', [ReactionController::class, 'store']);
        Route::delete('/{post}/reactions', [ReactionController::class, 'destroy']);
        Route::get('/{post}/reactions/users', [ReactionController::class, 'users']);

        // Bookmarks
        Route::post('/{post}/bookmark', [BookmarkController::class, 'store']);
        Route::delete('/{post}/bookmark', [BookmarkController::class, 'destroy']);
    });

    // Users
    Route::prefix('users')->group(function () {
        Route::get('/search', [UserController::class, 'search']);
        Route::get('/suggestions', [UserController::class, 'suggestions']);
        Route::get('/blocked', [UserController::class, 'blockedUsers']);
        Route::get('/muted', [UserController::class, 'mutedUsers']);
        Route::get('/follow-requests', [UserController::class, 'pendingFollowRequests']);

        Route::get('/{username}', [UserController::class, 'show']);
        Route::get('/{username}/posts', [PostController::class, 'userPosts']);
        Route::get('/{username}/followers', [UserController::class, 'followers']);
        Route::get('/{username}/following', [UserController::class, 'following']);

        Route::post('/{user}/follow', [UserController::class, 'follow']);
        Route::delete('/{user}/follow', [UserController::class, 'unfollow']);
        Route::post('/{user}/follow/accept', [UserController::class, 'acceptFollowRequest']);
        Route::post('/{user}/follow/reject', [UserController::class, 'rejectFollowRequest']);
        Route::delete('/{user}/follower', [UserController::class, 'removeFollower']);

        Route::post('/{user}/block', [UserController::class, 'block']);
        Route::delete('/{user}/block', [UserController::class, 'unblock']);
        Route::post('/{user}/mute', [UserController::class, 'mute']);
        Route::delete('/{user}/mute', [UserController::class, 'unmute']);
    });

    // Bookmarks
    Route::prefix('bookmarks')->group(function () {
        Route::get('/', [BookmarkController::class, 'index']);
        Route::get('/collections', [BookmarkController::class, 'collections']);
        Route::post('/collections', [BookmarkController::class, 'createCollection']);
        Route::put('/collections/{collection}', [BookmarkController::class, 'updateCollection']);
        Route::delete('/collections/{collection}', [BookmarkController::class, 'deleteCollection']);
        Route::get('/collections/{collection}/bookmarks', [BookmarkController::class, 'collectionBookmarks']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'clearAll']);
    });

    // Messages
    Route::prefix('messages')->group(function () {
        Route::get('/conversations', [MessageController::class, 'conversations']);
        Route::post('/conversations', [MessageController::class, 'startConversation']);
        Route::post('/conversations/group', [MessageController::class, 'createGroup']);
        Route::get('/conversations/{conversation}', [MessageController::class, 'messages']);
        Route::post('/conversations/{conversation}', [MessageController::class, 'sendMessage']);
        Route::post('/conversations/{conversation}/leave', [MessageController::class, 'leaveConversation']);
        Route::post('/conversations/{conversation}/mute', [MessageController::class, 'toggleMute']);
        Route::put('/{message}', [MessageController::class, 'editMessage']);
        Route::delete('/{message}', [MessageController::class, 'deleteMessage']);
    });

    // Search
    Route::prefix('search')->group(function () {
        Route::get('/', [SearchController::class, 'index']);
        Route::get('/users', [SearchController::class, 'users']);
        Route::get('/posts', [SearchController::class, 'posts']);
        Route::get('/hashtags', [SearchController::class, 'hashtags']);
        Route::get('/trending', [SearchController::class, 'trending']);
        Route::get('/hashtags/{slug}/posts', [SearchController::class, 'hashtagPosts']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
*/

// Admin public routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// Admin protected routes
Route::prefix('admin')->middleware(['auth:sanctum', 'ability:admin'])->group(function () {
    // Auth
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::put('/password', [AdminAuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/chart', [DashboardController::class, 'chartData']);
    Route::get('/dashboard/activity', [DashboardController::class, 'recentActivity']);

    // Users management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::post('/users/{user}/suspend', [AdminUserController::class, 'suspend']);
    Route::post('/users/{user}/unsuspend', [AdminUserController::class, 'unsuspend']);
    Route::post('/users/{user}/verify', [AdminUserController::class, 'verify']);
    Route::post('/users/{user}/unverify', [AdminUserController::class, 'unverify']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

    // Posts management
    Route::get('/posts', [AdminPostController::class, 'index']);
    Route::get('/posts/{post}', [AdminPostController::class, 'show']);
    Route::delete('/posts/{post}', [AdminPostController::class, 'destroy']);
    Route::post('/posts/bulk-delete', [AdminPostController::class, 'bulkDelete']);

    // Reports management
    Route::get('/reports', [AdminReportController::class, 'index']);
    Route::get('/reports/stats', [AdminReportController::class, 'stats']);
    Route::get('/reports/{report}', [AdminReportController::class, 'show']);
    Route::post('/reports/{report}/resolve', [AdminReportController::class, 'resolve']);
    Route::post('/reports/{report}/dismiss', [AdminReportController::class, 'dismiss']);

    // Settings
    Route::get('/settings', [AdminSettingsController::class, 'index']);
    Route::put('/settings', [AdminSettingsController::class, 'update']);
    Route::get('/settings/{key}', [AdminSettingsController::class, 'getByKey']);
    Route::put('/settings/{key}', [AdminSettingsController::class, 'updateByKey']);

    // Groups management
    Route::get('/groups', [AdminGroupController::class, 'index']);
    Route::get('/groups/{group}', [AdminGroupController::class, 'show']);
    Route::post('/groups/{group}/suspend', [AdminGroupController::class, 'suspend']);
    Route::post('/groups/{group}/restore', [AdminGroupController::class, 'restore']);
    Route::delete('/groups/{group}', [AdminGroupController::class, 'destroy']);
    Route::delete('/groups/{group}/members/{memberId}', [AdminGroupController::class, 'removeMember']);

    // Events management
    Route::get('/events', [AdminEventController::class, 'index']);
    Route::get('/events/{event}', [AdminEventController::class, 'show']);
    Route::post('/events/{event}/cancel', [AdminEventController::class, 'cancel']);
    Route::post('/events/{event}/suspend', [AdminEventController::class, 'suspend']);
    Route::post('/events/{event}/restore', [AdminEventController::class, 'restore']);
    Route::delete('/events/{event}', [AdminEventController::class, 'destroy']);

    // Admin Logs (Audit)
    Route::get('/logs', [AdminLogController::class, 'index']);
    Route::get('/logs/actions', [AdminLogController::class, 'actions']);
    Route::get('/logs/export', [AdminLogController::class, 'export']);

    // Admin Notifications
    Route::get('/notifications', [AdminNotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [AdminNotificationController::class, 'unreadCount']);
    Route::post('/notifications/{notification}/read', [AdminNotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{notification}/archive', [AdminNotificationController::class, 'archive']);

    // Analytics
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/user-growth', [AnalyticsController::class, 'userGrowth']);
    Route::get('/analytics/post-activity', [AnalyticsController::class, 'postActivity']);
    Route::get('/analytics/engagement', [AnalyticsController::class, 'engagementMetrics']);
    Route::get('/analytics/top-content', [AnalyticsController::class, 'topContent']);
    Route::get('/analytics/demographics', [AnalyticsController::class, 'demographics']);
    Route::get('/analytics/export', [AnalyticsController::class, 'export']);

    // Admin Management
    Route::get('/admins', [AdminManagementController::class, 'index']);
    Route::post('/admins', [AdminManagementController::class, 'store']);
    Route::get('/admins/roles', [AdminManagementController::class, 'roles']);
    Route::get('/admins/{admin}', [AdminManagementController::class, 'show']);
    Route::put('/admins/{admin}', [AdminManagementController::class, 'update']);
    Route::put('/admins/{admin}/password', [AdminManagementController::class, 'updatePassword']);
    Route::delete('/admins/{admin}', [AdminManagementController::class, 'destroy']);

    // Comments Moderation
    Route::get('/comments', [CommentModerationController::class, 'index']);
    Route::get('/comments/{comment}', [CommentModerationController::class, 'show']);
    Route::post('/comments/{comment}/hide', [CommentModerationController::class, 'hide']);
    Route::post('/comments/{comment}/unhide', [CommentModerationController::class, 'unhide']);
    Route::delete('/comments/{comment}', [CommentModerationController::class, 'destroy']);
    Route::post('/comments/bulk-delete', [CommentModerationController::class, 'bulkDelete']);

    // Hashtags
    Route::get('/hashtags', [HashtagController::class, 'index']);
    Route::get('/hashtags/trending', [HashtagController::class, 'trending']);
    Route::get('/hashtags/stats', [HashtagController::class, 'stats']);
    Route::get('/hashtags/{hashtag}', [HashtagController::class, 'show']);
    Route::post('/hashtags/{hashtag}/ban', [HashtagController::class, 'ban']);
    Route::post('/hashtags/{hashtag}/unban', [HashtagController::class, 'unban']);

    // Media Library
    Route::get('/media', [MediaLibraryController::class, 'index']);
    Route::get('/media/stats', [MediaLibraryController::class, 'stats']);
    Route::get('/media/storage', [MediaLibraryController::class, 'storageInfo']);
    Route::get('/media/{media}', [MediaLibraryController::class, 'show']);
    Route::delete('/media/{media}', [MediaLibraryController::class, 'destroy']);
    Route::post('/media/bulk-delete', [MediaLibraryController::class, 'bulkDelete']);

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::post('/announcements', [AnnouncementController::class, 'store']);
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show']);
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update']);
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    Route::post('/announcements/{announcement}/toggle', [AnnouncementController::class, 'toggle']);

    // Verification Requests
    Route::get('/verifications', [VerificationRequestController::class, 'index']);
    Route::get('/verifications/stats', [VerificationRequestController::class, 'stats']);
    Route::get('/verifications/categories', [VerificationRequestController::class, 'categories']);
    Route::get('/verifications/{verificationRequest}', [VerificationRequestController::class, 'show']);
    Route::post('/verifications/{verificationRequest}/approve', [VerificationRequestController::class, 'approve']);
    Route::post('/verifications/{verificationRequest}/reject', [VerificationRequestController::class, 'reject']);

    // Appeals
    Route::get('/appeals', [AppealController::class, 'index']);
    Route::get('/appeals/stats', [AppealController::class, 'stats']);
    Route::get('/appeals/types', [AppealController::class, 'types']);
    Route::get('/appeals/{appeal}', [AppealController::class, 'show']);
    Route::post('/appeals/{appeal}/approve', [AppealController::class, 'approve']);
    Route::post('/appeals/{appeal}/reject', [AppealController::class, 'reject']);
    Route::post('/appeals/{appeal}/review', [AppealController::class, 'markUnderReview']);

    // System / Backup / Maintenance
    Route::get('/system/status', [SystemController::class, 'status']);
    Route::post('/system/maintenance', [SystemController::class, 'maintenanceMode']);
    Route::post('/system/cache/clear', [SystemController::class, 'clearCache']);
    Route::post('/system/optimize', [SystemController::class, 'optimizeSystem']);
    Route::get('/system/backups', [SystemController::class, 'listBackups']);
    Route::post('/system/backups', [SystemController::class, 'backupDatabase']);
    Route::get('/system/backups/{filename}', [SystemController::class, 'downloadBackup']);
    Route::delete('/system/backups/{filename}', [SystemController::class, 'deleteBackup']);
});
