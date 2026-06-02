// backend/utils/email.js
const nodemailer = require("nodemailer");

const isDev = process.env.NODE_ENV !== "production";

// ─────────────────────────────────────────────────────────────────────────────
// DEV — Ethereal
// ─────────────────────────────────────────────────────────────────────────────
let _etherealTransporter = null;

async function getEtherealTransporter() {
  if (_etherealTransporter) return _etherealTransporter;
  const testAccount = await nodemailer.createTestAccount();
  _etherealTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log("\n📬 Ethereal test account created:");
  console.log("   User:", testAccount.user);
  console.log("   Pass:", testAccount.pass);
  console.log("   Web:  https://ethereal.email/messages  (view sent emails)\n");
  return _etherealTransporter;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROD — Resend via SMTP bridge
// ─────────────────────────────────────────────────────────────────────────────
let _prodTransporter = null;

function getProdTransporter() {
  if (_prodTransporter) return _prodTransporter;

  if (process.env.RESEND_API_KEY) {
    _prodTransporter = nodemailer.createTransport({
      host:   "smtp.resend.com",
      port:   465,
      secure: true,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    });
    console.log("✅ Email: using Resend (SMTP bridge)");
    return _prodTransporter;
  }

  _prodTransporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || "smtp.gmail.com",
    port:   parseInt(process.env.EMAIL_PORT || "465"),
    secure: process.env.EMAIL_SECURE !== "false",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { minVersion: "TLSv1.2" },
  });

  _prodTransporter.verify((err) => {
    if (err) console.warn("⚠️  SMTP transporter not ready:", err.message);
    else     console.log("✅ Email: using SMTP —", process.env.EMAIL_USER);
  });

  return _prodTransporter;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared send helper
// ─────────────────────────────────────────────────────────────────────────────
async function sendMail(to, subject, text, html) {
  const from = process.env.EMAIL_FROM
    || (isDev ? "SmartFinance <test@smartfinance.dev>" : `"SmartFinance" <${process.env.EMAIL_USER}>`);

  if (isDev) {
    const transport = await getEtherealTransporter();
    const info      = await transport.sendMail({ from, to, subject, text, html });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n${"─".repeat(60)}`);
    console.log(`📨 Email sent (Ethereal preview):`);
    console.log(`   To     : ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Preview: ${previewUrl}`);
    console.log(`${"─".repeat(60)}\n`);
    return info;
  }

  const transport = getProdTransporter();
  return transport.sendMail({ from, to, subject, text, html });
}

// ─────────────────────────────────────────────────────────────────────────────
// OTP email
// ─────────────────────────────────────────────────────────────────────────────
async function sendOTPEmail(toEmail, otp, userName = "User") {
  if (isDev) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`🔑  OTP for ${toEmail}: ${otp}`);
    console.log(`${"─".repeat(60)}\n`);
  }

  await sendMail(
    toEmail,
    "Your SmartFinance OTP Code",
    `Your OTP is: ${otp}\nValid for 5 minutes. Do not share it.`,
    `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f7f9fb;padding:32px;border-radius:12px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:linear-gradient(135deg,#1A5F3D,#3FAF7D);padding:12px 28px;border-radius:10px;">
      <span style="color:#fff;font-size:20px;font-weight:bold;">SmartFinance</span>
    </div>
  </div>
  <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Hi ${userName},</h2>
    <p style="color:#6b7280;margin:0 0 24px;">Your one-time verification code is:</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;background:#f0faf4;border:2px dashed #1A5F3D;border-radius:12px;padding:16px 32px;font-size:36px;font-weight:bold;color:#1A5F3D;letter-spacing:8px;">${otp}</span>
    </div>
    <p style="color:#6b7280;font-size:13px;text-align:center;">Valid for <strong>5 minutes</strong>. Do not share this code.</p>
  </div>
  <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px;">SmartFinance — Your trusted financial partner</p>
</div>`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Welcome email
// ─────────────────────────────────────────────────────────────────────────────
async function sendWelcomeEmail(toEmail, userName = "User") {
  await sendMail(
    toEmail,
    "Welcome to SmartFinance!",
    `Welcome, ${userName}! Your account is verified and ready to use.`,
    `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f7f9fb;padding:32px;border-radius:12px;">
  <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="color:#1A5F3D;">Welcome, ${userName}! 🎉</h2>
    <p style="color:#6b7280;">Your SmartFinance account is verified. Start your financial journey today.</p>
  </div>
</div>`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Password reset email
// ─────────────────────────────────────────────────────────────────────────────
async function sendPasswordResetEmail(toEmail, resetLink, userName = "User") {
  if (isDev) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`🔒  Password reset link for ${toEmail}:`);
    console.log(`    ${resetLink}`);
    console.log(`${"─".repeat(60)}\n`);
  }

  await sendMail(
    toEmail,
    "Reset Your SmartFinance Password",
    `Hi ${userName},\n\nClick the link below to reset your password (valid for 15 minutes):\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
    `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#f7f9fb;padding:32px;border-radius:12px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:linear-gradient(135deg,#1A5F3D,#3FAF7D);padding:12px 28px;border-radius:10px;">
      <span style="color:#fff;font-size:20px;font-weight:bold;">SmartFinance</span>
    </div>
  </div>
  <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">Hi ${userName},</h2>
    <p style="color:#6b7280;margin:0 0 24px;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetLink}"
        style="display:inline-block;background:linear-gradient(135deg,#1A5F3D,#2D7A4E);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:16px;font-weight:bold;">
        Reset Password
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:8px;">
      This link expires in <strong>15 minutes</strong>.
    </p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="color:#9ca3af;font-size:12px;">
      If you didn't request a password reset, you can safely ignore this email. Your password won't change.
    </p>
  </div>
  <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px;">SmartFinance — Your trusted financial partner</p>
</div>`
  );
}

module.exports = { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail };