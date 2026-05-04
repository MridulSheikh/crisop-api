import nodemailer from 'nodemailer';
import config from '../config';

export const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST, // smtp.gmail.com
  port: Number(config.SMTP_PORT), // 587 or 465
  secure: Number(config.SMTP_PORT) === 465, // auto adjust
  family: 4, // 🔥 IMPORTANT: force IPv4 (fix ENETUNREACH)
  auth: {
    user: config.SMTP_EMAIL,
    pass: config.SMTP_PASS,
  },
} as any);

const sendEmail = async (to: string, subject: string, body: string) => {
  const senderInfoData = {
    from: `"Crisop" <${config.SMTP_EMAIL}>`,
    to: to,
    subject: subject,
    html: body,
  };
  await transporter.sendMail(senderInfoData);
};

export default sendEmail;
