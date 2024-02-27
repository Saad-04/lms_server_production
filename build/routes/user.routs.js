"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const security_controller_1 = require("../controllers/security.controller");
const userRouter = express_1.default.Router();
userRouter.route("/registerUser").post(user_controller_1.registerUser);
userRouter.route("/activateUser").post(user_controller_1.activateUser);
userRouter.route("/loginUser").post(user_controller_1.loginUser);
userRouter.route("/refresh").get(user_controller_1.updateAccessToken);
userRouter.route("/socialRegister").post(user_controller_1.socialRegister);
// ---------------------------authenticated routes start here----------------------------
userRouter.route("/logoutUser").get(auth_1.isAuthenticated, user_controller_1.LogOutUser.logoutUser);
userRouter.route("/me").get(auth_1.isAuthenticated, user_controller_1.getUserInfo);
userRouter.route("/updateUserInfo").put(auth_1.isAuthenticated, user_controller_1.updateUserInfo);
userRouter
    .route("/updateUserPassword")
    .put(auth_1.isAuthenticated, user_controller_1.updateUserPassword);
userRouter.route("/updateUserPicture").put(auth_1.isAuthenticated, user_controller_1.updateUserPicture);
// ---------------------------admin routes start here----------------------------
userRouter.get("/get-admin-allusers", auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), user_controller_1.getAdminAllUsers);
userRouter.put("/updateUserRole", auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), user_controller_1.updateUserRole);
userRouter.post("/ReportMessage/:id", auth_1.isAuthenticated, security_controller_1.ReportMessage.reportMessage);
userRouter.delete("/deleteUserByAdmin/:id", auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), user_controller_1.deleteUserByAdmin);
exports.default = userRouter;
