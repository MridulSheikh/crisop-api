import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  toggleFeaturedController,
} from "./product.controller";
import { createProductSchema, updateProductSchema } from "./product.validation";

const router = express.Router();

// Admin/Manager protected routes
router
  .route('/')
  .post(
    auth("admin", "manager"),
    validateRequest(createProductSchema),
    createProductController
  )
  .get(
    getAllProductsController
  );

router
  .route('/:id')
  .get(
    auth("admin", "manager", "user"), // Allow users to view single product
    getSingleProductController
  )
  .patch(
    auth("admin", "manager"),
    validateRequest(updateProductSchema),
    updateProductController
  )
  .delete(
    auth("admin", "manager"),
    deleteProductController
  );

// Featured status toggle (special endpoint)
router.patch(
  '/:id/featured',
  auth("admin", "manager"),
  toggleFeaturedController
);

export default router;