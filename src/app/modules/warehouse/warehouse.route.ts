import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createWarehouseValidationSchema } from "./warehouse.validation";
import { createWarehouseIntoDbController, deleteWarehouseController, getAllWarehouseFromDbController, getSingleWareHouseByIdFromDBController, updateWarehouseIntoDbController } from "./warehouse.controller";
import { UpdateUserValidatonSchema } from "../user/user.validation";
import { UserRole } from "../user/user.interface";

const Router = express();


Router.route("/")
.post(auth(UserRole.admin, UserRole.manager, UserRole.super), validateRequest(createWarehouseValidationSchema), createWarehouseIntoDbController)
.get(auth(UserRole.admin, UserRole.manager, UserRole.super), getAllWarehouseFromDbController)

Router.route("/:id")
.delete(auth(UserRole.admin, UserRole.manager, UserRole.super), deleteWarehouseController)
.get(auth("admin", "manager"), getSingleWareHouseByIdFromDBController)
.patch(auth(UserRole.admin, UserRole.manager, UserRole.super), validateRequest(UpdateUserValidatonSchema), updateWarehouseIntoDbController)
export default Router;