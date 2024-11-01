import { Request, Response } from "express";
import { getSpecificCourseModule } from "../../../controllers/moduleController";
import { readFromFile } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";
import { Module } from "src/models/Module";

jest.mock('../../../utils/FileHandlers');

describe("getSpecificCourseModule", () => {
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

  it("should return the specific module when the course and module are found", async () => {
    const mockModule: Module = { id: 1, title: "Module 1", lessons: [] };

    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [mockModule] },
      { id: 2, title: "Course 2", description: "Description", modules: [] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    await getSpecificCourseModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockModule);
  });

  it("should return 404 if the course is not found", async () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    req.params.courseId = '2';

    await getSpecificCourseModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Course or modules not found.' });
  });

  it("should return 404 if the course has no modules", async () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    await getSpecificCourseModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Course or modules not found.' });
  });

  it("should return 404 if the module is not found", async () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [{ id: 1, title: "Module 1", lessons: [] }] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    req.params.moduleId = '2';

    await getSpecificCourseModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Module not found.' });
  });

  it("should handle errors and return 500", () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    getSpecificCourseModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error.' });
  });
});
