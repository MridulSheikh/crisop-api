"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatBot_controller_1 = require("./chatBot.controller");
const Router = express_1.default.Router();
Router.route("/").post(chatBot_controller_1.analyzeMessageContorller);
exports.default = Router;
