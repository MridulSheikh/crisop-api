import express from "express"
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createOrderSchema, toggleStatusValidationSchema } from "./oreder.validation";
import { canceledOrderController, createOrderController, getAllOrderFromDBController, getMyOrderController } from "./order.controller";
import { toggleFeaturedController } from "../product/product.controller";
import { UserRole } from "../user/user.interface";

const router = express.Router();


router.route("/").post(auth(UserRole.admin, UserRole.user, UserRole.manager, UserRole.super), validateRequest(createOrderSchema), createOrderController)
.get(auth(UserRole.admin, UserRole.manager, UserRole.super), getAllOrderFromDBController)

router.route("/my-orders").get(auth(UserRole.admin, UserRole.user, UserRole.manager, UserRole.super), getMyOrderController)

router.route("/toggle")
.patch(auth("admin", "manager", "user"), validateRequest(toggleStatusValidationSchema) , toggleFeaturedController)

router.route("/:id/cancel").patch(auth(UserRole.admin, UserRole.user, UserRole.manager, UserRole.super), canceledOrderController)


export default router;