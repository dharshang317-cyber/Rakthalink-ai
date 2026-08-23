import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer Transporter
 * Supports SMTP (Gmail, SendGrid, Mailgun, Amazon SES, or custom SMTP)
 * Automatically falls back to mock logger in development if SMTP is not configured.
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    // If Gmail user is specified without custom host
    if (!host && user.includes('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }

  // Fallback transporter (logs emails to console in development)
  return null;
};

const transporter = createTransporter();

const SENDER_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@rakthalink.ai';

/**
 * Send an email safely with graceful console fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      console.log('====================================================');
      console.log(`📧 [EMAIL SERVICE - DEV MOCK]`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message Preview:\n${text || 'HTML Content Sent'}`);
      console.log('====================================================');
      return { success: true, mocked: true };
    }

    const info = await transporter.sendMail({
      from: `"RakthaLink AI" <${SENDER_EMAIL}>`,
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send blood match request email to a voluntary donor with Accept & Cancel buttons
 */
export const sendMatchRequestEmail = async ({
  donorEmail,
  donorName,
  requesterName,
  bloodGroup,
  unitsRequired = 1,
  hospitalName,
  city,
  acceptUrl,
  cancelUrl,
}) => {
  const subject = `🩸 Urgent Blood Request: You have been got the request from ${requesterName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 28px 24px; }
          .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
          .alert-box h2 { margin: 0 0 6px; font-size: 16px; color: #991b1b; font-weight: 700; }
          .alert-box p { margin: 0; font-size: 14px; color: #7f1d1d; font-weight: 600; }
          .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 26px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
          .detail-row:last-child { border-bottom: none; }
          .label { color: #64748b; font-weight: 500; }
          .value { color: #0f172a; font-weight: 700; }
          .badge { background: #dc2626; color: #fff; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 800; }
          .btn-container { text-align: center; margin: 30px 0 20px; }
          .btn { display: inline-block; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; margin: 0 8px 10px; transition: all 0.2s; }
          .btn-accept { background-color: #16a34a; color: #ffffff !important; box-shadow: 0 4px 10px rgba(22, 163, 74, 0.3); }
          .btn-cancel { background-color: #64748b; color: #ffffff !important; }
          .footer { background: #0f172a; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RakthaLink AI</h1>
            <p>Connecting Blood. Connecting Lives.</p>
          </div>
          <div class="content">
            <p style="font-size: 15px; margin-top: 0;">Hello <strong>${donorName || 'Voluntary Donor'}</strong>,</p>
            
            <div class="alert-box">
              <h2>Urgent Blood Match Request</h2>
              <p>You have been got the request from <strong>${requesterName}</strong></p>
            </div>

            <div class="details-card">
              <div class="detail-row">
                <span class="label">Patient Requester:</span>
                <span class="value">${requesterName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Blood Group Required:</span>
                <span class="value"><span class="badge">${bloodGroup}</span></span>
              </div>
              <div class="detail-row">
                <span class="label">Units Needed:</span>
                <span class="value">${unitsRequired} Unit(s)</span>
              </div>
              <div class="detail-row">
                <span class="label">Hospital / Center:</span>
                <span class="value">${hospitalName}</span>
              </div>
              <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">${city}</span>
              </div>
            </div>

            <p style="font-size: 13px; color: #475569; text-align: center; margin-bottom: 20px;">
              Please respond promptly to let the requester know if you are able to donate:
            </p>

            <div class="btn-container">
              <a href="${acceptUrl}" class="btn btn-accept">✔ Accept Request</a>
              <a href="${cancelUrl}" class="btn btn-cancel">✖ Cancel Request</a>
            </div>

            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px;">
              Your contact details remain confidential until you choose to accept this request.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 | Developed by Dharshan G</p>
            <p>RakthaLink AI Platform — Voluntary Blood Donation Coordination</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: donorEmail,
    subject,
    text: `Hello ${donorName},\n\nYou have been got the request from ${requesterName} for ${unitsRequired} unit(s) of ${bloodGroup} blood at ${hospitalName}, ${city}.\n\nAccept: ${acceptUrl}\nCancel: ${cancelUrl}\n\nRakthaLink AI`,
    html,
  });
};

/**
 * Send notification email to the blood requester when the donor responds (Accepts or Cancels)
 */
export const sendDonorResponseEmail = async ({
  requesterEmail,
  requesterName,
  donorName,
  action, // 'ACCEPT' or 'DECLINE' / 'CANCEL'
  bloodGroup,
  hospitalName,
  actionLink,
}) => {
  const isAccepted = action === 'ACCEPT';
  const subject = isAccepted
    ? `🎉 ${donorName} has accepted your request - RakthaLink AI`
    : `ℹ️ ${donorName} has canceled your request - RakthaLink AI`;

  const statusText = isAccepted
    ? `${donorName} has accepted your request`
    : `${donorName} has canceled your request`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, ${isAccepted ? '#16a34a, #15803d' : '#475569, #334155'}); padding: 30px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 800; }
          .content { padding: 28px 24px; }
          .status-box { background-color: ${isAccepted ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isAccepted ? '#bbf7d0' : '#e2e8f0'}; border-radius: 12px; padding: 18px; margin-bottom: 24px; text-align: center; }
          .status-box h2 { margin: 0 0 6px; font-size: 18px; color: ${isAccepted ? '#166534' : '#334155'}; font-weight: 700; }
          .status-box p { margin: 0; font-size: 14px; color: ${isAccepted ? '#15803d' : '#475569'}; }
          .btn-container { text-align: center; margin: 28px 0 10px; }
          .btn { display: inline-block; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; background-color: ${isAccepted ? '#16a34a' : '#dc2626'}; color: #ffffff !important; }
          .footer { background: #0f172a; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RakthaLink AI</h1>
            <p>Connecting Blood. Connecting Lives.</p>
          </div>
          <div class="content">
            <p style="font-size: 15px; margin-top: 0;">Hello <strong>${requesterName || 'Requester'}</strong>,</p>
            
            <div class="status-box">
              <h2>${isAccepted ? '🎉 Great News!' : 'Status Update'}</h2>
              <p style="font-weight: 700; font-size: 16px;">${statusText}</p>
            </div>

            <p style="font-size: 13px; color: #475569; line-height: 1.6;">
              ${isAccepted 
                ? `Voluntary donor <strong>${donorName}</strong> is ready to help for your blood request (${bloodGroup}) at <strong>${hospitalName}</strong>. You can now use the live <strong>WhatsApp-style Chat Box</strong> and schedule an appointment.`
                : `Voluntary donor <strong>${donorName}</strong> is unable to donate at this time. Our AI matching engine is continuing to match other eligible voluntary donors nearby.`}
            </p>

            ${actionLink ? `
              <div class="btn-container">
                <a href="${actionLink}" class="btn">${isAccepted ? 'Open Chat & Appointments' : 'View Matching Donors'}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© 2026 | Developed by Dharshan G</p>
            <p>RakthaLink AI Platform — Voluntary Blood Donation Coordination</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: requesterEmail,
    subject,
    text: `Hello ${requesterName},\n\n${statusText} for your request at ${hospitalName}.\n\nRakthaLink AI: ${actionLink || ''}`,
    html,
  });
};
