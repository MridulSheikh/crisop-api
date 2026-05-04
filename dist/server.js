"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const mongoose_1 = __importDefault(require("mongoose"));
const colors_1 = __importDefault(require("colors"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["1.1.1.1", "8.8.8.8"]);
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.clear();
            console.log(colors_1.default.bold.cyan('\n🚀 Starting Crisop Server...\n'));
            // Show DB connecting once
            console.log(colors_1.default.yellow('📡 Connecting to database...'));
            yield mongoose_1.default.connect(config_1.default.database_url, {
                serverSelectionTimeoutMS: 30000,
                family: 4
            });
            console.log(colors_1.default.green('✅ Database connection successful.'));
            // Start server
            server = app_1.default.listen(config_1.default.port || 10000, () => {
                console.log(colors_1.default.bold.green('🎉 Crisop App Booted Successfully!\n'));
                console.group(colors_1.default.bold('🔧 Environment Details'));
                console.log('📦 Mode  :', colors_1.default.bgBlue.white(` ${config_1.default.NODE_ENV.toUpperCase()} `));
                console.log('🌐 URL   :', colors_1.default.underline.green(`http://localhost:${config_1.default.port}`));
                console.log('📡 Port  :', colors_1.default.yellow(config_1.default.port));
                console.groupEnd();
                console.log(colors_1.default.bold.green('\n✅ Server is up and running!\n'));
            });
        }
        catch (error) {
            console.log(colors_1.default.red('❌ Failed to start the application.'));
            console.error(error);
        }
    });
}
main();
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(colors_1.default.red('\n⚠️ Unhandled Rejection detected, shutting down...'));
    console.error(err);
    if (server) {
        server.close(() => process.exit(1));
    }
    else {
        process.exit(1);
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(colors_1.default.red('\n💥 Uncaught Exception detected, shutting down...'));
    console.error(err);
    process.exit(1);
});
