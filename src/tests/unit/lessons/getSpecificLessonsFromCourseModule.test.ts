import { Request, Response } from 'express';
import { getSpecificLessonsFromCourseModule } from "../../../controllers/lessonController";
import { readFromFile, coursesFilePath } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";
import { Module } from 'src/models/Module';
import { Lesson } from 'src/models/Lesson';

jest.mock('../../../utils/FileHandlers');

describe("getSpecificLessonsFromCourseModule", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            params: { courseId: '1', moduleId: '1', lessonId: '1' },
        };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return a specific lesson from a module in a course", () => {
        const mockLesson: Lesson = { id: 1, title: "Lesson 1", description: "test", topics: [], content: [] };
        const mockModule: Module = { id: 1, title: "Module 1", lessons: [mockLesson] };
        const mockCourses: Course[] = [
            { id: 1, title: "Course 1", description: "Description", modules: [mockModule] },
        ];

        (readFromFile as jest.Mock).mockImplementation((filePath) => {
            if (filePath === coursesFilePath) return mockCourses;
        });

        getSpecificLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(mockLesson);
    });

    it("should return 404 if the course is not found", () => {
        (readFromFile as jest.Mock).mockImplementation((filePath) => {
            if (filePath === coursesFilePath) return [];
        });

        getSpecificLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Course or modules not found' });
    });

    it("should return 404 if the module is not found", () => {
        const mockCourses: Course[] = [
            { id: 1, title: "Course 1", description: "Description", modules: [] },
        ];

        (readFromFile as jest.Mock).mockImplementation((filePath) => {
            if (filePath === coursesFilePath) return mockCourses;
        });

        getSpecificLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Course or modules not found' });
    });

    it("should return 404 if the lesson is not found", () => {
        const mockModule: Module = { id: 1, title: "Module 1", lessons: [] };
        const mockCourses: Course[] = [
            { id: 1, title: "Course 1", description: "Description", modules: [mockModule] },
        ];

        (readFromFile as jest.Mock).mockImplementation((filePath) => {
            if (filePath === coursesFilePath) return mockCourses;
        });

        getSpecificLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({message: "Modules or lessons not found."});
    });
});
