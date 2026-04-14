import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  toggleFeaturedController,
} from './product.controller';
import { createProductSchema, updateProductSchema } from './product.validation';
import { UserRole } from '../user/user.interface';
import { upload } from '../../utils/sendImageToCloudinary';

const router = express.Router();

// Admin/Manager protected routes
router
  .route('/')
  .post(
    auth(UserRole.admin, UserRole.manager, UserRole.super),
    upload.array('images', 5),
    validateRequest(createProductSchema),
    createProductController,
  )
  .get(
    auth(UserRole.admin, UserRole.manager, UserRole.super, UserRole.user),
    getAllProductsController,
  );

router
  .route('/:id')
  .get(
    auth(UserRole.admin, UserRole.manager, UserRole.super, UserRole.user),
    getSingleProductController,
  )
  .patch(
    auth(UserRole.admin, UserRole.manager, UserRole.super),
    upload.array('images', 5),
    validateRequest(updateProductSchema),
    updateProductController,
  )
  .delete(auth(UserRole.admin, UserRole.manager, UserRole.super), deleteProductController);

// Featured status toggle (special endpoint)
router.patch(
  '/:id/featured',
  auth('admin', 'manager'),
  toggleFeaturedController,
);

export default router;
