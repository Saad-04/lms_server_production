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
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseSchema = exports.courseDataSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var iCommentReplySchema = new mongoose_1.Schema({
    user: Object,
    answer: String,
    // likes: [Object],
}, { timestamps: true });
var commentSchema = new mongoose_1.Schema({
    user: Object,
    comment: String,
    commentReplies: [iCommentReplySchema],
    // likes: [Object],
}, { timestamps: true });
const reviewSchema = new mongoose_1.Schema({
    user: Object,
    reviewComment: String,
    rating: {
        type: Number,
        default: 0,
    },
    commentReplies: [commentSchema],
    // likes: [Object],
}, { timestamps: true });
const linkSchema = new mongoose_1.Schema({
    title: String,
    url: String,
});
const courseLikeSchema = new mongoose_1.Schema({
    userId: String,
});
exports.courseDataSchema = new mongoose_1.Schema({
    title: String,
    description: String,
    videoUrl: String,
    videoThumbnail: Object,
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema],
    likes: [courseLikeSchema],
});
exports.courseSchema = new mongoose_1.Schema({
    // admin: Object,
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    categories: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedPrice: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [exports.courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
const CourseModel = mongoose_1.default.model("Course", exports.courseSchema);
exports.default = CourseModel;
