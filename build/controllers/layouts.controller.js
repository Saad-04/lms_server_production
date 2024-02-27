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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLayout = exports.updateLayout = exports.createLayout = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const layout_model_1 = __importDefault(require("../models/layout.model"));
// import cloudinary from "cloudinary";
const cloudinary = require("cloudinary");
exports.createLayout = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.body;
        const isTypeExist = yield layout_model_1.default.findOne({ type });
        if (isTypeExist) {
            return next(new errorHandler_1.default(`${type} already exist`, 400));
        }
        if (type === "contactImage") {
            const { image } = req.body;
            const myCloud = yield cloudinary.v2.uploader.upload(image, {
                folder: "ContactImage",
                width: 150,
            });
            const contactimage = {
                public_id: myCloud === null || myCloud === void 0 ? void 0 : myCloud.public_id,
                url: myCloud === null || myCloud === void 0 ? void 0 : myCloud.secure_url,
            };
            yield layout_model_1.default.create({ type: "contactImage", contactimage });
        }
        if (type === "banner") {
            const { image, title, subtitle } = req.body;
            const myCloud = yield cloudinary.v2.uploader.upload(image, {
                folder: "Layout",
                width: 150,
            });
            const banner = {
                image: {
                    public_id: myCloud === null || myCloud === void 0 ? void 0 : myCloud.public_id,
                    url: myCloud === null || myCloud === void 0 ? void 0 : myCloud.secure_url,
                },
                title,
                subtitle,
            };
            yield layout_model_1.default.create({ type: "banner", banner });
        }
        if (type === "faq") {
            const { faq } = req.body;
            const faqItems = yield Promise.all(faq.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    question: item.question,
                    answer: item.answer,
                };
            })));
            yield layout_model_1.default.create({ type: "faq", faq: faqItems });
        }
        if (type === "category") {
            const { category } = req.body; //this category is array of abject [{}]
            const categoriesItems = yield Promise.all(category.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    title: item.title,
                };
            })));
            yield layout_model_1.default.create({
                type: "category",
                category: categoriesItems,
            });
        }
        if (type === "privacyPolicy") {
            const { privacyPolicy } = req.body; //this category is array of abject [{}]
            const privacyPolicyItems = yield Promise.all(privacyPolicy.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    title: item.title,
                };
            })));
            yield layout_model_1.default.create({
                type: "privacyPolicy",
                privacyPolicy: privacyPolicyItems,
            });
        }
        if (type === "about") {
            const { about } = req.body; //this category is array of abject [{}]
            const aboutItems = yield Promise.all(about.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    title: item.title,
                };
            })));
            yield layout_model_1.default.create({
                type: "about",
                about: aboutItems,
            });
        }
        res.status(200).json({
            success: true,
            message: "Layout created successfully",
        });
        //
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// now update the layout ----------------
exports.updateLayout = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { type } = req.body;
        const layoutType = yield layout_model_1.default.findOne({ type }); //first find layout with their type
        if (!layoutType) {
            next(new errorHandler_1.default(`${type} is not found  `, 400));
        }
        if (type === "banner") {
            const { image, title, subtitle } = req.body;
            yield cloudinary.v2.uploader.destroy((_b = (_a = layoutType === null || layoutType === void 0 ? void 0 : layoutType.banner) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b.public_id); //first destroy previous image then add new image
            const myCloud = yield cloudinary.v2.uploader.upload(image, {
                folder: "Layout",
                width: 150,
            });
            const banner = {
                image: {
                    public_id: myCloud === null || myCloud === void 0 ? void 0 : myCloud.public_id,
                    url: myCloud === null || myCloud === void 0 ? void 0 : myCloud.secure_url,
                },
                title,
                subtitle,
            };
            yield layout_model_1.default.findByIdAndUpdate(layoutType === null || layoutType === void 0 ? void 0 : layoutType._id, {
                type: "banner",
                banner,
            });
        }
        if (type === "contactImage") {
            const { image } = req.body;
            yield cloudinary.v2.uploader.destroy((_c = layoutType === null || layoutType === void 0 ? void 0 : layoutType.contactImage) === null || _c === void 0 ? void 0 : _c.public_id); //first destroy previous image then add new image
            const myCloud = yield cloudinary.v2.uploader.upload(image, {
                folder: "ContactImage",
                width: 150,
            });
            const contactImage = {
                public_id: myCloud === null || myCloud === void 0 ? void 0 : myCloud.public_id,
                url: myCloud === null || myCloud === void 0 ? void 0 : myCloud.secure_url,
            };
            yield layout_model_1.default.findByIdAndUpdate(layoutType === null || layoutType === void 0 ? void 0 : layoutType._id, {
                type: "contactImage",
                contactImage,
            });
        }
        if (type === "faq") {
            const { faq } = req.body;
            const faqItems = yield Promise.all(faq.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    question: item.question,
                    answer: item.answer,
                };
            })));
            yield layout_model_1.default.findByIdAndUpdate(layoutType === null || layoutType === void 0 ? void 0 : layoutType._id, {
                type: "faq",
                faq: faqItems,
            });
        }
        if (type === "category") {
            const { category } = req.body;
            const categoriesItems = yield Promise.all(category.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    title: item.title,
                };
            })));
            yield layout_model_1.default.findByIdAndUpdate(layoutType === null || layoutType === void 0 ? void 0 : layoutType._id, {
                type: "category",
                category: categoriesItems,
            });
        }
        if (type === "privacyPolicy") {
            const { privacyPolicy } = req.body;
            const privacyPolicyItems = yield Promise.all(privacyPolicy.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    title: item.title,
                };
            })));
            yield layout_model_1.default.findByIdAndUpdate(layoutType === null || layoutType === void 0 ? void 0 : layoutType._id, {
                type: "privacyPolicy",
                privacyPolicy: privacyPolicyItems,
            });
        }
        if (type === "about") {
            const { about } = req.body;
            const aboutItems = yield Promise.all(about.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return {
                    title: item.title,
                };
            })));
            yield layout_model_1.default.findByIdAndUpdate(layoutType === null || layoutType === void 0 ? void 0 : layoutType._id, {
                type: "about",
                about: aboutItems,
            });
        }
        res.status(200).json({
            success: true,
            message: `${type} updated successfully`,
        });
        //
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// now update the layout ----------------
exports.getAllLayout = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.params;
        const layout = yield layout_model_1.default.findOne({ type });
        res.status(200).json({
            success: true,
            layout,
        });
        //
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
