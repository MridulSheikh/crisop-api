import  express from "express";
import userController from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { CreateUserValidationSchema, forgetPasswordValidationSchema, LoginUserValidationSchema, refreshTokenValidationSchema } from "./user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "./user.interface";

const Router = express.Router()

Router.route("/create")
.post(validateRequest(CreateUserValidationSchema),userController.createUserIntoDatabseController)
Router.route("/login")
.post(validateRequest(LoginUserValidationSchema), userController.loginUserController)
Router.route("/refresh-token")
.post(validateRequest(refreshTokenValidationSchema), userController.refreshTokenController)
Router.route("/forget-password")
.post(validateRequest(forgetPasswordValidationSchema), userController.forgetPasswordController)

Router.route("/:email")
.get(auth(UserRole.admin,UserRole.user, UserRole.manager),userController.getSingleUserFromDBController)

export const UserRoute = Router;