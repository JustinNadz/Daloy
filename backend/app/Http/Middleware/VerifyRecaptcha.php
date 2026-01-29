<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\Response;

class VerifyRecaptcha
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip if reCAPTCHA is disabled (e.g., in development)
        if (!config('recaptcha.enabled')) {
            return $next($request);
        }

        // Get the token from request
        $token = $request->input('recaptcha_token');

        if (!$token) {
            return response()->json([
                'message' => 'reCAPTCHA verification is required',
                'errors' => [
                    'recaptcha_token' => ['Please complete the reCAPTCHA verification']
                ]
            ], 422);
        }

        // Verify with Google
        $recaptcha = new ReCaptcha(config('recaptcha.secret_key'));
        $response = $recaptcha->setExpectedHostname($request->getHost())
            ->verify($token, $request->ip());

        if (!$response->isSuccess()) {
            \Log::warning('reCAPTCHA verification failed', [
                'ip' => $request->ip(),
                'errors' => $response->getErrorCodes()
            ]);

            return response()->json([
                'message' => 'reCAPTCHA verification failed. Please try again.',
                'errors' => [
                    'recaptcha_token' => ['Verification failed. Please try again.']
                ]
            ], 422);
        }

        // Verification successful
        return $next($request);
    }
}
