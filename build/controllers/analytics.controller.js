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
exports.getCourseAnalytics = exports.getOrdersAnalytics = exports.getUsersAnalytics = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const analytics_generator_1 = require("../utils/analytics.generator");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const user_models_1 = __importDefault(require("../models/user.models"));
const order_model_1 = __importDefault(require("../models/order.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
// get users analytics --- only for admin
exports.getUsersAnalytics = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, analytics_generator_1.generateLast12MothsData)(user_models_1.default);
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// get users analytics --- only for admin
exports.getOrdersAnalytics = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield (0, analytics_generator_1.generateLast12MothsData)(order_model_1.default);
        res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// get users analytics --- only for admin
exports.getCourseAnalytics = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield (0, analytics_generator_1.generateLast12MothsData)(course_model_1.default);
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
