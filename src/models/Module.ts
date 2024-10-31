import { Lesson, LessonSchema } from './Lesson';
import Joi from 'joi';

export const ModuleSchema = Joi.object().keys({
    id: Joi.number(),
    title: Joi.string().required(),
    lessons: Joi.array().items(LessonSchema),
})

export interface Module {
    id: number,
    title: string;
    lessons: Lesson[];
}