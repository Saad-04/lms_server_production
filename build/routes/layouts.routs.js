"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const layouts_controller_1 = require("../controllers/layouts.controller");
const layoutsRouter = express_1.default.Router();
layoutsRouter
    .route("/create-layout")
    .post(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), layouts_controller_1.createLayout);
layoutsRouter
    .route("/update-layout")
    .put(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), layouts_controller_1.updateLayout);
layoutsRouter
    .route("/getAllLayout/:type")
    .get(layouts_controller_1.getAllLayout);
exports.default = layoutsRouter;
