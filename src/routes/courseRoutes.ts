import express from 'express';
import { getAllCourses, createCourse, getCourseById, updateCourseByID, deleteCourse } from '../controllers/courseController';
import { getCourseModules, getSpecificCourseModule, createNewModule, updateModule, deleteModule } from '../controllers/moduleController';
import { getLessonsFromCourseModule, getSpecificLessonsFromCourseModule, createLessonInModule, updateLessonInModule, deleteLesson } from '../controllers/lessonController';
import { validateSchema, validateCourseID, validateModuleID, validateLessonID } from '../middleware/ValidationMiddleware';
import { CourseSchema } from '../models/Course';
import { LessonSchema } from '../models/Lesson';
import { ModuleSchema } from '../models/Module';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         modules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Module'
 *
 *     Module:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *
 *     Lesson:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *         content:
 *           type: array
 *           items:
 *             type: string
 */


/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Endpoints to manage courses.
 */

/**
 * @swagger
 * /api/courses/:
 *   get:
 *     tags: [Courses]
 *     summary: Retrieve a list of courses - Pagination allowed.
 *     parameters:
 *       - in: path
 *         name: page
 *         description: Number of the page
 *       - in: path
 *         name: limit
 *         description: Limit for page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: No courses available
 */
router.get('/', getAllCourses);

/**
 * @swagger
 * /api/courses/{courseId}/:
 *   get:
 *     tags: [Courses]
 *     summary: Retrieve a course by ID
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:courseId', validateCourseID, getCourseById);

/**
 * @swagger
 * /api/courses/:
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseSchema'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid input
 */
router.post('/', validateSchema(CourseSchema), createCourse);

/**
 * @swagger
 * /api/courses/{courseId}/:
 *   put:
 *     tags: [Courses]
 *     summary: Update a course by ID
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseSchema'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.put('/:courseId', validateCourseID, updateCourseByID);

/**
 * @swagger
 * /api/courses/{courseId}/:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete a course by ID
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
router.delete('/:courseId', validateCourseID, deleteCourse);


/**
 * @swagger
 * tags:
 *   name: Modules
 *   description: API to manage modules within courses
 */

/**
 * @swagger
 * /api/courses/{courseId}/modules/:
 *   get:
 *     tags: [Modules]
 *     summary: Retrieve all modules for a specific course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course to retrieve modules for
 *       - in: path
 *         name: page
 *         description: Number of the page
 *       - in: path
 *         name: limit
 *         description: Limit for page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       404:
 *         description: Course not found
 */
router.get('/:courseId/modules', validateCourseID, getCourseModules);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/:
 *   get:
 *     tags: [Modules]
 *     summary: Retrieve a specific module by ID from a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module or course not found
 */
router.get('/:courseId/modules/:moduleId', validateCourseID, validateModuleID, getSpecificCourseModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/:
 *   post:
 *     tags: [Modules]
 *     summary: Create a new module in a specific course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course to add the module to
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModuleSchema'
 *     responses:
 *       201:
 *         description: Module created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Course not found
 */
router.post('/:courseId/modules', validateCourseID, validateSchema(ModuleSchema), createNewModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/:
 *   put:
 *     tags: [Modules]
 *     summary: Update a module by ID in a specific course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModuleSchema'
 *     responses:
 *       200:
 *         description: Module updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Module'
 *       404:
 *         description: Module or course not found
 */
router.put('/:courseId/modules/:moduleId', validateCourseID, validateModuleID, updateModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/:
 *   delete:
 *     tags: [Modules]
 *     summary: Delete a module by ID from a specific course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *       404:
 *         description: Module or course not found
 */
router.delete('/:courseId/modules/:moduleId', validateCourseID, validateModuleID, deleteModule);


/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: API to manage lessons within course modules
 */

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/:
 *   get:
 *     tags: [Lessons]
 *     summary: Retrieve all lessons for a specific module in a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course to retrieve lessons for
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module to retrieve lessons from
 *         schema:
 *           type: integer
 *       - in: path
 *         name: page
 *         description: Number of the page
 *       - in: path
 *         name: limit
 *         description: Limit for page
 *     responses:
 *       200:
 *         description: A list of lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Course or module not found
 */
router.get('/:courseId/modules/:moduleId/lessons', validateCourseID, validateModuleID, getLessonsFromCourseModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/:
 *   get:
 *     tags: [Lessons]
 *     summary: Retrieve a specific lesson by ID from a module in a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module
 *         schema:
 *           type: integer
 *       - in: path
 *         name: lessonId
 *         required: true
 *         description: ID of the lesson to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson, module, or course not found
 */
router.get('/:courseId/modules/:moduleId/lessons/:lessonId', validateCourseID, validateModuleID, validateLessonID, getSpecificLessonsFromCourseModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/:
 *   post:
 *     tags: [Lessons]
 *     summary: Create a new lesson in a specific module of a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course to add the lesson to
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module to add the lesson to
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonSchema'
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Module or course not found
 */
router.post('/:courseId/modules/:moduleId/lessons', validateCourseID, validateModuleID, validateSchema(LessonSchema), createLessonInModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/:
 *   put:
 *     tags: [Lessons]
 *     summary: Update a lesson by ID in a specific module of a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module
 *         schema:
 *           type: integer
 *       - in: path
 *         name: lessonId
 *         required: true
 *         description: ID of the lesson to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonSchema'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       404:
 *         description: Lesson, module, or course not found
 */
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', validateCourseID, validateModuleID, validateLessonID, updateLessonInModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/:
 *   delete:
 *     tags: [Lessons]
 *     summary: Delete a lesson by ID from a module in a course
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: ID of the course
 *         schema:
 *           type: integer
 *       - in: path
 *         name: moduleId
 *         required: true
 *         description: ID of the module
 *         schema:
 *           type: integer
 *       - in: path
 *         name: lessonId
 *         required: true
 *         description: ID of the lesson to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       404:
 *         description: Lesson, module, or course not found
 */
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', validateCourseID, validateModuleID, validateLessonID, deleteLesson);


export default router;
