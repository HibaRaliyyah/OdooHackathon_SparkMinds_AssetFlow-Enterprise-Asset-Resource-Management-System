import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"AssetFlow" <${process.env.SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
    // Non-fatal: don't throw, just log
  }
};

export const emailTemplates = {
  verification: (name: string, token: string) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#F8FAFC;padding:40px;border-radius:16px">
      <h2 style="color:#4F46E5">Welcome to AssetFlow, ${name}!</h2>
      <p>Your verification code is:</p>
      <div style="background:#4F46E5;color:#fff;font-size:32px;font-weight:bold;text-align:center;padding:20px;border-radius:12px;letter-spacing:8px">${token}</div>
      <p style="color:#666;margin-top:20px">This code expires in 10 minutes.</p>
    </div>
  `,
  passwordReset: (name: string, token: string) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#F8FAFC;padding:40px;border-radius:16px">
      <h2 style="color:#4F46E5">Password Reset Request</h2>
      <p>Hi ${name}, your reset code is:</p>
      <div style="background:#EF4444;color:#fff;font-size:32px;font-weight:bold;text-align:center;padding:20px;border-radius:12px;letter-spacing:8px">${token}</div>
      <p style="color:#666;margin-top:20px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `,
  maintenanceApproved: (assetName: string, recipientName: string) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#F8FAFC;padding:40px;border-radius:16px">
      <h2 style="color:#10B981">Maintenance Request Approved ✅</h2>
      <p>Hi ${recipientName}, your maintenance request for <strong>${assetName}</strong> has been approved.</p>
    </div>
  `,
  bookingConfirmed: (resourceName: string, startTime: string, recipientName: string) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#F8FAFC;padding:40px;border-radius:16px">
      <h2 style="color:#4F46E5">Booking Confirmed 📅</h2>
      <p>Hi ${recipientName}, your booking for <strong>${resourceName}</strong> starting at <strong>${startTime}</strong> has been confirmed.</p>
    </div>
  `,
};
