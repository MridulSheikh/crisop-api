import app from './app';
import confiq from './app/config';
import mongoose from 'mongoose';
import { Server } from 'http';
import { transporter } from './app/helpers/email';
import AppError from './app/errors/AppError';

let server: Server;

async function main() {
  try {
    await mongoose.connect(confiq.database_url as string);
    server = app.listen(confiq.port, () => {
      console.log(`Example app listening on port ${confiq.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
    throw new AppError(403, 'SMTP server not connected!');
  } else {
    console.log('SMTP server runnig....');
  }
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('⚠️ unhandledRejection is detected, shutting down server.....');
  if (Server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log('⚠️ uncaughtException is detected, shuttin down server.....');
  process.exit(1);
});
