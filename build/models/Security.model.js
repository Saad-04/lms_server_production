"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.reportSchema = new mongoose_1.default.Schema({
    reporterMessage: {
        type: String,
        required: true,
    },
    reportedOnComment: {
        type: String,
        required: true,
    },
    reporterDetail: {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        isVarified: {
            type: Boolean,
        },
        courses: [Object],
        role: {
            type: String,
            required: true,
        },
        avatar: {
            public_id: String,
            url: String,
        },
    },
    reportedOnUser: {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        isVarified: {
            type: Boolean,
        },
        courses: [Object],
        role: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        avatar: {
            public_id: String,
            url: String,
        },
    },
}, { timestamps: true });
