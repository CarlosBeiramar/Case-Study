import { Module, ModuleSchema } from './Module';
import Joi from 'joi';

export const CourseSchema = Joi.object().keys({
    id: Joi.number(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    modules: Joi.array().items(ModuleSchema).required(),
})

export interface Course {
    id: number;
    title: string;
    description: string;
    modules: Module[];
};
