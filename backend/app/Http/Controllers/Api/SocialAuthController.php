<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    use ApiResponse;

    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            // Configure Guzzle to skip SSL verification (for local development only)
            $socialite = Socialite::driver('google')->stateless();

            // Disable SSL verification for localhost (Windows fix)
            if (config('app.env') === 'local') {
                $socialite->setHttpClient(
                    new \GuzzleHttp\Client(['verify' => false])
                );
            }

            // Get user from Google
            $googleUser = $socialite->user();

            // Find or create user
            $user = $this->findOrCreateUser($googleUser, 'google');

            // Create Sanctum token
            $token = $user->createToken('google-auth')->plainTextToken;

            // Return user data and token
            return $this->success([
                'user' => $user,
                'token' => $token,
                'message' => 'Successfully logged in with Google',
            ]);

        } catch (\Exception $e) {
            return $this->error('Google authentication failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Redirect to Facebook OAuth
     */
    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')
            ->stateless()
            ->redirect();
    }

    /**
     * Handle Facebook OAuth callback
     */
    public function handleFacebookCallback(Request $request)
    {
        try {
            // Configure Guzzle to skip SSL verification (for local development only)
            $socialite = Socialite::driver('facebook')->stateless();

            // Disable SSL verification for localhost (Windows fix)
            if (config('app.env') === 'local') {
                $socialite->setHttpClient(
                    new \GuzzleHttp\Client(['verify' => false])
                );
            }

            // Get user from Facebook
            $facebookUser = $socialite->user();

            // Find or create user
            $user = $this->findOrCreateUser($facebookUser, 'facebook');

            // Create Sanctum token
            $token = $user->createToken('facebook-auth')->plainTextToken;

            // Return user data and token
            return $this->success([
                'user' => $user,
                'token' => $token,
                'message' => 'Successfully logged in with Facebook',
            ]);

        } catch (\Exception $e) {
            return $this->error('Facebook authentication failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Find or create user from OAuth provider
     */
    private function findOrCreateUser($providerUser, $provider)
    {
        // Check if user exists with this OAuth ID
        $user = User::where('oauth_provider', $provider)
            ->where('oauth_id', $providerUser->getId())
            ->first();

        if ($user) {
            // Update OAuth token and avatar
            $user->update([
                'oauth_token' => $providerUser->token,
                'oauth_refresh_token' => $providerUser->refreshToken ?? null,
                'avatar' => $providerUser->getAvatar() ?? $user->avatar,
            ]);

            return $user;
        }

        // Check if user exists with this email
        $existingUser = User::where('email', $providerUser->getEmail())->first();

        if ($existingUser) {
            // Link OAuth to existing account
            $existingUser->update([
                'oauth_provider' => $provider,
                'oauth_id' => $providerUser->getId(),
                'oauth_token' => $providerUser->token,
                'oauth_refresh_token' => $providerUser->refreshToken ?? null,
                'avatar' => $providerUser->getAvatar() ?? $existingUser->avatar,
                'is_verified' => true, // Auto-verify since Google verified email
            ]);

            return $existingUser;
        }

        // Create new user
        $username = $this->generateUniqueUsername($providerUser->getName() ?? $providerUser->getEmail());

        $newUser = User::create([
            'username' => $username,
            'email' => $providerUser->getEmail(),
            'display_name' => $providerUser->getName(),
            'avatar' => $providerUser->getAvatar(),
            'password' => Hash::make(Str::random(32)), // Random password (won't be used)
            'oauth_provider' => $provider,
            'oauth_id' => $providerUser->getId(),
            'oauth_token' => $providerUser->token,
            'oauth_refresh_token' => $providerUser->refreshToken ?? null,
            'is_verified' => true, // Auto-verify Google users
            'email_verified_at' => now(),
            'terms_accepted_at' => now(), // Assume accepted when using OAuth
        ]);

        return $newUser;
    }

    /**
     * Generate unique username from name
     */
    private function generateUniqueUsername($name)
    {
        // Clean name and create base username
        $base = Str::slug(Str::lower($name));
        $base = preg_replace('/[^a-z0-9_]/', '', $base);

        // Ensure minimum length
        if (strlen($base) < 3) {
            $base = 'user_' . $base;
        }

        // Check if username exists
        $username = $base;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }

        return $username;
    }
}
