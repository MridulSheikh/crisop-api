import app from './app';
import config from './app/config';
import mongoose from 'mongoose';
import { Server } from 'http';
import colors from 'colors';
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

let server: Server;

async function main() {
  try {
    console.clear();
    console.log(colors.bold.cyan('\n🚀 Starting Crisop Server...\n'));

    // Show DB connecting once
    console.log(colors.yellow('📡 Connecting to database...'));
    await mongoose.connect(config.database_url as string,{
      serverSelectionTimeoutMS: 30000,
      family: 4
    });
    console.log(colors.green('✅ Database connection successful.'));

    // Start server
    server = app.listen(config.port || 10000, () => {
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
