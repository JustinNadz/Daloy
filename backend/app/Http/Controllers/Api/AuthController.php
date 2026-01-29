<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:30', 'unique:users', 'regex:/^[a-zA-Z0-9_]+$/'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'display_name' => ['required', 'string', 'max:50'],
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'display_name' => $validated['display_name'],
        ]);

        // Record ToS acceptance timestamp (real-time)
        $user->terms_accepted_at = now();
        $user->save();

        // Send email verification notification
        $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $this->formatUser($user),
            'token' => $token,
            'message' => 'Please check your email to verify your account.',
        ], 'Registration successful', 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'login' => ['required', 'string'], // email or username
            'password' => ['required', 'string'],
        ]);

        $loginField = filter_var($validated['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginField, $validated['login'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            return $this->error('Your account has been deactivated.', 403);
        }

        if ($user->is_suspended && $user->suspended_until && $user->suspended_until->isFuture()) {
            return $this->error(
                'Your account is suspended until ' . $user->suspended_until->format('M d, Y') . '. Reason: ' . $user->suspension_reason,
                403
            );
        }

        // Update last active
        $user->update(['last_active_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 'Login successful');
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(['acceptedFollowers', 'acceptedFollowing']);

        return $this->success([
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:160'],
            'location' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'url', 'max:100'],
            'birthdate' => ['nullable', 'date', 'before:today'],
        ]);

        $user->update($validated);

        return $this->success([
            'user' => $this->formatUser($user->fresh()),
        ], 'Profile updated successfully');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return $this->success(null, 'Password updated successfully');
    }

    /**
     * Update privacy settings.
     */
    public function updatePrivacy(Request $request)
    {
        $validated = $request->validate([
            'privacy' => ['required', 'in:public,private'],
        ]);

        $request->user()->update($validated);

        return $this->success([
            'user' => $this->formatUser($request->user()->fresh()),
        ], 'Privacy settings updated');
    }

    /**
     * Upload avatar.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'], // 5MB
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            \Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars/' . $user->id, 'public');
        $user->update(['avatar' => $path]);

        return $this->success([
            'avatar_url' => $user->avatar_url,
        ], 'Avatar uploaded successfully');
    }

    /**
     * Upload cover photo.
     */
    public function uploadCoverPhoto(Request $request)
    {
        $request->validate([
            'cover_photo' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:10240'], // 10MB
        ]);

        $user = $request->user();

        // Delete old cover photo if exists
        if ($user->cover_photo) {
            \Storage::disk('public')->delete($user->cover_photo);
        }

        $path = $request->file('cover_photo')->store('covers/' . $user->id, 'public');
        $user->update(['cover_photo' => $path]);

        return $this->success([
            'cover_photo_url' => $user->cover_photo_url,
        ], 'Cover photo uploaded successfully');
    }

    /**
     * Verify email address.
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return $this->error('Invalid verification link.', 403);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success([
                'message' => 'Email already verified.',
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->success([
            'message' => 'Email verified successfully!',
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Resend email verification notification.
     */
    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->error('Email already verified.', 400);
        }

        $user->sendEmailVerificationNotification();

        return $this->success([
            'message' => 'Verification email resent successfully.',
        ]);
    }

    /**
     * Send password reset link.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Check if user exists
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Don't reveal if email exists or not for security
            return $this->success([
                'message' => 'If that email address is registered, you will receive a password reset link.',
            ]);
        }

        // Send password reset link
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return $this->success([
                'message' => 'Password reset link sent to your email.',
            ]);
        }

        return $this->error(
            'Failed to send password reset link. Please try again.',
            500
        );
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->success([
                'message' => 'Password reset successfully. You can now log in with your new password.',
            ]);
        }

        return $this->error(
            $status === Password::INVALID_TOKEN
            ? 'Invalid or expired reset token.'
            : 'Failed to reset password. Please try again.',
            400
        );
    }

    /**
     * Format user data for response.
     */
    private function formatUser(User $user)
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'display_name' => $user->display_name,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'cover_photo_url' => $user->cover_photo_url,
            'location' => $user->location,
            'website' => $user->website,
            'is_verified' => $user->is_verified,
            'privacy' => $user->privacy,
            'followers_count' => $user->followers_count,
            'following_count' => $user->following_count,
            'posts_count' => $user->posts_count,
            'created_at' => $user->created_at->toISOString(),
        ];

        if ($includePrivate) {
            $data['email'] = $user->email;
            $data['birthdate'] = $user->birthdate?->format('Y-m-d');
            $data['email_verified_at'] = $user->email_verified_at?->toISOString();
        }

        return $data;
    }
}
