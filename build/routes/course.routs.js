"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_controller_1 = require("../controllers/course.controller");
const auth_1 = require("../middleware/auth");
const courseRouter = express_1.default.Router();
courseRouter
    .route("/getPurchasedCourse/:id")
    .get(auth_1.isAuthenticated, course_controller_1.GetPurchasedCourse.getPurchasedCourse);
courseRouter
    .route("/addQuestionOnVideo")
    .put(auth_1.isAuthenticated, course_controller_1.AddQuestionOnVideo.addQuestionOnVideo);
courseRouter
    .route("/delete-comment/:id")
    .delete(auth_1.isAuthenticated, course_controller_1.DeleteVideoComment.deleteVideoComment);
courseRouter
    .route("/addReview/:id")
    .put(auth_1.isAuthenticated, course_controller_1.AddReviewInCourse.addReview);
courseRouter
    .route("/replyAnswerQuestion")
    .put(auth_1.isAuthenticated, course_controller_1.AnswerReplyOnVideoQuestion.answerReplyOnVideoQuestion);
courseRouter.route("/getSingleCourse/:id").get(course_controller_1.GetSingleCourse.getSingleCourse);
// courseRouter.route("/getSingleCourse/:id").get(getSingleCourse);
courseRouter.route("/getAllCourse").get(course_controller_1.GetAllCourse.getAllCourse);
courseRouter
    .route("/likeCourseContent/:id")
    .put(auth_1.isAuthenticated, course_controller_1.LikeVideoContent.likeCourseContent);
courseRouter.route("/generateVideoUrl").post(course_controller_1.GenerateVideoUrl.generateVideoUrl);
// courseRouter
//   .route("/addCourseToWishList")
//   .post(isAuthenticated, addCourseToWishList);
// ----------------------admin routes start from here--------------------
courseRouter
    .route("/createCourse")
    .post(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), course_controller_1.CreateCourse.createCourse);
courseRouter
    .route("/adminReplyReview")
    .put(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), course_controller_1.AdminReplyReview.adminReplyReview);
courseRouter
    .route("/get-admin-allcourses")
    .get(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), course_controller_1.GetAdminAllCourses.getAdminAllCourses);
courseRouter
    .route("/deleteCourseByAdmin/:id")
    .delete(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), course_controller_1.DeleteCourseByAdmin.deleteCourseByAdmin);
courseRouter
    .route("/updateCourse/:id")
    .put(auth_1.isAuthenticated, (0, auth_1.authorizedRole)("admin"), course_controller_1.EditCourse.editCourse);
// authorizedRole()
exports.default = courseRouter;
