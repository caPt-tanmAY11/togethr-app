// emails/collaborationAcceptedEmail.ts

type CollaborationAcceptedEmailProps = {
  recipientName: string;
  projectTitle: string;
  projectUrl: string;
};

export function collaborationAcceptedEmail({
  recipientName,
  projectTitle,
  projectUrl,
}: CollaborationAcceptedEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Collaboration Request Accepted</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background-color:#0b0f1a;
      font-family:'Inter', -apple-system, BlinkMacSystemFont,
                   'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <!-- Card -->
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
              max-width:520px;
              background-color:#111827;
              border-radius:16px;
              padding:32px;
            "
          >
            <!-- Brand -->
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1
                  style="
                    margin:0;
                    font-size:28px;
                    color:#ffffff;
                    font-weight:700;
                  "
                >
                  togethr<span style="color:#39aaaa;">.</span>
                </h1>
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td style="padding-bottom:12px;">
                <h2
                  style="
                    margin:0;
                    font-size:22px;
                    color:#ffffff;
                    font-weight:600;
                  "
                >
                  Collaboration request accepted 🎉
                </h2>
              </td>
            </tr>

            <!-- Message -->
            <tr>
              <td style="padding-bottom:24px;">
                <p
                  style="
                    margin:0;
                    font-size:15px;
                    line-height:1.6;
                    color:#cbd5e1;
                  "
                >
                  Hi <strong>${recipientName}</strong>,
                </p>

                <p
                  style="
                    margin-top:12px;
                    font-size:15px;
                    line-height:1.6;
                    color:#cbd5e1;
                  "
                >
                  Great news! Your collaboration request for the project
                  <strong>“${projectTitle}”</strong> has been accepted.
                </p>

                <p
                  style="
                    margin-top:12px;
                    font-size:15px;
                    line-height:1.6;
                    color:#cbd5e1;
                  "
                >
                  You can now start collaborating with the project owner and
                  contribute to building something awesome together.
                </p>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a
                  href="${projectUrl}"
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
                  View Project
                </a>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top:1px solid #1f2937; padding-top:16px;">
                <p
                  style="
                    margin:0;
                    font-size:12px;
                    color:#64748b;
                  "
                >
                  If you believe this was a mistake, you can safely ignore this
                  email.
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer text -->
          <p
            style="
              margin-top:20px;
              font-size:12px;
              color:#475569;
            "
          >
            © ${new Date().getFullYear()} togethr. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
