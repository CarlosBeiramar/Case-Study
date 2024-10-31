import { Request, Response } from 'express';
import { createNewModule } from "../../../controllers/moduleController";
import { readFromFile, writeToFile, coursesFilePath, moduleFilePath } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";
import { Module } from 'src/models/Module';

jest.mock('../../../utils/FileHandlers');

describe("createNewModule", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      params: { courseId: '1' },
      body: {
        title: "New Module",
        lesson: [],
      },
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new module and return it", () => {
    const mockModule: Module = { id: 1, title: "New Module", lessons: [] };
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];
    const mockModules: Module[] = [];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    (writeToFile as jest.Mock).mockImplementation(() => {});

    createNewModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(mockModule);
    expect(mockModules).toContainEqual(mockModule);
    expect(mockCourses[0].modules).toContainEqual(mockModule);
  });

  it("should return 404 if the course is not found", () => {
    const mockCourses: Course[] = [];
    const mockModules: Module[] = [];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    createNewModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Course not found.' });
  });

  it("should handle errors and return 500", () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    createNewModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error.' });
  });
});
