import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Update this to your verified domain email
const FROM_EMAIL = 'isssue <noreply@isssue.ink>';

export async function sendInviteEmail({
  to,
  inviterName,
  zineName,
  appUrl,
}: {
  to: string;
  inviterName: string;
  zineName: string;
  appUrl: string;
}) {
  const loginUrl = `${appUrl}/login?email=${encodeURIComponent(to)}`;
  
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${inviterName} invited you to "${zineName}" on isssue`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f3eb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; font-size: 28px; font-weight: 600; margin: 0; font-family: Georgia, serif;">isssue</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #1a1a1a; font-size: 18px; margin: 0 0 8px 0;">
                You're invited! 🎉
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                <strong>${inviterName}</strong> wants you to join <strong>"${zineName}"</strong> — a monthly collaborative zine where friends each get a page.
              </p>
              
              <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Every month, everyone creates their own page in secret. When the issue drops, you all get to see each other's pages for the first time. ✨
              </p>
              
              <!-- CTA Button -->
              <a href="${loginUrl}" style="display: block; background: #1a1a1a; color: white; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-size: 16px; font-weight: 500; text-align: center; margin-bottom: 24px;">
                Join ${zineName} →
              </a>
              
              <p style="color: #999; font-size: 13px; margin: 0;">
                Or copy this link: <br>
                <a href="${loginUrl}" style="color: #666; word-break: break-all;">${loginUrl}</a>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="padding: 24px 32px; background: #faf9f6; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                isssue — Create together, reveal together
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `,
    text: `
${inviterName} invited you to "${zineName}" on isssue!

isssue is a monthly collaborative zine where friends each get a page. Every month, everyone creates their own page in secret. When the issue drops, you all get to see each other's pages for the first time.

Join here: ${loginUrl}

---
isssue — Create together, reveal together
    `.trim(),
  });

  if (error) {
    console.error('Failed to send invite email:', error);
    throw error;
  }

  return data;
}
