"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const order_controller_1 = require("../controllers/order.controller");
const orderRouter = express_1.default.Router();
orderRouter.post("/createOrder", auth_1.isAuthenticated, order_controller_1.CreateOrder.createOrder);
//
orderRouter.get("/get-admin-orders", auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), order_controller_1.getAdminAllOrders);
// payment integration
orderRouter.get("/payment/stripepublishablekey", order_controller_1.SendStripePublishableKey.sendStripePublishableKey);
//
orderRouter.post("/payment", auth_1.isAuthenticated, order_controller_1.NewPayment.newPayment);
// authorizedRole()
exports.default = orderRouter;
