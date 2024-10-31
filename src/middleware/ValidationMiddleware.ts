import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateSchema = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);

        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        next();
    };
};

export const validateCourseID = (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (isNaN(courseId) || courseId < 0 ){
        return res.status(400).json({
            "message": "Invalid course ID. It must be a positive integer."
        })
    }

    next()
};

export const validateModuleID = (req: Request, res: Response, next: NextFunction) => {
    const moduleId = parseInt(req.params.moduleId, 10);

    if (isNaN(moduleId) || moduleId < 0 ){
        return res.status(400).json({
            "message": "Invalid module ID. It must be a positive integer."
        })
    }

    next();
};

export const validateLessonID = (req: Request, res: Response, next: NextFunction) => {
    const lessonId = parseInt(req.params.lessonId, 10);

    if (isNaN(lessonId) || lessonId < 0 ){
        return res.status(400).json({
            "message": "Invalid lesson ID. It must be a positive integer."
        })
    }

    next();
};
