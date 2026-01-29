<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class TwoFactorController extends Controller
{
    use ApiResponse;

    /**
     * Enable two-factor authentication (step 1: generate QR code)
     */
    public function enable(Request $request)
    {
        $user = $request->user();

        // If already enabled, return error
        if ($user->two_factor_enabled_at) {
            return $this->error('Two-factor authentication is already enabled', 400);
        }

        $google2fa = new Google2FA();

        // Generate secret key
        $secret = $google2fa->generateSecretKey();

        // Generate QR Code URL
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        // Generate SVG QR code
        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $qrCodeSvg = $writer->writeString($qrCodeUrl);

        // Generate recovery codes
        $recoveryCodes = $this->generateRecoveryCodes();

        // Store secret and recovery codes (not enabled yet - waiting for confirmation)
        $user->two_factor_secret = encrypt($secret);
        $user->two_factor_recovery_codes = encrypt(json_encode($recoveryCodes));
        $user->save();

        return $this->success([
            'qr_code_svg' => $qrCodeSvg,
            'secret' => $secret, // Show for manual entry
            'recovery_codes' => $recoveryCodes,
        ], 'Scan the QR code with your authenticator app');
    }

    /**
     * Confirm and activate two-factor authentication (step 2: verify code)
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->two_factor_secret) {
            return $this->error('Two-factor authentication setup not started', 400);
        }

        if ($user->two_factor_enabled_at) {
            return $this->error('Two-factor authentication is already enabled', 400);
        }

        $google2fa = new Google2FA();
        $secret = decrypt($user->two_factor_secret);

        // Verify the code
        $valid = $google2fa->verifyKey($secret, $request->code);

        if (!$valid) {
            return $this->error('Invalid verification code. Please try again.', 400);
        }

        // Enable 2FA
        $user->two_factor_enabled_at = now();
        $user->save();

        return $this->success([
            'message' => 'Two-factor authentication has been enabled successfully',
            'enabled_at' => $user->two_factor_enabled_at,
        ]);
    }

    /**
     * Disable two-factor authentication
     */
    public function disable(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return $this->error('Invalid password', 401);
        }

        if (!$user->two_factor_enabled_at) {
            return $this->error('Two-factor authentication is not enabled', 400);
        }

        // Disable 2FA
        $user->two_factor_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_enabled_at = null;
        $user->save();

        return $this->success([
            'message' => 'Two-factor authentication has been disabled',
        ]);
    }

    /**
     * Verify two-factor code during login
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();

        if (!$user->two_factor_enabled_at) {
            return $this->error('Two-factor authentication is not enabled', 400);
        }

        $google2fa = new Google2FA();
        $secret = decrypt($user->two_factor_secret);

        // Check if it's a recovery code
        if (strlen($request->code) > 6) {
            return $this->verifyRecoveryCode($user, $request->code);
        }

        // Verify TOTP code
        $valid = $google2fa->verifyKey($secret, $request->code, 2); // 2 = tolerance window

        if (!$valid) {
            return $this->error('Invalid verification code', 400);
        }

        return $this->success([
            'verified' => true,
            'message' => 'Two-factor authentication verified',
        ]);
    }

    /**
     * Verify recovery code
     */
    private function verifyRecoveryCode($user, $code)
    {
        $recoveryCodes = json_decode(decrypt($user->two_factor_recovery_codes), true);

        if (!in_array($code, $recoveryCodes)) {
            return $this->error('Invalid recovery code', 400);
        }

        // Remove used recovery code
        $recoveryCodes = array_filter($recoveryCodes, function ($recoveryCode) use ($code) {
            return $recoveryCode !== $code;
        });

        // Update recovery codes
        $user->two_factor_recovery_codes = encrypt(json_encode(array_values($recoveryCodes)));
        $user->save();

        return $this->success([
            'verified' => true,
            'message' => 'Recovery code accepted. Please save your remaining codes.',
            'remaining_codes' => count($recoveryCodes),
        ]);
    }

    /**
     * Get current 2FA status
     */
    public function status(Request $request)
    {
        $user = $request->user();

        return $this->success([
            'enabled' => !is_null($user->two_factor_enabled_at),
            'enabled_at' => $user->two_factor_enabled_at,
        ]);
    }

    /**
     * Generate recovery codes
     */
    private function generateRecoveryCodes($count = 8)
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(Str::random(5) . '-' . Str::random(5));
        }
        return $codes;
    }
}
