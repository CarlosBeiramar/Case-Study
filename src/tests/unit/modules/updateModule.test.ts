import { Request, Response } from 'express';
import { updateModule } from "../../../controllers/moduleController";
import { readFromFile, writeToFile, coursesFilePath, moduleFilePath } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";
import { Module } from 'src/models/Module';

jest.mock('../../../utils/FileHandlers');

describe("updateModule", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      params: { courseId: '1', moduleId: '1' },
      body: {
        title: "Updated Module Title",
        lessons: [],
      },
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update an existing module and return it", async () => {
    const mockModule: Module = { id: 1, title: "Old Module Title", lessons: [] };
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [mockModule] },
    ];
    const mockModules: Module[] = [mockModule];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    (writeToFile as jest.Mock).mockImplementation(() => {});

    await updateModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ module: { ...mockModule, title: "Updated Module Title", lessons: [] } });
    expect(mockModules[0].title).toBe("Updated Module Title");
  });

  it("should return 404 if the module is not found", async () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];
    const mockModules: Module[] = [];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    await updateModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Module not found.' });
  });

  it("should return 404 if the course is not found", async () => {
    const mockModule: Module = { id: 1, title: "Old Module Title", lessons: [] };
    const mockCourses: Course[] = [];
    const mockModules: Module[] = [mockModule];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    await updateModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Course not found." });
  });

  it("should return 404 if the module is not found in the course", async () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];
    const mockModules: Module[] = [{ id: 2, title: "Some Other Module", lessons: [] }];

    (readFromFile as jest.Mock).mockImplementation((filePath) => {
      if (filePath === coursesFilePath) return mockCourses;
      if (filePath === moduleFilePath) return mockModules;
    });

    await updateModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Module not found.' });
  });

  it("should handle errors and return 500", async () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    await updateModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error.' });
  });
});
