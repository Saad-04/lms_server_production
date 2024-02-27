import { Response } from "express";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";

// get user by id
export const createCourseCollection = async (data: object, res: Response) => {
  const course = await CourseModel.create(data);
  const allCourse = await CourseModel.find().select(
    "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
  );
  await redis.setex("allCourses", 300, JSON.stringify(allCourse));

  res.status(201).json({
    success: true,
    course,
  });
};
// Get All Courses
export const getAllCoursesService = async (res: Response) => {
  const courses = await CourseModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    courses,
  });
};
