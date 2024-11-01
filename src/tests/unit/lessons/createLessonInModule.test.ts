import { Request, Response } from 'express';
import { createLessonInModule } from "../../../controllers/lessonController";
import { readFromFile, writeToFile, lessonsFilePath, coursesFilePath, moduleFilePath } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";
import { Module } from 'src/models/Module';
import { Lesson } from 'src/models/Lesson';

jest.mock('../../../utils/FileHandlers');

describe("createLessonInModule", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            params: { courseId: '1', moduleId: '1' },
            body: {
                title: "New Lesson",
                description: "Lesson description",
                topics: [],
                content: []
            }
        };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 404 if the module is not found", async () => {
        const mockCourses: Course[] = [
            { id: 1, title: "Course 1", description: "Description", modules: [] },
        ];
        const mockLessons: Lesson[] = [];

        (readFromFile as jest.Mock).mockImplementation((filePath) => {
            if (filePath === coursesFilePath) return mockCourses;
            if (filePath === lessonsFilePath) return mockLessons;
            if (filePath === moduleFilePath) return []; // No modules
        });

        await createLessonInModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Module not found.' });
    });

    it("should return 404 if the course is not found", async () => {
        const mockModule: Module = { id: 1, title: "Module 1", lessons: [] };
        const mockLessons: Lesson[] = [];

        (readFromFile as jest.Mock).mockImplementation((filePath) => {
            if (filePath === coursesFilePath) return [];
            if (filePath === lessonsFilePath) return mockLessons;
            if (filePath === moduleFilePath) return [mockModule];
        });

        await createLessonInModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Course not found.' });
    });

    it("should handle errors and return 500", async () => {
        (readFromFile as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        await createLessonInModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Internal Server Error." });
    });
});
