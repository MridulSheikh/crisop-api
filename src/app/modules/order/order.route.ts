import express from "express"
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createOrderSchema, toggleStatusValidationSchema } from "./oreder.validation";
import { createOrderController } from "./order.controller";
import { toggleFeaturedController } from "../product/product.controller";

const router = express.Router();


router.route("/").post(auth("admin", "manager", "user"), validateRequest(createOrderSchema), createOrderController)

router.route("/toggle")
.patch(auth("admin", "manager", "user"), validateRequest(toggleStatusValidationSchema) , toggleFeaturedController)

export default router;