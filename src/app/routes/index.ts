import { Router } from 'express';
import { ContactRoute } from '../modules/contact/contact.route';
import { UserRoute } from '../modules/user/user.route';
import categoryRoute from '../modules/category/category.route'
import warehouseRoute from "../modules/warehouse/warehouse.route"
import productRoute from "../modules/product/product.route"
import stockRoute from "../modules/stock/stock.route"
import orderRoute from '../modules/order/order.route'
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
  },
  {
    path: '/warehouse',
    route: warehouseRoute
  },
  {
    path: "/stock",
    route: stockRoute
  },
  {
    path: "/product",
    route: productRoute
  },
  {
    path: "/order",
    route: orderRoute,
  }
];

modulesRutes.forEach((route) => router.use(route.path, route.route));
export default router;
