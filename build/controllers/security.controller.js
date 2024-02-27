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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportMessage = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
require("dotenv").config();
const course_model_1 = __importDefault(require("../models/course.model"));
// import mongoose from "mongoose";
const mongoose = require("mongoose");
const notificaton_model_1 = __importDefault(require("../models/notificaton.model"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
// import axios from "axios";
const axios = require("axios");
// export class AddQuestionOnVideo {
//   static addQuestionOnVideo = catchAsyncError(
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const { courseId, contentId, question } = req.body as addQuestions;
//         const course = await CourseModel.findById(courseId);
//         if (!mongoose.Types.ObjectId.isValid(contentId)) {
//           return next(new ErrorHandler("invalid content id", 400));
//         }
//         const courseContent = course?.courseData.find((item: any) =>
//           item._id.equals(contentId)
//         );
//         if (!courseContent) {
//           return next(new ErrorHandler("invalid content id", 400));
//         }
//         const newQuesion: any = {
//           user: req.user,
//           comment: question,
//           questionReplies: [],
//           // likes: [],
//         };
//         courseContent.questions.push(newQuesion);
//         const user = await userModel.findById(req?.user?._id);
//         //
//         // if question is too longe then we send only some starting words
//         const truncatedQuestion =
//           question.length > 30 ? `${question.substring(0, 30)}...` : question;
//         await NotificationModel.create({
//           user: {
//             userId: user?._id,
//             name: user?.name,
//             role: user?.role,
//             avatar: user?.avatar.url || "",
//           },
//           section: "videoQuestion",
//           title: `New question in ${courseContent.title} `,
//           message: `${user?.name}: "${truncatedQuestion}"`,
//         });
//         await course?.save();
//         res.status(201).json({
//           success: true,
//           course,
//         });
//       } catch (error: any) {
//         return next(new ErrorHandler(error.message, 500));
//       }
//     }
//   );
// }
class ReportMessage {
}
exports.ReportMessage = ReportMessage;
_a = ReportMessage;
ReportMessage.reportMessage = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const { messageId, contentId, reporterMessage } = req.body;
        const courseId = req.params.id;
        // Check if message ID is provided and valid
        // Find the message
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return next(new errorHandler_1.default("invalid course id", 400));
        }
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("course not found", 404));
        }
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("invalid content id", 400));
        }
        const videoContent = course === null || course === void 0 ? void 0 : course.courseData.find((item) => item._id.equals(contentId));
        if (!videoContent) {
            return next(new errorHandler_1.default("invalid content id", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new errorHandler_1.default("invalid content id", 400));
        }
        const question = videoContent.questions.find((item) => item._id.equals(messageId));
        if (!question) {
            return next(new errorHandler_1.default("invalid message id", 400));
        }
        const reporter = yield user_models_1.default.findById((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id);
        if (!reporter) {
            return next(new errorHandler_1.default("invalid reporter id", 400));
        }
        try {
            (0, sendMail_1.default)({
                email: reporter.email,
                subject: "Report Submitted successfully ",
                // html: "<h1>Hello SMTP Email</h1>",
                data: {
                    reporterName: reporter.name,
                    questionUserName: question.user.name,
                },
                template: "report-message.ejs",
            });
            const user = yield user_models_1.default.findById((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c._id);
            //
            const truncatedQuestion = question.comment.length > 30
                ? `${question.comment.substring(0, 30)}...`
                : question.comment;
            yield notificaton_model_1.default.create({
                user: {
                    userId: user === null || user === void 0 ? void 0 : user._id,
                    name: user === null || user === void 0 ? void 0 : user.name,
                    role: user === null || user === void 0 ? void 0 : user.role,
                    avatar: (user === null || user === void 0 ? void 0 : user.avatar.url) || "",
                },
                section: "report-comment",
                title: `Someone reported in : ${course === null || course === void 0 ? void 0 : course.name} `,
                message: `${user === null || user === void 0 ? void 0 : user.name}: "${truncatedQuestion}"`,
            });
            // template: "activation-mail.ejs",
            // data: { user: { name: question.user.email } },
        }
        catch (error) {
            return next(new errorHandler_1.default(error.message, 404));
        }
        // xsmtpsib-ee1624ae5415d39087366ae785cbc9012c9109e3ff713626560bfe45a52371c4-LZbsj01fTadBwFgJ
        //   // Find the admin to notify
        //   const admin = await AdminModel.findOne();
        //   // Notify the admin
        //   if (admin) {
        //     // Assuming you have a notification system in place
        //     await NotificationModel.create({
        //       user: {
        //         userId: admin._id,
        //         name: admin.name,
        //         role: admin.role,
        //         avatar: admin.avatar.url || ''
        //       },
        //       section: 'messageReport',
        //       title: `Message Reported`,
        //       message: `A message has been reported: ${comment}`,
        //     });
        //   }
        res.status(200).json({
            success: true,
            message: " Message reported successfully our team check and then take action on It",
            videoContent,
            question,
            reporter: {
                reporterDatail: reporter,
                reporterMessage,
                reportedOnComment: question.comment,
                reportedOnUser: question.user,
            },
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
