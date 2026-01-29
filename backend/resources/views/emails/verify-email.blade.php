<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Daloy</title>
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

        <h2>Verify Your Email Address</h2>

        <p>Hi {{ $user->display_name }},</p>

        <p>Thanks for signing up for Daloy! To complete your registration and start connecting with others, please
            verify your email address by clicking the button below:</p>

        <div style="text-align: center;">
            <a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>
        </div>

        <p>This verification link will expire in 60 minutes for security reasons.</p>

        <div class="alternate-link">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a></p>
        </div>

        <p style="margin-top: 30px;">If you didn't create an account on Daloy, you can safely ignore this email.</p>

        <div class="footer">
            <p>© {{ date('Y') }} Daloy. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>

</html>