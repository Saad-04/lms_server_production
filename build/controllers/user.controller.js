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
exports.deleteUserByAdmin = exports.updateUserRole = exports.getAdminAllUsers = exports.updateUserPicture = exports.updateUserPassword = exports.updateUserInfo = exports.socialRegister = exports.getUserInfo = exports.updateAccessToken = exports.LogOutUser = exports.loginUser = exports.activateUser = exports.registerUser = void 0;
const user_models_1 = __importDefault(require("../models/user.models"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../utils/jwt");
const redis_1 = require("../utils/redis");
const service_user_1 = require("../services/service.user");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
// import cloudinary from 'cloudinary';
const cloudinary = require("cloudinary");
require("dotenv").config();
exports.registerUser = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const emailExist = yield user_models_1.default.findOne({ email });
        if (emailExist) {
            return next(new errorHandler_1.default("this email already exist ", 400));
        }
        const user = { email, name, password };
        // activation token
        const activationToken = createActivationToken(user); //this return activation_code and activation_token(cookie)
        let activationCode = activationToken.activationCode;
        // let data = { user: { name: user.name }, activationCode };
        // let html = ejs.renderFile(
        //   path.join(__dirname, "../mails/activation-mail.ejs"),
        //   data
        // );
        try {
            (0, sendMail_1.default)({
                email: user.email,
                subject: "activate your account",
                data: {
                    name: user.name,
                    activationCode: activationCode,
                },
                template: "activation-mail.ejs",
            });
            res.status(201).json({
                success: true,
                message: `please check ${user.email} to activate acount`,
                activationToken: activationToken.token,
                activationCode: activationToken.activationCode,
            });
        }
        catch (error) {
            next(new errorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
// create activationToken
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        user,
        activationCode,
    }, process.env.ACTIVATION_SECRETE, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};
exports.activateUser = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { activation_Code, activation_Token } = req.body; //-----
    const newUser = jsonwebtoken_1.default.verify(activation_Token, process.env.ACTIVATION_SECRETE);
    if (newUser.activationCode !== activation_Code) {
        return next(new errorHandler_1.default("activation_Code not matching!", 400));
    }
    const { email, name, password } = newUser.user;
    const emailExist = yield user_models_1.default.findOne({ email });
    if (emailExist) {
        return next(new errorHandler_1.default("this email already exist!❌", 400));
    }
    const user = yield user_models_1.default.create({ email, name, password });
    res.status(201).json({
        success: true,
        user,
    });
}));
exports.loginUser = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new errorHandler_1.default("Please enter email and password", 400));
        }
        const user = yield user_models_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new errorHandler_1.default("Invalid email or password", 400));
        }
        const isPasswordMatch = yield user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new errorHandler_1.default("Invalid email or password", 400));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
class LogOutUser {
}
exports.LogOutUser = LogOutUser;
_a = LogOutUser;
LogOutUser.logoutUser = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        // remove user from redis
        const user = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
        yield redis_1.redis.del(user);
        yield redis_1.redis.del();
        res.status(200).json({
            success: true,
            message: "logged out successfully!",
        });
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.updateAccessToken = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
        const message = "Could not refresh token";
        if (!decoded) {
            return next(new errorHandler_1.default(message, 400));
        }
        const userInRedis = yield redis_1.redis.get(decoded.id);
        if (!userInRedis) {
            return next(new errorHandler_1.default("Please login for access this resources!", 400));
        }
        const user = JSON.parse(userInRedis);
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
            expiresIn: "5m",
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
            expiresIn: "3d",
        });
        req.user = user;
        res.cookie("access_token", accessToken, jwt_1.accessTokenOptions);
        res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOptions);
        yield redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800); // 7days
        return next();
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
// get user/ info
exports.getUserInfo = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
        (0, service_user_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.socialRegister = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, avatar } = req.body;
        const user = yield user_models_1.default.findOne({ email });
        if (!user) {
            const newUser = yield user_models_1.default.create({ email, name, avatar });
            (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.updateUserInfo = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    try {
        const { name, country } = req.body;
        const user = yield user_models_1.default.findById((_d = req.user) === null || _d === void 0 ? void 0 : _d._id);
        if (name && user) {
            user.name = name;
        }
        if (country && user) {
            user.country = country;
        }
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield redis_1.redis.del((_e = req.user) === null || _e === void 0 ? void 0 : _e._id);
        yield redis_1.redis.set((_f = req.user) === null || _f === void 0 ? void 0 : _f._id, JSON.stringify(user));
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.updateUserPassword = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new errorHandler_1.default("Please enter old and new password", 400));
        }
        const user = yield user_models_1.default.findById((_g = req.user) === null || _g === void 0 ? void 0 : _g._id).select("+password");
        if ((user === null || user === void 0 ? void 0 : user.password) === undefined) {
            return next(new errorHandler_1.default("Invalid user", 400));
        }
        const isPasswordMatch = yield (user === null || user === void 0 ? void 0 : user.comparePassword(oldPassword));
        if (!isPasswordMatch) {
            return next(new errorHandler_1.default("wrong old password", 400));
        }
        user.password = newPassword;
        yield user.save();
        yield redis_1.redis.set((_h = req.user) === null || _h === void 0 ? void 0 : _h._id, JSON.stringify(user));
        res.status(201).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.updateUserPicture = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l;
    try {
        const { avatar } = req.body;
        let userId = (_j = req.user) === null || _j === void 0 ? void 0 : _j._id;
        const user = yield user_models_1.default.findById(userId).select("+password");
        if (user && avatar) {
            if ((_k = user === null || user === void 0 ? void 0 : user.avatar) === null || _k === void 0 ? void 0 : _k.public_id) {
                yield cloudinary.v2.uploader.destroy((_l = user === null || user === void 0 ? void 0 : user.avatar) === null || _l === void 0 ? void 0 : _l.public_id);
                const cloud = yield cloudinary.v2.uploader.upload(avatar, {
                    folder: "user-avatar",
                    widtch: 150,
                });
                user.avatar = {
                    public_id: cloud.public_id,
                    url: cloud.secure_url,
                };
            }
            else {
                const cloud = yield cloudinary.v2.uploader.upload(avatar, {
                    folder: "user-avatar",
                    widtch: 150,
                });
                user.avatar = {
                    public_id: cloud.public_id,
                    url: cloud.secure_url,
                };
            }
        }
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield redis_1.redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
// get all orders --- only for admin
exports.getAdminAllUsers = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, service_user_1.getAllUsersService)(res);
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
// update user role --- only for admin
exports.updateUserRole = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, role } = req.body;
        const isUserExist = yield user_models_1.default.findOne({ email });
        if (isUserExist) {
            const id = isUserExist._id;
            (0, service_user_1.updateUserRoleService)(res, id, role);
        }
        else {
            res.status(400).json({
                success: false,
                message: "User not found",
            });
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 400));
    }
}));
// delete user  --- only for admin
exports.deleteUserByAdmin = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield user_models_1.default.findById(id);
        if (!user) {
            next(new errorHandler_1.default("user not found ", 404));
        }
        else {
            yield user.deleteOne({ id }); //-------deleted user
            yield redis_1.redis.del(id); //------also from user cache
            res.status(200).json({
                success: false,
                message: "user deleted successfully",
            });
        }
    }
    catch (error) {
        return next(new errorHandler_1.default(error.message, 404));
    }
}));
