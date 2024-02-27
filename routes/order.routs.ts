import express from "express";

import { authorizedRole, isAuthenticated } from "../middleware/auth";
import {
  CreateOrder,
  getAdminAllOrders,
  NewPayment,
  SendStripePublishableKey,
} from "../controllers/order.controller";

const orderRouter = express.Router();

orderRouter.post("/createOrder", isAuthenticated, CreateOrder.createOrder);
//
orderRouter.get(
  "/get-admin-orders",
  isAuthenticated,
  authorizedRole("admin"),
  getAdminAllOrders
);
// payment integration
orderRouter.get(
  "/payment/stripepublishablekey",
  SendStripePublishableKey.sendStripePublishableKey
);
//
orderRouter.post("/payment", isAuthenticated, NewPayment.newPayment);

// authorizedRole()

export default orderRouter;
