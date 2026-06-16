import nodemailer from 'nodemailer';

function createTransport() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'Email is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to your environment variables.'
    );
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

export async function sendPasswordResetEmail(toEmail, toName, resetToken) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:5173';
  const resetUrl = `${appUrl}/reset-password/${resetToken}`;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  const transport = createTransport();

  await transport.sendMail({
    from: `"HRPortal" <${from}>`,
    to: toEmail,
    subject: 'Reset your HRPortal password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:1.5rem;font-weight:900;color:white;letter-spacing:0.05em">HR</span>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:0.9rem">HRPortal</p>
        </div>
        <h2 style="color:#0F172A;margin:0 0 8px">Password Reset Request</h2>
        <p style="color:#64748B;margin:0 0 24px">Hi ${toName}, we received a request to reset your password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:1rem">
          Reset Password
        </a>
        <p style="color:#94A3B8;margin:24px 0 0;font-size:0.85rem">
          This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:24px 0"/>
        <p style="color:#CBD5E1;font-size:0.75rem;margin:0">
          If the button above doesn't work, copy and paste this URL into your browser:<br/>
          <span style="color:#6366F1">${resetUrl}</span>
        </p>
      </div>
    `
  });
}
