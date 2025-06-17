import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import categoryValidation from "./category.validation"
import { createCategoryIntoDatabseController, deleteOneCategoryIntoDB, getAllCategoriesFromDBController, updateOneCateogryIntoDBController } from "./category.contorller"

const router = express.Router()

router.route("/")
.post(auth("admin", "manager"), validateRequest(categoryValidation.createCategoryValidationSchema), createCategoryIntoDatabseController)
.get(auth('admin', 'manager'), getAllCategoriesFromDBController)

router.route("/:id")
.patch(auth("admin", "manager"), validateRequest(categoryValidation.updateCategoryValidationSchema), updateOneCateogryIntoDBController)
.delete(auth("admin", "manager"), deleteOneCategoryIntoDB)

export default router;