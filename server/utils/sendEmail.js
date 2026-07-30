import nodemailer from "nodemailer";

const hasSmtpConfig = () =>
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporterSingleton = null;

const getTransporter = () => {
  if (!transporterSingleton) {
    transporterSingleton = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000, // 5 seconds connection timeout
      greetingTimeout: 5000,   // 5 seconds greeting timeout
      socketTimeout: 5000,     // 5 seconds socket inactivity timeout
    });
  }
  return transporterSingleton;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP environment variables are not configured.");
    }

    return false;
  }

  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || "GaramBazaar <no-reply@GaramBazaar.local>",
      to,
      subject,
      html,
      text,
    });
    console.log(`Email successfully sent to ${to} (Subject: "${subject}")`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to} (Subject: "${subject}"):`, error.message);
    throw error;
  }
};
