import nodemailer from 'nodemailer';
import config from '../config';

export const transporter = nodemailer.createTransport({
  service: config.SMTP_SERVICE,
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: false,
  auth: {
    user: config.SMTP_EMAIL,
    pass: config.SMTP_PASS,
  },
});

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
