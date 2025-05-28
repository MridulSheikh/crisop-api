import app from './app';
import config from './app/config';
import mongoose from 'mongoose';
import { Server } from 'http';
import { transporter } from './app/helpers/email';
import AppError from './app/errors/AppError';
import colors from 'colors';

let server: Server;

async function main() {
  try {
    console.clear();
    console.log(colors.bold.cyan('\n🚀 Starting Crisop Server...\n'));

    // Show DB connecting once
    console.log(colors.yellow('📡 Connecting to database...'));
    await mongoose.connect(config.database_url as string);
    console.log(colors.green('✅ Database connection successful.'));

    // Verify SMTP once
    console.log(colors.yellow('📧 Verifying SMTP server...'));
    transporter.verify((error, success) => {
      if (error) {
        console.log(colors.red('❌ SMTP server connection failed.'));
        console.error(error);
        throw new AppError(403, 'SMTP server not connected!');
      } else {
        console.log(colors.green('✅ SMTP server is running.\n'));
      }
    });

    // Start server
    server = app.listen(config.port, () => {
      console.log(colors.bold.green('🎉 Crisop App Booted Successfully!\n'));

      console.group(colors.bold('🔧 Environment Details'));
      console.log(
        '📦 Mode  :',
        colors.bgBlue.white(` ${config.NODE_ENV!.toUpperCase()} `),
      );
      console.log(
        '🌐 URL   :',
        colors.underline.green(`http://localhost:${config.port}`),
      );
      console.log('📡 Port  :', colors.yellow(config.port as string));
      console.groupEnd();

      console.log(colors.bold.green('\n✅ Server is up and running!\n'));
    });
  } catch (error) {
    console.log(colors.red('❌ Failed to start the application.'));
    console.error(error);
  }
}

main();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(colors.red('\n⚠️ Unhandled Rejection detected, shutting down...'));
  console.error(err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(colors.red('\n💥 Uncaught Exception detected, shutting down...'));
  console.error(err);
  process.exit(1);
});
