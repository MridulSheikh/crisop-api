import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createStockValidationSchema, updateStockValidationSchema } from "./stock.validation";
import { createStockeIntoDbController, getAllStockFromDBController, getSingleStockFromDBController, softDeleteController, updateStockController } from "./stock.contorller";
import { UserRole } from "../user/user.interface";


const Router = express();

Router.route('/')
.post(auth(UserRole.admin, UserRole.manager, UserRole.super), validateRequest(createStockValidationSchema), createStockeIntoDbController)
.get(auth(UserRole.admin, UserRole.manager, UserRole.super), getAllStockFromDBController)


Router.route("/:id")
.get(auth(UserRole.admin, UserRole.manager, UserRole.super), getSingleStockFromDBController)
.delete(auth(UserRole.admin, UserRole.manager, UserRole.super), softDeleteController)
.patch(auth(UserRole.admin, UserRole.manager, UserRole.super),validateRequest(updateStockValidationSchema) , updateStockController)


export default Router;