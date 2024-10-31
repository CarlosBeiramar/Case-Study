import { Request, Response } from 'express';
import { deleteModule } from "../../../controllers/moduleController";
import { readFromFile, writeToFile, coursesFilePath, moduleFilePath } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";
import { Module } from 'src/models/Module';

jest.mock('../../../utils/FileHandlers');

describe("deleteModule", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      params: { courseId: '1', moduleId: '1' },
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete an existing module from a course and return success message", () => {
    const mockModule: Module = { id: 1, title: "Module 1", lessons: [] };
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [mockModule] },
    ];
    const mockModules: Module[] = [mockModule];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    (writeToFile as jest.Mock).mockImplementation(() => {});

    deleteModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Deleted Successfully.' });
    expect(mockModules.length).toBe(0);
    expect(mockCourses[0].modules.length).toBe(0);
  });

  it("should return 404 if the module is not found", () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];
    const mockModules: Module[] = [];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    deleteModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Module not found.' });
  });

  it("should return 404 if the course is not found", () => {
    const mockModule: Module = { id: 1, title: "Module 1", lessons: [] };
    const mockModules: Module[] = [mockModule];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return [];
      if (filePath === moduleFilePath) return mockModules;
    });

    deleteModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Course not found.' });
  });

  it("should handle errors and return 500", () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    deleteModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error.' });
  });
});
