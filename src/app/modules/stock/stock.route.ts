import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { createStockValidationSchema, updateStockValidationSchema } from "./stock.validation";
import { createStockeIntoDbController, getAllStockFromDBController, getSingleStockFromDBController, softDeleteController, updateStockController } from "./stock.contorller";


const Router = express();

Router.route('/')
.post(auth("admin", "manager"), validateRequest(createStockValidationSchema), createStockeIntoDbController)
.get(auth('admin', "manager"), getAllStockFromDBController)


Router.route("/:id")
.get(auth("admin", "manager"), getSingleStockFromDBController)
.delete(auth("admin", "manager"), softDeleteController)
.patch(auth("admin", "manager"),validateRequest(updateStockValidationSchema) , updateStockController)


export default Router;