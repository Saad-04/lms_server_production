import express from "express";
import {
  // addCourseToWishList,
  AddQuestionOnVideo,
  AddReviewInCourse,
  AdminReplyReview,
  AnswerReplyOnVideoQuestion,
  DeleteCourseByAdmin,
  EditCourse,
  GenerateVideoUrl,
  GetAdminAllCourses,
  GetAllCourse,
  GetPurchasedCourse,
  CreateCourse,
  // CreateCourse,
  // GetSingleCourse,
  GetSingleCourse,
  LikeVideoContent,
  DeleteVideoComment,
  // LikeCourseContent,
} from "../controllers/course.controller";
import { authorizedRole, isAuthenticated } from "../middleware/auth";

const courseRouter = express.Router();
courseRouter
  .route("/getPurchasedCourse/:id")
  .get(isAuthenticated, GetPurchasedCourse.getPurchasedCourse);
courseRouter
  .route("/addQuestionOnVideo")
  .put(isAuthenticated, AddQuestionOnVideo.addQuestionOnVideo);
courseRouter
  .route("/delete-comment/:id")
  .delete(isAuthenticated, DeleteVideoComment.deleteVideoComment);
courseRouter
  .route("/addReview/:id")
  .put(isAuthenticated, AddReviewInCourse.addReview);
courseRouter
  .route("/replyAnswerQuestion")
  .put(isAuthenticated, AnswerReplyOnVideoQuestion.answerReplyOnVideoQuestion);
courseRouter.route("/getSingleCourse/:id").get(GetSingleCourse.getSingleCourse);
// courseRouter.route("/getSingleCourse/:id").get(getSingleCourse);
courseRouter.route("/getAllCourse").get(GetAllCourse.getAllCourse);
courseRouter
  .route("/likeCourseContent/:id")
  .put(isAuthenticated, LikeVideoContent.likeCourseContent);
courseRouter.route("/generateVideoUrl").post(GenerateVideoUrl.generateVideoUrl);
// courseRouter
//   .route("/addCourseToWishList")
//   .post(isAuthenticated, addCourseToWishList);

// ----------------------admin routes start from here--------------------
courseRouter
  .route("/createCourse")
  .post(isAuthenticated, authorizedRole("admin"), CreateCourse.createCourse);
courseRouter
  .route("/adminReplyReview")
  .put(
    isAuthenticated,
    authorizedRole("admin"),
    AdminReplyReview.adminReplyReview
  );
courseRouter
  .route("/get-admin-allcourses")
  .get(
    isAuthenticated,
    authorizedRole("admin"),
    GetAdminAllCourses.getAdminAllCourses
  );
courseRouter
  .route("/deleteCourseByAdmin/:id")
  .delete(
    isAuthenticated,
    authorizedRole("admin"),
    DeleteCourseByAdmin.deleteCourseByAdmin
  );
courseRouter
  .route("/updateCourse/:id")
  .put(isAuthenticated, authorizedRole("admin"), EditCourse.editCourse);

// authorizedRole()

export default courseRouter;
