import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
// import cloudinary from "cloudinary";
const cloudinary = require("cloudinary");

import {
  createCourseCollection,
  getAllCoursesService,
} from "../services/service.course";
import CourseModel, { ICourse, ICourseData } from "../models/course.model";
import { redis } from "../utils/redis";
// import mongoose from "mongoose";
const mongoose = require("mongoose");
import sendEmail from "../utils/sendMail";
import ejs from "ejs";
import path from "path";
import NotificationModel from "../models/notificaton.model";
import userModel from "../models/user.models";
// import axios from "axios";
const axios = require("axios");
// only admin can create course
export class CreateCourse {
  static createCourse = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        let data = req.body;
        data.admin = req.user;
        const thumbnail = data.thumbnail as string;
        if (!data) {
          next(new ErrorHandler("please fill all the fields", 400));
        }
        if (thumbnail) {
          const cloudImage = await cloudinary.v2.uploader.upload(thumbnail, {
            folder: "coursethumbnails",
            width: 150,
          });
          data.thumbnail = {
            public_id: cloudImage?.public_id,
            url: cloudImage?.secure_url,
          };
        }
        // now create a course
        createCourseCollection(data, res);
      } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
      }
    }
  );
}
// only admin can edit this
export class EditCourse {
  static editCourse = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = req.body;

        const thumbnail = data.thumbnail;

        const courseId = req.params.id;

        const courseData = (await CourseModel.findById(courseId)) as any;

        if (thumbnail) {
          await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
            folder: "coursethumbnails",
          });

          data.thumbnail = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
        // now update a course

        const course = await CourseModel.findByIdAndUpdate(
          courseId,
          { $set: data },
          {
            new: true,
          }
        );
        // here we again find all courses and then again change redis allcourses data to new data
        const allCourse = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
        // Set the key with an expiration time of 5 minutes (300 seconds)
        await redis.setex("allCourses", 300, JSON.stringify(allCourse));

        res.status(201).json({
          success: true,
          course,
        });
      } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
      }
    }
  );
}
// get single course video
// this get single course api anyone can access it except who buy the course
export class GetSingleCourse {
  static getSingleCourse = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const courseId = req.params.id;
        const isRedisExist = await redis.get(courseId);

        if (isRedisExist) {
          const course = JSON.parse(isRedisExist);
          res.status(200).json({ success: true, course });
        } else {
          const course = await CourseModel.findById(courseId).select(
            "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links -likes"
          );
          await redis.set(courseId, JSON.stringify(course), "EX", 604800);
          res.status(200).json({ success: true, course });
        }
      } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
      }
    }
  );
}

// anyone can access this
export class GetAllCourse {
  static getAllCourse = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const isRedisExist = await redis.get("allCourses");

        if (isRedisExist) {
          const allCourse = await JSON.parse(isRedisExist);

          res.status(200).json({
            success: true,
            allCourse,
          });
        } else {
          const allCourse = await CourseModel.find().select(
            "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
          );
          await redis.setex("allCourses", 300, JSON.stringify(allCourse));

          res.status(200).json({
            success: true,
            allCourse,
          });
        }
      } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
      }
    }
  );
}

// only purchased user can access thisexport class GetPurchasedCourse {
export class GetPurchasedCourse {
  static getPurchasedCourse = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExists = await userCourseList?.find(
          (course: any) => course?.courseId.toString() === courseId
        );

        if (!courseExists) {
          return next(
            new ErrorHandler("You are not eligible to access this course", 404)
          );
        }

        const course = await CourseModel.findById(courseId);

        const courseData = course?.courseData;

        res.status(200).json({
          success: true,
          courseData,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
    //add comment in video comment section
  );
}

// when user like the video

// here user like the video
interface LikeVideoContentInterface {
  contentId: string;
}
export class LikeVideoContent {
  static likeCourseContent = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { contentId } = req.body as LikeVideoContentInterface;

        const courseId = req.params.id;

        const course = await CourseModel.findById(courseId);

        const courseContent = course?.courseData.find(
          (
            item: any //this is single video content
          ) => item._id.equals(contentId)
        );

        if (!courseContent) {
          return next(new ErrorHandler(" content not found ", 404));
        }
        // const user: any = {
        //   user: req.user,
        // };

        const likeExist = courseContent.likes.some(
          (item: any) => item.userId === req.user?._id //herer we check is user already give a like ?
        );

        if (likeExist) {
          courseContent.likes = courseContent.likes.filter(
            (item: any) => item.userId !== req.user?._id //if already like exist then remove it
          );
        } else {
          const user = req.user?._id;
          courseContent.likes.push({ userId: user } as any); //here we push req.user in array
        }

        await course?.save();

        // again get updated data
        const updatedCourse = await CourseModel.findById(courseId);
        const updatedCourseContent = course?.courseData.find(
          (
            item: any //this is single video content
          ) => item._id.equals(contentId)
        );
        const likes = updatedCourseContent?.likes;
        res.status(201).json({
          success: true,
          likes, //this likes is array of objects
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}
interface addQuestions extends Document {
  courseId: string;
  contentId: string;
  question: string;
}
// here anyone can asked question under a video
export class AddQuestionOnVideo {
  static addQuestionOnVideo = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { courseId, contentId, question } = req.body as addQuestions;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
          return next(new ErrorHandler("invalid content id", 400));
        }
        const courseContent = course?.courseData.find((item: any) =>
          item._id.equals(contentId)
        );

        if (!courseContent) {
          return next(new ErrorHandler("invalid content id", 400));
        }

        const newQuesion: any = {
          user: req.user,
          comment: question,
          questionReplies: [],
          // likes: [],
        };
        courseContent.questions.push(newQuesion);
        const user = await userModel.findById(req?.user?._id);
        //
        // if question is too longe then we send only some starting words
        const truncatedQuestion =
          question.length > 30 ? `${question.substring(0, 30)}...` : question;

        await NotificationModel.create({
          user: {
            userId: user?._id,
            name: user?.name,
            role: user?.role,
            avatar: user?.avatar.url || "",
          },
          section: "video-comment",
          title: `New question in ${courseContent.title} `,
          message: `${user?.name}: "${truncatedQuestion}"`,
        });

        await course?.save();

        res.status(201).json({
          success: true,
          course,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}

interface AddAnswer extends Document {
  courseId: string;
  contentId: string;
  answer: string;
  questionId: string;
}
// here anyone can asked question under a video
export class AnswerReplyOnVideoQuestion {
  static answerReplyOnVideoQuestion = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { courseId, contentId, questionId, answer } =
          req.body as AddAnswer;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
          return next(new ErrorHandler("invalid content id", 400));
        }
        const courseContent = course?.courseData.find((item: any) =>
          item._id.equals(contentId)
        );

        if (!courseContent) {
          return next(new ErrorHandler("invalid content id", 400));
        }
        // array of all questions
        const question = courseContent.questions.find((ques: any) =>
          ques._id.equals(questionId)
        );

        if (!question) {
          return next(new ErrorHandler("Invalid question id", 400));
        }

        const newAnswer: any = {
          user: req.user,
          answer,
          // likes: [],
        };

        question.commentReplies.push(newAnswer);

        await course?.save();

        if (question.user?._id === req.user?._id) {
          // create a notification
          const user = await userModel.findById(req?.user?._id);
          //
          const truncatedQuestion =
            answer.length > 30 ? `${answer.substring(0, 30)}...` : answer;

          await NotificationModel.create({
            user: {
              userId: user?._id,
              name: user?.name,
              role: user?.role,
              avatar: user?.avatar.url || "",
            },
            section: "video-comment",
            title: `Someone reply you in ${courseContent.title} `,
            message: `${user?.name}: "${truncatedQuestion}"`,
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
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}

interface AddReview extends Document {
  userId: string;
  rating: number;
  review: string;
}
// add a review
export class AddReviewInCourse {
  static addReview = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { rating, review } = req.body as AddReview;

        const userCourseList = req.user?.courses;

        const courseId = req.params.id;

        const course = await CourseModel.findById(courseId);

        // check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList?.some(
          (course: any) => course.courseId.toString() === courseId.toString()
        );

        if (!courseExists) {
          return next(
            new ErrorHandler(
              "You are not eligible to add review on this course",
              404
            )
          );
        }
        // // check if review already exists in userCourseList based on _id
        // const reviewExists = course?.reviews?.some(
        //   (rev: any) => rev?.user._id.toString() === req.user?._id
        // );
        // if (!reviewExists) {
        //   return next(new ErrorHandler("you already give a reveiw ", 404));
        // }

        const reviewData: any = {
          user: req.user,
          reviewComment: review,
          rating,
          // likes: [],
        };

        course?.reviews.push(reviewData);

        let avg = 0;

        course?.reviews.forEach((rat: any) => {
          avg += rat.rating;
        });

        if (course) {
          course.ratings = avg / course.reviews.length;
        }
        const redisCourse = await CourseModel.findById(courseId).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
        await redis.set(courseId, JSON.stringify(redisCourse), "EX", 604800);
        await course?.save();
        const user = await userModel.findById(req?.user?._id);
        //
        const truncatedQuestion =
          review.length > 30 ? `${review.substring(0, 30)}...` : review;

        await NotificationModel.create({
          user: {
            userId: user?._id,
            name: user?.name,
            role: user?.role,
            avatar: user?.avatar.url || "",
          },
          section: "video-review",
          title: `New Review added in course: ${course?.name} `,
          message: `${user?.name}: "${truncatedQuestion}"`,
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
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}
interface ReplyReview {
  reviewId: string;
  reply: string;
  courseId: string;
}
// only admin reply this comment
export class AdminReplyReview {
  static adminReplyReview = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { reply, courseId, reviewId } = req.body as ReplyReview;

        const course = await CourseModel.findById(courseId);

        if (!course) {
          return next(new ErrorHandler("course not found ", 404));
        }

        // check if courseId already exists in userCourseList based on _id
        const review = course.reviews?.find(
          (rev: any) => rev._id.toString() === reviewId
        );

        if (!review) {
          return next(new ErrorHandler("review not found ", 404));
        }

        const replyData: any = {
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
        const redisCourse = await CourseModel.findById(courseId).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
        await redis.set(courseId, JSON.stringify(redisCourse), "EX", 604800);

        await course?.save();

        // if review add successfully then again update the redis all courses
        const user = await userModel.findById(req?.user?._id);
        //
        const truncatedQuestion =
          reply.length > 30 ? `${reply.substring(0, 30)}...` : reply;

        await NotificationModel.create({
          user: {
            userId: user?._id,
            name: user?.name,
            role: user?.role,
            avatar: user?.avatar.url || "",
          },
          section: "admin-reply",
          title: `Admin Replied you in : ${course?.name} `,
          message: `${user?.name}: "${truncatedQuestion}"`,
        });

        const allCourse = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.setex("allCourses", 300, JSON.stringify(allCourse));

        res.status(201).json({
          success: true,
          course,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}
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
export class GetAdminAllCourses {
  static getAdminAllCourses = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        getAllCoursesService(res);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );
}

// delete user  --- only for admin
export class DeleteCourseByAdmin {
  static deleteCourseByAdmin = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = req.params.id;
        const course = await CourseModel.findById(id);

        if (!course) {
          next(new ErrorHandler("course not found ", 404));
        } else {
          await course.deleteOne({ id }); //-------deleted user
          await redis.del(id); //------also from user cache
          // also update redis db also
          const allCourse = await CourseModel.find().select(
            "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
          );
          await redis.setex("allCourses", 300, JSON.stringify(allCourse));

          res.status(200).json({
            success: false,
            message: "course deleted successfully",
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 404));
      }
    }
  );
}

// generate video url

interface Props extends Document {
  videoId: string;
}
export class GenerateVideoUrl {
  static generateVideoUrl = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { videoId } = req.body as Props;
        const response = await axios.post(
          `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
          { ttl: 300 },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: ` Apisecret ${process.env.API_SECRET_KEY}`,
            },
          }
        );
        res.json(response.data);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
        //
      }
    }
  );
}

type Req = {
  activeVideo: number;
  questionId: string;
};
export class DeleteVideoComment {
  static deleteVideoComment = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const courseId = req.params.id;

        const { activeVideo, questionId } = req.body as Req;

        const course = await CourseModel.findById(courseId);

        if (!course) {
          next(new ErrorHandler("course not found ", 404));
        }
        const videoIndex = activeVideo;
        const video = course?.courseData[videoIndex] as ICourseData;;

        if (!video) {
          next(new ErrorHandler("VIDEO NOT FOUND ", 404));
        }

        const questionid = questionId;

        const question = video?.questions.find(
          (q) => q._id.toString() === questionid
        );

        if (!question) {
          next(new ErrorHandler("Question NOT FOUND ", 404));
        }
        const newArray: any = video?.questions.filter(
          (q) => q._id.toString() !== questionid
        );
        video.questions = newArray;

        await course?.save();
        // check is this user comment or not

        res.status(200).json({
          success: true,
          // video,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
    //add comment in video comment section
  );
}
