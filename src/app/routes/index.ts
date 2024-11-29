import { Router } from 'express';
import { ContactRoute } from '../modules/contact/contact.route';
const router = Router();

const modulesRutes = [
  {
    path: '/contact',
    route: ContactRoute,
  },
];

modulesRutes.forEach((route) => router.use(route.path, route.route));
export default router;
