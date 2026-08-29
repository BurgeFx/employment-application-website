import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import env from '../env.js';

dotenv.config({ quiet: true });

const emailUser = env.NODEMAILER_USERNAME || process.env.NODEMAILER_USERNAME;
const emailPass = env.NODEMAILER_PASSWORD || process.env.NODEMAILER_PASSWORD;

const dummyTransporter = {
  verify: (callback) => {
    console.log('Email verification: dummy transporter (missing SMTP credentials)');
    callback(null, false);
  },
  sendMail: async (options) => {
    console.log('Email would be sent:', options);
    return { messageId: 'dummy-' + Date.now() };
  }
};

const transporter = emailUser && emailPass
  ? nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      pool: true,
    })
  : dummyTransporter;

transporter.verify((error, success) => {
  if (error) {
    console.error('Email verification failed:', error.message || error);
    return;
  }

  if (success === false) {
    console.warn('Email server verification returned false');
    return;
  }

  console.log('Email server is ready to send messages');
});

export const emailTemplate = (name = 'Applicant') => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application Submitted</title>
  </head>
  <body style="margin:0; padding:36px 18px; background:#f7f8fa; font-family:Arial, sans-serif; color:#233247;">
    <div style="max-width:980px; margin:0 auto; background:#ffffff; border:1px solid #e8ebef; border-radius:24px; overflow:hidden; box-shadow:0 24px 70px rgba(16,43,78,0.10);">
      <div style="padding:44px 7% 30px; background:#102b4e; text-align:center; color:#ffffff;">
        <p style="margin:0 0 10px; color:#c69a3a; font-size:12px; letter-spacing:0.16em; font-weight:700; text-transform:uppercase;">
          Body Mind And Soul
        </p>
        <h1 style="margin:0; font-size:clamp(2.2rem,4vw,3.4rem); color:#ffffff; font-family:Georgia, serif;">
          Application Submitted
        </h1>
        <p style="margin:10px 0 0; color:#c7d4e2; font-size:16px;">
          Your application has been received successfully.
        </p>
      </div>

      <div style="padding:32px 7%;">
        <p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#233247;">
          Dear ${name},
        </p>

        <p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#233247;">
          Thank you for submitting your application. We have received your information and supporting documents successfully.
        </p>

        <p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#233247;">
          Our team will review your application and contact you soon regarding the next steps in the hiring process.
        </p>

        <div style="margin:24px 0; padding:16px 18px; border-left:4px solid #c69a3a; background:#f5ead0; border-radius:8px;">
          <p style="margin:0; font-size:15px; color:#102b4e; font-weight:700;">
            Status: Submitted
          </p>
        </div>

        <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#233247;">
          If you have any questions, please reply to this email and our team will be happy to assist you.
        </p>

        <p style="margin:0; font-size:16px; line-height:1.7; color:#233247;">
          Sincerely,<br />
          <strong style="color:#102b4e;">Body Mind And Soul Hiring Team</strong>
        </p>
      </div>

      <div style="padding:18px 24px; background:#f8fafc; text-align:center; font-size:12px; color:#6b7280;">
        © 2026 Body Mind And Soul. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;

export const sendApplicationSubmittedEmail = async ({ to, name }) => {
  if (!emailUser || !emailPass) {
    console.warn('Email not sent: SMTP credentials missing.');
    return { messageId: 'disabled' };
  }

  const mailOptions = {
    from: `"Body Mind And Soul" <${emailUser}>`,
    to,
    subject: 'Your application has been submitted successfully',
    html: emailTemplate(name),
  };

  return transporter.sendMail(mailOptions);
};

export default transporter;

