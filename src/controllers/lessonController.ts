import { readFromFile, lessonsFilePath, coursesFilePath, moduleFilePath, writeToFile} from '../utils/FileHandlers';
import { Request, Response, RequestHandler } from 'express';
import { Course } from 'src/models/Course';
import { Module } from 'src/models/Module';
import { Lesson } from 'src/models/Lesson';
import logger from '../utils/logger';

export const getLessonsFromCourseModule = (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.courseId, 10);
        const moduleId = parseInt(req.params.moduleId, 10);

        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;

        const coursesData = readFromFile(coursesFilePath);

        const course: Course = coursesData.find((course) => course.id === courseId);

        if (!course || course.modules.length === 0){
            logger.warn('Getting all lessons from a course module: Course or modules not found');
            return res.status(404).json({ message: 'Course or modules not found' });
        }

        const module: Module = course.modules.find((mod: Module) => mod.id === moduleId);

        if (!module || module.lessons.length === 0) {
            logger.warn('Getting all lessons from a course module: Modules or lessons not found.');
            return res.status(404).json({ message: 'Modules or lessons not found.'});
        }

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedModuleLessons = module.lessons.slice(startIndex, endIndex);

        logger.info(`Successfully retrieved ${module.lessons.length} lessons`)
        return res.status(200).json({page, limit, totalLessons: module.lessons.length, paginatedModuleLessons});
    } catch (error) {
        logger.error(`Error getting all lessons from a course module: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const getSpecificLessonsFromCourseModule = (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.courseId, 10);
        const moduleId = parseInt(req.params.moduleId, 10);
        const lessonId = parseInt(req.params.lessonId, 10);

        const coursesData = readFromFile(coursesFilePath);

        const course: Course = coursesData.find((course: Course) => course.id === courseId);

        if (!course || course.modules.length === 0) {
            logger.warn('Getting specific lesson from a course module: Course or modules not found');
            return res.status(404).json({ message: 'Course or modules not found' });
        }

        const module: Module = course.modules.find((mod: Module) => mod.id === moduleId);

        if (!module || module.lessons.length === 0) {
            logger.warn('Getting specific lesson from a course module: Modules or lessons not found.');
            return res.status(404).json({ message: 'Modules or lessons not found.'});
        }

        const lesson = module.lessons.find((l: Lesson) => l.id === lessonId);
        logger.info('Getting specific lesson from a course module: Successfully retrieved.');
        return res.status(200).json(lesson);
    } catch (error) {
        logger.error(`Error getting specific lesson from a course module: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const createLessonInModule = (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.courseId, 10);
        const moduleId = parseInt(req.params.moduleId, 10);

        const coursesData: Course[] = readFromFile(coursesFilePath);
        const lessonData: Lesson[] = readFromFile(lessonsFilePath);
        const moduleData: Module[] = readFromFile(moduleFilePath);

        const newLesson: Lesson = {
            id: lessonData.length > 0 ? lessonData[lessonData.length - 1].id : 1,
            title: req.body.title,
            description: req.body.description,
            topics: req.body.topics,
            content: req.body.content,
        }

        lessonData.push(newLesson);

        const moduleToAddLesson = moduleData.find(module => module.id === moduleId);

        if (!moduleToAddLesson){
            logger.warn('Creating lesson in a module: Module not found.');
            return res.status(404).json({ message: 'Module not found.'});
        }

        moduleToAddLesson.lessons.push(newLesson);

        const courseToAddLesson = coursesData.find(course => course.id === courseId)

        if (!courseToAddLesson) {
            logger.warn('Creating lesson in a module: Course not found.')
            return res.status(404).json({ message: 'Course not found.' })
        }

        courseToAddLesson.modules.find(module => module.id === moduleId).lessons.push(newLesson);


        writeToFile(lessonsFilePath, lessonData);
        writeToFile(moduleFilePath, moduleData);
        writeToFile(coursesFilePath, coursesData);

        logger.info('Creating lesson in a module: Successfully created.');
        return res.status(201).json(newLesson);
    } catch (error) {
        logger.error(`Error creating lesson in a module: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: "Internal Server Error."});
    }
}

export const updateLessonInModule = (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.courseId, 10);
        const moduleId = parseInt(req.params.moduleId, 10);
        const lessonId = parseInt(req.params.lessonId, 10);

        const coursesData: Course[] = readFromFile(coursesFilePath);
        const lessonData: Lesson[] = readFromFile(lessonsFilePath);
        const moduleData: Module[] = readFromFile(moduleFilePath);

        const updateLesson = (lesson: Lesson) => {
            lesson.title = req.body.title || lesson.title;
            lesson.description = req.body.description || lesson.description;
            lesson.topics = req.body.topics || lesson.topics;
            lesson.content = req.body.content || lesson.content;
        };


        const lessonToUpdate = lessonData.find(lesson => lesson.id === lessonId);
        if (lessonToUpdate) {
            updateLesson(lessonToUpdate);
        } else {
            logger.warn('Updating lesson in a module: Lesson not found.');
            return res.status(404).json({ message: "Lesson not found." });
        }

        const module = moduleData.find(module => module.id === moduleId);
        if (module) {
            const lessonInModule = module.lessons.find(lesson => lesson.id === lessonId);
            if (lessonInModule) {
                updateLesson(lessonInModule);
            } else {
                logger.warn('Updating lesson in a module: Lesson not found in module.');
                return res.status(404).json({ message: "Lesson not found in module." });
            }
        } else {
            logger.warn('Updating lesson in a module: Module not found.');
            return res.status(404).json({ message: "Module not found." });
        }

        const course = coursesData.find(course => course.id === courseId);
        if (course) {
            const moduleInCourse = course.modules.find(module => module.id === moduleId);
            if (moduleInCourse) {
                const lessonInCourse = moduleInCourse.lessons.find(lesson => lesson.id === lessonId);
                if (lessonInCourse) {
                    updateLesson(lessonInCourse);
                } else {
                    logger.warn('Updating lesson in a module: Lesson not found in course module.')
                    return res.status(404).json({ message: "Lesson not found in course module." });
                }
            } else {
                logger.warn('Updating lesson in a module: Module not found in course.');
                return res.status(404).json({ message: "Module not found in course." });
            }
        } else {
            logger.warn('Updating lesson in a module: Course not found.');
            return res.status(404).json({ message: "Course not found." });
        }

        writeToFile(lessonsFilePath, lessonData);
        writeToFile(moduleFilePath, moduleData);
        writeToFile(coursesFilePath, coursesData);

        logger.info('Updating lesson in a module: Successfully updated.');
        return res.status(204).json({ message: "Successfully updated." });
    } catch (error) {
        logger.error(`Error updating lesson in a module: ${error.message}`, { stack: error.stack })
        return res.status(500).json({ message: "Internal Server Error." });
    }
};

export const deleteLesson = (req: Request, res: Response) => {
    try {
        const courseId = parseInt(req.params.courseId, 10);
        const moduleId = parseInt(req.params.moduleId, 10);
        const lessonId = parseInt(req.params.lessonId, 10);

        const coursesData: Course[] = readFromFile(coursesFilePath);
        const lessonData: Lesson[] = readFromFile(lessonsFilePath);
        const moduleData: Module[] = readFromFile(moduleFilePath);

        const lessonIndex = lessonData.findIndex(lesson => lesson.id === lessonId);
        if (lessonIndex === -1) {
            logger.warn('Deleting lesson in a module: Lesson not found.')
            return res.status(404).json({ message: 'Lesson not found.' });
        }
        lessonData.splice(lessonIndex, 1);

        const module = moduleData.find(module => module.id === moduleId);
        if (!module) {
            logger.warn('Deleting lesson in a module: Module not found.')
            return res.status(404).json({ message: 'Module not found.' });
        }

        const moduleLessonIndex = module.lessons.findIndex(lesson => lesson.id === lessonId);
        if (moduleLessonIndex === -1) {
            logger.warn('Deleting lesson in a module: Lesson not found in module.')
            return res.status(404).json({ message: 'Lesson not found in module.' });
        }
        module.lessons.splice(moduleLessonIndex, 1);

        const course = coursesData.find(course => course.id === courseId);
        if (!course) {
            logger.warn('Deleting lesson in a module: Course not found.')
            return res.status(404).json({ message: 'Course not found.' });
        }

        const moduleInCourse = course.modules.find(module => module.id === moduleId);
        if (!moduleInCourse) {
            logger.warn('Deleting lesson in a module: Module not found in course.')
            return res.status(404).json({ message: 'Module not found in course.' });
        }

        const courseLessonIndex = moduleInCourse.lessons.findIndex(lesson => lesson.id === lessonId);
        if (courseLessonIndex === -1) {
            logger.warn('Deleting lesson in a module: Lesson not found in course module.')
            return res.status(404).json({ message: 'Lesson not found in course module.' });
        }

        moduleInCourse.lessons.splice(courseLessonIndex, 1);

        writeToFile(lessonsFilePath, lessonData);
        writeToFile(moduleFilePath, moduleData);
        writeToFile(coursesFilePath, coursesData);

        logger.info('Deleting lesson in a module: Deleted successfully');
        return res.status(200).json({ message: 'Deleted successfully.' });
    } catch (error) {
        console.error(error);
        logger.error(`Error deleting lesson in a module: ${error.message}`, { stack: error.stack })
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};
