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
exports.authorizedRole = exports.isAuthenticated = void 0;
const catchAsyncError_1 = require("./catchAsyncError");
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const redis_1 = require("../utils/redis");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.isAuthenticated = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const access_token = req.cookies.access_token;
        if (!access_token) {
            return next(new errorHandler_1.default("please login first ! ", 400));
        }
        const decode = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN);
        if (!decode) {
            return next(new errorHandler_1.default("invalid access token! ", 400));
        }
        // if (typeof decode === "object" && "id" in decode) {
        //   // ...
        //   const user = await redis.get(decode?.id); //this is will edit after
        // }
        const user = yield redis_1.redis.get(decode === null || decode === void 0 ? void 0 : decode.id); //this is will edit after
        const userId = decode === null || decode === void 0 ? void 0 : decode.sub;
        console.log("user id is this ", userId);
        if (!user) {
            return next(new errorHandler_1.default("user not found ! ", 404));
        }
        req.user = JSON.parse(user);
        next();
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
const authorizedRole = (...roles) => {
    return (req, res, next) => {
        var _a, _b;
        try {
            if (!roles.includes(((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || "")) {
                next(new errorHandler_1.default(`${(_b = req.user) === null || _b === void 0 ? void 0 : _b.role} is now allowed to access this !`, 400));
            }
            next();
        }
        catch (error) {
            next(new errorHandler_1.default(error.message, 403));
        }
    };
};
exports.authorizedRole = authorizedRole;
