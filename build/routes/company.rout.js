"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const companyName_controller_1 = require("../controllers/companyName.controller");
const companyNameRouter = express_1.default.Router();
companyNameRouter
    .route("/companyName")
    .post(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), companyName_controller_1.createCompanyName);
companyNameRouter
    .route("/getCompanyName")
    .get(companyName_controller_1.getCompanyName);
companyNameRouter
    .route("/updateCompanyName/:id")
    .put(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), companyName_controller_1.updateCompanyName);
exports.default = companyNameRouter;
