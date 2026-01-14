export function verifyEmailTemplate(verifyUrl: string) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email</title>
  </head>

  <body style="margin:0; padding:0; background-color:#0b0f1a; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="max-width:520px; background-color:#111827; border-radius:16px; padding:32px;"
          >
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:700;">
                  togethr<span style="color:#39aaaa;">.</span>
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding-bottom:12px;">
                <h2 style="margin:0; font-size:22px; color:#ffffff; font-weight:600;">
                  Verify your email address
                </h2>
              </td>
            </tr>

            <tr>
              <td style="padding-bottom:24px;">
                <p style="margin:0; font-size:15px; line-height:1.6; color:#cbd5e1;">
                  Thanks for signing up for <strong>togethr</strong>!  
                  Please confirm your email address to activate your account and start collaborating.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a
                  href="${verifyUrl}"
                  target="_blank"
                  style="
                    display:inline-block;
                    background-color:#39aaaa;
                    color: #ffffff;
                    text-decoration:none;
                    font-size:15px;
                    font-weight:600;
                    padding:14px 28px;
                    border-radius:10px;
                  "
                >
                  Verify Email
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding-bottom:20px;">
                <p style="margin:0; font-size:13px; color:#94a3b8;">
                  If the button doesn’t work, copy and paste this link into your browser:
                </p>
                <p style="margin-top:8px; font-size:13px; word-break:break-all;">
                  <a href="${verifyUrl}" style="color:#39aaaa; text-decoration:none;">
                    ${verifyUrl}
                  </a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="border-top:1px solid #1f2937; padding-top:16px;">
                <p style="margin:0; font-size:12px; color:#64748b;">
                  This link will expire in 24 hours.  
                  If you didn’t create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>

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
