import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  BCRYPT_SALT: process.env.SALT_ROUNDS,
  JWT_ACCESS_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRES_ID: process.env.JWT_EXPIREIN,
  CLIENT_URL: process.env.CLIENT_URL,
  REFRESH_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  REFRESH_EXPIREIN: process.env.JWT_REFRESH_EXPIREIN,
  JWT_RESETPASSWORD_TOKEN_SECRET: process.env.JWT_RESETPASSWORD_TOKEN_SECRET,
  JWT_RESETPASSWORD_TOKEN_EXPIREIN:
    process.env.JWT_RESETPASSWORD_TOKEN_EXPIREIN,
};
