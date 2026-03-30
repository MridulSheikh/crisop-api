import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import categoryValidation from "./category.validation"
import { createCategoryIntoDatabseController, deleteOneCategoryController, getAllCategoriesFromDBController, getSingleCategoryFromDbController, updateOneCateogryIntoDBController } from "./category.contorller"
import { UserRole } from "../user/user.interface"

const router = express.Router()

router.route("/")
.post(auth(UserRole.admin, UserRole.manager, UserRole.super), validateRequest(categoryValidation.createCategoryValidationSchema), createCategoryIntoDatabseController)
.get(getAllCategoriesFromDBController)

router.route("/:id")
.patch(auth(UserRole.admin, UserRole.manager, UserRole.super), validateRequest(categoryValidation.updateCategoryValidationSchema), updateOneCateogryIntoDBController)
.delete(auth(UserRole.admin, UserRole.manager, UserRole.super), deleteOneCategoryController)
.get(auth('admin', 'manager'), getSingleCategoryFromDbController)

export default router;