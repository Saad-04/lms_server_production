import { NextFunction, Request, Response } from "express";
import userModel from "../models/user.models";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import { redis } from "../utils/redis";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import { IOrder } from "../models/order.model";
import createOrderCollection, {
  getAllOrderService,
} from "../services/service.order";
import CourseModel, { ICourse } from "../models/course.model";
import NotificationModel from "../models/notificaton.model";
import sendEmailEjs from "../utils/sendMail";
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create order
export class CreateOrder {
  static createOrder = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { courseId, payment_info } = req.body as IOrder;

        if (payment_info) {
          if ("id" in payment_info) {
            const paymentIntentId = payment_info.id;
            const paymentIntent = await stripe.paymentIntents.retrieve(
              paymentIntentId
            );

            if (paymentIntent.status !== "succeeded") {
              return next(new ErrorHandler("Payment not authorized!", 400));
            }
          }
        }

        const user = await userModel.findById(req.user?._id);

        const courseExistInUser = user?.courses.some(
          (course: any) => course._id.toString() === courseId
        );

        if (courseExistInUser) {
          return next(
            new ErrorHandler("You have already purchased this course", 400)
          );
        }

        const course: ICourse | null = await CourseModel.findById(courseId);

        if (!course) {
          return next(new ErrorHandler("Course not found", 404));
        }

        const data: any = {
          courseId: course?._id,
          userId: user?._id,
          payment_info,
        };

        const mailData = {
          order: {
            _id: course._id.toString().slice(0, 6),
            name: course.name,
            price: course.price,
            date: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/order-confirmation.ejs"),
          { order: mailData }
        );

        try {
          if (user) {
            await sendEmailEjs({
              email: user.email,
              subject: "Your Order Confirmation",
              template: "order-confirmation.ejs",
              data: mailData,
            });
          }
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }

        user?.courses.push({ courseId: course?._id });

        await redis.set(req.user?._id, JSON.stringify(user));

        await user?.save();

        await NotificationModel.create({
          userId: user?._id,
          user: {
            userId: user?._id,
            name: user?.name,
            role: user?.role,
            avatar: user?.avatar.url || "",
          },
          section: "payment",
          title: "New Order",
          message: `${user?.name}: " place order in course ${course.name}"`,
        });

        course.purchased = course.purchased + 1;

        await course.save();
        createOrderCollection(data, res);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}
// get all orders --- only for admin
export const getAdminAllOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrderService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//  send stripe publishble key
export class SendStripePublishableKey {
  static sendStripePublishableKey = catchAsyncError(
    async (req: Request, res: Response) => {
      res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    }
  );
}

// new payment
export class NewPayment {
  static newPayment = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const myPayment = await stripe.paymentIntents.create({
          amount: req.body.amount,
          currency: "USD",
          metadata: {
            company: "E-Learning",
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        res.status(201).json({
          success: true,
          client_secret: myPayment.client_secret,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
    }
  );
}
