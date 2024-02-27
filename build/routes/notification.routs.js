"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = express_1.default.Router();
notificationRouter
    .route("/getAllNotifications")
    .get(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), notification_controller_1.getAllNotifications);
notificationRouter
    .route("/updateNotificationStatus/:id")
    .put(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), notification_controller_1.updateNotification);
// authorizedRole()
exports.default = notificationRouter;
