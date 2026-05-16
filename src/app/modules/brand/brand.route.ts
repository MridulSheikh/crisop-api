import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { UserRole } from '../user/user.interface';
import {
  createBrandIntoDBController,
  getAllBrandFromDBController,
  getSingleBrandFromDBController,
  hardDeleteBrandFromDBController,
  softDeleteBrandFromDBController,
  updateBrandIntoDBController,
} from './brand.controller';
import brandValidation from './brand.validation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(UserRole.admin, UserRole.manager, UserRole.super),
    upload.single('img'),
    validateRequest(brandValidation.createBrandValidationSchema),
    createBrandIntoDBController,
  )
  .get(getAllBrandFromDBController);

router.delete(
  '/:id/hard',
  auth(UserRole.admin, UserRole.super),
  hardDeleteBrandFromDBController,
);

router
  .route('/:id')
  .get(getSingleBrandFromDBController)
  .patch(
    auth(UserRole.admin, UserRole.manager, UserRole.super),
    upload.single('img'),
    validateRequest(brandValidation.updateBrandValidationSchema),
    updateBrandIntoDBController,
  )
  .delete(
    auth(UserRole.admin, UserRole.manager, UserRole.super),
    softDeleteBrandFromDBController,
  );

export default router;
