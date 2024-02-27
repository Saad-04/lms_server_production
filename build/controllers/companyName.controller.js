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
exports.updateCompanyName = exports.getCompanyName = exports.createCompanyName = void 0;
const catchAsyncError_1 = require("../middleware/catchAsyncError");
const company_model_1 = __importDefault(require("../models/company.model"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
exports.createCompanyName = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { companyName } = req.body;
        const name = yield company_model_1.default.create({ companyName });
        res.status(201).json({
            success: true,
            name,
        });
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.getCompanyName = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield company_model_1.default.find();
        res.status(200).json({
            success: true,
            company: company[0],
        });
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
exports.updateCompanyName = (0, catchAsyncError_1.catchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { newName } = req.body;
        const id = req.params.id;
        const updatedCompany = yield company_model_1.default.findByIdAndUpdate(id, { companyName: newName }, { new: true });
        // 
        const company = yield company_model_1.default.find();
        res.status(200).json({
            success: true,
            company: company[0],
        });
    }
    catch (error) {
        next(new errorHandler_1.default(error.message, 400));
    }
}));
