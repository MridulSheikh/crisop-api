import { Router } from 'express';
import { ContactRoute } from '../modules/contact/contact.route';
import { UserRoute } from '../modules/user/user.route';
import categoryRoute from '../modules/category/category.route'
const router = Router();

const modulesRutes = [
  {
    path: '/contact',
    route: ContactRoute,
  },
  {
    path: '/user',
    route: UserRoute
  },
  {
    path: '/category',
    route: categoryRoute
  }
];

modulesRutes.forEach((route) => router.use(route.path, route.route));
export default router;
