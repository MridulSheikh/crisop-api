import  express from "express";
import userController from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { changePasswordValidationSchema, CreateUserValidationSchema, forgetPasswordValidationSchema, LoginUserValidationSchema, oAuthValidationSchema, resetPasswordValidationSchema, updateMyProfileValidationSchema } from "./user.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "./user.interface";
import { upload } from "../../utils/sendImageToCloudinary";

const Router = express.Router()

Router.route("/create")
.post(validateRequest(CreateUserValidationSchema),userController.createUserIntoDatabseController)
Router.route("/login")
.post(validateRequest(LoginUserValidationSchema), userController.loginUserController)
Router.route("/refresh-token")
.post(userController.refreshTokenController)
Router.route("/forgot-password")
.post(validateRequest(forgetPasswordValidationSchema), userController.forgetPasswordController)
Router.route("/reset-password")
.post(validateRequest(resetPasswordValidationSchema),userController.resetPasswordContorller)
Router.route("/oauth")
.post(validateRequest(oAuthValidationSchema), userController.handleOAuthController)
Router.route("/change-role")
.post(auth(UserRole.admin,UserRole.super), userController.changeUserRoleController)
Router.route("/add-member")
.post(auth(UserRole.admin, UserRole.super), userController.addTeamMemberController)
Router.route("/logout-me").post(userController.logOutMeController)
Router.route("/me")
.patch(
  auth(UserRole.admin, UserRole.user, UserRole.manager, UserRole.super),
  upload.single("image"),
  validateRequest(updateMyProfileValidationSchema),
  userController.updateMyProfileController,
)
Router.route("/change-password")
.patch(
  auth(UserRole.admin, UserRole.user, UserRole.manager, UserRole.super),
  validateRequest(changePasswordValidationSchema),
  userController.changeMyPasswordController,
)

// Router.route("/email-verification/:email")
// .post(userController.createVerificationCodeController)
Router.route('/verify').post( userController.verfiyCodeController)

Router.route("/")
.get(auth(UserRole.admin, UserRole.super),userController.getAllUserFromDB)
Router.route("/:email")
.get(auth(UserRole.admin,UserRole.user, UserRole.manager),userController.getSingleUserFromDBController)



export const UserRoute = Router;
