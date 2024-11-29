import express from 'express';
import emailContactController from './contact.controller';

const router = express.Router();

router.route('/email').post(emailContactController);

export const ContactRoute = router;
