"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteVideoComment = exports.GenerateVideoUrl = exports.DeleteCourseByAdmin = exports.GetAdminAllCourses = exports.AdminReplyReview = exports.AddReviewInCourse = exports.AnswerReplyOnVideoQuestion = exports.AddQuestionOnVideo = exports.LikeVideoContent = exports.GetPurchasedCourse = exports.GetAllCourse = exports.GetSingleCourse = exports.EditCourse = exports.CreateCourse = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
// import cloudinary from "cloudinary";
const cloudinary = require("cloudinary");
const service_course_1 = require("../services/service.course");
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../utils/redis");
// import mongoose from "mongoose";
const mongoose = require("mongoose");
const notificaton_model_1 = __importDefault(require("../models/notificaton.model"));
const user_models_1 = __importDefault(require("../models/user.models"));
// import axios from "axios";
const axios = require("axios");
// only admin can create course
class CreateCourse {
}
exports.CreateCourse = CreateCourse;
_a = CreateCourse;
CreateCourse.createCourse = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = req.body;
        data.admin = req.user;
        const thumbnail = data.thumbnail;
        if (!data) {
            next(new errorHandler_1.default("please fill all the fields", 400));
        }
        if (thumbnail) {
            const cloudImage = yield cloudinary.v2.uploader.upload(thumbnail, {
                folder: "coursethumbnails",
                width: 150,
            });
            data.thumbnail = {
                public_id: cloudImage === null || cloudImage === void 0 ? void 0 : cloudImage.public_id,
                url: cloudImage === null || cloudImage === void 0 ? void 0 : cloudImage.secure_url,
            };
        }
        // now create a course
        (0, service_course_1.createCourseCollection)(data, res);
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
// only admin can edit this
class EditCourse {
}
exports.EditCourse = EditCourse;
_b = EditCourse;
EditCourse.editCourse = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = (yield course_model_1.default.findById(courseId));
        if (thumbnail) {
            yield cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myCloud = yield cloudinary.v2.uploader.upload(thumbnail, {
                folder: "coursethumbnails",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        // now update a course
        const course = yield course_model_1.default.findByIdAndUpdate(courseId, { $set: data }, {
            new: true,
        });
        // here we again find all courses and then again change redis allcourses data to new data
        const allCourse = yield course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        // Set the key with an expiration time of 5 minutes (300 seconds)
        yield redis_1.redis.setex("allCourses", 300, JSON.stringify(allCourse));
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
// get single course video
// this get single course api anyone can access it except who buy the course
class GetSingleCourse {
}
exports.GetSingleCourse = GetSingleCourse;
_c = GetSingleCourse;
GetSingleCourse.getSingleCourse = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.id;
        const isRedisExist = yield redis_1.redis.get(courseId);
        if (isRedisExist) {
            const course = JSON.parse(isRedisExist);
            res.status(200).json({ success: true, course });
        }
        else {
            const course = yield course_model_1.default.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links -likes");
            yield redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800);
            res.status(200).json({ success: true, course });
        }
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
// anyone can access this
class GetAllCourse {
}
exports.GetAllCourse = GetAllCourse;
_d = GetAllCourse;
GetAllCourse.getAllCourse = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isRedisExist = yield redis_1.redis.get("allCourses");
        if (isRedisExist) {
            const allCourse = yield JSON.parse(isRedisExist);
            res.status(200).json({
                success: true,
                allCourse,
            });
        }
        else {
            const allCourse = yield course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            yield redis_1.redis.setex("allCourses", 300, JSON.stringify(allCourse));
            res.status(200).json({
                success: true,
                allCourse,
            });
        }
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
// only purchased user can access thisexport class GetPurchasedCourse {
class GetPurchasedCourse {
}
exports.GetPurchasedCourse = GetPurchasedCourse;
_e = GetPurchasedCourse;
GetPurchasedCourse.getPurchasedCourse = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    try {
        const userCourseList = (_q = req.user) === null || _q === void 0 ? void 0 : _q.courses;
        const courseId = req.params.id;
        const courseExists = yield (userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.find((course) => (course === null || course === void 0 ? void 0 : course.courseId.toString()) === courseId));
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not eligible to access this course", 404));
        }
        const course = yield course_model_1.default.findById(courseId);
        const courseData = course === null || course === void 0 ? void 0 : course.courseData;
        res.status(200).json({
            success: true,
            courseData,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
})
//add comment in video comment section
);
class LikeVideoContent {
}
exports.LikeVideoContent = LikeVideoContent;
_f = LikeVideoContent;
LikeVideoContent.likeCourseContent = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    try {
        const { contentId } = req.body;
        const courseId = req.params.id;
        const course = yield course_model_1.default.findById(courseId);
        const courseContent = course === null || course === void 0 ? void 0 : course.courseData.find((item //this is single video content
        ) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default(" content not found ", 404));
        }
        // const user: any = {
        //   user: req.user,
        // };
        const likeExist = courseContent.likes.some((item) => { var _q; return item.userId === ((_q = req.user) === null || _q === void 0 ? void 0 : _q._id); } //herer we check is user already give a like ?
        );
        if (likeExist) {
            courseContent.likes = courseContent.likes.filter((item) => { var _q; return item.userId !== ((_q = req.user) === null || _q === void 0 ? void 0 : _q._id); } //if already like exist then remove it
            );
        }
        else {
            const user = (_r = req.user) === null || _r === void 0 ? void 0 : _r._id;
            courseContent.likes.push({ userId: user }); //here we push req.user in array
        }
        yield (course === null || course === void 0 ? void 0 : course.save());
        // again get updated data
        const updatedCourse = yield course_model_1.default.findById(courseId);
        const updatedCourseContent = course === null || course === void 0 ? void 0 : course.courseData.find((item //this is single video content
        ) => item._id.equals(contentId));
        const likes = updatedCourseContent === null || updatedCourseContent === void 0 ? void 0 : updatedCourseContent.likes;
        res.status(201).json({
            success: true,
            likes, //this likes is array of objects
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// here anyone can asked question under a video
class AddQuestionOnVideo {
}
exports.AddQuestionOnVideo = AddQuestionOnVideo;
_g = AddQuestionOnVideo;
AddQuestionOnVideo.addQuestionOnVideo = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _s;
    try {
        const { courseId, contentId, question } = req.body;
        const course = yield course_model_1.default.findById(courseId);
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("invalid content id", 400));
        }
        const courseContent = course === null || course === void 0 ? void 0 : course.courseData.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default("invalid content id", 400));
        }
        const newQuesion = {
            user: req.user,
            comment: question,
            questionReplies: [],
            // likes: [],
        };
        courseContent.questions.push(newQuesion);
        const user = yield user_models_1.default.findById((_s = req === null || req === void 0 ? void 0 : req.user) === null || _s === void 0 ? void 0 : _s._id);
        //
        // if question is too longe then we send only some starting words
        const truncatedQuestion = question.length > 30 ? `${question.substring(0, 30)}...` : question;
        yield notificaton_model_1.default.create({
            user: {
                userId: user === null || user === void 0 ? void 0 : user._id,
                name: user === null || user === void 0 ? void 0 : user.name,
                role: user === null || user === void 0 ? void 0 : user.role,
                avatar: (user === null || user === void 0 ? void 0 : user.avatar.url) || "",
            },
            section: "video-comment",
            title: `New question in ${courseContent.title} `,
            message: `${user === null || user === void 0 ? void 0 : user.name}: "${truncatedQuestion}"`,
        });
        yield (course === null || course === void 0 ? void 0 : course.save());
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// here anyone can asked question under a video
class AnswerReplyOnVideoQuestion {
}
exports.AnswerReplyOnVideoQuestion = AnswerReplyOnVideoQuestion;
_h = AnswerReplyOnVideoQuestion;
AnswerReplyOnVideoQuestion.answerReplyOnVideoQuestion = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _t, _u, _v;
    try {
        const { courseId, contentId, questionId, answer } = req.body;
        const course = yield course_model_1.default.findById(courseId);
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("invalid content id", 400));
        }
        const courseContent = course === null || course === void 0 ? void 0 : course.courseData.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new errorHandler_1.default("invalid content id", 400));
        }
        // array of all questions
        const question = courseContent.questions.find((ques) => ques._id.equals(questionId));
        if (!question) {
            return next(new errorHandler_1.default("Invalid question id", 400));
        }
        const newAnswer = {
            user: req.user,
            answer,
            // likes: [],
        };
        question.commentReplies.push(newAnswer);
        yield (course === null || course === void 0 ? void 0 : course.save());
        if (((_t = question.user) === null || _t === void 0 ? void 0 : _t._id) === ((_u = req.user) === null || _u === void 0 ? void 0 : _u._id)) {
            // create a notification
            const user = yield user_models_1.default.findById((_v = req === null || req === void 0 ? void 0 : req.user) === null || _v === void 0 ? void 0 : _v._id);
            //
            const truncatedQuestion = answer.length > 30 ? `${answer.substring(0, 30)}...` : answer;
            yield notificaton_model_1.default.create({
                user: {
                    userId: user === null || user === void 0 ? void 0 : user._id,
                    name: user === null || user === void 0 ? void 0 : user.name,
                    role: user === null || user === void 0 ? void 0 : user.role,
                    avatar: (user === null || user === void 0 ? void 0 : user.avatar.url) || "",
                },
                section: "video-comment",
                title: `Someone reply you in ${courseContent.title} `,
                message: `${user === null || user === void 0 ? void 0 : user.name}: "${truncatedQuestion}"`,
            });
        }
        // else {
        // const data: any = {
        //   title: courseContent.title,
        //   name: question.user.name,
        //   senderName: req.user?.name,
        // };
        // const html = await ejs.renderFile(
        //   path.join(__dirname, "../mails/question-reply.ejs"),
        //   data
        // );
        // try {
        // sendEmail({
        //   email: question?.user?.email,
        //   subject: "Question reply ",
        //   // template: "question-reply.ejs",
        //   html,
        // });
        // }
        // catch (error: any) {
        //   next(new ErrorHandler(error.message, 404));
        // }
        // }
        //
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// add a review
class AddReviewInCourse {
}
exports.AddReviewInCourse = AddReviewInCourse;
_j = AddReviewInCourse;
AddReviewInCourse.addReview = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _w, _x;
    try {
        const { rating, review } = req.body;
        const userCourseList = (_w = req.user) === null || _w === void 0 ? void 0 : _w.courses;
        const courseId = req.params.id;
        const course = yield course_model_1.default.findById(courseId);
        // check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList === null || userCourseList === void 0 ? void 0 : userCourseList.some((course) => course.courseId.toString() === courseId.toString());
        if (!courseExists) {
            return next(new errorHandler_1.default("You are not eligible to add review on this course", 404));
        }
        // // check if review already exists in userCourseList based on _id
        // const reviewExists = course?.reviews?.some(
        //   (rev: any) => rev?.user._id.toString() === req.user?._id
        // );
        // if (!reviewExists) {
        //   return next(new ErrorHandler("you already give a reveiw ", 404));
        // }
        const reviewData = {
            user: req.user,
            reviewComment: review,
            rating,
            // likes: [],
        };
        course === null || course === void 0 ? void 0 : course.reviews.push(reviewData);
        let avg = 0;
        course === null || course === void 0 ? void 0 : course.reviews.forEach((rat) => {
            avg += rat.rating;
        });
        if (course) {
            course.ratings = avg / course.reviews.length;
        }
        const redisCourse = yield course_model_1.default.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        yield redis_1.redis.set(courseId, JSON.stringify(redisCourse), "EX", 604800);
        yield (course === null || course === void 0 ? void 0 : course.save());
        const user = yield user_models_1.default.findById((_x = req === null || req === void 0 ? void 0 : req.user) === null || _x === void 0 ? void 0 : _x._id);
        //
        const truncatedQuestion = review.length > 30 ? `${review.substring(0, 30)}...` : review;
        yield notificaton_model_1.default.create({
            user: {
                userId: user === null || user === void 0 ? void 0 : user._id,
                name: user === null || user === void 0 ? void 0 : user.name,
                role: user === null || user === void 0 ? void 0 : user.role,
                avatar: (user === null || user === void 0 ? void 0 : user.avatar.url) || "",
            },
            section: "video-review",
            title: `New Review added in course: ${course === null || course === void 0 ? void 0 : course.name} `,
            message: `${user === null || user === void 0 ? void 0 : user.name}: "${truncatedQuestion}"`,
        });
        // sendEmail({
        //   email: question.user.email,
        //   subject: "Question reply ",
        //   template: "question-reply.ejs",
        //   data,
        // });
        // }
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// only admin reply this comment
class AdminReplyReview {
}
exports.AdminReplyReview = AdminReplyReview;
_k = AdminReplyReview;
AdminReplyReview.adminReplyReview = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _y, _z;
    try {
        const { reply, courseId, reviewId } = req.body;
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("course not found ", 404));
        }
        // check if courseId already exists in userCourseList based on _id
        const review = (_y = course.reviews) === null || _y === void 0 ? void 0 : _y.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new errorHandler_1.default("review not found ", 404));
        }
        const replyData = {
            user: req.user,
            comment: reply,
            // likes: [],
        };
        // if (!review.commentReplies) {
        //   // review.commentReplies.push({
        //   //   user: req.user,
        //   //   comment: "",
        //   //   likes: [],
        //   // });
        //   review.commentReplies = [];
        // }
        if (review.commentReplies) {
            review.commentReplies.push(replyData);
        }
        const redisCourse = yield course_model_1.default.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        yield redis_1.redis.set(courseId, JSON.stringify(redisCourse), "EX", 604800);
        yield (course === null || course === void 0 ? void 0 : course.save());
        // if review add successfully then again update the redis all courses
        const user = yield user_models_1.default.findById((_z = req === null || req === void 0 ? void 0 : req.user) === null || _z === void 0 ? void 0 : _z._id);
        //
        const truncatedQuestion = reply.length > 30 ? `${reply.substring(0, 30)}...` : reply;
        yield notificaton_model_1.default.create({
            user: {
                userId: user === null || user === void 0 ? void 0 : user._id,
                name: user === null || user === void 0 ? void 0 : user.name,
                role: user === null || user === void 0 ? void 0 : user.role,
                avatar: (user === null || user === void 0 ? void 0 : user.avatar.url) || "",
            },
            section: "admin-reply",
            title: `Admin Replied you in : ${course === null || course === void 0 ? void 0 : course.name} `,
            message: `${user === null || user === void 0 ? void 0 : user.name}: "${truncatedQuestion}"`,
        });
        const allCourse = yield course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        yield redis_1.redis.setex("allCourses", 300, JSON.stringify(allCourse));
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// export class AddCourseToWishList {
// static addCourseToWishList = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { courseId } = req.body;
//       const course = (await CourseModel.findById(courseId)) as ICourse;
//       const user = await userModel.findById(req.user?._id);
//       const courseExistWishlist = user?.wishList.some(
//         (item: any) => item._id.toString() === courseId
//       );
//       if (!user) {
//         return next(new ErrorHandler("user not found", 400));
//       }
//       if (courseExistWishlist) {
//         user.wishList = user?.wishList.filter(
//           (item: ICourse) => item._id !== courseId
//         );
//       } else {
//         user.wishList.push(course);
//       }
//       await course?.save();
//       res.status(201).json({
//         success: true,
//         user,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );}
// remove course from wishlist
// delete user  --- only for admin
// export class RemoveCourseWishList {
// static removeCourseWishList = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const courseId = req.body;
//       const course = await CourseModel.findById(courseId);
//       const user = await userModel.findById(req.user?._id);
//       if (!course) {
//         next(new ErrorHandler("course not found ", 404));
//       }
//       if (!user) {
//         next(new ErrorHandler("user not found ", 404));
//       }
//       const wishlistExist = user?.wishList.some(
//         (e) => e._id.toString() === courseId
//       );
//       if (wishlistExist) {
//         user?.wishList = user?.wishList.filter(
//           (item) => item._id !== courseId //if already like exist then remove it
//         );
//       } else {
//         user?.wishList.push(user.user); //here we push req.user in array
//       }
//       res.status(200).json({
//         success: false,
//         message: "course deleted successfully",
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 404));
//     }
//   }
// );}
// get all courses --- only for admin
class GetAdminAllCourses {
}
exports.GetAdminAllCourses = GetAdminAllCourses;
_l = GetAdminAllCourses;
GetAdminAllCourses.getAdminAllCourses = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, service_course_1.getAllCoursesService)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
// delete user  --- only for admin
class DeleteCourseByAdmin {
}
exports.DeleteCourseByAdmin = DeleteCourseByAdmin;
_m = DeleteCourseByAdmin;
DeleteCourseByAdmin.deleteCourseByAdmin = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const course = yield course_model_1.default.findById(id);
        if (!course) {
            next(new errorHandler_1.default("course not found ", 404));
        }
        else {
            yield course.deleteOne({ id }); //-------deleted user
            yield redis_1.redis.del(id); //------also from user cache
            // also update redis db also
            const allCourse = yield course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            yield redis_1.redis.setex("allCourses", 300, JSON.stringify(allCourse));
            res.status(200).json({
                success: false,
                message: "course deleted successfully",
            });
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 404));
    }
}));
class GenerateVideoUrl {
}
exports.GenerateVideoUrl = GenerateVideoUrl;
_o = GenerateVideoUrl;
GenerateVideoUrl.generateVideoUrl = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { videoId } = req.body;
        const response = yield axios.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: ` Apisecret ${process.env.API_SECRET_KEY}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
        //
    }
}));
class DeleteVideoComment {
}
exports.DeleteVideoComment = DeleteVideoComment;
_p = DeleteVideoComment;
DeleteVideoComment.deleteVideoComment = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.id;
        const { activeVideo, questionId } = req.body;
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            next(new errorHandler_1.default("course not found ", 404));
        }
        const videoIndex = activeVideo;
        const video = course === null || course === void 0 ? void 0 : course.courseData[videoIndex];
        ;
        if (!video) {
            next(new errorHandler_1.default("VIDEO NOT FOUND ", 404));
        }
        const questionid = questionId;
        const question = video === null || video === void 0 ? void 0 : video.questions.find((q) => q._id.toString() === questionid);
        if (!question) {
            next(new errorHandler_1.default("Question NOT FOUND ", 404));
        }
        const newArray = video === null || video === void 0 ? void 0 : video.questions.filter((q) => q._id.toString() !== questionid);
        video.questions = newArray;
        yield (course === null || course === void 0 ? void 0 : course.save());
        // check is this user comment or not
        res.status(200).json({
            success: true,
            // video,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
})
//add comment in video comment section
);
