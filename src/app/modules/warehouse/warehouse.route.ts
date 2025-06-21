import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createWarehouseValidationSchema } from "./warehouse.validation";
import { createWarehouseIntoDbController, deleteWarehouseController, getAllWarehouseFromDbController, getSingleWareHouseByIdFromDBController, updateWarehouseIntoDbController } from "./warehouse.controller";
import { UpdateUserValidatonSchema } from "../user/user.validation";

const Router = express();


Router.route("/")
.post(auth("admin", "manager"), validateRequest(createWarehouseValidationSchema), createWarehouseIntoDbController)
.get(auth("admin", "manager"), getAllWarehouseFromDbController)

Router.route("/:id")
.delete(auth("admin", "manager"), deleteWarehouseController)
.get(auth("admin", "manager"), getSingleWareHouseByIdFromDBController)
.patch(auth("admin", "manager"), validateRequest(UpdateUserValidatonSchema), updateWarehouseIntoDbController)
export default Router;