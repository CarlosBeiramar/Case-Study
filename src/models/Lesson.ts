import Joi from "joi";
import { ContentType } from "../utils/ContentTypes"

const ContentTypeSchema = Joi.string().valid(...Object.values(ContentType));

const ContentSchema = Joi.object().keys({
    type: Joi.string().required(),
    data: Joi.string().required()
})

export const LessonSchema = Joi.object().keys({
    id: Joi.number(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    topics: Joi.array().items(Joi.string()).required(),
    content: Joi.array().items(ContentSchema).required()
})

interface Content {
    type: string;
    data: string;
}

export interface Lesson {
    id: number;
    title: string;
    description: string;
    topics: string[];
    content: Content[];
}
