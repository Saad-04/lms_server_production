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
exports.errorMiddleWare = void 0;
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const errorMiddleWare = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'internal server error !';
    if (err.name === 'CastError') {
        const message = `resource not found invalid ! ${err.path} `;
        err = new errorHandler_1.default(message, 400);
    }
    if (err.code === 11000) {
        const message = `duplicate ! ${Object.keys(err.KeyValue)} entered ! `;
        err = new errorHandler_1.default(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
        const message = `json web token is invalid ! try again `;
        err = new errorHandler_1.default(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = `json web token is Expired ! try again `;
        err = new errorHandler_1.default(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
});
exports.errorMiddleWare = errorMiddleWare;
