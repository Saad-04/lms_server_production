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
exports.getAllCoursesService = exports.createCourseCollection = void 0;
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../utils/redis");
// get user by id
const createCourseCollection = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.default.create(data);
    const allCourse = yield course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
    yield redis_1.redis.setex("allCourses", 300, JSON.stringify(allCourse));
    res.status(201).json({
        success: true,
        course,
    });
});
exports.createCourseCollection = createCourseCollection;
// Get All Courses
const getAllCoursesService = (res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield course_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({
        success: true,
        courses,
    });
});
exports.getAllCoursesService = getAllCoursesService;
