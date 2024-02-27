"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const analyticsRouter = express_1.default.Router();
analyticsRouter
    .route("/user-analytics")
    .get(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), analytics_controller_1.getUsersAnalytics);
analyticsRouter
    .route("/course-analytics")
    .get(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), analytics_controller_1.getCourseAnalytics);
analyticsRouter
    .route("/order-analytics")
    .get(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), analytics_controller_1.getOrdersAnalytics);
// authorizedRole()
exports.default = analyticsRouter;
