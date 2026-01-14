// emails/hackTeamRequestRejectedEmail.ts

type HackTeamRequestRejectedEmailProps = {
  recipientName: string;
  teamName: string;
  teamUrl?: string;
};

export function hackTeamRequestRejectedEmail({
  recipientName,
  teamName,
  teamUrl,
}: HackTeamRequestRejectedEmailProps) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Request Update</title>
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
                  Team request update
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
                  Thanks for your interest in joining the team
                  <strong>“${teamName}”</strong>.
                </p>

                <p
                  style="
                    margin-top:12px;
                    font-size:15px;
                    line-height:1.6;
                    color:#cbd5e1;
                  "
                >
                  Unfortunately, your request was not approved this time.
                  This doesn’t reflect your skills or potential — teams often
                  make decisions based on timing, availability, or specific
                  requirements.
                </p>

                <p
                  style="
                    margin-top:12px;
                    font-size:15px;
                    line-height:1.6;
                    color:#cbd5e1;
                  "
                >
                  Don’t get discouraged — there are many other teams and
                  projects actively looking for collaborators.
                </p>
              </td>
            </tr>

            ${
              teamUrl
                ? `
            <!-- CTA -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <a
                  href="${teamUrl}"
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
                  Explore more teams
                </a>
              </td>
            </tr>
            `
                : ""
            }

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
                  You’re receiving this email because you requested to join a
                  team on togethr.
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
