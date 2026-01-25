<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminPostController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminSettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

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
    });

    // Posts
    Route::prefix('posts')->group(function () {
        Route::get('/feed', [PostController::class, 'feed']);
        Route::get('/explore', [PostController::class, 'explore']);
        Route::post('/', [PostController::class, 'store']);
        Route::get('/{post}', [PostController::class, 'show']);
        Route::put('/{post}', [PostController::class, 'update']);
        Route::delete('/{post}', [PostController::class, 'destroy']);
        Route::get('/{post}/comments', [PostController::class, 'comments']);
        Route::post('/{post}/comments', [PostController::class, 'comment']);
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
});
