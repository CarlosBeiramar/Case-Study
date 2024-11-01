import { Request, Response } from 'express';
import { getLessonsFromCourseModule } from "../../../controllers/lessonController";
import { readFromFile, coursesFilePath } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";
import { Module } from 'src/models/Module';
import { Lesson } from 'src/models/Lesson';

jest.mock('../../../utils/FileHandlers');

describe("getLessonsFromCourseModule", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        req = {
            params: { courseId: '1', moduleId: '1' },
            query: { page: "1", limit: "2" }
        };
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        res = { status: statusMock, json: jsonMock };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return paginated lessons of a specific module in a course", async () => {
        const mockLessons: Lesson[] = [
            { id: 1, title: "Lesson 1", description: "test", topics: [], content: [] },
            { id: 2, title: "Lesson 2", description: "test", topics: [], content: [] },
            { id: 3, title: "Lesson 3", description: "test", topics: [], content: [] },
        ];

        const mockModule: Module = { id: 1, title: "Module 1", lessons: mockLessons };
        const mockCourses: Course[] = [
            { id: 1, title: "Course 1", description: "Description", modules: [mockModule] },
        ];

        (readFromFile as jest.Mock).mockImplementation(() => mockCourses);

        await getLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({
            page: 1,
            limit: 2,
            totalLessons: mockLessons.length,
            paginatedModuleLessons: mockLessons.slice(0, 2),
        });
    });

    it("should return 404 if the course is not found", async () => {
        (readFromFile as jest.Mock).mockReturnValue([]);

        await getLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Course or modules not found' });
    });

    it("should return 404 if the module is not found in the course", async () => {
        const mockModule: Module = { id: 1, title: "Module 1", lessons: [] };
        const mockCourses: Course[] = [
            { id: 1, title: "Course 1", description: "Description", modules: [mockModule] },
        ];

        (readFromFile as jest.Mock).mockReturnValue(mockCourses);

        await getLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Modules or lessons not found.' });
    });

    it("should handle errors and return 500 status", async () => {
        (readFromFile as jest.Mock).mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        await getLessonsFromCourseModule(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
});
