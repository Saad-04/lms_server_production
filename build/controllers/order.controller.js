"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewPayment = exports.SendStripePublishableKey = exports.getAdminAllOrders = exports.CreateOrder = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const redis_1 = require("../utils/redis");
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const service_order_1 = __importStar(require("../services/service.order"));
const course_model_1 = __importDefault(require("../models/course.model"));
const notificaton_model_1 = __importDefault(require("../models/notificaton.model"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// create order
class CreateOrder {
}
exports.CreateOrder = CreateOrder;
_a = CreateOrder;
CreateOrder.createOrder = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        const { courseId, payment_info } = req.body;
        if (payment_info) {
            if ("id" in payment_info) {
                const paymentIntentId = payment_info.id;
                const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== "succeeded") {
                    return next(new errorHandler_1.default("Payment not authorized!", 400));
                }
            }
        }
        const user = yield user_models_1.default.findById((_d = req.user) === null || _d === void 0 ? void 0 : _d._id);
        const courseExistInUser = user === null || user === void 0 ? void 0 : user.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new errorHandler_1.default("You have already purchased this course", 400));
        }
        const course = yield course_model_1.default.findById(courseId);
        if (!course) {
            return next(new errorHandler_1.default("Course not found", 404));
        }
        const data = {
            courseId: course === null || course === void 0 ? void 0 : course._id,
            userId: user === null || user === void 0 ? void 0 : user._id,
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
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData });
        try {
            if (user) {
                yield (0, sendMail_1.default)({
                    email: user.email,
                    subject: "Your Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        }
        catch (error) {
            return next(new errorHandler_1.default(error.message, 500));
        }
        user === null || user === void 0 ? void 0 : user.courses.push({ courseId: course === null || course === void 0 ? void 0 : course._id });
        yield redis_1.redis.set((_e = req.user) === null || _e === void 0 ? void 0 : _e._id, JSON.stringify(user));
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield notificaton_model_1.default.create({
            userId: user === null || user === void 0 ? void 0 : user._id,
            user: {
                userId: user === null || user === void 0 ? void 0 : user._id,
                name: user === null || user === void 0 ? void 0 : user.name,
                role: user === null || user === void 0 ? void 0 : user.role,
                avatar: (user === null || user === void 0 ? void 0 : user.avatar.url) || "",
            },
            section: "payment",
            title: "New Order",
            message: `${user === null || user === void 0 ? void 0 : user.name}: " place order in course ${course.name}"`,
        });
        course.purchased = course.purchased + 1;
        yield course.save();
        (0, service_order_1.default)(data, res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// get all orders --- only for admin
exports.getAdminAllOrders = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, service_order_1.getAllOrderService)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
//  send stripe publishble key
class SendStripePublishableKey {
}
exports.SendStripePublishableKey = SendStripePublishableKey;
_b = SendStripePublishableKey;
SendStripePublishableKey.sendStripePublishableKey = (0, catchAsyncError_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        publishablekey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
}));
// new payment
class NewPayment {
}
exports.NewPayment = NewPayment;
_c = NewPayment;
NewPayment.newPayment = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myPayment = yield stripe.paymentIntents.create({
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
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
