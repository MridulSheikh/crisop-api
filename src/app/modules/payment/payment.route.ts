import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../user/user.interface';
import { stripePaymentIntent } from './payment.controller';
const router = express.Router();

router.route("/create-stripe-intent").post(auth(UserRole.admin, UserRole.manager, UserRole.super, UserRole.user), stripePaymentIntent)

export default router;