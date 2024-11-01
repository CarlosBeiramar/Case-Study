import { Course, CourseSchema } from "../models/Course";
import { Module } from '../models/Module';
import { Lesson } from "../models/Lesson";
import express, { Request, Response, RequestHandler } from 'express';
import { readFromFile, writeToFile, moduleFilePath, coursesFilePath, lessonsFilePath } from "../utils/FileHandlers";
import logger from '../utils/logger';

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses: Course[] = await readFromFile(coursesFilePath);

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (courses.length === 0) {
      logger.warn(`Getting all courses: No courses available.`);
      return res.status(404).json({ message: 'Course not found.' });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedCourses = courses.slice(startIndex, endIndex);

    logger.info(`Getting all courses: Successfully retrieved ${courses.length} courses.`);
    return res.status(200).json({
      page,
      limit,
      totalCourses: courses.length,
      courses: paginatedCourses
    });
  } catch (error) {
    logger.error(`Error getting all courses: ${error.message}`, { stack: error.stack });
    return res.status(500).json("Internal Server Error.");
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const courses: Course[] = await readFromFile(coursesFilePath);
    const courseId: number = parseInt(req.params.id, 10);

    const course: Course = courses.find(c => c.id === courseId);

    if (!course){
      logger.warn(`Getting course by ID: Course not found.`);
      return res.status(404).json({ message: "Course not found" });
    }

    logger.info('Getting course by ID: Successfully retrieved course by ID.')
    return res.status(200).json(course);
  } catch (error) {
    logger.error(`Error getting course by ID: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const coursesData: Course[] = await readFromFile(coursesFilePath);
    const modulesData: Module[] = await readFromFile(moduleFilePath);
    const lessonsData: Lesson[] = await readFromFile(lessonsFilePath);

    const newCourse: Course = {
      id: coursesData.length > 0 ? coursesData[coursesData.length - 1].id + 1 : 1,
      title: req.body.title,
      description: req.body.description,
      modules: req.body.modules,
    }

    if (newCourse.modules){
      newCourse.modules.map((module: Module, moduleIndex: number) => {

        const newModuleId = modulesData.length > 0 ? modulesData[modulesData.length - 1].id + 1 : 1;
        const newModule: Module = { id: newModuleId, ...module };
        newCourse.modules[moduleIndex] = newModule;
        if (module.lessons) {
          module.lessons.map((lesson: Lesson, lessonIndex: number) => {
            const newLessonId = lessonsData.length > 0 ? lessonsData[lessonsData.length - 1].id + 1 : 1;
            const newLesson: Lesson = { id: newLessonId, ...lesson };
            newCourse.modules[moduleIndex].lessons[lessonIndex] = newLesson;
            lessonsData.push(newLesson);
          });
        }
        modulesData.push(newModule);
      });
    }

    coursesData.push(newCourse);
    writeToFile(coursesFilePath, coursesData);
    writeToFile(moduleFilePath, modulesData);
    writeToFile(lessonsFilePath, lessonsData);

    logger.info('Creating course: Successfully created new course.');
    return res.status(201).json({ newCourse });
  } catch (error) {
    logger.error(`Error creating course: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export const updateCourseByID = async (req: Request, res: Response) => {
  try {
    const courses: Course[] = await readFromFile(coursesFilePath);
    const courseId: number = parseInt(req.params.id, 10);
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1){
      logger.warn('Updating course by ID: Course not found');
      return res.status(404).json({ message: "Course not found" });
    }

    courses[courseIndex].title = req.body.title || courses[courseIndex].title;
    courses[courseIndex].description = req.body.title || courses[courseIndex].description;
    courses[courseIndex].modules = courses[courseIndex].modules;

    writeToFile(coursesFilePath, courses);

    logger.info('Updating course by ID: Course updated successfully.');
    return res.status(204).json({ message: "Course updated successfully." })
  } catch (error) {
    logger.error(`Error updating course by ID: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courses: Course[] = await readFromFile(coursesFilePath);
    const courseId: number = parseInt(req.params.id, 10);

    const courseIndex: number = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1){
      logger.warn('Deleting course: Course not found');
      return res.status(404).json({ message: "Course not found" });
    }

    courses.splice(courseIndex, 1);

    writeToFile(coursesFilePath, courses);

    logger.info('Deleting course: Course deleted successfully.');
    return res.status(200).json({ message: "Deleted successfully." })
  } catch (error) {
    logger.error(`Error deleting course: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: "Internal Server Error." })
  }
}


