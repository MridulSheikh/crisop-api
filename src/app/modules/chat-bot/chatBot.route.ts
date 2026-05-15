import express from "express"
import { analyzeMessageContorller } from "./chatBot.controller"


const Router = express.Router()

Router.route("/").post(analyzeMessageContorller)

export default Router;