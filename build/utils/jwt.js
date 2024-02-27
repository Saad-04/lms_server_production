"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
const redis_1 = require("./redis");
const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRES || "300", 10);
const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRES || "1200", 10);
// options
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpires * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: accessTokenExpires * 60 * 60 * 1000,
    sameSite: "lax",
    secure: true,
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpires * 24 * 60 * 60 * 1000),
    httpOnly: true,
    maxAge: refreshTokenExpires * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: true,
};
const sendToken = (user, statusCode, res) => {
    const accessToken = user.SIGN_ACCESS_TOKEN();
    const refreshToken = user.SIGN_REFRESH_TOKEN();
    // upload user to redis
    redis_1.redis.set(user._id, JSON.stringify(user));
    // parse environment variable to integrate fallback value
    if (process.env.NODE_ENV === "production") {
        exports.accessTokenOptions.secure = true;
    }
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
exports.sendToken = sendToken;
