import express from "express"
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createOrderSchema } from "./oreder.validation";
import { createOrderController } from "./order.controller";

const router = express.Router();


router.route("/").post(auth("admin", "manager", "user"), validateRequest(createOrderSchema), createOrderController)


export default router;