module.exports.forgotMessage = (code, siteUrl) => {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007BFF;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 24px;
        }
        .body {
            padding: 20px;
            color: #333333;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            background-color: #007BFF;
            color: white !important;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background: #f4f4f4;
            color: #888888;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            Password Reset Request
        </div>
        <div class="body">
            <p>We received a request to reset your password. Click the button below to proceed with resetting your password. This link will expire in 10 minutes.</p>
            <p style="text-align: center;">
                <a href="${siteUrl}/${code}" class="button">Reset Password</a>
            </p>
            <p>If you didn't request this, you can safely ignore this email. Your password will not change until you access the link above and create a new one.</p>
            <p>Stay safe,</p>
            <p><strong>${process.env.hospital_name}</strong></p>
        </div>
    </div>
</body>
</html>
`
}
