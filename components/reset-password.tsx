export function resetPasswordEmail(resetUrl: string) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your password</title>
  </head>

  <body style="margin:0; padding:0; background-color:#0b0f1a; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <!-- Card -->
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="max-width:520px; background-color:#111827; border-radius:16px; padding:32px;"
          >
            <!-- Brand -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:700;">
                  togethr<span style="color:#39aaaa;">.</span>
                </h1>
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td style="padding-bottom:12px;">
                <h2 style="margin:0; font-size:22px; color:#ffffff; font-weight:600;">
                  Reset your password
                </h2>
              </td>
            </tr>

            <!-- Text -->
            <tr>
              <td style="padding-bottom:24px;">
                <p style="margin:0; font-size:15px; line-height:1.6; color:#cbd5e1;">
                  We received a request to reset your password for your
                  <strong>togethr</strong> account.  
                  Click the button below to create a new password.
                </p>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a
                  href="${resetUrl}"
                  target="_blank"
                  style="
                    display:inline-block;
                    background-color:#39aaaa;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:15px;
                    font-weight:600;
                    padding:14px 28px;
                    border-radius:10px;
                  "
                >
                  Reset Password
                </a>
              </td>
            </tr>

            <!-- Fallback -->
            <tr>
              <td style="padding-bottom:20px;">
                <p style="margin:0; font-size:13px; color:#94a3b8;">
                  If the button doesn’t work, copy and paste this link into your browser:
                </p>
                <p style="margin-top:8px; font-size:13px; word-break:break-all;">
                  <a href="${resetUrl}" style="color:#39aaaa; text-decoration:none;">
                    ${resetUrl}
                  </a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #1f2937; padding-top:16px;">
                <p style="margin:0; font-size:12px; color:#64748b;">
                  This link will expire in 1 hour.  
                  If you didn’t request a password reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer text -->
          <p style="margin-top:20px; font-size:12px; color:#475569;">
            © ${new Date().getFullYear()} togethr. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
