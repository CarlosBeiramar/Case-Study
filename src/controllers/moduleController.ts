import { Module, ModuleSchema } from "../models/Module";
import { Request, RequestHandler, Response } from "express";
import { readFromFile, moduleFilePath, coursesFilePath, writeToFile} from '../utils/FileHandlers';
import { Course } from "../models/Course";
import logger from '../utils/logger';
import { Cipher } from "crypto";

export const getCourseModules = async (req: Request, res: Response) => {
  try {
    const coursesData: Course[] = await readFromFile(coursesFilePath);
    const courseId: number = parseInt(req.params.courseId, 10);

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const course: Course = coursesData.find((course) => course.id === courseId);

    if (!course || course.modules.length === 0){
      logger.info(`Getting course modules: Course or modules not found.`);
      return res.status(404).json({ message: 'Course or modules not found.' });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedModules = course.modules.splice(startIndex, endIndex);

    logger.info(`Getting course modules: Successfully retrieved ${course.modules} modules.`);
    return res.status(200).json({ page, limit, totalModules: course.modules.length, modules: course.modules});
  } catch (error) {
    logger.error(`Error getting course modules: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

export const getSpecificCourseModule = async (req: Request, res: Response) => {
  try {
    const courseId: number = parseInt(req.params.courseId, 10);
    const moduleId: number = parseInt(req.params.moduleId, 10);

    const coursesData: Course[] = await readFromFile(coursesFilePath);

    const course: Course | undefined = coursesData.find((course) => course.id === courseId);

    if (!course || course.modules.length === 0) {
      logger.warn('Getting specific module: Course or modules not found')
      return res.status(404).json({ message: 'Course or modules not found.' });
    }

    const module: Module | undefined = course.modules.find((module) => module.id === moduleId);

    if (!module) {
      logger.warn('Getting specific module: Module not found.')
      return res.status(404).json({ message: 'Module not found.' });
    }

    logger.info(`Getting specific module: Successfully retrieved ${module.lessons} modules.`);
    return res.status(200).json(module);
  } catch (error) {
    logger.error(`Error getting specific module: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

export const createNewModule = async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);

    const coursesData: Course[] = await readFromFile(coursesFilePath);
    const modulesData: Module[] = await readFromFile(moduleFilePath);

    const newModule: Module = {
      id: modulesData.length > 0 ? modulesData[modulesData.length - 1].id + 1 : 1,
      title: req.body.title,
      lessons: req.body.lesson,
    }

    modulesData.push(newModule);

    const course: Course | undefined = coursesData.find((course) => course.id === courseId);
    if (!course) {
      logger.info('Creating module: Course not found.');
      return res.status(404).json({ message: 'Course not found.' });
    }

    course.modules.push(newModule);

    writeToFile(moduleFilePath, modulesData);
    writeToFile(coursesFilePath, coursesData);

    logger.info('Creating module: Successfully created module.');
    return res.status(201).json(newModule);
  } catch (error) {
    logger.error(`Error creating module: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

export const updateModule = async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const moduleId = parseInt(req.params.moduleId, 10);

    const coursesData: Course[] = await readFromFile(coursesFilePath);
    const modulesData: Module[] = await readFromFile(moduleFilePath);

    const module: Module = modulesData.find((module) => module.id === moduleId);

    if (!module) {
        logger.warn('Updating module: Module not found.');
        return res.status(404).json({ message: 'Module not found.' });
    }

    const updateModule = (module: Module) => {
      module.title = req.body.title || module.title;
      module.lessons = req.body.lessons || module.lessons;
    }

    updateModule(module);

    const course: Course = coursesData.find(course => course.id === courseId);
    if (course) {
      const moduleCourse = course.modules.find(module => module.id === moduleId);
      if (moduleCourse) {
        updateModule(moduleCourse);
      } else {
        logger.warn('Updating module: Module not found.');
        return res.status(404).json({ message: 'Module not found.' });
      }
    } else {
    logger.warn('Updating module: Course not found.');
    return res.status(404).json({ message: "Course not found." });
    }

    writeToFile(moduleFilePath, modulesData);
    writeToFile(coursesFilePath, coursesData);

    logger.info('Updating module: Successfully created.');
    return res.status(200).json({ module });
  } catch (error) {
    logger.error(`Error updating module: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId, 10);
    const moduleId = parseInt(req.params.moduleId, 10);

    const coursesData: Course[] = await readFromFile(coursesFilePath);
    const modulesData: Module[] = await readFromFile(moduleFilePath);

    const moduleIndex: number = modulesData.findIndex((module) => module.id === moduleId);

    if (moduleIndex === -1) {
      logger.info('Deleting module: Module not found.');
      return res.status(404).json({ message: 'Module not found.' });
    }

    modulesData.splice(moduleIndex, 1);

    const course: Course = coursesData.find((course) => course.id === courseId);

    if (!course) {
      logger.info('Deleting module: Course not found.');
      return res.status(404).json({ message: 'Course not found.' });
    }

    const moduleToDeleteIndex: number = course.modules.findIndex((module) => module.id === moduleId);

    if (moduleToDeleteIndex === -1) {
      logger.info('Deleting module: Module not found inside course modules.');
      return res.status(404).json({ message: 'Module not found inside course modules.'});
    }

    course.modules.splice(moduleToDeleteIndex, 1);

    writeToFile(moduleFilePath, modulesData);
    writeToFile(coursesFilePath, coursesData);

    logger.info('Deleting module: Successfully deleted.');
    return res.status(200).json({ message: 'Deleted Successfully.' });
  } catch (error) {
    logger.error(`Error deleting module: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
}
