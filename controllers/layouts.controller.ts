import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import LayoutModel, { ImageBanner } from "../models/layout.model";
// import cloudinary from "cloudinary";
const cloudinary = require("cloudinary");

import { createCourseCollection } from "../services/service.course";

interface LayoutType extends Document {
  type: string;
}

interface BannerLayout extends Document {
  image: string;
  title: string;
  subtitle: string;
}

export const createLayout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      const isTypeExist = await LayoutModel.findOne({ type });

      if (isTypeExist) {
        return next(new ErrorHandler(`${type} already exist`, 400));
      }

      if (type === "contactImage") {
        const { image } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "ContactImage",
          width: 150,
        });

        const contactimage = {
          public_id: myCloud?.public_id,
          url: myCloud?.secure_url,
        };

        await LayoutModel.create({ type: "contactImage", contactimage });
      }

      if (type === "banner") {
        const { image, title, subtitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "Layout",
          width: 150,
        });

        const banner = {
          image: {
            public_id: myCloud?.public_id,
            url: myCloud?.secure_url,
          },
          title,
          subtitle,
        };
        await LayoutModel.create({ type: "banner", banner });
      }

      if (type === "faq") {
        const { faq } = req.body;
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await LayoutModel.create({ type: "faq", faq: faqItems });
      }

      if (type === "category") {
        const { category } = req.body; //this category is array of abject [{}]
        const categoriesItems = await Promise.all(
          category.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.create({
          type: "category",
          category: categoriesItems,
        });
      }
      if (type === "privacyPolicy") {
        const { privacyPolicy } = req.body; //this category is array of abject [{}]
        const privacyPolicyItems = await Promise.all(
          privacyPolicy.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.create({
          type: "privacyPolicy",
          privacyPolicy: privacyPolicyItems,
        });
      }
      if (type === "about") {
        const { about } = req.body; //this category is array of abject [{}]
        const aboutItems = await Promise.all(
          about.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.create({
          type: "about",
          about: aboutItems,
        });
      }

      res.status(200).json({
        success: true,
        message: "Layout created successfully",
      });
      //
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// now update the layout ----------------
export const updateLayout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;

      const layoutType: any = await LayoutModel.findOne({ type }); //first find layout with their type

      if (!layoutType) {
        next(new ErrorHandler(`${type} is not found  `, 400));
      }

      if (type === "banner") {
        const { image, title, subtitle } = req.body;
        await cloudinary.v2.uploader.destroy(
          layoutType?.banner?.image?.public_id
        ); //first destroy previous image then add new image

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "Layout",
          width: 150,
        });

        const banner = {
          image: {
            public_id: myCloud?.public_id,
            url: myCloud?.secure_url,
          },
          title,
          subtitle,
        };
        await LayoutModel.findByIdAndUpdate(layoutType?._id, {
          type: "banner",
          banner,
        });
      }
      if (type === "contactImage") {
        const { image } = req.body;
        await cloudinary.v2.uploader.destroy(
          layoutType?.contactImage?.public_id
        ); //first destroy previous image then add new image

        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "ContactImage",
          width: 150,
        });

        const contactImage = {
          public_id: myCloud?.public_id,
          url: myCloud?.secure_url,
        };

        await LayoutModel.findByIdAndUpdate(layoutType?._id, {
          type: "contactImage",
          contactImage,
        });
      }

      if (type === "faq") {
        const { faq } = req.body;
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(layoutType?._id, {
          type: "faq",
          faq: faqItems,
        });
      }

      if (type === "category") {
        const { category } = req.body;
        const categoriesItems = await Promise.all(
          category.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(layoutType?._id, {
          type: "category",
          category: categoriesItems,
        });
      }
      if (type === "privacyPolicy") {
        const { privacyPolicy } = req.body;
        const privacyPolicyItems = await Promise.all(
          privacyPolicy.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(layoutType?._id, {
          type: "privacyPolicy",
          privacyPolicy: privacyPolicyItems,
        });
      }
      if (type === "about") {
        const { about } = req.body;
        const aboutItems = await Promise.all(
          about.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(layoutType?._id, {
          type: "about",
          about: aboutItems,
        });
      }

      res.status(200).json({
        success: true,
        message: `${type} updated successfully`,
      });
      //
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
// now update the layout ----------------
export const getAllLayout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;

      const layout = await LayoutModel.findOne({ type });

      res.status(200).json({
        success: true,
        layout,
      });
      //
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
