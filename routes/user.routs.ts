import express from "express";
import {
  activateUser,
  deleteUserByAdmin,
  getAdminAllUsers,
  getUserInfo,
  loginUser,
  LogOutUser,
  registerUser,
  socialRegister,
  updateAccessToken,
  updateUserInfo,
  updateUserPassword,
  updateUserPicture,
  updateUserRole,
} from "../controllers/user.controller";
import { authorizedRole, isAuthenticated } from "../middleware/auth";
import { ReportMessage } from "../controllers/security.controller";

const userRouter = express.Router();

userRouter.route("/registerUser").post(registerUser);
userRouter.route("/activateUser").post(activateUser);
userRouter.route("/loginUser").post(loginUser);
userRouter.route("/refresh").get(updateAccessToken);
userRouter.route("/socialRegister").post(socialRegister);
// ---------------------------authenticated routes start here----------------------------
userRouter.route("/logoutUser").get(isAuthenticated, LogOutUser.logoutUser);
userRouter.route("/me").get(isAuthenticated, getUserInfo);
userRouter.route("/updateUserInfo").put(isAuthenticated, updateUserInfo);
userRouter
  .route("/updateUserPassword")
  .put(isAuthenticated, updateUserPassword);
userRouter.route("/updateUserPicture").put(isAuthenticated, updateUserPicture);

// ---------------------------admin routes start here----------------------------
userRouter.get(
  "/get-admin-allusers",
  isAuthenticated,
  authorizedRole("admin"),
  getAdminAllUsers
);
userRouter.put(
  "/updateUserRole",
  isAuthenticated,
  authorizedRole("admin"),
  updateUserRole
);
userRouter.post(
  "/ReportMessage/:id",

  isAuthenticated,
  ReportMessage.reportMessage
);
userRouter.delete(
  "/deleteUserByAdmin/:id",
  isAuthenticated,
  authorizedRole("admin"),
  deleteUserByAdmin
);

export default userRouter;
