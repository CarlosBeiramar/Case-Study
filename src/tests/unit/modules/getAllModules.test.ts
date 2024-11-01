import { Request, Response } from "express";
import { getCourseModules } from "../../../controllers/moduleController";
import { readFromFile } from '../../../utils/FileHandlers';
import { Course } from "src/models/Course";

jest.mock('../../../utils/FileHandlers');

describe("getCourseModules", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      params: { courseId: '1' },
      query: { page: '1', limit: '2' }
    };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    res = { status: statusMock, json: jsonMock };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return paginated course modules when the course is found", async () => {
    const mockModules = [
      { id: 1, title: "Module 1", lessons: [] },
      { id: 2, title: "Module 2", lessons: [] },
      { id: 3, title: "Module 3", lessons: [] },
    ];

    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: mockModules },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    await getCourseModules(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      page: 1,
      limit: 2,
      totalModules: mockModules.length,
      modules: mockModules.slice(0, 2)
    });
  });

  it("should return 404 if the course is not found", async () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    req.params.courseId = '2';

    await getCourseModules(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Course or modules not found.' });
  });

  it("should return 404 if the course has no modules", async () => {
    const mockCourses: Course[] = [
      { id: 1, title: "Course 1", description: "Description", modules: [] },
    ];

    (readFromFile as jest.Mock).mockReturnValue(mockCourses);

    await getCourseModules(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Course or modules not found.' });
  });

  it("should handle errors and return 500", async () => {
    (readFromFile as jest.Mock).mockImplementation(() => {
      throw new Error("File read error");
    });

    await getCourseModules(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error.' });
  });
});
