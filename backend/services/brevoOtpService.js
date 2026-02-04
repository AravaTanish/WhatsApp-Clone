import tranEmailApi from "../config/brevo.js";

export async function sendWhatsAppEmailOTP(email, otp) {
  try {
    const sender = {
      email: process.env.EMAIL_USER,
      name: "WhatsApp Clone",
    };

    const htmlContent = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
              Roboto, Helvetica, Arial, sans-serif;
              background:#f2f4f7; padding:32px 16px;">
    
    <div style="max-width:560px; margin:0 auto; background:#ffffff;
                padding:32px; border-radius:12px;
                box-shadow:0 8px 24px rgba(0,0,0,0.06);">

      <h2 style="margin:0 0 12px; font-weight:600; color:#111;">
        Verify your email address
      </h2>

      <p style="margin:0 0 20px; color:#444; font-size:15px;">
        Use the verification code below to securely sign in to your account.
      </p>

      <div style="text-align:center; margin:28px 0;">
        <span style="
          display:inline-block;
          padding:14px 28px;
          font-size:24px;
          font-weight:600;
          letter-spacing:6px;
          color:#111;
          background:#f5f7fa;
          border-radius:8px;
        ">
          ${otp}
        </span>
      </div>

      <p style="margin:0 0 8px; color:#444; font-size:14px;">
        This code will expire in <strong>10 minutes</strong>.
      </p>

      <p style="margin:0; color:#666; font-size:13px;">
        If you didn’t request this code, you can safely ignore this email.
      </p>

      <hr style="border:none; border-top:1px solid #eaeaea; margin:28px 0;" />

      <p style="margin:0; font-size:12px; color:#999;">
        WhatsApp Clone • Secure authentication
      </p>

    </div>
  </div>
`;

    await tranEmailApi.sendTransacEmail({
      sender,
      to: [{ email }],
      subject: "Your WhatsApp Clone verification code",
      htmlContent,
    });

    console.log(`WhatsApp OTP sent to ${email}`);
  } catch (err) {
    console.error("Email OTP error:", err);
    throw new Error("OTP email failed");
  }
}
