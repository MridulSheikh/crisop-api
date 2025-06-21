import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import categoryValidation from "./category.validation"
import { createCategoryIntoDatabseController, deleteOneCategoryController, getAllCategoriesFromDBController, getSingleCategoryFromDbController, updateOneCateogryIntoDBController } from "./category.contorller"

const router = express.Router()

router.route("/")
.post(auth("admin", "manager"), validateRequest(categoryValidation.createCategoryValidationSchema), createCategoryIntoDatabseController)
.get(auth('admin', 'manager'), getAllCategoriesFromDBController)

router.route("/:id")
.patch(auth("admin", "manager"), validateRequest(categoryValidation.updateCategoryValidationSchema), updateOneCateogryIntoDBController)
.delete(auth("admin", "manager"), deleteOneCategoryController)
.get(auth('admin', 'manager'), getSingleCategoryFromDbController)

export default router;