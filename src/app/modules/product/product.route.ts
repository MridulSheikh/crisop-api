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
  getAllProductsAdminController,
} from './product.controller';
import { createProductSchema, updateProductSchema } from './product.validation';
import { UserRole } from '../user/user.interface';
import { upload } from '../../utils/sendImageToCloudinary';

const router = express.Router();

// Admin/Manager protected routes
router
  .route('/')
  .post(
    auth(UserRole.admin, UserRole.super),
    upload.array('images', 5),
    validateRequest(createProductSchema),
    createProductController,
  )
  .get(
    getAllProductsController,
  );

  router.route('/admin')
  .get(auth(UserRole.admin, UserRole.manager, UserRole.super), getAllProductsAdminController)

router
  .route('/:id')
  .get(
    getSingleProductController,
  )
  .patch(
    auth(UserRole.admin, UserRole.super),
    upload.array('newImages', 5),
    validateRequest(updateProductSchema),
    updateProductController,
  )
  .delete(auth(UserRole.admin, UserRole.super), deleteProductController);

// Featured status toggle (special endpoint)
router.patch(
  '/:id/featured',
  auth('admin', 'manager'),
  toggleFeaturedController,
);

export default router;
