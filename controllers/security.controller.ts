import { Request, Response, NextFunction } from "express";
import userModel from "../models/user.models";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";

require("dotenv").config();

import CourseModel, { ICourse } from "../models/course.model";
// import mongoose from "mongoose";
const mongoose = require("mongoose");
import NotificationModel from "../models/notificaton.model";
import { Template } from "ejs";
import sendEmail from "../utils/sendMail";
import sendEmailEjs from "../utils/sendMail";
// import axios from "axios";
const axios = require("axios");
// only admin can create course

// here anyone can asked question under a video
interface addQuestions extends Document {
  contentId: string;
  reporterMessage: string;
  messageId: string;
  question: string;
}
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

export class ReportMessage {
  static reportMessage = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { messageId, contentId, reporterMessage } =
          req.body as addQuestions;
        const courseId = req.params.id;
        // Check if message ID is provided and valid

        // Find the message
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
          return next(new ErrorHandler("invalid course id", 400));
        }
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return next(new ErrorHandler("course not found", 404));
        }
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
          return next(new ErrorHandler("invalid content id", 400));
        }

        const videoContent = course?.courseData.find((item: any) =>
          item._id.equals(contentId)
        );

        if (!videoContent) {
          return next(new ErrorHandler("invalid content id", 400));
        }
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
          return next(new ErrorHandler("invalid content id", 400));
        }
        const question = videoContent.questions.find((item: any) =>
          item._id.equals(messageId)
        );
        if (!question) {
          return next(new ErrorHandler("invalid message id", 400));
        }

        const reporter = await userModel.findById(req?.user?._id);

        if (!reporter) {
          return next(new ErrorHandler("invalid reporter id", 400));
        }

        try {
          sendEmailEjs({
            email: reporter.email,
            subject: "Report Submitted successfully ",
            // html: "<h1>Hello SMTP Email</h1>",
            data: {
              reporterName: reporter.name,
              questionUserName: question.user.name,
            },
            template: "report-message.ejs",
          });
          const user = await userModel.findById(req?.user?._id);
          //
          const truncatedQuestion =
            question.comment.length > 30
              ? `${question.comment.substring(0, 30)}...`
              : question.comment;

          await NotificationModel.create({
            user: {
              userId: user?._id,
              name: user?.name,
              role: user?.role,
              avatar: user?.avatar.url || "",
            },
            section: "report-comment",
            title: `Someone reported in : ${course?.name} `,
            message: `${user?.name}: "${truncatedQuestion}"`,
          });
          // template: "activation-mail.ejs",
          // data: { user: { name: question.user.email } },
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 404));
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
          message:
            " Message reported successfully our team check and then take action on It",
          videoContent,
          question,
          reporter: {
            reporterDatail: reporter,
            reporterMessage,
            reportedOnComment: question.comment,
            reportedOnUser: question.user,
          },
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}
