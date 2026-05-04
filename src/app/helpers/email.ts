import config from '../config';
import { Resend } from 'resend';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

const resend = new Resend(config.RESEND_API);

export const sendEmail = async (_to: string, subject: string, html: string) => {
  try {
    const data = await resend.emails.send({
      from: config.SMTP_EMAIL as string,
      to: "crisop.freshfood@gmail.com", // this is for testing | can't send email to user with out using real domain
      subject,
      html,
    });
    if(data.error?.statusCode){
      throw new AppError(data.error?.statusCode, data.error.message)
    }
    return data;
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong!');
  }
};

export default sendEmail;
