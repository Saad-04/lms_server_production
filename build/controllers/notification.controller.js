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
exports.updateNotification = exports.getAllNotifications = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const notificaton_model_1 = __importDefault(require("../models/notificaton.model"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const node_cron_1 = __importDefault(require("node-cron"));
// get all notifications --- only admin
exports.getAllNotifications = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notifications = yield notificaton_model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
exports.updateNotification = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notificatonId = req.params.id;
        const notification = yield notificaton_model_1.default.findById(notificatonId);
        if (!notification) {
            next(new errorHandler_1.default("notification not found", 404));
        }
        else {
            notification.status
                ? (notification.status = "read")
                : notification === null || notification === void 0 ? void 0 : notification.status;
        }
        notification === null || notification === void 0 ? void 0 : notification.save();
        const notifications = yield notificaton_model_1.default.find().sort({
            createdAt: -1,
        });
        res.status(201).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 500));
    }
}));
// delete the 30days old notification
// delete notification --- only admin
const deleteNotification = node_cron_1.default.schedule("0 0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    const thirtyDaysAgo = new Date(Date.now() - 60 * 1000);
    yield notificaton_model_1.default.deleteMany({
        status: "read",
        createdAt: { $lt: thirtyDaysAgo },
    });
    console.log("Deleted read notifications");
}));
