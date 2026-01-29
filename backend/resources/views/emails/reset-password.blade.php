<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Daloy</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }

        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .logo {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo h1 {
            color: #3b82f6;
            font-size: 32px;
            margin: 0;
        }

        h2 {
            color: #1f2937;
            font-size: 24px;
            margin-bottom: 20px;
        }

        p {
            color: #4b5563;
            margin-bottom: 20px;
        }

        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }

        .button:hover {
            background-color: #2563eb;
        }

        .alternate-link {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }

        .alternate-link a {
            color: #3b82f6;
            word-break: break-all;
        }

        .security-notice {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .security-notice p {
            color: #92400e;
            margin: 0;
            font-size: 14px;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="logo">
            <h1>Daloy</h1>
        </div>

        <h2>Reset Your Password</h2>

        <p>Hi there,</p>

        <p>We received a request to reset the password for your Daloy account. If you made this request, click the
            button below to reset your password:</p>

        <div style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">Reset Password</a>
        </div>

        <div class="security-notice">
            <p><strong>⚠️ Security Notice:</strong> This password reset link will expire in 60 minutes. If you didn't
                request this, please ignore this email and your password will remain unchanged.</p>
        </div>

        <div class="alternate-link">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="{{ $resetUrl }}">{{ $resetUrl }}</a></p>
        </div>

        <p style="margin-top: 30px;">If you didn't request a password reset, please secure your account by changing your
            password immediately and consider enabling two-factor authentication.</p>

        <div class="footer">
            <p>© {{ date('Y') }} Daloy. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>

</html>